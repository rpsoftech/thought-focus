import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AutoCloseNotificationPipePipe } from './pipes/auto-close-notification-pipe.pipe';
import { AgentComponent } from './agent/agent.component';
import { UserComponent } from './user/user.component';
import { ChattingComponent } from './chatting/chatting.component';
import { ChattingBubbleComponent } from './chatting-bubble/chatting-bubble.component';
import { GetCharTllLengthPipe } from './pipes/get-char-tll-length.pipe';

const route: Routes = [
  {
    path: 'user',
    component: UserComponent,
  },
  {
    path: 'agent',
    component: AgentComponent,
  },
  {
    path:'',
    redirectTo:'agent',
    pathMatch:'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    AutoCloseNotificationPipePipe,
    AgentComponent,
    UserComponent,
    ChattingComponent,
    ChattingBubbleComponent,
    GetCharTllLengthPipe,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(route),
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
