import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
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
    time: number;
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
  private conn!: Socket;
  sendMessageObservable = new Subject();
  agentJoinObser = new Subject();
  agentActiveSessionID = '';
  constructor() {
    const u = localStorage.getItem('user_name');
    this._user_name = u !== null ? u : '';
    const u1 = localStorage.getItem('user_type');
    this._selected_user_type = u1 !== null ? u1 : '';
    const u2 = localStorage.getItem('session_id');
    this.sessionID = u2 !== null ? u2 : this.makeid(10);
    if (this._selected_user_type !== '') {
      this.connectToSocketio();
    }
  }
  connectToSocketio() {
    this.conn = io(`${environment.api}/${this._selected_user_type}`, {
      auth: {
        session: this.sessionID,
        name: this.user_name,
      },
      transports: ['websocket'],
    })
      .on('history', (a) => {
        this.Msgs = a;
      })
      .on('msg', (a) => {
        this.Msgs.push(a);
      });
    this.sendMessageObservable.subscribe((a) => this.conn.send(a));
    this.agentJoinObser.subscribe((a) => this.conn.emit('join', a));
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
  leaveChat() {
    this.conn.emit('leave', this.agentActiveSessionID);
    this.agentActiveSessionID = '';
  }
  sensMessage(msh: string) {
    this.sendMessageObservable.next({
      from: this.user_name,
      sessionid: this.sessionID,
      msg: msh,
      time: Date.now(),
    });
  }
  joinChat(sessionid: string) {
    this.agentActiveSessionID = sessionid;
    this.agentJoinObser.next(sessionid);
  }
}
