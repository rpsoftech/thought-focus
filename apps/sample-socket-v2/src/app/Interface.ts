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
