import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AppService } from './../../app.service';
import { Router } from '@angular/router';
//import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public firstName: any;
  public lastName: any;
  public mobile: any;
  public email: any;
  public password: any;
  public countryCode: any;

  constructor(

    public appService: AppService,
    public socketService : SocketService,
    public router: Router,
    private toastr: ToastrService,
    vcr: ViewContainerRef) {
    // this.toastr.setRootViewContainerRef(vcr);
    console.log("signup constructor called");
  }

  ngOnInit() {
  }
  public goToSignIn: any = () => {

    this.router.navigate(['/login']);

  } // end goToSignIn

  public signupFunction: any = () => {

    if (!this.firstName) {
      //alert('enter first name');
      this.toastr.warning('enter first name')


    } else if (!this.lastName) {
      this.toastr.warning('enter last name');
      // alert('enter last name');
    }
    else if (!this.countryCode) {
      this.toastr.warning('enter mobile')
      // alert('Choose country code');

    }
    else if (!this.mobile) {
      this.toastr.warning('enter mobile')
      // alert('enter mobile')

    } else if (!this.email) {
      //this.toastr.warning('enter email')
      alert('enter email')

    } else if (!this.password) {
      //  alert('enter password')
      this.toastr.warning('enter password')
    }


    else {

      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        countryCode: this.countryCode,
        mobile: this.mobile,
        email: this.email,
        password: this.password,

      }

      console.log(data);
      this.appService.signupFunction(data).subscribe(

        (apiResponse) => {
          console.log(apiResponse);

          if (apiResponse.status === 200) {
            // alert('Signup successful');
            this.toastr.success('Signup successful');

            let mailDetails = {
              receiver:apiResponse.data.email,
              subject:'Welcome to Meeting app',
              html:`<p>Hi ${apiResponse.data.firstName}, <p>Thank you for joining us, we are happy to have you on board</p><br><p>Regards:</p><p>Meeting app team</p>`
            }
        
            this.socketService.sendMail(mailDetails);

            setTimeout(() => {
              this.goToSignIn();
            }, 2000);

          } else {
            //    alert(apiResponse.message);
            this.toastr.error(apiResponse.message);
          }

        }//success
        , (err) => {
          //alert('some error occured');

          this.toastr.error('some error occured');

        });

    } // end condition

  } // end signupFunction

}


 