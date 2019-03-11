import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { AboutComponent } from './about/about.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserModule } from './user/user.module';
import { MeetingModule } from './meeting/meeting.module';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 
import { ToastrModule } from 'ngx-toastr';
import { SignupComponent } from './user/signup/signup.component';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from './socket.service';
import { PasswordResetComponent } from './user/password-reset/password-reset.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingService } from './meeting.service';


@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    NotFoundComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    UserModule,
    MeetingModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: 'signup', component: SignupComponent },
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'reset-password/:token',component:PasswordResetComponent},
      { path: '*', component: NotFoundComponent },
      { path: '**', component: NotFoundComponent },
     
      

    ]),

  ],
  providers: [AppService,SocketService,MeetingService],
  bootstrap: [AppComponent]
})
export class AppModule {}
