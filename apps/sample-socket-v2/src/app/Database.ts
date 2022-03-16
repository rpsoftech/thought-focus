/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { Server, Socket } from 'socket.io';

export const DbPrisma = new PrismaClient();

export const agents: {
  [agent_id: string]: Socket;
} = {};
export const BotIds: {
  [session_id: string]: string;
} = {};

export const server = new Server({
  cors: '*',
  transports: ['websocket'],
} as any);
