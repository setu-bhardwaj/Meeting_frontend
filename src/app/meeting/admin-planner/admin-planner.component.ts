import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, Time } from '@angular/common';
import { CalendarEvent } from 'angular-calendar';
import { setHours, setMinutes } from 'date-fns';
import { DatePipe } from '@angular/common';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  subMonths,
  addMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import * as moment from 'moment';

import {
  CalendarEventAction,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';

import { Cookie } from 'ng2-cookies/ng2-cookies';
import { MeetingService } from 'src/app/meeting.service';
import { AppService } from 'src/app/app.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';

type CalendarPeriod = 'day' | 'week' | 'month';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};




@Component({
  selector: 'app-admin-planner',
  templateUrl: './admin-planner.component.html',
  styleUrls: ['./admin-planner.component.css']
})
export class AdminPlannerComponent implements OnInit {

  public allMeetings;


  constructor(public router: Router, public _router: ActivatedRoute, public meetingService: MeetingService, public modal: NgbModal, public AppService: AppService,
    public SocketService: SocketService, public toastr: ToastrService) { }
  public currentUserId;

  public adminUserDetails = this.AppService.gertUserInfoFromLocalStorage();

  ngOnInit() {


    // this.currentUserId = this._router.snapshot.paramMap.get('userId');
    // this.getAllEvents();
    // this.getAllDetailsOfCurrentUser();
    this.getAllMeetings();

  }

  public getAllMeetings = () => {

    this.allMeetings = this.meetingService.getAllEvents().subscribe(
      apiResponse => {
        console.log(apiResponse);
        if (apiResponse.status == 200) {
          this.allMeetings = apiResponse.data;

        }
        else {
          this.toastr.error("Events not found");
        }
      },
      error => {
        console.log('some error occured');
        this.toastr.error(error.errorMessage);

      }

    )
  }


  public meetingSchedule = () => {
    this.router.navigate(['meeting/event/add'])
  }
  //  public detailsOfCurrentUser;
  //  public getAllDetailsOfCurrentUser = () =>{
  //    this.appService.getSingleUser(this.currentUserId).subscribe((response)=>{

  //      this.detailsOfCurrentUser = response.data;
  //    })


  //  } //  end of get all details of current user


  //logout function
  public logout: any = () => {

    this.AppService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('authtoken');

          Cookie.delete('receiverId');

          Cookie.delete('receiverName');

          //  this.SocketService.exitSocket()
          this.SocketService.disconnectedSocket();
          this.SocketService.exitSocket();


          this.toastr.success("You have been logged out")
          this.router.navigate(['/']);

        } else {
          //alert(apiResponse.message)
          this.toastr.error(apiResponse.message)

        } // end condition

      }, (err) => {
        // alert('some error occured');
        this.toastr.error('some error occured')


      });

  } // end logout




}



