import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';

//import 'rxjs/add/operator/catch';
//import 'rxjs/add/operator/do';
//import 'rxjs/add/operator/toPromise';

//import observable related code (as per version 6)
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public baseUrl = 'http://localhost:3000/api/v1';
  private authToken = Cookie.get('authToken');

  constructor(public _http: HttpClient) {
    console.log("app service constructor is called");
    console.log(this.authToken);
  }//end constructor

  public gertUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage = (data) => {
    return localStorage.setItem('userInfo', JSON.stringify(data));
  }


  //exceptional handler
  private handleError(err: HttpErrorResponse) {
    console.log('Handle error http calls');
    console.log(err.message);
    return Observable.throw(err.message);
  }


  public signupFunction(data): Observable<any> {
    let myResponse = this._http.post(this.baseUrl + '/users/signup', data);
    console.log(myResponse);
    return myResponse;


  }//signupFunction

  public signinFunction(data): Observable<any> {

    let myResponse = this._http.post(this.baseUrl + '/users/login', data);
    console.log(myResponse);
    return myResponse;


  }//signinFunction   

  public logout(): Observable<any> {

    const params = new HttpParams().set('authToken', Cookie.get('authToken'))
    console.log(params);

    return this._http.post(`${this.baseUrl}/users/logout`, params);

  } // end logout function


  public findUser(email): Observable<any> {
    // console.log(`${this.baseUrl}/users/findUser`,email)
    let response = this._http.post(`${this.baseUrl}/users/findUser`, email);
    return response;
  } // end of forgot password

  // public forgotPassword(email): Observable<any> {
  //   console.log(email)
  //   let response = this._http.post(this.baseUrl + '/users/forgotPassword', email);
  //   return response;
  // } // end of forgot password

  public update = (details): any => {
    return this._http.post(`${this.baseUrl}/users/update`, details);
  }


  public getInfoUsingToken = (token): any => {
    return this._http.get(`${this.baseUrl}/users/verify/${token}`);
  }

  public updatePassword = (details): any => {
    return this._http.post(`${this.baseUrl}/users/updatePassword`, details);
  }


  public getAllUsers = (): any => {
    console.log(this.authToken);

    let myResponse = this._http.get(`${this.baseUrl}/users/view/allUsers?authToken=${this.authToken}`)
    return myResponse;
  } //get all users

  public getSingleUser = (userId): any => {
    return this._http.get(`${this.baseUrl}/users/${userId}/userDetails`);
  }
}//class



