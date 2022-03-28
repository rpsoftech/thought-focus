/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DbPrisma,
  server,
  RoomStatus,
  agentsConnectionArray,
} from './app/Database';
import {
  AgentAuth,
  UserAuth,
  ChatStatus,
  GetTimeStamp,
  RequestSubject,
} from './app/Interface';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { RequestToBot } from './app/BotChat';
import {
  AssignWithSkillAndCal,
  GetAgentChatHistoryHeader,
  ChangeChatStatus,
  AddMessageToChat,
  SearchChatAndAssignToAgent,
  AssignChangeToAgent,
} from './app/GeneralFunctiion';

const port = process.env['PORT'] || 3101;
server.listen(+port);

server.of('user').use(async (s, n) => {
  const user: UserAuth = s.handshake.auth as any;
  if (typeof user.uid === 'undefined' || user.uid === '') {
    const uid = uuidv4();
    await DbPrisma.userChatSessionMap.create({
      data: {
        ucsm_id: uid,
        ucsm_session_id: null,
      },
    });
    user.uid = uid;
    s.emit('uid', uid);
  }
  let a = await DbPrisma.userChatSessionMap.findUnique({
    where: {
      ucsm_id: user.uid,
    },
    include: {
      ChatSessions: true,
    },
  });
  if (a === null) {
    const uid = uuidv4();
    await DbPrisma.userChatSessionMap.create({
      data: {
        ucsm_id: uid,
        ucsm_session_id: null,
      },
    });
    user.uid = uid;
    a = {
      ChatSessions: {} as any,
      ucsm_id: uid,
      ucsm_session_id: null,
    };
    s.emit('uid', uid);
  }
  if (a.ucsm_session_id !== null) {
    if (
      [ChatStatus.inactive, ChatStatus.finished].includes(
        a.ChatSessions.chat_session_status
      )
    ) {
      a.ucsm_session_id = null;
    } else {
      user.session_id = a.ChatSessions.chat_session_uniq_id;
    }
  }
  if (a.ucsm_session_id === null) {
    const session_id = uuidv4();
    const b = await DbPrisma.chatSessions.create({
      data: {
        chat_session_extra: {
          name: user.user_name_user,
        },
        chat_session_status: 1,
        chat_session_uniq_id: session_id,
      },
    });
    await DbPrisma.userChatSessionMap.update({
      data: {
        ucsm_session_id: b.chat_session_id,
      },
      where: {
        ucsm_id: user.uid,
      },
    });
    user.session_id = session_id;
  }
  if (
    a.ChatSessions === null ||
    typeof a.ChatSessions.chat_session_extra === 'undefined' ||
    typeof (a.ChatSessions.chat_session_extra as any).bot_id === 'undefined'
  ) {
    const res = await RequestToBot('Hello');
    user.bot_id = res.bot_id;
    await DbPrisma.chatSessions.update({
      data: {
        chat_session_status: ChatStatus.with_bot,
        chat_session_extra: {
          bot_id: user.bot_id,
          name: user.user_name_user,
        },
      },
      where: {
        chat_session_uniq_id: user.session_id,
      },
    });
    AddMessageToChat(
      user.session_id,
      user.user_name_user,
      'U',
      'Hello',
      {}
    ).then(() => {
      AddMessageToChat(
        user.session_id,
        'Bot',
        'B',
        res.response.EN.text[0],
        res.response
      );
    });
    RoomStatus[user.session_id] = ChatStatus.with_bot;
  } else {
    RoomStatus[user.session_id] = a.ChatSessions.chat_session_status;
    user.bot_id = (a.ChatSessions.chat_session_extra as any).bot_id;
  }
  s.emit('session_id', user.session_id);
  s.join(user.session_id);
  n();
});
server.of('agent').use(async (s, n) => {
  let agent: AgentAuth = s.handshake.auth as any;
  s.request.complete = true;
  if (
    agent.user_name &&
    agent.password &&
    agent.user_name !== null &&
    agent.password !== null
  ) {
    const a = await DbPrisma.agent.findFirst({
      where: {
        agent_password: agent.password,
        agent_email: agent.user_name,
      },
    });
    if (a === null) {
      const err: any = new Error('not authorized');
      err.data = { content: 'Please retry later' };
      n(err);
      return;
    }
    agent = Object.assign(agent, a);
    s.handshake.auth = agent;
    s.join(`agent${a.agent_id}`);
    agentsConnectionArray[a.agent_id] = s;
    n();
  } else {
    const err: any = new Error('not authorized');
    err.data = { content: 'Please retry later' };
    n(err);
  }
});

server.of('user').on('connect', async (s) => {
  const user: UserAuth = s.handshake.auth as any;
  s.on('chat_hist', async (c) => {
    if (user.session_id !== c) {
      return;
    }
    const chat_data = await DbPrisma.chatMessageHistory.findMany({
      where: {
        chm_chat_session_id: c,
      },
    });
    s.emit('chat_hist', {
      session_id: c,
      hist: chat_data,
    });
  });
  s.on('chat_status', (chat_id: string) => {
    if (user.session_id !== chat_id) {
      return;
    }
    s.emit('chat_status', {
      chat_id: chat_id,
      status: RoomStatus[user.session_id],
    });
  });
  s.on('change_status', (status: number, extra: any) => {
    ChangeChatStatus(user.session_id, status);
    if (status === ChatStatus.finished) {
      DbPrisma.userChatSessionMap.update({
        data: {
          ucsm_session_id: null,
        },
        where: {
          ucsm_id: user.uid,
        },
      });
    }
    if (status === ChatStatus.with_agent) {
      extra = Object.assign(extra, {
        session_id: user.session_id,
      });
      AssignWithSkillAndCal(extra);
    }
  });
  s.on('emit_chat_id', (chat_id: string, message: string) => {
    if (user.session_id !== chat_id) {
      return;
    }
    if (RoomStatus[chat_id] === ChatStatus.with_bot) {
      RequestToBot(message, user.bot_id).then((res) => {
        AddMessageToChat(
          user.session_id,
          'Bot',
          'B',
          res.response.EN.text[0],
          res.response
        );
      });
    }
    AddMessageToChat(chat_id, user.user_name_user, 'U', message, {});
  });
});
server.of('agent').on('disconnect', (s) => {
  console.log(s.handshake.auth);
});
server.of('agent').on('connect', async (s) => {
  const agent: AgentAuth = s.handshake.auth as any;
  DbPrisma.agentStatus
    .update({
      where: {
        agent_status_id: agent.agent_id,
      },
      data: {
        agent_availability: 1,
      },
    })
    .then(() => {
      SearchChatAndAssignToAgent(agent.agent_id);
    });
  GetAgentChatHistoryHeader(agent.agent_id, ChatStatus.active).then((a) => {
    a.forEach((c) => {
      s.join(c.ChatSessions.chat_session_uniq_id);
    });
  });
  s.on('chat_hist', async (c) => {
    const chat_data = await DbPrisma.chatMessageHistory.findMany({
      where: {
        chm_chat_session_id: c,
      },
    });
    s.emit('chat_hist', {
      session_id: c,
      hist: chat_data,
    });
  });
  s.on('noti', (session_id: string, noti: string) => {
    SendNotification(session_id, `${agent.agent_name} is ${noti}`, s, 'user');
  });
  s.on('act_history', async () => {
    s.emit(
      'act_history',
      await GetAgentChatHistoryHeader(agent.agent_id, ChatStatus.active)
    );
  });
  s.on('chat_status', (chat_id: string) => {
    s.emit('chat_status', {
      chat_id: chat_id,
      status: RoomStatus[chat_id],
    });
  });
  s.on('add_chat', (chat_id: string) => {
    DbPrisma.chatSessions
      .findMany({
        where: {
          chat_session_uniq_id: chat_id,
          NOT: {
            chat_session_status: ChatStatus.finished,
          },
        },
      })
      .then((a) => {
        if (a.length === 0) {
          return;
        }
        AssignChangeToAgent(agent.agent_id, chat_id, false);
      });
  });
  s.on('disconnect', () => {
    DbPrisma.agentStatus.update({
      where: {
        agent_status_id: agent.agent_id,
      },

      data: {
        agent_availability: 0,
      },
    });
  });
  s.on('change_status', (status: number, chat_id: string) => {
    if (status === ChatStatus.finished) {
      ChangeChatStatus(chat_id, ChatStatus.finished, true, agent.agent_id);
      AddMessageToChat(
        chat_id,
        'System',
        'N',
        `${agent.agent_name} Left Chat`,
        {
          time: GetTimeStamp(),
        }
      );
    }
  });
  s.on('emit_chat_id', (chat_id: string, message: string) => {
    if (RoomStatus[chat_id] === ChatStatus.with_bot) {
      ChangeChatStatus(chat_id, ChatStatus.with_agent);
      AddMessageToChat(
        chat_id,
        'System',
        'N',
        `${agent.agent_name} Joined Chat`,
        {
          time: GetTimeStamp(),
        }
      );
    }
    AddMessageToChat(chat_id, agent.agent_name, 'A', message, {});
  });
  s.on('respo', (a) => RequestSubject.next(a));
});
async function SendNotification(
  session_id: string,
  notification: string,
  so: Socket,
  namespace_to: 'user' | 'agent' | ['user', 'agent']
) {
  if (Array.isArray(namespace_to)) {
    namespace_to.forEach((n) => {
      server.of(n).to(session_id).emit('noti', { session_id, notification });
    });
  } else {
    server
      .of(namespace_to)
      .to(session_id)
      .emit('noti', { session_id, notification });
  }
  so.to(session_id).emit('noti', { session_id, notification });
}
