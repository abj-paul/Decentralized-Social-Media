import { Component, OnInit } from '@angular/core';
import { Post } from '../model/Post';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit{
  posts : Post [] = [];

  constructor(private http : HttpClient){}

  ngOnInit(): void {
    const userId = 1; //TODO
    this.http.get<any>(`http://localhost:3000/api/v1/user/post/get?userId=${userId}`)
    .subscribe((response)=>{
      this.posts = response.posts;
    });
  }
}
