import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { VanillaService } from './Vanilla.service';
import { ChatAgentMap, ChatSessions, ChatMessageHistory } from './interface';
import { BehaviorSubject, Subject } from 'rxjs';

export const ChatStatus = {
  active: 1,
  inactive: 0,
  with_bot: 2,
  with_agent: -1,
  finished: -2,
};

@Injectable({
  providedIn: 'root',
})
export class BasicService {
  private _user_name = '';
  private _password = '';
  private _user_name_user = '';
  private _user_id = '';
  private _session_id = '';
  ChatIdStatusSubject = new Subject<{
    chat_id: string;
    status: number;
  }>();
  SessionIdSubject = new BehaviorSubject('');
  user_type = '';
  ChatHistoryHeader = new BehaviorSubject<
    (ChatAgentMap & {
      ChatSessions: ChatSessions;
    })[]
  >([]);
  ChatHistoryId: {
    [id: string]: ChatAgentMap & {
      ChatSessions: ChatSessions;
    };
  } = {};
  MessageSubject: Subject<ChatMessageHistory> = new Subject();
  NotiSubject: Subject<{
    session_id: string;
    notification: string;
  }> = new Subject();
  conn!: Socket;
  public get session_id() {
    return this._session_id;
  }
  public set session_id(value) {
    localStorage.setItem('session_id', value);
    this.SessionIdSubject.next(value);
    this._session_id = value;
  }
  public get user_id() {
    return this._user_id;
  }
  public set user_id(value) {
    localStorage.setItem('uid', value);
    this._user_id = value;
  }
  public get user_name_user() {
    return this._user_name_user;
  }
  public set user_name_user(value) {
    localStorage.setItem('user_name_user', value);
    this._user_name_user = value;
  }
  public get user_name() {
    return sessionStorage.getItem('user_name') as any;
  }
  public set user_name(value) {
    this._user_name = value;
    sessionStorage.setItem('user_name', value);
  }
  public get password() {
    return sessionStorage.getItem('password') as any;
  }
  public set password(value) {
    this._password = value;
    sessionStorage.setItem('password', value);
  }
  constructor(private vanilla: VanillaService) {
    const i = localStorage.getItem('user_name_user');
    if (i !== null) this.user_name_user = i;
    const i1 = localStorage.getItem('uid');
    if (i1 !== null) this.user_id = i1;
    const i2 = localStorage.getItem('session_id');
    if (i2 !== null) this.session_id = i2;
    // const i3 = localStorage.getItem('user_id');
    // if (i3 !== null) this.user_id = i3;
  }
  connect() {
    return new Promise<boolean>((res, rej) => {
      this.vanilla.LoaderSubject.next(true);
      this.conn = io(`${environment.api}/${this.user_type}`, {
        auth: {
          user_name: this.user_name,
          user_name_user: this.user_name_user,
          uid: this.user_id,
          password: this.password,
        },
        transports: ['websocket'],
      })
        .on('connect', () => {
          this.vanilla.LoaderSubject.next(false);
          res(true);
        })
        .on('session_id', (a) => {
          this.session_id = a;
        })
        // .onAny(console.log)
        .on('uid', (a) => {
          this.user_id = a;
        })
        .on('connect_error', (err: any) => {
          console.log(err.message);
          if(err.message !== 'not authorized'){
            return;
          }
          this.vanilla.LoaderSubject.next(false);
          rej(true);
          this.user_name = this.password = null;
          this.user_name_user = '';
          this.conn.close();
          this.conn.disconnect();
        })
        .on('chat_status', (a) => this.ChatIdStatusSubject.next(a))
        .on('user_req', (aaa: { req_id: string }) => {
          VanillaService.swal
            .fire({
              icon: 'question',
              title: 'Incoming Request',
              text: 'User Want To Connect To You',
              cancelButtonText: 'Reject',
              allowOutsideClick: false,
              confirmButtonText: 'Accept',
              showCancelButton: true,
            })
            .then((swal_respo) => {
              this.conn.emit('respo', {
                req_id: aaa.req_id,
                data: {
                  accept: swal_respo.isConfirmed ? true : false,
                },
              });
            });
        })
        .on(
          'act_history',
          (
            a: (ChatAgentMap & {
              ChatSessions: ChatSessions;
            })[]
          ) => {
            a.sort((a, b) => a.cam_edited_on - b.cam_edited_on);
            this.ChatHistoryHeader.next(a);
            a.forEach((a) => {
              this.ChatHistoryId[a.ChatSessions.chat_session_uniq_id] = a;
            });
          }
        )
        .on('noti', (a) => this.NotiSubject.next(a))
        .on('msg', (a: ChatMessageHistory) => {
          this.MessageSubject.next(a);
          this.updateLastMessage(
            a.chm_chat_session_id,
            a.cha_created_at,
            a.chm_message
          );
        });
    });
  }
  GetOnce<T>(event: string, ...data: any) {
    return new Promise<T>((res) => {
      this.conn.emit(event, ...data);
      this.conn.once(event, (d) => {
        res(d);
      });
    });
  }
  private updateLastMessage(
    session_id: string,
    time: number,
    last_message: string
  ) {
    if (this.user_type === 'user') {
      return;
    }
    const a = this.ChatHistoryHeader.value;
    a.forEach((a1) => {
      if (a1.ChatSessions.chat_session_uniq_id === session_id) {
        a1.cam_edited_on = time;
        a1.cam_last_message = last_message;
      }
    });
    a.sort((a, b) => a.cam_edited_on - b.cam_edited_on);
    this.ChatHistoryHeader.next(a);
    this.ChatHistoryId[session_id].cam_edited_on = time;
    this.ChatHistoryId[session_id].cam_last_message = last_message;
  }
}
