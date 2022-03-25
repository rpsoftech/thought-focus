import { Component } from '@angular/core';
import { BasicService } from '../services/Basic.service';
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
  constructor(private basic: BasicService, private vanilla: VanillaService) {
    basic.user_type = 'agent';
    if (basic.user_name !== null && basic.password !== null)
      basic.connect().catch(() => {
        this.show_user_password = true;
      });
    else this.show_user_password = true;
  }
  Save() {
    if (this.user_name !== '' && this.password !== '') {
      this.basic.user_name = this.user_name;
      this.basic.password = this.password;
      this.basic
        .connect()
        .catch(() => {
          this.show_user_password = true;
        });
    }
  }
}
