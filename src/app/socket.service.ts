import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import * as io from 'socket.io-client';

import {Observable, observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public url = "http://localhost:3000/"
  public socket;

  constructor(public http:HttpClient) { 
    console.log('in socket service');
    this.socket = io(this.url);
  }//end constructor

  public sendMail = (maildetails) =>{
    console.log(maildetails);
    this.socket.emit('sendMail',maildetails);
  }

  public sendUserId = () =>{

    return Observable.create((observer)=>{

      this.socket.on('sendUserId',(data)=>{
        observer.next(data)
      })

    })

  }//sendUserId

  public check = () =>{
    return Observable.create((observer) =>{
      this.socket.on('newEventAdded',(data)=>{
        observer.next(data);
      })

    })
  }//check

  public checkEdit = () =>{
    return Observable.create((observer) =>{
      this.socket.on('eventEdited',(data)=>{
        observer.next(data);
      })

    })
  }//checkEdit

  public checkDelete = () =>{
    return Observable.create((observer) =>{
      this.socket.on('eventDeleted',(data)=>{
        observer.next(data);
      })

    })
  }//checkDelete

    // events to be emitted
    public userId = (id)=>{
      this.socket.emit('userId',id)
    } 
  
    public newEvent = (details) =>{
      this.socket.emit('newEvent',details)
    }
  
    public eventEdited = (details) =>{
      this.socket.emit('eventEdited',details)
    }
  
    
    public eventDeleted = (details) =>{
      this.socket.emit('eventDeleted',details)
    }
  












}//end class


