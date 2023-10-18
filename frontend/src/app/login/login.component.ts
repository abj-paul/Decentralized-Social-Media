import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedServiceService } from '../shared-service.service';
import { BackendServersService } from '../backend-servers.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  username : string = "";
  password : string = "";
  loginStatus : string = "";

  constructor(private http : HttpClient, private router : Router, private shared : SharedServiceService, private servers : BackendServersService){}
  ngOnInit(): void {
    this.shared.setRoute("login");
  }

  authenticate():void{
    this.http.post<any>(this.servers.getLoginServerAddress()+"/api/v1/authentication/login", {
      "username" : this.username,
      "password" : this.password
    }).subscribe((response)=>{
      this.loginStatus = response["message"];
      localStorage.setItem("token",response["token"]);
      localStorage.setItem("userId", response["userId"]);
      localStorage.setItem("username", response["username"]);
      console.log(response);

      this.shared.username = this.username;
      this.router.navigate(["/timeline"]);
    })
  }
}
