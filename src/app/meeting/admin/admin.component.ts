import { Component, OnInit } from '@angular/core';

import {Router} from '@angular/router'
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(public router:Router,public AppService: AppService) { }

  ngOnInit() {
    this.getAllUsers()

  }

  public allUsers = [];

  public emailToSearch;

  public showSearchResult = false;

  public getAllUsers = ()=>{

    this.AppService.getAllUsers().subscribe((response)=>{

      if(response.status === 200){

        this.allUsers = response.data;
        // console.log(this.allUsers)
      }

    })

  }//get All Users

  public searchResults = {
    email:'',
    firstName:'',
    lastName:'',
    userId:''
  }
  public search = () =>{
    
    for(let each of this.allUsers){

      if(each.email == this.emailToSearch){
        this.searchResults.email = each.email;
        this.searchResults.firstName = each.firstName;
        this.searchResults.lastName = each.lastName;
        this.searchResults.userId = each.userId;
        this.showSearchResult = true;
      }

    }

  } //  end of search

  public capture = ()=>{

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



          this.router.navigate(['/']);

        } else {
          //alert(apiResponse.message)
          console.log(apiResponse.message)

        } // end condition

      }, (err) => {
        // alert('some error occured');
        console.log('some error occured')


      });

  } // end logout



}
