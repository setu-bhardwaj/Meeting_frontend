import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { HttpClient, HttpHeaders, } from '@angular/common/http';

import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import * as io from 'socket.io-client';

import { Observable, observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public url = "http://localhost:3000/"
  public socket;

  constructor(public http: HttpClient) {
    console.log('in socket service');
    this.socket = io(this.url);
  }//end constructor


  //to emit
  public sendMail = (maildetails) => {
    console.log(maildetails);
    this.socket.emit('sendMail', maildetails);
  }

  public setUser = (authToken) => {
    this.socket.emit('set-user', authToken);
  }


  public notifyUpdates = (data) => {
    this.socket.emit('notify-updates', data);
  }

  public exitSocket = () => {
    this.socket.disconnect();
  }// end exit socket

  public disconnectedSocket = () => {

    this.socket.emit("disconnect", "");

  }//end disconnectedSocket



  //to lsiten

  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      });//On method
    });//end observable
  }//end verifyUser

  public onlineUserList = () => {
    return Observable.create((observer) => {
      this.socket.on('online-user-list', (userList) => {
        observer.next(userList);
      });//end On method
    });//end observable

  }//end onlineUserList


  public listenAuthError = () => {
    return Observable.create((observer) => {
      this.socket.on('auth-error', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end listenAuthError


  public getUpdatesFromAdmin = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end getUpdatesFromAdmin


  public sendUserId = () => {

    return Observable.create((observer) => {

      this.socket.on('sendUserId', (data) => {
        observer.next(data)
      })

    })

  }//sendUserId

  public disconnect = () => {
    return Observable.create((observer) => {
      this.socket.on('disconnect', () => {
        observer.next();
      });//end On method
    });//end observable

  }//end disconnect








  //exceptional handler
  private handleError(err: HttpErrorResponse) {
    console.log('Handle error http calls');
    console.log(err.message);
    return Observable.throw(err.message);
  }







}//end class


