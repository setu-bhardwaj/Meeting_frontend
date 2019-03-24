import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  constructor(public appService: AppService, public socketService: SocketService, public _router: ActivatedRoute,
    public router: Router, private toastr: ToastrService) {

  }
  public token;
  public emailReceived;
  public date = new Date();

  ngOnInit() {
    this.token = this._router.snapshot.paramMap.get('token');

    this.getInfoUsingToken(this.token)
    this.update;
  }//oninit

  public getInfoUsingToken = (token) => {
    this.appService.getInfoUsingToken(token).subscribe((response) => {
      console.log(response)
      if ((response.data[0].PasswordResetToken == this.token) && (Date.parse(`${response.data[0].PasswordResetExpiration}`) > Date.parse(`${this.date}`))) {
        // console.log('user verified')
        this.emailReceived = response.data[0].email
      } else {
        this.toastr.success('some error occured')
        this.router.navigate(['/login'])
      }

    }, ((err) => {
      this.toastr.error('some error occured');
      this.router.navigate(['/login'])
    }))
  }

  public password;
  public update = () => {

    if (!this.emailReceived) {
      this.toastr.warning('some error has occured, please try again')
    } else {

      let details = {
        email: this.emailReceived,
        password: this.password
      }
      this.appService.updatePassword(details).subscribe((response) => {
        // console.log(response);

        if (response.status === 200) {
          this.toastr.success('password changed successfully . Please login');
          this.router.navigate(['/login'])
        } else {
          alert(response.message);
        }
      })

    }
  }

}//end class
