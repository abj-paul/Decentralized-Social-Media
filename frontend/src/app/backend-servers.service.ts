import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendServersService {

  private loginServer : string = "http://localhost:3000";
  private postServer : string = "http://localhost:3001";
  private notificationServer : string = "http://localhost:3002";

  constructor() { }

  public getLoginServerAddress(){
    return this.loginServer;
  }
  public getPostServerAddress() : String {
    return this.postServer;
  }
  public getNotificationServerAddress() : String {
    return this.notificationServer;
  }
}
