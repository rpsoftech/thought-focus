import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from '../environments/environment';

@Component({
  selector: 'thought-focus-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  user_typs = ['user', 'agent'];
  private _selected_user_type = '';
  private _user_name = '';
  private _sessionID = '';
  Msgs: {
    from: string;
    sessionid: string;
    msg: string;
  }[] = [];
  public get sessionID() {
    return this._sessionID;
  }
  public set sessionID(value) {
    localStorage.setItem('session_id', value);
    this._sessionID = value;
  }
  public get selected_user_type() {
    return this._selected_user_type;
  }
  public set selected_user_type(value) {
    localStorage.setItem('user_type', value);
    this._selected_user_type = value;
  }
  public get user_name() {
    return this._user_name;
  }
  public set user_name(value) {
    localStorage.setItem('user_name', value);
    this._user_name = value;
  }
  sendMessageObservable = new Subject();
  constructor() {
    const u = localStorage.getItem('user_name');
    this._user_name = u !== null ? u : '';
    const u1 = localStorage.getItem('user_type');
    this._selected_user_type = u1 !== null ? u1 : '';
    const u2 = localStorage.getItem('session_id');
    this.sessionID = u2 !== null ? u2 : this.makeid(10);
  }
  connectToSocketio() {
    const conn = io(`${environment.api}/${this.user_typs}`, {
      auth: {
        session: this.sessionID,
        name:this.user_name
      },
    })
      .on('history', (a) => {
        this.Msgs = a;
      })
      .on('msg', (a) => {
        this.Msgs.push(a);
      });
    this.sendMessageObservable.subscribe((a) => conn.send(a));
  }
  makeid(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
