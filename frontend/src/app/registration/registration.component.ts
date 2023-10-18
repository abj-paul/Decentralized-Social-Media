import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SharedServiceService } from '../shared-service.service';
import { BackendServersService } from '../backend-servers.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit{
  username : string = "";
  password : string = "";
  description : string = "";
  registrationStatus : string = "";

  constructor(private http : HttpClient, private shared : SharedServiceService, private servers : BackendServersService){}
  ngOnInit(): void {
    this.shared.setRoute("registration");
  }

  registerUser() : void {
    this.registrationStatus = "";

    this.http.post<any>(this.servers.getLoginServerAddress()+"/api/v1/authentication/register", {
      "username" : this.username,
      "password" : this.password,
      "description" : this.description
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          // Handle 400 status code here
          console.log('Bad Request:', error.error.message);
        } else {
          // Handle other errors
          console.error('An error occurred:', error);
        }
        this.registrationStatus = error.error.message;
        return throwError('Something went wrong. Please try again later.');
      })
    ).subscribe((response)=>{
      console.log(response);
      this.registrationStatus = response.message;
      this.registerUser = response["message"];
    })
  }
}
