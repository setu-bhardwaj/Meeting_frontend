import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin/admin.component';
import { NormalComponent } from './normal/normal.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdminPlannerComponent } from './admin-planner/admin-planner.component';
import { MeetingCreateComponent } from './admin-planner/meeting-create/meeting-create.component';
import { MeetingEditComponent } from './admin-planner/meeting-edit/meeting-edit.component';
import { MeetingViewComponent } from './admin-planner/meeting-view/meeting-view.component';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [AdminComponent, NormalComponent, AdminPlannerComponent, MeetingCreateComponent, MeetingEditComponent, MeetingViewComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    RouterModule.forChild([
      { path: 'meeting/admin/:userId', component: AdminComponent },
      { path: 'meeting/:userId', component: NormalComponent },
      { path: 'meeting/admin-planner/view', component: AdminPlannerComponent },
      { path: 'event/:eventId', component: MeetingViewComponent },
      { path: 'meeting/event/add', component: MeetingCreateComponent },
      { path: 'edit/:eventId', component: MeetingEditComponent },


    ])
  ]
})
export class MeetingModule { }
