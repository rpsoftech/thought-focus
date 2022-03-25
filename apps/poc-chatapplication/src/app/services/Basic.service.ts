import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { VanillaService } from './Vanilla.service';
import { ChatAgentMap, ChatSessions, ChatMessageHistory } from './interface';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class BasicService {
  private _user_name = '';
  private _password = '';
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
  constructor(private vanilla: VanillaService) {}
  connect() {
    return new Promise<boolean>((res, rej) => {
      this.vanilla.LoaderSubject.next(true);
      this.conn = io(`${environment.api}/${this.user_type}`, {
        auth: {
          user_name: this.user_name,
          password: this.password,
        },
        transports: ['websocket'],
      })
        .on('connect', () => {
          this.vanilla.LoaderSubject.next(false);
          res(true);
        })
        .on('connect_error', (err: any) => {
          this.vanilla.LoaderSubject.next(false);
          rej(true);
          this.user_name = this.password = null;
          this.conn.close();
          this.conn.disconnect();
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
