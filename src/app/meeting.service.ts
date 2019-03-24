import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';

//import observable related code (as per version 6)
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  public baseUrl = 'http://localhost:3000/api/v1';
  private authToken = Cookie.get('authToken');

  constructor(public _http: HttpClient) {
    console.log("meeting service constructor is called");
    console.log(this.authToken);
  }//end constructor

  public userDetails = JSON.parse(localStorage.getItem('userInfo'));


  //exceptional handler
  private handleError(err: HttpErrorResponse) {
    console.log('Handle error http calls');
    console.log(err.message);
    return Observable.throw(err.message);
  }

  public getAllEvents = (): any => {
    let myResponse = this._http.get(this.baseUrl + '/meeting/getEvents/all?authToken=' + this.authToken);
    console.log(myResponse);
    return myResponse;
  } //get getAllEventsofUser

  public getAllEventsofUser = (userId): any => {

    let myResponse = this._http.get(`${this.baseUrl}/meeting/getEvents/user/${userId}?authToken=${this.authToken}`)
    return myResponse;
  } //get getAllEventsofUser


  public getEventByUserMail = (currentUserEmail): any => {
    let myResponse = this._http.get(`${this.baseUrl}/meeting/getEvents/email/${currentUserEmail}?authToken=${this.authToken}`)
    return myResponse;
  }//get Single event info

  public getSingleEvent = (currentEventId): any => {
    let myResponse = this._http.get(`${this.baseUrl}/meeting/getEvents/event/${currentEventId}?authToken=${this.authToken}`)
    return myResponse;
  }//get Single event info


  public getEventsOfDay = (details): any => {
    let myResponse = this._http.post(`${this.baseUrl}/meeting/getEvents/date/byDate?authToken=${this.authToken}`, details)
    return myResponse;

  } // end of get events of day



  public addEvent = (details): any => {
    let myResponse = this._http.post(`${this.baseUrl}/meeting/addEvent?authToken=${this.authToken}`, details);
    return myResponse;
  }//add events

  public updateEvent = (currentEventId, details): any => {
    let myResponse = this._http.put(`${this.baseUrl}/meeting/editEvent/${currentEventId}?authToken=${this.authToken}`, details);
    return myResponse;
  } //updateEvent

  public deleteEvent = (eventId): any => {
    let data = {}
    let myResponse = this._http.post(`${this.baseUrl}/meeting/deleteEvent/${eventId}?authToken=${this.authToken}`, data);
    return myResponse;
  }//deleteEvent
}//end class
