import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'thought-focus-chatting-bubble',
  templateUrl: './chatting-bubble.component.html',
  styleUrls: ['./chatting-bubble.component.scss'],
})
export class ChattingBubbleComponent {
  @Input() name = '';
  @Input() callback_button = false;
  // @Input() last_message = 'sugdyagdvuhijosfhugdvahbioKPDJISHUGVAHIOJDOHUGVJIJOISFDAHUIHHWUOIFDJIHIHSIFAJNWOK';
  @Input() is_readed = true;
  @Output() Callback = new EventEmitter();
  onElementClick() {
    this.is_readed = true;
  }
}
