import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Notification } from '../model/Notification';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{

  userId  = localStorage.getItem("userId");
  username = localStorage.getItem("username");
  notifications : Notification[] = [];
  constructor(private http : HttpClient){}

  ngOnInit(): void {
    const userId = localStorage.getItem("userId");
    this.http.get<any>("http://localhost:3000/api/v1/user/notification?userId="+userId)
    .subscribe((response)=>{
      this.notifications = response.notifications;
    });
  }

  removeNotification(notificationId:number):void {
    this.http.delete("http://localhost:3000/api/v1/user/notification?notificationId="+notificationId)
    .subscribe((response)=>{
      this.notifications.splice(notificationId, 1);
      console.log(this.notifications);
    })
  }
}
