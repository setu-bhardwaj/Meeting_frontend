import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import{FormsModule} from '@angular/forms';
import{RouterModule,Routes} from '@angular/router';
import { AdminComponent } from '../meeting/admin/admin.component';
import { NormalComponent } from '../meeting/normal/normal.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

@NgModule({
  declarations: [LoginComponent, SignupComponent, ForgetPasswordComponent, PasswordResetComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
       {path:'meeting/admin/:userId',component:AdminComponent},
       {path:'meeting/:userId',component:NormalComponent},


 

    ])
  ]
})
export class UserModule { }
