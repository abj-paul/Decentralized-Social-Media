import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendServersService {

  private loginServer : string = "http://localhost:80";
  private postServer : string = "http://localhost:80";
  private notificationServer : string = "http://localhost:80";

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
