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

  removeNotification(userId:number, postId:number):void {
    this.http.patch('http://localhost:3000/api/v1/user/notification', {
      "userId" : userId,
      "postId" : postId
    })
    .subscribe((response)=>{
      let newNotifications : Notification[] = [];
      this.notifications.forEach((element)=>{
        if((element.postId==postId && element.userId==userId)==false)
          newNotifications.push(element);
      });
      this.notifications = newNotifications;
    })
  }
}
