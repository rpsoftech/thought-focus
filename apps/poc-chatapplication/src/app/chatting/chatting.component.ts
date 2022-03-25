import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import { BasicService } from '../services/Basic.service';
import { ChatMessageHistory } from '../services/interface';

@Component({
  selector: 'thought-focus-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.scss'],
})
export class ChattingComponent implements OnInit, OnDestroy {
  @Input() chatid!: Observable<string>;
  active_chatid = '';
  @Input() active = false;
  subscri: Subscription[] = [];
  @Input() chat_history: ChatMessageHistory[] = [];
  @Input() active_chat_name = 'Keyur Shah';
  @Input() active_last_message_at = 17880808088000;
  @Input() notification_obse = new BehaviorSubject<string>('');
  @Input() chat_message = '';
  TypingSubject = new Subject<void>();
  constructor(public basic: BasicService) {}
  ngOnInit(): void {
    if (this.chatid) {
      this.subscri.push(
        this.chatid.pipe(distinctUntilChanged()).subscribe((a) => {
          this.AfterChatIdRecived(a);
        })
      );
    }
    this.subscri.push(
      this.basic.MessageSubject.pipe(
        filter((a) =>
          this.active_chatid
            ? a.chm_chat_session_id === this.active_chatid
            : false
        )
      ).subscribe((m) => {
        this.chat_history.push(m);
        this.active_last_message_at = m.cha_created_at;
      })
    );
    this.subscri.push(
      this.basic.NotiSubject.pipe(
        filter((a) =>
          this.active_chatid ? a.session_id === this.active_chatid : false
        )
      ).subscribe((m) => {
        this.notification_obse.next(m.notification);
      })
    );
    this.subscri.push(this.TypingSubject.pipe(debounceTime(500)).subscribe(()=>{
      this.basic.conn.emit('noti',this.active_chatid,' Typing...')
    }))
  }
  ngOnDestroy(): void {
    this.subscri.forEach((a) => a.unsubscribe());
  }
  AfterChatIdRecived(id: string) {
    this.active_chatid = id;
    this.active = true;
    this.basic.GetOnce<any>('chat_hist', id).then((a) => {
      console.log(a.hist);
      this.chat_history = a.hist;
      this.chat_history.sort((a, b) => a.cha_created_at - b.cha_created_at);
    });
  }
  sendMessgae() {
    this.basic.conn.emit('emit_chat_id', this.active_chatid, this.chat_message);
    this.chat_message = '';
  }
  MsgChange() {
    this.TypingSubject.next();
  }
  // constructor(){}
}
