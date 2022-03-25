/* eslint-disable @typescript-eslint/no-explicit-any */
import { DbPrisma, server } from './app/Database';
import { AgentAuth, UserAuth, ChatStatus } from './app/Interface';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessageHistory_chm_type } from '@prisma/client';
import { Socket } from 'socket.io';
import { RequestToBot } from './app/BotChat';
const RoomStatus: {
  [room_id: string]: number;
} = {};
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
    typeof a.ChatSessions === 'undefined' ||
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
    AddMessageToChat(user.session_id, user.user_name_user, 'U', 'Hello', {});
    AddMessageToChat(
      user.session_id,
      'Bot',
      'B',
      res.response.EN.text[0],
      res.response
    );
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
      console.log(a);
      const err: any = new Error('not authorized');
      err.data = { content: 'Please retry later' };
      n(err);
      return;
    }
    console.log(s.id);
    agent = Object.assign(agent, a);
    s.handshake.auth = agent;
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
  DbPrisma.agentStatus.upsert({
    where: {
      agent_status_id: agent.agent_id,
    },
    create: {
      agent_availability: 1,
      agent_capacity: 3,
      agent_current_capacity: 3,
      agent_status_id: agent.agent_id,
    },
    update: {
      agent_availability: 1,
    },
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
  s.on('emit_chat_id', (chat_id: string, message: string) => {
    AddMessageToChat(chat_id, agent.agent_name, 'A', message, {});
  });
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
async function AddMessageToChat(
  session_id: string,
  from: string,
  chm_type: ChatMessageHistory_chm_type,
  messgae: string,
  chat_extra = {}
) {
  const msg = await DbPrisma.chatMessageHistory.create({
    data: {
      cha_created_at: GetTimeStamp(),
      chm_extra: chat_extra,
      chm_from: from,
      chm_message: messgae,
      chm_uniq_id: uuidv4(),
      chm_chat_session_id: session_id,
      chm_type: chm_type,
    },
  });
  DbPrisma.chatAgentMap.updateMany({
    data: {
      cam_edited_on: GetTimeStamp(),
      cam_last_message: messgae,
    },
    where: {
      cam_chat_session_id: session_id,
    },
  });
  server.of('user').to(session_id).emit('msg', msg);
  server.of('agent').to(session_id).emit('msg', msg);
}
function GetAgentChatHistoryHeader(agent_id: number, with_status?: number) {
  return DbPrisma.chatAgentMap.findMany({
    where: {
      cam_agent_id: agent_id,
      cam_chat_status: with_status,
    },
    include: {
      ChatSessions: true,
    },
  });
}

function GetTimeStamp() {
  return Math.floor(Date.now() / 1000);
}
