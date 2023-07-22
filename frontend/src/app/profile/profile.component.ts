import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  //TODO: load cached user info

  userId : number = 0;
  username : string = "";
  description : string = "";
  //notifications : 

}
