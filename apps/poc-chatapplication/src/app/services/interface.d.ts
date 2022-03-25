export type UserChatSessionMap = {
  ucsm_id: string;
  ucsm_session_id: number;
};

/**
 * Model Agent
 *
 */
export type Agent = {
  agent_id: number;
  agent_name: string;
  agent_email: string;
  agent_password: string;
  agent_uname: string;
  agent_extra: any;
  agent_created_at: bigint;
};

/**
 * Model AgentCat
 *
 */
export type AgentCat = {
  agent_cat_id: number;
  agent_cat_name: string;
  agent_cat_type: AgentCat_agent_cat_type;
  agent_created_at: bigint;
};

/**
 * Model AgentCatMap
 *
 */
export type AgentCatMap = {
  agent_cat_map_id: number;
  agent_cat_map_agent_id: number;
  agent_cat_map_agent_cat_id: number;
};

/**
 * Model AgentSkillSetMap
 *
 */
export type AgentSkillSetMap = {
  ass_id: number;
  ass_agent_id: number;
  ass_agent_skill_set_id: number;
};

/**
 * Model AgentStatus
 *
 */
export type AgentStatus = {
  agent_status_id: number;
  agent_availability: number;
  agent_capacity: number;
  agent_current_capacity: number;
};

/**
 * Model ChatAgentMap
 *
 */
export type ChatAgentMap = {
  cam_id: number;
  cam_agent_id: number;
  cam_chat_session_id: number;
  cam_chat_status: number;
  cam_last_message: string;
  cam_edited_on: number;
};

/**
 * Model ChatMessageHistory
 *
 */
export type ChatMessageHistory = {
  chm_id: number;
  chm_chat_session_id: string;
  chm_uniq_id: string;
  chm_from: string;
  chm_message: string;
  chm_type: ChatMessageHistory_chm_type;
  chm_extra: any;
  cha_created_at: number;
};

/**
 * Model ChatSessions
 *
 */
export type ChatSessions = {
  chat_session_id: number;
  chat_session_uniq_id: string;
  chat_session_status: number;
  chat_session_extra: any;
};

/**
 * Model SkillSet
 *
 */
export type SkillSet = {
  skill_id: number;
  skill_name: string;
  skill_type: SkillSet_skill_type;
};

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const AgentCat_agent_cat_type: {
  P: 'P';
  Q: 'Q';
  R: 'R';
  S: 'S';
};

export type AgentCat_agent_cat_type =
  typeof AgentCat_agent_cat_type[keyof typeof AgentCat_agent_cat_type];

export const ChatMessageHistory_chm_type: {
  U: 'U';
  A: 'A';
  B: 'B';
  EMPTY_ENUM_VALUE: 'EMPTY_ENUM_VALUE';
};

export type ChatMessageHistory_chm_type =
  typeof ChatMessageHistory_chm_type[keyof typeof ChatMessageHistory_chm_type];

export const SkillSet_skill_type: {
  A: 'A';
  B: 'B';
  C: 'C';
};

export type SkillSet_skill_type =
  typeof SkillSet_skill_type[keyof typeof SkillSet_skill_type];
