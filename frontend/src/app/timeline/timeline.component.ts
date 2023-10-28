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
    const userId = localStorage.getItem("userId");
    console.log(userId);

    this.http.get<any>(this.servers.getPostServerAddress() + `/api/v1/user/timeline?userId=${userId}`, {
      headers:   new HttpHeaders({'Authorization': 'Bearer ' + localStorage.getItem("token")})
    }).subscribe(
        (response) => {
          console.log(response);
          if (response && response.posts) {
            this.posts = response.posts;
            console.log(this.posts);
          } else {
            console.error("Invalid response format or missing 'posts' property.");
          }
        },
        (error) => {
          console.error("An error occurred:", error);
          // Handle error appropriately, e.g., show an error message to the user.
        }
      );
    
  }
}
