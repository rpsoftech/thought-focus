/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';
import { RequestToBot, Output } from './app/BotChat';

const server = new Server({
  cors: '*',
  transports: ['websocket'],
} as any);
interface MsgInterface {
  type: 'msg' | 'noti';
  from: string;
  extra?:any;
  sessionid: string;
  msg: string | Output;
  time: number;
}
const Chats: {
  [sessoinid: string]: any[];
} = {};
const roomStatusChatWithBot: {
  [bot_id: string]: boolean;
} = {};
server
  .of('user')
  .use(async (s, n) => {
    if (typeof s.handshake.auth.bot_id === 'undefined') {
      const Msg: MsgInterface = {
        type: 'msg',
        from: s.handshake.auth.name,
        sessionid: '',
        msg: 'Hello',
        time: Date.now(),
      };
      const res = await RequestToBot('Hello');
      s.handshake.auth.bot_id = res.bot_id;
      s.handshake.auth.session = res.bot_id;
      Msg.sessionid = res.bot_id;
      const sessionid = s.handshake.auth.session;
      if (typeof Chats[sessionid] === 'undefined') {
        Chats[sessionid] = [];
      }
      sendMEssageTosessionid(sessionid, Msg, 'msg');
      sendMEssageTosessionid(
        sessionid,
        {
          from: 'bot',
          sessionid: 'bot',
          msg: res.response,
          time: Date.now(),
          type: 'msg',
        },
        'msg'
      );
      roomStatusChatWithBot[sessionid] = true;
      s.emit('bot_id', res.bot_id);
    } else {
      const sessionid = s.handshake.auth.session;
      if (typeof Chats[sessionid] === 'undefined') {
        Chats[sessionid] = [];
      }
      roomStatusChatWithBot[sessionid] = true;
    }
    n();
  })
  .on('connect', (s) => {
    const chatroomid = s.handshake.auth.session;
    s.join(chatroomid);
    s.emit('history', Chats[chatroomid]);
    s.on('typing', (a) => {
      server.of('agent').to(chatroomid).emit('typing', a);
      s.to(chatroomid).emit('typing', a);
    });
    s.on('message', async (a) => {
      sendMEssageTosessionid(chatroomid, a);
      if (roomStatusChatWithBot[chatroomid] === true) {
        const res = await RequestToBot(a.msg, chatroomid);
        sendMEssageTosessionid(chatroomid, {
          from: 'bot',
          msg: res.response,
          extra:res.extra,
          sessionid: 'bot',
          time: Date.now(),
          type: 'msg',
        });
      }
    });
  });
function sendMEssageTosessionid(
  sessionid: string,
  msg: MsgInterface,
  type: 'msg' | 'noti' = 'msg'
) {
  Chats[sessionid].push(msg);
  server.of('user').to(sessionid).emit(type, msg);
  server.of('agent').to(sessionid).emit(type, msg);
}
server.of('agent').on('connect', (s) => {
  const user_name = s.handshake.auth.name;
  const AgentId = s.handshake.auth.session;
  let chatRoomid = 'default';
  s.on('join', (a) => {
    s.emit('history', Chats[a]);
    sendMEssageTosessionid(a, {
      from: user_name,
      msg: `${user_name} Joined Chat`,
      sessionid: AgentId,
      time: Date.now(),
      type: 'noti',
    });
    chatRoomid = a;
    s.join(chatRoomid);
  });
  s.on('leave', (a) => {
    s.leave(a);
    sendMEssageTosessionid(a, {
      from: user_name,
      msg: `${user_name} Left Chat`,
      sessionid: AgentId,
      time: Date.now(),
      type: 'noti',
    });
    //TODO Send Notfication
  });
  s.on('typing', (a) => {
    server.of('user').to(chatRoomid).emit('typing', a);
    s.to(chatRoomid).emit('typing', a);
  });
  s.on('message', (a) => {
    if (roomStatusChatWithBot[chatRoomid] === true) {
      roomStatusChatWithBot[chatRoomid] = false;
      sendMEssageTosessionid(chatRoomid, {
        from: 'bot',
        msg: 'Bot Left Chat',
        sessionid: 'bot',
        time: Date.now(),
        type: 'noti',
      });
    }
    sendMEssageTosessionid(chatRoomid, a);
  });
});

server.listen(3100);
