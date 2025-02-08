import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BootChatService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions'; 
  private apiKey = 'u1PtSblVk5spjN8mskAZzekkzY2J9_BraB_JlW8T9Cs7TVwH7cT3BlbkFJm6bI84lTeey4LQMUsPGF98LhxszyWLy1Q4uG-N8IY211s-oZiH-Y3iqJZE0aCE2FKL1OOnlrkA'; // ⚠️ Reemplaza con tu API Key

  constructor(private http: HttpClient) {}

  // Enviar mensaje y recibir respuesta en streaming
  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
      max_tokens: 150
    };

    return this.http.post(this.apiUrl, body, { headers });
  }

  // Transcribir audio a texto con Whisper AI
  transcribeAudio(audioData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
    });

    return this.http.post('https://api.openai.com/v1/audio/transcriptions', audioData, { headers });
  }
}
