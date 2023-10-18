import { Component, OnInit } from '@angular/core';
import { Post } from '../model/Post';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedServiceService } from '../shared-service.service';
import { BackendServersService } from '../backend-servers.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit{
  posts : Post [] = [];
  username : string = "";

  constructor(private http : HttpClient, private shared : SharedServiceService, private servers : BackendServersService){}

  ngOnInit(): void {
    this.shared.setRoute("timeline");
    this.username = this.shared.username;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem("token")}`);
    const userId = localStorage.getItem("userId");
    console.log(userId);

    this.http.get<any>(this.servers.getPostServerAddress()+`/api/v1/user/post?userId=${userId}`, {headers}) //
    .subscribe((response)=>{
      console.log(response);
      
      this.posts = response.posts;
      console.log(this.posts);
    });
  }
}
