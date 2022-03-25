import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { VanillaService } from './Vanilla.service';

@Injectable({
  providedIn: 'root',
})
export class BasicService {
  private _user_name = '';
  private _password = '';
  user_type = '';
  private conn!: Socket;
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
          // bot_id: this.sessionID,
          // session: this.sessionID,
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
          console.log(err.data);
          this.conn.close();
          this.conn.disconnect();
        })
        .onAny(console.log);
    });
  }
}
