import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import {
  startOfDay, endOfDay, subDays, addDays, endOfMonth,
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
import { Subject } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


import { MeetingService } from './../../meeting.service';
import { SocketService } from 'src/app/socket.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as io from 'socket.io-client';

import * as moment from 'moment';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { $ } from 'protractor';

//type CalendarPeriod = 'day' | 'week' | 'month';

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
  selector: 'app-normal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './normal.component.html',
  styleUrls: ['./normal.component.css']
})
export class NormalComponent implements OnInit {

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;

  view: string = 'month';

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Opened', event);
      }
    }]

  refresh: Subject<any> = new Subject();

  activeDayIsOpen: boolean = false;

  public userDetails: any
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public meetings: any = [];
  public events: CalendarEvent[];
  public remindMe: any;

  constructor(public MeetingService: MeetingService, public SocketService: SocketService, public router: Router, public AppService: AppService, private toastr: ToastrService, private modal: NgbModal) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    this.remindMe = true
    this.events = [];

    this.userDetails = this.AppService.gertUserInfoFromLocalStorage();
    console.log(this.userDetails.firstName);



    this.getAllUserMeetingFunction();
    // console.log("hi")
    // console.log(this.getAllUserMeetingFunction())
    this.getUpdatesFromAdmin();

    setInterval(() => {
      this.meetingReminder();  //tobe done
    }, 5000);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        //this.activeDayIsOpen = true;
        this.view = 'day'
      }
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(event)
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }


  //getting all meetings/events of user
  public getAllUserMeetingFunction = () => {
    this.MeetingService.getAllEventsofUser(this.receiverId).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status == 200) {
          this.meetings = apiResponse.data;
          this.events = [];
          for (let each of this.meetings) {
            this.events.push({
              title: each.title,
              //  description : each.description,
              start: new Date(each.startAt),
              end: new Date(each.endAt),
              color: colors.blue,
              //   createdBy : each.createdBy
              //    each.remindMe = true
            });
          }
          //     this.events = this.meetings;
          console.log(this.events);


          this.refresh.next();

          this.toastr.info("Meetngs found and calender updated");
        }
        else if (apiResponse.status == 404) {

          this.toastr.info("No Meeting scheduled");
        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
          this.events = [];
        }

      },
      (error) => {

        this.toastr.error("Some Error Occurred", "Error!");

      }
    );
    return this.events;
  }//end getAllUserMeetingFunction


  public meetingReminder(): any {
    let currentTime = new Date().getTime();
    for (let meetingEvent of this.meetings) {

      if (isSameDay(new Date(), meetingEvent.startAt) && new Date(meetingEvent.startAt).getTime() - currentTime <= 60000
        && new Date(meetingEvent.startAt).getTime() > currentTime) {
        if (meetingEvent.remindMe) {

          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalAlert, { size: 'sm' });

          break;
        }//

      }//end if
      else if (currentTime > new Date(meetingEvent.startAt).getTime() &&
        new Date(currentTime - meetingEvent.startAt).getTime() < 10000) {
        this.toastr.info(`Meeting ${meetingEvent.title} Started!`, `Gentle Reminder`);
      }
    }

  }//end meetingReminder function





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


  //events

  public verifyUserConfirmation: any = () => {
    this.SocketService.verifyUser()
      .subscribe(() => {
        this.SocketService.setUser(this.authToken);

      });//end subscribe
  }//end verifyUserConfirmation

  public authErrorFunction: any = () => {

    this.SocketService.listenAuthError()
      .subscribe((data) => {
        console.log(data)



      });//end subscribe
  }//end authErrorFunction


  public getUpdatesFromAdmin = () => {

    this.SocketService.getUpdatesFromAdmin(this.receiverId).subscribe((data) => {
      this.getAllUserMeetingFunction();
      this.toastr.info("Here the updates from Admin!", data.message);
    });
  }







}//end class

// /////////cal code///////////

// import {
//   Component,
//   ChangeDetectionStrategy,
//   ViewChild,
//   TemplateRef
// } from '@angular/core';
// import {
//   startOfDay,
//   endOfDay,
//   subDays,
//   addDays,
//   endOfMonth,
//   isSameDay,
//   isSameMonth,
//   addHours
// } from 'date-fns';
// import { Subject } from 'rxjs';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import {
//   CalendarEvent,
//   CalendarEventAction,
//   CalendarEventTimesChangedEvent,
//   CalendarView
// } from 'angular-calendar';

// const colors: any = {
//   red: {
//     primary: '#ad2121',
//     secondary: '#FAE3E3'
//   },
//   blue: {
//     primary: '#1e90ff',
//     secondary: '#D1E8FF'
//   },
//   yellow: {
//     primary: '#e3bc08',
//     secondary: '#FDF1BA'
//   }
// }; 

// @Component({
//   selector: 'app-normal',
//   templateUrl: './normal.component.html',
//   styleUrls: ['./normal.component.css']
// })
// export class NormalComponent  {
//   @ViewChild('modalContent') modalContent: TemplateRef<any>;

//   view: CalendarView = CalendarView.Month;

//   CalendarView = CalendarView;

//   viewDate: Date = new Date();

//   modalData: {
//     action: string;
//     event: CalendarEvent;
//   };

//   actions: CalendarEventAction[] = [
//     {
//       label: '<i class="fa fa-fw fa-pencil"></i>',
//       onClick: ({ event }: { event: CalendarEvent }): void => {
//         this.handleEvent('Edited', event);
//       }
//     },
//     {
//       label: '<i class="fa fa-fw fa-times"></i>',
//       onClick: ({ event }: { event: CalendarEvent }): void => {
//         this.events = this.events.filter(iEvent => iEvent !== event);
//         this.handleEvent('Deleted', event);
//       }
//     }
//   ];

//   refresh: Subject<any> = new Subject();

//   events: CalendarEvent[] = [
//     {
//       start: subDays(startOfDay(new Date()), 1),
//       end: addDays(new Date(), 1),
//       title: 'A 3 day event',
//       color: colors.red,
//       actions: this.actions,
//       allDay: true,
//       resizable: {
//         beforeStart: true,
//         afterEnd: true
//       },
//       draggable: true
//     },
//     {
//       start: startOfDay(new Date()),
//       title: 'An event with no end date',
//       color: colors.yellow,
//       actions: this.actions
//     },
//     {
//       start: subDays(endOfMonth(new Date()), 3),
//       end: addDays(endOfMonth(new Date()), 3),
//       title: 'A long event that spans 2 months',
//       color: colors.blue,
//       allDay: true
//     },
//     {
//       start: addHours(startOfDay(new Date()), 2),
//       end: new Date(),
//       title: 'A draggable and resizable event',
//       color: colors.yellow,
//       actions: this.actions,
//       resizable: {
//         beforeStart: true,
//         afterEnd: true
//       },
//       draggable: true
//     }
//   ];

//   activeDayIsOpen: boolean = true;

//   constructor(private modal: NgbModal) {}

//   dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
//     if (isSameMonth(date, this.viewDate)) {
//       this.viewDate = date;
//       if (
//         (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
//         events.length === 0
//       ) {
//         this.activeDayIsOpen = false;
//       } else {
//         this.activeDayIsOpen = true;
//       }
//     }
//   }

//   eventTimesChanged({
//     event,
//     newStart,
//     newEnd
//   }: CalendarEventTimesChangedEvent): void {
//     event.start = newStart;
//     event.end = newEnd;
//     this.handleEvent('Dropped or resized', event);
//     this.refresh.next();
//   }

//   handleEvent(action: string, event: CalendarEvent): void {
//     this.modalData = { event, action };
//     this.modal.open(this.modalContent, { size: 'lg' });
//   }

//   addEvent(): void {
//     this.events.push({
//       title: 'New event',
//       start: startOfDay(new Date()),
//       end: endOfDay(new Date()),
//       color: colors.red,
//       draggable: true,
//       resizable: {
//         beforeStart: true,
//         afterEnd: true
//       }
//     });
//     this.refresh.next();
//   }
// }
