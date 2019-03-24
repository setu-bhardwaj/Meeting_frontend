import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';

import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';

import { SocketService } from '../../socket.service';

import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { AppService } from 'src/app/app.service';
import { MeetingService } from 'src/app/meeting.service';

const colors: any = {
  green: {
    primary: '#008000',
    secondary: '#FAE3E3'
  }
};

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalConfirmation') modalConfirmation: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;

  view: string = 'month';

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-pencil-alt"></i>       ',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fas fa-trash-alt"></i>        ',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;

  public selectedUser: any;
  public allUsers: any[];
  public allUsersData: any[];

  public onlineUserList: any = []
  public meetings: any = [];
  public events: CalendarEvent[] = [];

  //user: admin
  public userDetails: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public adminId: any;
  public adminName: any;
  public disconnectedSocket: boolean;



  public gentleReminder: Boolean = true;

  constructor(public MeetingService: MeetingService, public SocketService: SocketService, public router: Router, public AppService: AppService, private toastr: ToastrService, private modal: NgbModal) {
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');

    this.adminId = Cookie.get('receiverId');
    this.adminName = Cookie.get('receiverName');
  }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.userDetails = this.AppService.gertUserInfoFromLocalStorage()
    console.log(this.userDetails);
    this.checkStatus();
    this.verifyUserConfirmation();

    this.getAllUsers()

  }

  //check status method is checking the authorization of user, cookies might get damage or expired

  public checkStatus: any = () => {

    if (Cookie.get('authToken') === undefined || Cookie.get('authToken') === '' || Cookie.get('authToken') === null) {

      this.router.navigate(['/']);

      return false;

    } else {
      return true;
    }

  } // end checkStatus

  public verifyUserConfirmation: any = () => {

    this.SocketService.verifyUser()
      .subscribe((data) => {

        this.disconnectedSocket = false;
        // since now user is verified so setting the user
        this.SocketService.setUser(this.authToken);
        this.getAllUsers();

      });
  }

  public emailToSearch;

  public showSearchResult = false;

  public getAllUsers = () => {

    this.AppService.getAllUsers().subscribe((response) => {
      console.log(response)
      if (response.status === 200) {

        this.allUsers = response.data;

      }
      console.log(this.allUsers)
    })

  }//get All Users

  public searchResults = {
    email: '',
    firstName: '',
    lastName: '',
    userId: ''
  }
  public search = () => {

    for (let each of this.allUsers) {

      if (each.email == this.emailToSearch) {
        this.searchResults.email = each.email;
        this.searchResults.firstName = each.firstName;
        this.searchResults.lastName = each.lastName;
        this.searchResults.userId = each.userId;
        this.showSearchResult = true;
      }

    }

  } //  end of search




  /* Calendar Events */

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      //console.log('Day CLicked')
      this.viewDate = date;
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
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

  handleEvent(action: string, event: any): void {
    //console.log(event)

    if (action === 'Edited') {
      this.router.navigate([`/user/admin/meeting/update/${event.meetingId}`]);
    }

    else if (action === 'Deleted') {
      console.log(action === 'Deleted')

      this.modalData = { event, action };
      this.modal.open(this.modalConfirmation, { size: 'sm' });

    }
    else {
      this.modalData = { event, action };
      this.modal.open(this.modalContent, { size: 'lg' });
    }
  }

  deleteEvent(event: any): void {
    //console.log("meeting Deleted...")

    this.deleteMeetingFunction(event);

    this.events = this.events.filter(iEvent => iEvent !== event);
    this.refresh.next();
    this.activeDayIsOpen = false;
  }

  /* End Calendar Events */

  public getUserMeetings(userId): any { //get meetings of clicked user ; 
    this.receiverId = userId

    this.getUserAllMeetingFunction()
  }//end of getUserMeetings function


  public getUserAllMeetingFunction = () => {//this function will get all the meetings of User. 

    if (this.receiverId != null && this.authToken != null) {
      this.MeetingService.getAllEventsofUser(this.receiverId).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {

          this.meetings = apiResponse.data;
          console.log(this.meetings)

          for (let each of this.meetings) {
            each.title = each.title;
            each.start = new Date(each.startAt);
            each.end = new Date(each.endAt);
            each.color = colors.green;
            each.actions = this.actions
            each.remindMe = true

          }
          this.events = this.meetings;
          //console.log(this.events)
          this.refresh.next();

          this.toastr.info("Calendar Updated", `Meetings Found!`);

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
          this.events = [];
        }
      },
        (error) => {
          if (error.status == 400) {
            this.toastr.warning("Calendar Failed to Update", "Either user or Meeting not found");
            this.events = []
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");


          }
        }//end error
      );//

    }//end if
    else {
      this.toastr.info("Missing Authorization Key", "Please login again");
      this.router.navigate(['/']);

    }

  }//end getUserAllMeetingFunction


  public deleteMeetingFunction(meeting): any {
    this.MeetingService.deleteEvent(meeting.meetingId)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.toastr.success("Meeting has been deleted");

          let dataForNotify = {
            message: `Hi, ${this.receiverName} has canceled the meeting - ${meeting.meetingTopic}. Please Check your Calendar/Email`,
            userId: meeting.participantId
          }

          this.notifyUpdatesToUser(dataForNotify);

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      },
        (error) => {

          if (error.status == 404) {
            this.toastr.warning("Delete Meeting Failed", "Meeting Not Found!");
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");


          }

        });//end calling deletemeeting

  }//end deletemeeting



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


  public viewMeetings(): any {
    this.router.navigate(['/meeting/admin-planner/view']);

  }


  /* Socket - Event Based Functions */

  //listened
  // public verifyUserConfirmation: any = () => {
  //   this.SocketService.verifyUser()
  //     .subscribe(() => {
  //       //console.log("In verify")
  //       this.SocketService.setUser(this.authToken);//in reply to verify user emitting set-user event with authToken as parameter.

  //     });//end subscribe
  // }//end verifyUserConfirmation

  public authErrorFunction: any = () => {

    this.SocketService.listenAuthError()
      .subscribe((data) => {
        this.toastr.info("Missing Authorization Key", "Please login again");
        this.router.navigate(['/user/login']);

      });//end subscribe
  }//end authErrorFunction

  public getOnlineUserList: any = () => {
    this.SocketService.onlineUserList()
      .subscribe((data) => {

        this.onlineUserList = []
        for (let x in data) {
          //let temp = { 'userId': x, 'userName': data[x] };
          this.onlineUserList.push(x);
        }

        // for (let user of this.allUsers) {

        //   if (this.onlineUserList.includes(user.userId)) {
        //     user.status = "online"
        //   } else {
        //     user.status = "offline"
        //   }

        // }

      });//end subscribe
  }//end getOnlineUserList


  //emitted 

  public notifyUpdatesToUser: any = (data) => {
    //data will be object with message and userId(recieverId)
    this.SocketService.notifyUpdates(data);

  }//end notifyUpdatesToUser


}
