import { TestBed } from '@angular/core/testing';

import { BootChatService } from './bootchat.service'; 

describe('BootchatService', () => {
  let service: BootChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BootChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
