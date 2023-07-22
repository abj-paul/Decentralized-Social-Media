import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  username : string = "";
  password : string = "";
  description : string = "";
  registrationStatus : string = "";

  constructor(private http : HttpClient){}

  registerUser() : void {
    this.http.post<any>("http://localhost:3000/api/v1/authentication/register", {
      "username" : this.username,
      "password" : this.password,
      "description" : this.description
    }).subscribe((response)=>{
      console.log(response);
      this.registerUser = response["message"];
    })
  }
}
