/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';

const server = new Server({
  cors: '*',
  transports: ['websocket'],
} as any);

const Chats: {
  [sessoinid: string]: any[];
} = {};
server.of('user').on('connect', (s) => {
  const sessionid = s.handshake.auth.session;
  if (typeof Chats[sessionid] === 'undefined') {
    Chats[sessionid] = [];
  }
  s.join(sessionid);
  s.emit('history', Chats[sessionid]);
  s.on('message', (a) => {
    sendMEssageTosessionid(sessionid, a);
  });
});
function sendMEssageTosessionid(sessionid: string, msg: any) {
  Chats[sessionid].push(msg);
  server.of('user').to(sessionid).emit('msg', msg);
  server.of('agent').to(sessionid).emit('msg', msg);
}
server.of('agent').on('connect', (s) => {
  let chatRoomid = 'default';
  s.on('join', (a) => {
    s.emit('history', Chats[a]);
    chatRoomid = a;
    s.join(chatRoomid);
  });
  s.on('message', (a) => {
    sendMEssageTosessionid(chatRoomid, a);
  });
});

server.listen(3000);
