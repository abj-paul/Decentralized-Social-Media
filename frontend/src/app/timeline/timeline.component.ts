import { Component, OnInit } from '@angular/core';
import { Post } from '../model/Post';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit{
  posts : Post [] = [];

  constructor(private http : HttpClient){}

  ngOnInit(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem("token")}`);
    const userId = localStorage.getItem("userId");
    console.log(userId);

    this.http.get<any>(`http://localhost:3000/api/v1/user/post/get?userId=${userId}`, {headers}) //
    .subscribe((response)=>{
      this.posts = response.posts;
    });
  }
}
