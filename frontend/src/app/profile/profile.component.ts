import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Notification } from '../model/Notification';
import { SharedServiceService } from '../shared-service.service';
import { Router } from '@angular/router';
import { BackendServersService } from '../backend-servers.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{

  userId  = localStorage.getItem("userId");
  username = localStorage.getItem("username");
  notifications : Notification[] = [];
  constructor(private http : HttpClient, private shared : SharedServiceService, private router : Router, private servers : BackendServersService){}

  ngOnInit(): void {
    this.shared.setRoute("profile");
    const userId = localStorage.getItem("userId");
    console.log(userId);
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem("token")}`);


    this.http.get<any>(this.servers.getNotificationServerAddress()+"/api/v1/user/notification?userId="+userId, {headers})
    .subscribe((response)=>{
      console.log(response.notifications);
      this.notifications = response.notifications;
    });
  }

  viewNotification(userId:number, postId:number):void {
    this.shared.setPostId(postId);
    this.removeNotification(userId, postId);
    this.router.navigate(["/view"]);
  }

  removeNotification(userId:number, postId:number):void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem("token")}`);

    this.http.patch(this.servers.getNotificationServerAddress()+'/api/v1/user/notification', {
      "userId" : userId,
      "postId" : postId
    }, {headers})
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
