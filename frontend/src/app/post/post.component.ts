import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  textContent : string = "";
  imageContent : any = "";

  constructor(private http : HttpClient){}

  onUpload(event:any):void{
    this.imageContent = event.target.files[0];
  }
  uploadPost():void{
    console.log(this.textContent);
    console.log(this.imageContent);

    let userId = localStorage.getItem("userId");
    if(!userId) userId = '1';

    const form = new FormData();
    form.append("textContent", this.textContent);
    form.append("imageContent", this.imageContent, this.imageContent.name);
    form.append("userId", userId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem("token")}`);


    this.http.post<any>("http://localhost:3000/api/v1/user/post/upload", form, {headers})
    .subscribe((res)=>{
      console.log(res);
    });
  }
}
