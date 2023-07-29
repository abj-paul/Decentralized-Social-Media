import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {
  current_route : string = "";
  constructor() { }

  setRoute(newRoute : string) : void {
    this.current_route = newRoute;
  }
  getRoute():string {
    return this.current_route;
  }
}
