import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'thought-focus-chatting-bubble',
  templateUrl: './chatting-bubble.component.html',
  styleUrls: ['./chatting-bubble.component.scss'],
})
export class ChattingBubbleComponent {
  @Input() name = 'Keyur';
  // @Input() last_message = 'sugdyagdvuhijosfhugdvahbioKPDJISHUGVAHIOJDOHUGVJIJOISFDAHUIHHWUOIFDJIHIHSIFAJNWOK';
  @Input() is_readed = true;
  onElementClick() {
    this.is_readed = true;
  }
}
