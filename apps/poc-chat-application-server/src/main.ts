/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';

const server = new Server({
  cors: '*',
  transports: ['websocket'],
} as any);

const Chats: {
  [sessoinid: string]: any[];
} = {};
server.of('users').on('connection', (s) => {
  const sessionid = s.handshake.auth.session;
  if (typeof Chats[sessionid] === 'undefined') {
    Chats[sessionid] = [];
  }
  s.join(sessionid);
  s.emit('history', Chats[sessionid]);
  s.on('message', (a) => {
    server.to(sessionid).emit('msg', a);
  });
});
server.of('agent').on('connection', (s) => {
  const sessionid = s.handshake.auth.session;
  if (typeof Chats[sessionid] === 'undefined') {
    Chats[sessionid] = [];
  }
  s.on('join', (a) => s.join(a));
  s.emit('history', Chats[sessionid]);
  s.on('message', (a) => {
    server.to(sessionid).emit('msg', a);
  });
});

server.listen(3000);
