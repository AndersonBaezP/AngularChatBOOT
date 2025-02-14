import { Component, OnInit } from '@angular/core';
import { BootChatService } from './Service/bootchat.service';  
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'BootChat';
  userInput: string = '';
  messages: { text: string, sender: 'user' | 'bot', type: 'text' | 'image' | 'audio', timestamp: string }[] = [];
  recording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  private apiUrl: string = 'https://us-central1-true-velocity-440119-s3.cloudfunctions.net/funciondc_clasifica'; 

  // Lista de etiquetas (o se puede cargar desde un archivo JSON)
  labels: { [key: string]: string } = {};

  constructor(private bootchatService: BootChatService, private http: HttpClient) {}

  // Cargar las etiquetas desde el archivo JSON
  ngOnInit() {
    this.http.get<{ [key: string]: string }>('/labels.json').subscribe(
      data => {
        this.labels = data;
        console.log('Labels cargados:', this.labels); // Verifica en la consola
      },
      error => {
        console.error('Error cargando labels.json:', error);
      }
    );
  }
  

  // Enviar mensaje de texto
  sendMessage() {
    if (this.userInput.trim() !== '') {
      this.addMessage(this.userInput, 'user', 'text');
      const userMessage = this.userInput;
      this.userInput = ''; // Limpiar input

      this.bootchatService.sendMessage(userMessage).subscribe(response => {
        this.addMessage(response.choices[0]?.message?.content ?? 'Error', 'bot', 'text');
      });
    }
  }

  // Agregar mensaje con timestamp
  addMessage(text: string, sender: 'user' | 'bot', type: 'text' | 'image' | 'audio') {
    const timestamp = new Date().toLocaleString();
    this.messages.push({ text, sender, type, timestamp });
  }

  
  // Subir imagen y enviarla a la API de Google Cloud
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.addMessage(reader.result as string, 'user', 'image'); // Mostrar la imagen

            // Enviar imagen a la API para clasificación
            const formData = new FormData();
            formData.append('image', file);

            this.http.post<{ prediction: string }>(this.apiUrl, formData).subscribe(
                response => { 
                    console.log(' Respuesta completa de la API:', response);

                    if (!response || !response.prediction) {
                        console.error(' Error: No se encontró "prediction" en la respuesta de la API.');
                        return this.addMessage('Error al clasificar la imagen.', 'bot', 'text');
                    }

                    const rawLabel = response.prediction; 
                    console.log(' Valor recibido en prediction:', rawLabel);

                    const classIndex = Number(rawLabel);
                    console.log(' Índice convertido:', classIndex);

                    if (isNaN(classIndex)) {
                        console.error(' Error: Índice recibido no es un número válido.');
                        return this.addMessage('Error al clasificar la imagen.', 'bot', 'text');
                    }

                    const classification = this.labels[classIndex] || 'Clasificación desconocida';
                    console.log(' Clasificación encontrada:', classification);

                    this.addMessage(`Imagen clasificada como: ${classification}`, 'bot', 'text');
                },
                error => {
                    console.error(' Error en la clasificación:', error);
                    this.addMessage('Error al clasificar la imagen.', 'bot', 'text');
                }
            );
        };
        reader.readAsDataURL(file);
    }
}

  // Iniciar grabación de audio con transcripción en tiempo real
  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.recording = true;
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    }).catch(error => {
      console.error('Error al acceder al micrófono:', error);
      this.recording = false;
    });
  }

  // Detener grabación y transcribir automáticamente
  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();

      this.mediaRecorder.onstop = () => {
        this.recording = false;

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Se libera el micrófono para evitar grabaciones innecesarias
        this.releaseMicrophone();

        // Transcripción automática al detener la grabación
        this.sendAudio(audioBlob);
      };
    }
  }

  // Liberar el micrófono para evitar grabaciones accidentales
  releaseMicrophone() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      stream.getTracks().forEach(track => track.stop());
    }).catch(error => console.error('Error liberando el micrófono:', error));
  }

  // Convertir audio a texto y actualizar input automáticamente
  sendAudio(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    this.bootchatService.transcribeAudio(formData).subscribe(response => {
      if (response && response.text) {
        this.userInput = response.text; // Se muestra la transcripción en el input inmediatamente
      } else {
        this.addMessage('Error en la transcripción.', 'bot', 'text');
      }
    }, error => {
      console.error('Error en la transcripción:', error);
      this.addMessage('No se pudo transcribir el audio.', 'bot', 'text');
    });
  }
}
