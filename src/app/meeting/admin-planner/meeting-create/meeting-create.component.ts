import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MeetingService } from 'src/app/meeting.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';





@Component({
  selector: 'app-meeting-create',
  templateUrl: './meeting-create.component.html',
  styleUrls: ['./meeting-create.component.css']
})
export class MeetingCreateComponent implements OnInit {


  constructor(public router: Router, public _router: ActivatedRoute, public meetingService: MeetingService,
    public modal: NgbModal, public AppService: AppService, public socketService: SocketService,
    public SocketService: SocketService, public toastr: ToastrService) {

    console.log("inside meeting create")
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
  // public possibleUsers = [{name : "dgdfg" ,email:"dsfjk@gail.com"},
  // {name:"sgdfc",email:"fhjdjkdf@gmail.com"}]
  public fullName;


  public adminUserDetails = this.AppService.gertUserInfoFromLocalStorage();
  ngOnInit() {

    this.authToken = Cookie.get('authToken');
    this.userDetails = this.AppService.gertUserInfoFromLocalStorage()
    this.getAllUsers();

    // console.log(this.getAllUsers())
  }//oninit


  public getAllUsers = () => {
    console.log("inside api users");


    this.AppService.getAllUsers().subscribe((response) => {
      console.log(response)
      if (response.status === 200) {

        this.allUsers = response.data;

      }
      console.log(this.allUsers)
      // console.log(typeof(this.allUsers[3].email))
      //  this.userCategory = this.allUsers


    })

  }//get All Users


  public getUserByEmail(): any {
    console.log(this.userSelected)
    this.meetingService.getEventByUserMail(this.userSelected).subscribe(
      apiResponse => {
        //console.log(apiResponse.data);

        this.userDetailsViaEmail = apiResponse.data;
        console.log(this.userDetailsViaEmail);
      },
      error => {
        console.log("some error ocured")
        this.toastr.error(error.errorMessage);
      }

    )

  }

  public validateDate(startDate: any, endDate: any): boolean {
    let start = new Date(startDate);
    let end = new Date(endDate);

    if (end < start) {
      return true;
    }
    else {
      return false;
    }
  }//end validateDate


  public validateCurrentDate(startDate: any): boolean {

    let start = new Date(startDate);
    let end: any = new Date();

    if (end > start) {
      return true;
    }
    else {
      return false;
    }

  }//end validating start/end date





  public addMeeting: any = () => {
    console.log(this.allUsers)
    console.log(this.userSelected)

    for (let i = 0; i < this.allUsers.length; i++) {
      if (this.userSelected == this.allUsers[i].email) {
        this.userDetailsViaEmail = this.allUsers[i]
      }
    }

    console.log(this.userDetailsViaEmail);

    if (this.validateDate(this.startAt, this.endAt)) {
      this.toastr.warning("End Date/Time cannot be before Start Date/Time");
    }

    else {
      let fullName = `${this.userDetailsViaEmail.firstName} ${this.userDetailsViaEmail.lastName}`

      let meetingData = {
        title: this.meetingTitle,
        description: this.meetingDescHtml,
        startAt: this.startAt,
        endAt: this.endAt,
        where: this.where,
        userId: this.userDetailsViaEmail.userId,
        userName: fullName,
        userEmail: this.userDetailsViaEmail.email
      }

      //    console.log("user selected: " + this.userDetailsViaEmail)
      console.log(meetingData);

      this.meetingService.addEvent(meetingData).subscribe(

        apiResponse => {
          if (apiResponse.status === 200) {

            console.log("Meeting added successfully and user been notified")
            this.toastr.success("Meeting added successfully and user been notified");
            setTimeout(() => {
              this.router.navigate(['event/', apiResponse.data.eventId]);
            }, 1000)

            //sending mail post meeting create
            let mailDetails = {
              receiver: meetingData.userEmail,
              subject: 'A new Meeting been scheduled',
              html: `<p>Hi ${meetingData.userName}, <p>A new meeting has been schedueld by the admin . Kindly check your dashboard calender for details </p><br><p>Regards:</p><p>Meeting planner team</p>`
            }

            this.socketService.sendMail(mailDetails);

            //end send mail
          }



        },
        error => {
          console.log(error.errorMessage);
          this.toastr.error('Some error occured', error.errorMessage);
        }

      )


    }
  }//get add meeting

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
