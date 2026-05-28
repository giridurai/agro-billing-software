import { TestBed } from '@angular/core/testing';

import { Iteams } from './iteams';

describe('Iteams', () => {
  let service: Iteams;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Iteams);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
