import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseDetectionComponent } from './exercise-detection.component';

describe('ExerciseDetectionComponent', () => {
  let component: ExerciseDetectionComponent;
  let fixture: ComponentFixture<ExerciseDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
