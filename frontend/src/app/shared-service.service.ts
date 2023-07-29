import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {
  current_route : string = "";
  username : string = "";
  postId : number = 1;

  constructor() { }

  setRoute(newRoute : string) : void {
    this.current_route = newRoute;
  }
  getRoute():string {
    return this.current_route;
  }

  getPostId():number {
    return this.postId;
  }
  setPostId(postId:number):void {
    this.postId = postId;
  }
}
