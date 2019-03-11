import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPlannerComponent } from './admin-planner.component';

describe('AdminPlannerComponent', () => {
  let component: AdminPlannerComponent;
  let fixture: ComponentFixture<AdminPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPlannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
