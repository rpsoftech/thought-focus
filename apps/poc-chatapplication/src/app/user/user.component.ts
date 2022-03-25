import { Component, OnInit } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { BasicService } from '../services/Basic.service';

@Component({
  selector: 'thought-focus-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  ChatIdSubjec !: Observable<string>;
  constructor(public basic: BasicService) {
    basic.user_type = 'user';
    if(basic.user_name_user){
      this.AfterNameSaved();
    }
    this.ChatIdSubjec = basic.SessionIdSubject.pipe(filter(a=>a!== ''));
  }
  ngOnInit(): void {
    console.log('');
  }
  AfterNameSaved() {
    this.basic.connect();
  }
}
