/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent } from '@prisma/client';
import { QueryExec, Pool } from 'query-builder-mysql';
import { Subject } from 'rxjs';

export const RequestSubject = new Subject<{
  req_id: string;
  data: any;
}>();
const DbPool = new Pool({
  connectionLimit: 1,
  host: process.env.DATABASE_HOST,
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DB,
  idleTimeout: 0,
},{
  nestTables:true
} as any);
DbPool.get_connection().then((a) => {
  a.AutoExeQueryStatus(false);
  QueryBuilder = a;
});
export let QueryBuilder: QueryExec;
export interface UserAuth {
  uid: string;
  user_name_user: string;
  session_id: string;
  bot_id: string;
}
export interface AgentAuth extends Agent {
  agent: string;
  user_name: string;
  password: string;
  session_id: string;
}

export const ChatStatus = {
  active: 1,
  inactive: 0,
  with_bot: 2,
  with_agent: -1,
  finished: -2,
};
export function GetTimeStamp() {
  return Math.floor(Date.now() / 1000);
}