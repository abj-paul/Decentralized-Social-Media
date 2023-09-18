import { Component, OnInit } from '@angular/core';
import { SharedServiceService } from '../shared-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.css']
})
export class SinglePostComponent implements OnInit {

  post : any ; 
  constructor(private shared : SharedServiceService, private http : HttpClient){}

  ngOnInit(): void {
    this.shared.setRoute("single-post");
    const postId  = this.shared.getPostId();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem("token")}`);

    this.http.get<any>("http://localhost:3001/api/v1/user/post/"+postId, {headers})
    .subscribe((req)=>{
      console.log(req);
      this.post = req.postContent[0];
    })

  }

}
