import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MeetingService } from 'src/app/meeting.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';


@Component({
  selector: 'app-meeting-edit',
  templateUrl: './meeting-edit.component.html',
  styleUrls: ['./meeting-edit.component.css']
})
export class MeetingEditComponent implements OnInit {
  currentMeeting: any;
  constructor(public router: Router, public _router: ActivatedRoute, public meetingService: MeetingService,
    public modal: NgbModal, public AppService: AppService,
    public socketService: SocketService, public toastr: ToastrService) {

    console.log("inside meeting edit")
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');

  }


  public allUsers: any[];
  public userEmail;
  public userId;
  public userName;
  public userDetails: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;

  public meetingTitle: string;
  public meetingDescHtml: string;
  public blogDescription: string;
  public startAt: Date;
  public endAt: Date;
  public where: any;
  public userDetailsViaEmail: any;
  public userSelected;

  public fullName;


  public adminUserDetails = this.AppService.gertUserInfoFromLocalStorage();

  ngOnInit() {

    let myEventId = this._router.snapshot.paramMap.get('eventId');
    console.log(myEventId);


    this.authToken = Cookie.get('authToken');
    this.userDetails = this.AppService.gertUserInfoFromLocalStorage()
    // this.getAllUsers();
    this.meetingService.getSingleEvent(myEventId).subscribe(
      apiResponse => {
        console.log(apiResponse);
        this.currentMeeting = apiResponse.data;
        console.log("current meeting is : ");
        console.log(this.currentMeeting);
      }, error => {

        console.log("some error occured");
        this.toastr.error("some error occured : ", error.errorMessage)

      }

    )

  }




  public editMeeting: any = () => {

    console.log(this.currentMeeting[0].eventId);
    console.log(this.currentMeeting);
    this.meetingService.updateEvent(this.currentMeeting[0].eventId, this.currentMeeting[0]).subscribe(
      data => {
        console.log(data);
        this.toastr.success("Meeting updated successfully");

        let mailDetails = {
          receiver: this.currentMeeting.userEmail,
          subject: 'Meeting Modified',
          html: `<p>Hi ${this.currentMeeting.userName}, <p>A meeting has been modified by the admin . Kindly check your dashboard calender for details. </p><br><p>Regards:</p><p>Meeting planner team</p>`
        }

        this.socketService.sendMail(mailDetails);

        setTimeout(() => {
          this.router.navigate(['/event', this.currentMeeting[0].eventId]);
        }, 1000)
      },
      error => {
        console.log("some error occured");
        this.toastr.error("Error : ", error.message);
      }

    )

  }//edit meeting




  public logout: any = () => {

    this.AppService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('authtoken');

          Cookie.delete('receiverId');

          Cookie.delete('receiverName');

          //  this.SocketService.exitSocket()
          this.socketService.disconnectedSocket();
          this.socketService.exitSocket();


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
