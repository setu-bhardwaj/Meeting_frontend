
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
//import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ToastrService } from 'ngx-toastr';
//import { forgotPassword } from './forgotPassword';
import { generate } from 'shortid';
import { SocketService } from 'src/app/socket.service';

declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email: any;
  public password: any;

 // forgotEmail: forgotPassword;
 forgetEmail: string;
  data: any;
  errorMsg: string;

  constructor(
    public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    public socketService : SocketService
    // vcr: ViewContainerRef,
  ) {

    //this.toastr.setRootViewContainerRef(vcr);

  }

  ngOnInit() {
  }
  public goToSignUp: any = () => {

    this.router.navigate(['/signup']);

  } // end goToSignUp

  public signinFunction: any = () => {

    if (!this.email) {
      alert('enter email');
      // this.toastr.warning('enter email')


    } else if (!this.password) {

      //alert('enter password')
      this.toastr.warning('enter password')


    } else {

      let data = {
        email: this.email,
        password: this.password
      }

      this.appService.signinFunction(data).subscribe(
        (apiResponse) => {

          if (apiResponse.status === 200) {
            console.log('login success')
            this.toastr.success('Login Successful');
            console.log(apiResponse)
            //setting up the cookies at client side
            Cookie.set('authToken', apiResponse.data.authToken);
            Cookie.set('receiverId', apiResponse.data.userDetails.userId);

            Cookie.set('receiverName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);
            this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
console.log(apiResponse.data.userDetails.firstName.toLowerCase())
            if(apiResponse.data.userDetails.firstName.toLowerCase().endsWith('admin')){
              
            this.router.navigate([`meeting/admin/${apiResponse.data.userDetails.userId}`]);
        }
        else{
            this.router.navigate([`meeting/${apiResponse.data.userDetails.userId}`]);
        }

          } else if (apiResponse.status === 400) {
            this.toastr.error('Kindly check credentials');
          }
          else {
            // alert(apiResponse.message)
            this.toastr.error(apiResponse.message);


          }

        },
        (err) => {
          // alert('some error occured, please check entries again')
          this.toastr.error('some error occured, please check entries again')

        });

    } // end condition

  } // end signinFunction

  forgotpassword() {
    $('#regModal').modal('show');
  }

  forgetPass() {
    if(!this.forgetEmail){
        this.toastr.warning('Please enter email for recovery')
      }else{
   
        let data = {email :this.forgetEmail };
     
    this.appService.findUser(data).subscribe(apiResponse => {
        console.log(data)
        console.log(apiResponse);
      this.data = apiResponse;
      if (apiResponse.error) {
          //console.log(this.data)
        this.errorMsg = apiResponse.message;
        $('#regModal').modal('hide');
        this.toastr.error('Email is not Registered');
      } else {
        let details = {
            email:this.forgetEmail,
            PasswordResetToken:generate(),
            PasswordResetExpiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
          }
     
        this.appService.update(details).subscribe((response)=>{
            //  console.log(response);
             if(response.status===200){
              let mailDetails = {
                receiver:response.data.email,
                subject:'Your password reset Link Is Here',
                html:`<p>Hi ${response.data.firstName},</p>Below is your password reset link.</p><p>http://localhost:4200/reset-password/${details.PasswordResetToken}</p><br><p>Please note that it is valid for a period of 24hrs</p><br><p>Regards:</p><p>Meeting Planner Team</p>`
              }
              this.socketService.sendMail(mailDetails);
              //  this.router.navigate([`reset-passoword/${details.PasswordResetToken}`])
                this.toastr.success('Password reset mail sent to you');
             }else{
               this.toastr.error('some error occured, please try again')
             }
           },
           ((err)=>{
             this.toastr.error(err.message)
            })
            )


        $('#regModal').modal('hide');
        this.toastr.success('Password sent to your email', 'Password Sent');
      }
    });
  }}//forgetPass

  cancel() {
    $('#regModal').modal('hide');
  }

}//class
