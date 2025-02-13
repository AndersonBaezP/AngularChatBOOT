import { TestBed } from '@angular/core/testing';

import { ImageClassificationService } from './image-classification.service';

describe('ImageClassificationService', () => {
  let service: ImageClassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageClassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
