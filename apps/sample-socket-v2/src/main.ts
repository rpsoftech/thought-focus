/* eslint-disable @typescript-eslint/no-explicit-any */
import { DbPrisma, server } from './app/Database';
import { AgentAuth, UserAuth } from './app/Interface';
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
          chat_session_extra: {},
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
server.of('agent').use(async (s) => {
  let agent: AgentAuth = s.handshake.auth as any;
  const a = await DbPrisma.agent.findMany({
    where: {
      agent_password: agent.password,
      agent_uname: agent.user_name,
    },
  });
  if (a.length === 0) {
    s.removeAllListeners();
    s.disconnect(true);
    return;
  }
  agent = Object.assign(agent, a[0]);
  s.handshake.auth = agent;
});

server.of('agent').on('connect', async (s) => {
  // const agent: AgentAuth = s.handshake.auth as any;
});
server.of('agent').on('connect', async (s) => {
  // const user: UserAuth = s.handshake.auth as any;
  // s.on('history', () => {});
});
