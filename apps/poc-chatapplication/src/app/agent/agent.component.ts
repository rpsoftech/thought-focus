import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BasicService } from '../services/Basic.service';
import { ChatAgentMap, ChatSessions } from '../services/interface';
import { VanillaService } from '../services/Vanilla.service';
@Component({
  selector: 'thought-focus-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
})
export class AgentComponent {
  show_user_password = false;
  user_name = '';
  password = '';
  ChatIdSubject = new Subject<string>();
  ChatHistory!: Observable<
    (ChatAgentMap & {
      ChatSessions: ChatSessions;
    })[]
  >;
  ChatWatching!: Observable<ChatSessions[]>;
  constructor(private basic: BasicService, private vanilla: VanillaService) {
    basic.user_type = 'agent';
    this.ChatHistory = basic.ChatHistoryHeader.asObservable();
    this.ChatWatching = basic.ChatWatchingHeades.asObservable();
    if (basic.user_name !== null && basic.password !== null) this.connect();
    else this.show_user_password = true;
  }
  private connect() {
    this.basic
      .connect()
      .then(() => {
        this.show_user_password = false;
        this.basic.conn.emit('act_history');
      })
      .catch(() => {
        this.show_user_password = true;
      });
  }
  Save() {
    if (this.user_name !== '' && this.password !== '') {
      this.basic.user_name = this.user_name;
      this.basic.password = this.password;
      this.connect();
    }
  }
  AddChatt(chat_id: string) {
    // console.log(chat_id);
    if (chat_id && chat_id !== '') {
      this.basic.conn.emit('add_chat', chat_id);
    }
  }
}
