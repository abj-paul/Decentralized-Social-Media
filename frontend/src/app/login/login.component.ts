import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username : string = "";
  password : string = "";
  loginStatus : string = "";

  constructor(private http : HttpClient, private router : Router){}

  authenticate():void{
    this.http.post<any>("http://localhost:3000/api/v1/authentication/login", {
      "username" : this.username,
      "password" : this.password
    }).subscribe((response)=>{
      this.loginStatus = response["message"];
      localStorage.setItem("token",response["token"]);
      localStorage.setItem("userId", response["userId"]);
      localStorage.setItem("username", response["username"]);
      console.log(response);

      this.router.navigate(["/timeline"]);
    })
  }
}
