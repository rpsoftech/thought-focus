/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Agent,
  AgentChatQue,
  ChatMessageHistory_chm_type,
} from '@prisma/client';
import {
  agentsConnectionArray,
  DbPrisma,
  RoomStatus,
  server,
} from './Database';
import {
  ChatStatus,
  GetTimeStamp,
  QueryBuilder,
  RequestSubject,
} from './Interface';
import { v4 as uuidv4 } from 'uuid';
import { filter, firstValueFrom, timeout } from 'rxjs';

export async function AssignWithSkillAndCal(req: {
  cat_id: number;
  skill_id?: number;
  session_id: string;
  not_agents?: number[];
}) {
  const a = QueryBuilder;
  try {
    a.select('`a`.*', false);
    a.select('`as`.*', false);
    a.from('Agent as a')
      .join('AgentStatus as as', 'as.agent_status_id = a.agent_id')
      .where('as.agent_availability', 1)
      .where('as.agent_current_capacity >', '0', false);
    a.order_by('as.agent_last_active_on');
    if (req.not_agents && Array.isArray(req.not_agents)) {
      a.where_not_in('a.agent_id', req.not_agents);
    }
    if (req.cat_id) {
      a.join(
        'AgentCatMap as acm',
        'acm.agent_cat_map_agent_id = a.agent_id',
        'left'
      );
      a.where('acm.agent_cat_map_agent_cat_id', req.cat_id);
    }
    if (req.skill_id) {
      a.join(
        'AgentSkillSetMap as asm',
        'asm.ass_agent_id = a.agent_id',
        'left'
      );
      a.or_where('asm.ass_agent_skill_set_id', req.skill_id);
    }
    const agnetsLisr = await DbPrisma.$queryRawUnsafe<Agent[]>(await a.get());
    if (agnetsLisr.length === 0) {
      ToWaitAndAddToQue(
        {
          cat_id: req.cat_id,
          skill_id: req.skill_id,
        },
        req.session_id
      );
      return;
    }
    const agent_id = agnetsLisr[0].agent_id;
    const reqid = uuidv4();

    agentsConnectionArray[agent_id].emit('user_req', {
      req_id: reqid,
    });
    firstValueFrom(
      RequestSubject.pipe(filter((a) => a.req_id === reqid)).pipe(
        timeout({
          first: 10000,
        })
      )
    )
      .then((a) => {
        const dd: {
          accept: boolean;
        } = a.data;
        if (dd.accept) {
          AssignChangeToAgent(agent_id, req.session_id);
          //TODO:Add Agent To Chat
        } else {
          throw new Error('Rejected');
        }
      })
      .catch(() => {
        if (typeof req.not_agents === 'undefined') {
          req.not_agents = [];
        }
        req.not_agents.push(agent_id);
        AssignWithSkillAndCal(req);
      });
  } catch (error) {
    console.log(error);
  }
}

export async function SearchChatAndAssignToAgent(
  agent_id: number,
  not_req_id?: number[]
) {
  //TODO: Skill Remains
  // SELECT * FROM AgentChatQue  as acq
  // LEFT JOIN AgentCatMap as acm on acq.AgentCat = acm.agent_cat_map_agent_cat_id
  // LEFT JOIN Agent as a on a.agent_id = acm.agent_cat_map_agent_id
  // JOIN AgentStatus as ass on ass.agent_status_id = a.agent_id
  // WHERE ass.agent_availability = 1
  // ORDER by acq.created_at ASC;
  const a = QueryBuilder.from('AgentChatQue as acq').join(
    'AgentCatMap as acm',
    'acq.AgentCat = acm.agent_cat_map_agent_cat_id',
    'left'
  );
  a.join('Agent as a', 'a.agent_id = acm.agent_cat_map_agent_id', 'left')
    .join('AgentStatus as ass', 'ass.agent_status_id = a.agent_id')
    .where('ass.agent_availability', 1)
    .where('ass.agent_current_capacity >', 0)
    .order_by('acq.created_at', 'asc');
  a.where('a.agent_id', agent_id);
  if (not_req_id) {
    a.where_not_in('acq.que_id', not_req_id);
  }
  const q = await a.get();
  const agnetsLisr: AgentChatQue[] = await DbPrisma.$queryRawUnsafe(q);
  if (agnetsLisr.length === 0) {
    return;
  }
  const id = agnetsLisr[0].que_id;
  const reqid = uuidv4();
  const session_id = agnetsLisr[0].ChatSession_id;
  agentsConnectionArray[agent_id].emit('user_req', {
    req_id: reqid,
  });
  firstValueFrom(
    RequestSubject.pipe(filter((a) => a.req_id === reqid)).pipe(
      timeout({
        first: 10000,
      })
    )
  )
    .then((a) => {
      const dd: {
        accept: boolean;
      } = a.data;
      if (dd.accept) {
        AssignChangeToAgent(agent_id, session_id);
        //TODO:Add Agent To Chat
      } else {
        throw new Error('Rejected');
      }
    })
    .finally(() => {
      if (typeof not_req_id === 'undefined') {
        not_req_id = [];
      }
      not_req_id.push(id);
      SearchChatAndAssignToAgent(agent_id, not_req_id);
    });
}
async function ToWaitAndAddToQue(
  data: { skill_id?: number; cat_id: number },
  session_id: string
) {
  await DbPrisma.agentChatQue.upsert({
    update: {
      created_at: GetTimeStamp(),
      ChatSession_id: session_id,
      AgentCat: data.cat_id,
      AgentSkill: data.skill_id,
    },
    where: {
      ChatSession_id: session_id,
    },
    create: {
      created_at: GetTimeStamp(),
      ChatSession_id: session_id,
      AgentCat: data.cat_id,
      AgentSkill: data.skill_id,
    },
  });
}

export function GetAgentChatHistoryHeader(
  agent_id: number,
  with_status?: number
) {
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
export async function AssignChangeToAgent(
  agent_id: number,
  session_id: string,
  update_status = true
) {
  agentsConnectionArray[agent_id].join(session_id);
  const p: Promise<any>[] = [];
  p.push(
    DbPrisma.chatAgentMap.upsert({
      create: {
        cam_edited_on: GetTimeStamp(),
        cam_agent_id: agent_id,
        cam_chat_session_id: session_id,
        cam_last_message: '',
        cam_chat_status: ChatStatus.active,
      },
      update: {
        cam_chat_status: ChatStatus.active,
      },
      where: {
        cam_agent_id_cam_chat_session_id: {
          cam_agent_id: agent_id,
          cam_chat_session_id: session_id,
        },
      },
    })
  );
  p.push(
    DbPrisma.agentStatus.update({
      data: {
        agent_current_capacity: {
          decrement: 1,
        },
      },
      where: {
        agent_status_id: agent_id,
      },
    })
  );
  p.push(
    DbPrisma.agentChatQue.deleteMany({
      where: {
        ChatSession_id: session_id,
      },
    })
  );
  Promise.all(p).then(async () => {
    agentsConnectionArray[agent_id].emit(
      'act_history',
      await GetAgentChatHistoryHeader(agent_id, ChatStatus.active)
    );
  });
  if (update_status) {
    ChangeChatStatus(session_id, ChatStatus.with_agent);
  } else {
    // ChangeChatStatus(session_id, ChatStatus.with_agent, true, agent_id);
  }
}

export async function ChangeChatStatus(
  chat_id: string,
  status: number,
  only_agent = false,
  agent_id?: number
) {
  const p: Promise<any>[] = [];
  if (status === ChatStatus.finished) {
    const agets = await DbPrisma.chatAgentMap.findMany({
      where: {
        cam_chat_session_id: chat_id,
        cam_agent_id: agent_id,
        NOT: {
          cam_chat_status: status,
        },
      },
      include: {
        Agent: {
          include: {
            AgentStatus: true,
          },
        },
      },
    });
    if (only_agent === false) {
      p.push(
        DbPrisma.chatSessions.update({
          data: {
            chat_session_status: status,
          },
          where: {
            chat_session_uniq_id: chat_id,
          },
        })
      );
    }
    const aaa = agets.map((a) => {
      DbPrisma.agentStatus.update({
        data: {
          agent_current_capacity: {
            increment: 1,
          },
        },
        where: {
          agent_status_id: a.cam_agent_id,
        },
      });
    });
    p.concat(aaa as any);
    DbPrisma.agentStatus.updateMany({
      data: {
        agent_current_capacity: {
          increment: 1,
        },
      },
    });
    p.push(
      DbPrisma.chatAgentMap.updateMany({
        data: {
          cam_chat_status: status,
        },
        where: {
          cam_chat_session_id: chat_id,
        },
      })
    );
  }
  if ([ChatStatus.with_bot, ChatStatus.with_agent].includes(status)) {
    p.push(
      DbPrisma.chatSessions.update({
        data: {
          chat_session_status: status,
        },
        where: {
          chat_session_uniq_id: chat_id,
        },
      })
    );
    if (status === ChatStatus.with_agent) {
      AddMessageToChat(chat_id, 'System', 'N', 'Bot Left Chat', {
        time: GetTimeStamp(),
      });
    } else if (status === ChatStatus.with_bot) {
      AddMessageToChat(chat_id, 'System', 'N', 'Bot Joined Chat', {
        time: GetTimeStamp(),
      });
    }
  }
  await Promise.all(p);
  RoomStatus[chat_id] = status;
  if (only_agent === false) {
    server.of('user').to(chat_id).emit('chat_status', {
      chat_id: chat_id,
      status: status,
    });
  }
  if (typeof agent_id === 'undefined') {
    server.of('agent').to(chat_id).emit('chat_status', {
      chat_id: chat_id,
      status: status,
    });
  }
}

export async function AddMessageToChat(
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
