import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin/admin.component';
import { NormalComponent } from './normal/normal.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { FlatpickrModule} from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdminPlannerComponent } from './admin-planner/admin-planner.component';


@NgModule({
  declarations: [AdminComponent, NormalComponent, AdminPlannerComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    RouterModule.forChild([
      {path:'meeting/admin/:userId',component:AdminComponent},
      {path:'meeting/:userId',component:NormalComponent},


 

    ])
  ]
})
export class MeetingModule { }
