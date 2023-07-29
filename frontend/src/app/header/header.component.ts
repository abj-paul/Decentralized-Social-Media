import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedServiceService } from '../shared-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent{
  current_page_name : string = "";

  constructor(private router : Router, private shared :SharedServiceService){}

  goBack():void {
    if(this.shared.getRoute()=="registration"){
      this.router.navigate(['/home']);
    }else if(this.shared.getRoute()=="login"){
      this.router.navigate(["/home"]);
    }else if(this.shared.getRoute()=="timeline"){
      this.router.navigate(["/profile"]);
    }else if(this.shared.getRoute()=="profile"){
      this.router.navigate(["/timeline"]);
    }else if(this.shared.getRoute()=="post"){
      this.router.navigate(["/timeline"]);
    }
  }
}
