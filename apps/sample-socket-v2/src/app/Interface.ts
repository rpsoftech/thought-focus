import { Agent } from '@prisma/client';

export interface UserAuth {
  uid: string;
  session_id: string;
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
