import { Component, OnInit,TemplateRef,ViewChild} from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import {Location, Time}  from '@angular/common';
import { CalendarEvent } from 'angular-calendar';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import * as moment from 'moment';

import {
  CalendarEventAction,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';

import { Cookie } from 'ng2-cookies/ng2-cookies';
import { MeetingService } from 'src/app/meeting.service';
import { AppService } from 'src/app/app.service';
import { SocketService } from 'src/app/socket.service';
import { ToastrService } from 'ngx-toastr';

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
  selector: 'app-admin-planner',
  templateUrl: './admin-planner.component.html',
  styleUrls: ['./admin-planner.component.css']
})
export class AdminPlannerComponent implements OnInit {

  view: CalendarPeriod = 'month';

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalContent1') modalContent1: TemplateRef<any>;
  @ViewChild('add') add: TemplateRef<any>;
  @ViewChild('edit') edit: TemplateRef<any>;


  constructor(public router:Router,public _router:ActivatedRoute,public meetingService:MeetingService,public modal:NgbModal,public appService:AppService,
    public socketService:SocketService,public toastr : ToastrService) { }
    public currentUserId;

    public adminUserDetails = this.appService.gertUserInfoFromLocalStorage();

  ngOnInit() {

    
    this.currentUserId = this._router.snapshot.paramMap.get('userId');
    this.getAllEvents();
    this.getAllDetailsOfCurrentUser();
    
  }

  //  //code for limiting the number of  months

  //  minDate: Date = subMonths(new Date('2018-02-01'), 1);

  //  maxDate: Date = addMonths(new Date('2018-11-30'), 1);
 
  //  prevBtnDisabled: boolean = false;
 
  //  nextBtnDisabled: boolean = false;
 
  //  dateIsValid(date: Date): boolean {
  //    return date >= this.minDate && date <= this.maxDate;
  //  }
 
  //  dateOrViewChanged(): void {
  //    this.prevBtnDisabled = !this.dateIsValid(
  //      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
  //    );
  //    this.nextBtnDisabled = !this.dateIsValid(
  //      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
  //    );
  //    if (this.viewDate < this.minDate) {
  //      this.changeDate(this.minDate);
  //    } else if (this.viewDate > this.maxDate) {
  //      this.changeDate(this.maxDate);
  //    }
  //  }
 
  //  changeDate(date: Date): void {
  //    this.viewDate = date;
  //    this.dateOrViewChanged();
  //  }  
 
  //  increment(): void {
  //    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  //  }
 
  //  decrement(): void {
  //    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  //  }
 
  //  today(): void {
  //    this.changeDate(new Date());
  //  }
 
 
  //  // end of limiting months code
 
 
   public allEvents;
   public getAllEvents = () =>{
 
     this.events = [] ;
     this.meetingService.getAllEventsofUser(this.currentUserId).subscribe((response)=>{
          this.allEvents = response.data;
       for(let each of response.data){
         this.addEvent(each);
        
       }
 
     })
    
     this.refresh.next();
 
   } // end of get all events
 
   
 
 
   // view: string = 'month';
 
   viewDate: Date = new Date();
 
   modalData: {
     action: string;
     event: CalendarEvent;
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
 
   events: CalendarEvent[] = []
 
 
   activeDayIsOpen: boolean = true;
 
   public seletedDayEvents = [];
   public showAllEvents = true;
   dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
 
     this.seletedDayEvents = [];
     this.addTitle = '';
     this.addWhere = '';
     this.addPurpose = '';
     this.showAllEvents = true;
     // console.log(events);
     if (isSameMonth(date, this.viewDate)) {
       if (
         (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
         events.length === 0
       ) {
         this.activeDayIsOpen = false;
       } else {
         this.activeDayIsOpen = true;
         this.viewDate = date;
       }
     }
 
     this.meetingService.getAllEventsofUser(this.currentUserId).subscribe((response)=>{
 
       for(let each of response.data){
 
         for(let each1 of events){
 
           if(each.id==each1.id){
 
             this.seletedDayEvents.push(each);
 
           }
 
         }
 
       }
 
     })
       this.sd = this.ed = moment(date).format('YYYY-MM-DD');
       this.st = this.et =  moment(date).format('HH:mm');
   //  this.addStart = moment(date).format('YYYY-MM-DD')+'T'+moment(date).format('HH:mm')
   //  this.addEnd = moment(date).format('YYYY-MM-DD')+'T'+moment(date).format('HH:mm')
     
   //  this.seletedDayEvents = events; 
     this.modal.open(this.modalContent1,{size:'lg'});
   } // end of day clicked
 
   
   public addEventz = () =>{
   
   this.click(1,1);
   this.modal.open(this.add,{size:'lg'})  
   }
   public sd;
   public st;
   public ed;
   public et;
   // public addStart;  
   // public addEnd;
   public addTitle;
   public addWhere;
   public addPurpose;
   
   public saveEvent = () =>{
    
     let details ={ 
       userId:this.currentUserId,
       start:this.sd+'T'+this.st,
       end:this.ed+'T'+this.et,
       title:this.addTitle,
       where:this.addWhere,
       purpose:this.addPurpose,
       createdBy:this.adminUserDetails.firstName+' '+this.adminUserDetails.lastName
     }
 
 
     // console.log(details);
     this.meetingService.addEvent(details).subscribe((response)=>{
 
       if(response.status === 200){
         this.getAllEvents();
         this.click(1,1);
         this.toastr.success('success','Event added');
       }
       
 
     })
 
     this.socketService.newEvent(details);
 
     let mailDetails = {
       receiver:this.detailsOfCurrentUser[0].email,
       subject:'A new event has been added to your calender.',
       html:`<p>Hi,</p><p>A new event has been added to your calender</p><h4>${this.addTitle}</h4><p>${moment(this.sd+'T'+this.st).format('MMMM Do YYYY, h:mm:ss a')}</p><p>TO</p><p>${moment(this.ed+'T'+this.et).format('MMMM Do YYYY, h:mm:ss a')}</p><br><p>Regards:</p><p>My-Planner team</p>`
     }
     // console.log(mailDetails);
     this.socketService.sendMail(mailDetails);
 
   } //  end of save event
 
   public idOfEventToBeEdited;
   public editEvent = (event) =>{
     this.showAllEvents = false;
     this.idOfEventToBeEdited = event.target.id.slice(4);
     this.click(1,1);
     for(let each of this.allEvents){
       if(each.id == this.idOfEventToBeEdited){
         this.esd = moment(each.start).format('YYYY-MM-DD')
         this.est = moment(each.start).format('HH:mm')
         this.eed = moment(each.end).format('YYYY-MM-DD')
         this.eet = moment(each.end).format('HH:mm')
         this.editTitle = each.title
         this.editWhere = each.where,
         this.editPurpose = each.purpose
       }
     }
   this.modal.open(this.edit,{size:'lg'})  
 
   } //  end of editEvent
 
   // public editStart;
   // public editEnd;
   public esd;
   public est;
   public eed;
   public eet;
 
   public editTitle;
   public editWhere;
   public editPurpose;
   public saveEditedEvent = () =>{
 
     let details = {
       id:this.idOfEventToBeEdited,
       start:this.esd+'T'+this.est,
       end:this.eed+'T'+this.eet,
       title:this.editTitle,
       where:this.editWhere,
       purpose:this.editPurpose,
       userId:this.currentUserId
     }
 
     this.meetingService.updateEvent(this.idOfEventToBeEdited,details).subscribe((response)=>{
       if(response.status === 200){
         this.getAllEvents();
         this.toastr.success('success','Event edited');
         this.click(1,1);
       }
     })
 
     this.socketService.eventEdited(details);
 
     
     let mailDetails = {
       receiver:this.detailsOfCurrentUser[0].email,
       subject:'An event has been edited in your calender.',
       html:`<p>Hi,</p><p>An event has been edited in your calender.</p><h4>${this.addTitle}</h4><p>${moment(this.esd+'T'+this.est).format('MMMM Do YYYY, h:mm:ss a')}</p><p>TO</p><p>${moment(this.eed+'T'+this.eet).format('MMMM Do YYYY, h:mm:ss a')}</p><br><p>Regards:</p><p>My-Planner team</p>`
     }
 
     this.socketService.sendMail(mailDetails);
 
   } //  end of save edited event
 
   public deleteEvent = (event) =>{
 
     let id = event.target.id;
 
     let details = {
       id:id
     }
 
     this.meetingService.deleteEvent(details).subscribe((response)=>{
 
       if(response.status===200){
         let main = document.getElementById('main'+id)
       main.parentNode.removeChild(main);
       this.getAllEvents();
       }
       this.toastr.success('Success','event deleted')
     })
 
     let nd={
       userId:this.currentUserId,
       id:id
     }
 
 this.socketService.eventDeleted(nd)
  
 
 let mailDetails = {
   receiver:this.detailsOfCurrentUser[0].email,
   subject:'A event has been deleted.',
   html:`<p>Hi,</p><h4>An event has been deleted from you calender, please check your calender</h4><br><p>Regards:</p><p>My-Planner team</p>`
 }
 
 this.socketService.sendMail(mailDetails);
 
 } // end of delete event
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
       title: each.title,
       start:new Date(each.start),
       end: new Date(each.end),
       color: colors.red,
       draggable: true,
       resizable: {
         beforeStart: true,
         afterEnd: true
       },
       id:each.id
     });
     this.refresh.next();
   }
 
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
 }
 
 public detailsOfCurrentUser;
 public getAllDetailsOfCurrentUser = () =>{
   this.appService.getSingleUser(this.currentUserId).subscribe((response)=>{
 
     this.detailsOfCurrentUser = response.data;
   })
 
 
 } //  end of get all details of current user
 
 
 public logout = () =>{
   Cookie.delete('authToken');
   this.router.navigate(['/about'])
 }
 

 
 }
 
 
 
