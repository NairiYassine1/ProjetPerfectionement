import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OuvertureCompteComponent } from './ouverture-compte';

describe('OuvertureCompteComponent', () => {
  let component: OuvertureCompteComponent;
  let fixture: ComponentFixture<OuvertureCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OuvertureCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OuvertureCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
