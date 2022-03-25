/* eslint-disable @typescript-eslint/no-explicit-any */
import { DbPrisma, server } from './app/Database';
import { AgentAuth, UserAuth, ChatStatus } from './app/Interface';
import { v4 as uuidv4 } from 'uuid';

const port = process.env['PORT'] || 3101;
server.listen(+port);

server.of('user').use(async (s) => {
  const user: UserAuth = s.handshake.auth as any;
  if (typeof user.uid !== 'undefined') {
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
  if (typeof user.session_id === 'undefined') {
    const a = await DbPrisma.userChatSessionMap.findUnique({
      where: {
        ucsm_id: user.uid,
      },
    });
    if (a.ucsm_session_id === null) {
      const session_id = uuidv4();
      const b = await DbPrisma.chatSessions.create({
        data: {
          chat_session_extra: JSON.stringify({}),
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
    s.emit('session_id', user.session_id);
  }
});
server.of('agent').use(async (s, n) => {
  let agent: AgentAuth = s.handshake.auth as any;

  console.log(s.id);
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
    console.log(agent);
    s.handshake.auth = agent;
    n();
  } else {
    const err: any = new Error('not authorized');
    err.data = { content: 'Please retry later' };
    n(err);
  }
});

server.of('user').on('connect', async (s) => {
  // const user: UserAuth = s.handshake.auth as any;
});
server.of('agent').on('connect', async (s) => {
  const agent: AgentAuth = s.handshake.auth as any;
  s.on('act_history', async () => {
    return await GetAgentChatHistoryHeader(agent.agent_id, ChatStatus.active);
  });
  s.on('emit_chat_id', (a) => {
    console.log(a);
  });
});
function AddMessageToChat(
  chat_id: number,
  from: string,
  messgae: string,
  chat_extra = {}
) {
  DbPrisma.chatMessageHistory.create({
    data: {
      cha_created_at: Date.now(),
      chm_extra: JSON.stringify(chat_extra),
      chm_from: from,
      chm_message: messgae,
      chm_uniq_id: uuidv4(),
      chm_chat_session_id: chat_id,
      chm_type: 'A',
    },
  });
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
