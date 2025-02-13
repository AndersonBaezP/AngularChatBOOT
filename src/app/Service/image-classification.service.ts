import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageClassificationService {
  private apiUrl = 'https://us-central1-true-velocity-440119-s3.cloudfunctions.net/funciondc_clasifica';

  constructor(private http: HttpClient) {}

  classifyImage(imageData: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', imageData);

    return this.http.post<any>(this.apiUrl, formData);
  }
}

