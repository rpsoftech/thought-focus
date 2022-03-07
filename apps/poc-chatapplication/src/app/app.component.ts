/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPlatformServer } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
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
  private _sessionID!: string;
  Msgs: {
    type: 'msg' | 'noti';
    from: string;
    sessionid: string;
    msg: string | any;
    time: number;
  }[] = [];
  private TypingNotiSubjec = new Subject<string>();
  TypingNotiSubjecRemote = new Subject<string>();
  TypingObsevableRemote = this.TypingNotiSubjecRemote.pipe(debounceTime(10));
  public get sessionID() {
    return this._sessionID;
  }
  public set sessionID(value) {
    sessionStorage.setItem('session_id', value);
    this._sessionID = value;
  }
  public get selected_user_type() {
    return this._selected_user_type;
  }
  public set selected_user_type(value) {
    sessionStorage.setItem('user_type', value);
    this._selected_user_type = value;
    if (this._selected_user_type !== '') {
      if (
        this.selected_user_type === 'agent' &&
        (typeof this.sessionID === 'undefined' || this.sessionID === '')
      ) {
        this.sessionID = this.makeid(10);
      }
      this.connectToSocketio();
    }
  }
  public get user_name() {
    return this._user_name;
  }
  public set user_name(value) {
    sessionStorage.setItem('user_name', value);
    this._user_name = value;
  }
  private conn!: Socket;
  agentJoinObser = new Subject();
  agentActiveSessionID = '';
  constructor(@Inject(PLATFORM_ID) platForm:any) {
    if(isPlatformServer(platForm)){
      return;
    }
    const u = sessionStorage.getItem('user_name');
    this._user_name = u !== null ? u : '';
    const u2 = sessionStorage.getItem('session_id');
    if (u2 !== null) {
      this.sessionID = u2;
    }
    const u1 = sessionStorage.getItem('user_type');
    this.selected_user_type = u1 !== null ? u1 : '';
  }
  connectToSocketio() {
    this.conn = io(`${environment.api}/${this._selected_user_type}`, {
      auth: {
        bot_id: this.sessionID,
        session: this.sessionID,
        name: this.user_name,
      },
      transports: ['websocket'],
    })
      .on('bot_id', (a) => (this.sessionID = a))
      .on('history', (a) => {
        this.Msgs = a;
      })
      .on('msg', (a) => {
        this.Msgs.push(a);
      })
      .on('typing', (s) => this.TypingNotiSubjecRemote.next(s));
    this.TypingNotiSubjec.pipe(debounceTime(500)).subscribe((a) =>
      this.conn.emit('typing', a)
    );
    this.agentJoinObser.subscribe((a) => this.conn.emit('join', a));
  }
  msgChange() {
    console.log('aosidoi');

    this.TypingNotiSubjec.next(`${this.user_name} is typing...`);
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
    this.conn.send({
      type: 'msg',
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
