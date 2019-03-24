import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MeetingService } from 'src/app/meeting.service';
import { Location } from '@angular/common';
import { Toast, ToastrModule, ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-meeting-view',
  templateUrl: './meeting-view.component.html',
  styleUrls: ['./meeting-view.component.css'],
  providers: [Location]
})
export class MeetingViewComponent implements OnInit {

  public currentMeeting;

  constructor(private _route: ActivatedRoute, private router: Router, private appService: AppService, public socketService: SocketService,
    private meetingService: MeetingService, private location: Location, public toastr: ToastrService) { }

  ngOnInit() {

    let myEventId = this._route.snapshot.paramMap.get('eventId');
    console.log(myEventId);

    this.meetingService.getSingleEvent(myEventId).subscribe(
      apiResponse => {

        this.currentMeeting = apiResponse.data[0]
        console.log(this.currentMeeting);

      },
      error => {
        console.log('some error occured');
        this.toastr.error(error.errorMessage);
      }
    )
  }//oninit

  deleteThisMeeting(): any {
    console.log(this.currentMeeting);
    this.meetingService.deleteEvent(this.currentMeeting.eventId).subscribe(
      data => {
        console.log(data);
        console.log('Meeting Deleted successfully');
        this.toastr.success('Meeting Deleted successfully and user notified');
        setTimeout(() => {
          this.router.navigate(['/meeting/admin-planner/view']);
        }, 1000)

        let mailDetails = {
          receiver: this.currentMeeting.userEmail,
          subject: 'Meeting Deleted',
          html: `<p>Hi ${this.currentMeeting.userName}, <p>A meeting has been deleted by the admin . Kindly check your dashboard calender for details. </p><br><p>Regards:</p><p>Meeting planner team</p>`
        }

        this.socketService.sendMail(mailDetails);


      },
      error => {
        console.log("some error occured");
        console.log(error.errorMessage);
        this.toastr.error('some error occured', error.errorMessage);

      }
    )
  }// end delete this blog 

  goBackToPreviousPage(): any {
    this.location.back();
  }//going back


}

