import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import {CalendarEvent,CalendarEventAction,CalendarEventTimesChangedEvent,CalendarView} from 'angular-calendar';
import { setHours, setMinutes } from 'date-fns';
import { DatePipe } from '@angular/common';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays, 
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  subMonths,
  addMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { Subject, timer } from 'rxjs';
import { NgbModal,NgbActiveModal  } from '@ng-bootstrap/ng-bootstrap';


import { MeetingService } from './../../meeting.service';
import { SocketService } from 'src/app/socket.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as io from 'socket.io-client';

import * as moment from 'moment';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';

type CalendarPeriod = 'day' | 'week' | 'month';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};


function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth
  }[period](date);
}


@Component({
  selector: 'app-normal',
  templateUrl: './normal.component.html',
  styleUrls: ['./normal.component.css']
})
export class NormalComponent implements OnInit {
public userDetails : any

 constructor(public MeetingService : MeetingService, public SocketService : SocketService,public router : Router,public AppService :AppService, private toastr: ToastrService, private modal: NgbModal) { }

  ngOnInit() {
    this.userDetails = this.AppService.gertUserInfoFromLocalStorage();
    console.log(this.userDetails.firstName);
  
    this.getAllEvents();
    this.register();
    this.checkAdd();
    this.checkEdit();
    this.checkDelete();
    setTimeout(() => {
      this.remainderFunction();  
    }, 1000);
  }


  view: CalendarPeriod = 'month';
  minDate: Date = subMonths(new Date('2018-02-01'), 1);

  maxDate: Date = addMonths(new Date('2018-11-30'), 1);

  prevBtnDisabled: boolean = false;

  nextBtnDisabled: boolean = false;

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }  

  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }


  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalContent1') modalContent1: TemplateRef<any>;
  @ViewChild('remainder') remainder: TemplateRef<any>;
  @ViewChild('newAdd') newAdd: TemplateRef<any>;
  @ViewChild('newEdit') newEdit: TemplateRef<any>;
  @ViewChild('newDelete') newDelete: TemplateRef<any>;


  viewDate: Date = new Date();

  modalData: {
    action: string;
    event:CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();


 

  public allEvents:any;
  public getAllEvents = () =>{
    this.events = [];
    this.MeetingService.getAllEventsofUser(this.userDetails.userId).subscribe((response)=>{
      this.allEvents = response.data;
      for(let each of response.data){
        this.addEvent(each);
      }
    })
    this.refresh.next();
  } //getAllEvents

  events: CalendarEvent[] = [
    
  ];

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
        this.viewDate = date;  
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }

    this.modal.open(this.modalContent1, { size: 'lg' });

  }
  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }



  public currentClickedEvent;
  handleEvent(action: string, event: CalendarEvent): void {

    for(let each of this.allEvents){
      if(event.id == each.id){
        this.currentClickedEvent = each;
      }
    }
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }


  addEvent(each): void {
    this.events.push({
      title:each.title,
      id:each.id,
      start:new Date(each.start),
      end: new Date(each.end),
      color: colors.yellow,
      draggable: false,
      resizable: {
        beforeStart:false,
        afterEnd:false
      }
    });
    this.refresh.next();
  }

  public remainderInfo;
  public remainderFunction = () =>{
    let action="click";
    // console.log('running')
    for(let each of this.allEvents){


      if(moment(each.start).format('MM')==moment().format('MM')){

        if(moment(each.start).format('DD')==moment().format('DD')){

          if(moment(each.start).format('HH')==moment().format('HH')){

            let a = parseInt(moment(each.start).format('mm'))
             let b = parseInt(moment().format('mm'));
             
             if((a-b)==1){
               this.remainderInfo = each;
              this.modal.open(this.remainder,{size:'lg'})
              
             }
          }

        }

      }

    }
   setTimeout(() => {
      this.remainderFunction();
      }, 40000);
        } //remainder function

        public snooze = () =>{
          this.click(1,1);
          setTimeout(() => {
            this.click(1,1);
            this.modal.open(this.remainder,{size:'lg'});
          }, 5000);
      
        } //  end of snooze


        public click(x,y){
          var ev = document.createEvent("MouseEvent");
          var el = document.elementFromPoint(x,y);
          ev.initMouseEvent(
              "click",
              true /* bubble */, true /* cancelable */,
              window, null,
              x, y, 0, 0, /* coordinates */
              false, false, false, false, /* modifier keys */
              0 /*left*/, null
          );
          el.dispatchEvent(ev);
      } //  end of click


      public register = () =>{

        this.SocketService.sendUserId().subscribe((data)=>{
          this.SocketService.userId(this.userDetails.userId);
        })
      }

      public eventsAdded;
  public checkAdd = () =>{
    this.SocketService.check().subscribe((data)=>{
      this.getAllEvents()
      this.refresh.next();
      this.eventsAdded = data;
      setTimeout(() => {
        this.modal.open(this.newAdd, { size: 'sm' });
      }, 500);
    })
   
  }

  public eventEdited;
  public checkEdit = () =>{

    this.SocketService.checkEdit().subscribe((data)=>{
      this.getAllEvents()
      this.refresh.next();
    this.eventEdited = data;  
    // this.getAllEvents();
    setTimeout(() => {
      this.modal.open(this.newEdit, { size: 'sm' });
      
    }, 500);
   
    })

  }//cehckEdit

  public deletedEvent;
  public checkDelete = () =>{
    
    this.SocketService.checkDelete().subscribe((data)=>{
      this.getAllEvents()
      this.refresh.next();
      for(let each of this.allEvents){
        if(each.id==data.id){
          this.deletedEvent = each;
        }
        
      }

      setTimeout(() => {
        this.modal.open(this.newDelete, { size: 'sm' });  
      }, 500);
      
    })
  }

    public logout: any = () => {

      this.AppService.logout()
        .subscribe((apiResponse) => {
  
          if (apiResponse.status === 200) {
            console.log("logout called")
            Cookie.delete('authtoken');
  
            Cookie.delete('receiverId');
  
            Cookie.delete('receiverName');
  
          //  this.SocketService.exitSocket()
  
  
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
  




      


}//end class

