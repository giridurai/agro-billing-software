import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IteamMaster } from './iteam-master';

describe('IteamMaster', () => {
  let component: IteamMaster;
  let fixture: ComponentFixture<IteamMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IteamMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IteamMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
