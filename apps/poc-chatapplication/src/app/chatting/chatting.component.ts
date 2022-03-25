import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'thought-focus-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.scss'],
})
export class ChattingComponent implements OnInit, OnDestroy {
  @Input() chatid!: Subject<string>;
  @Input() active = false;
  subscri: Subscription[] = [];
  @Input() chat_history: ChatMessageHistory[] = [
    {
      cha_created_at: 178808088000,
      chm_from: 'Keyur shah',
      chm_message:
        'isiooakdjsioajdmnoqnbhsdajbdnshadijob habdj isdijb nmaksdin j oaisjdpoj ajspidasdasd a aspdopasj aopsjdop asdiwhe',
      chm_type: 'U',
    },
    {
      cha_created_at: 178808088000,
      chm_from: 'Keyur shah',
      chm_message:
        'isiooakdjsioajdmnoqnbhsdajbdnshadijob habdj isdijb nmaksdin j oaisjdpoj ajspidasdasd a aspdopasj aopsjdop asdiwhe',
      chm_type: 'B',
    },
    {
      cha_created_at: 178808088000,
      chm_from: 'Keyur shah',
      chm_message:
        'isiooakdjsioajdmnoqnbhsdajbdnshadijob habdj isdijb nmaksdin j oaisjdpoj ajspidasdasd a aspdopasj aopsjdop asdiwhe',
      chm_type: 'A',
    },
    {
      cha_created_at: 178808088000,
      chm_from: 'Keyur shah',
      chm_message:
        'isiooakdjsioajdmnoqnbhsdajbdnshadijob habdj isdijb nmaksdin j oaisjdpoj ajspidasdasd a aspdopasj aopsjdop asdiwhe',
      chm_type: 'U',
    },
  ];
  @Input() active_chat_name = 'Keyur Shah';
  @Input() active_last_message_at = 17880808088000;
  @Input() notification_obse = new BehaviorSubject<string>('asijdkaishbdnj ');
  @Input() chat_message = '';
  ngOnInit(): void {
    if (this.chatid) {
      this.chatid.subscribe((a) => {
        console.log(a);
      });
    }
  }
  ngOnDestroy(): void {
    this.subscri.forEach((a) => a.unsubscribe());
  }
  AfterChatIdRecived(id: string) {
    console.log(id);
  }
  sendMessgae() {
    this.chat_message = '';
  }
  // constructor(){}
}
export type ChatMessageHistory = {
  chm_id?: number;
  chm_chat_session_id?: number;
  chm_uniq_id?: string;
  chm_from: string;
  chm_message: string;
  chm_type: 'U' | 'A' | 'B';
  chm_extra?: string;
  cha_created_at: number;
};
