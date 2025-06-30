import { AgentAppStatus } from '@/types/common';

import { IStreams } from './chat';
import { IUser } from './user';

export interface IVrmConfig {
  offset?: number[];
  blendshapesUpperCase?: boolean;
  rotation?: number[];
  expressionWeights?: { [key: string]: number };
  creator?: string;
}

export interface ICustomVRM {
  id: number;
  userId: number;
  user: IUser;
  vrmId: number;
  vrm: IVrmProps;
  createdAt: Date;
}

export interface ICustomBG {
  id: number;
  userId: number;
  user: IUser;
  bgId: number;
  bg: IBgProps;
  createdAt: Date;
}

export interface IVrmProps {
  id: number;
  name: string;
  file: IMedia;
  thumbnail: IMedia;
  unlockedByDefault: boolean;
  description?: string;
  tags?: string[];
  vrmConfig?: IVrmConfig;
  partners: IPartner[];
  customVrm?: ICustomVRM;
  userVRMTuning: IUserVRMTuning[];
  createdAt: Date;
  updatedAt: Date;
  /*
   * The following properties are not part of the original type definition and are being mapped onto the object in the associated context provider.
   */
  unlockedAt?: Date;
}

export interface IPartner {
  id: number;
  name: string;
  email: string;
  vrm: IVrmProps[];
}

export type IBGType = 'Static' | '360' | 'Chroma';

export interface IBgConfig {
  type: IBGType;
  color?: string;
}

export interface IUserVRMTuning {
  id: number;
  userId: number;
  vrmId: number;
  user: IUser;
  vrm: IVrmProps;
}

export interface IBgProps {
  id: number;
  name: string;
  image: IMedia;
  tags?: string[];
  unlockedByDefault: boolean;
  description?: string;
  bgConfig?: IBgConfig;
  customBg?: ICustomBG;
  defaultBg?: boolean;
  createdAt: Date;
  updatedAt: Date;
  /*
   * The following properties are not part of the original type definition and are being mapped onto the object in the associated context provider.
   */
  unlockedAt?: Date;
}

export interface IMedia {
  id: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  bgId?: number;
  bg?: IBgProps;
  agentId?: number;
  agent?: IAgent;
  voiceId?: number;
  animationFileId?: number;
  animationFile?: IAnimation;
  animationThumbnailId?: number;
  animationThumbnail?: IAnimation;
  vrmFileId?: number;
  vrmFile?: IVrmProps;
  vrmThumbnailId?: number;
  vrmThumbnail?: IVrmProps;
}

export interface IAnimation {
  id: number;
  name: string;
  file?: IMedia;
  thumbnail?: IMedia;
  description?: string;
  animationConfig?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  AgentAnimation?: IAgentAnimation[];
}

export interface IAgent {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  handle?: string;
  walletAddress?: string;
  idleDelay?: number;
  walletHoldings?: number;
  bio?: string;
  socials?: { id: string; type: string; url: string }[];
  user?: IUserAgents;
  idleChat?: boolean;
  discoverability?: boolean;
  colorHexs?: object;
  logo?: IMedia;
  voiceService?: string;
  voiceID?: string;
  exp?: number;
  lore?: string[];
  idle?: string[];
  contractAddress?: string;
  vectorID?: string;
  vrm?: IVrmProps;
  vrmId?: number;
  bg?: IBgProps;
  bgId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  animations?: IAgentAnimation[];
  animationId?: number;
  followingAgents?: IFollowingAgents[];
  streams?: IStreams[];
  appStatus?: AgentAppStatus;
  knowledge: string[];
  adjectives?: string[];
  style?: string[];
  voiceInstructions?: VoiceInstructionCategory;
  greetingMessage?: string[];
}

export interface IAgentAnimation {
  id: number;
  state: AnimationStates;
  agent?: IAgent;
  agentId?: number;
  animation?: IAnimation;
  animationId?: number;
}

export enum AnimationStates {
  IDLE = 'IDLE',
  TALK = 'TALK',
}

export interface IUserAgents {
  id: number;
  createdAt?: Date;
  updatedAt: Date;
  instance?: string;
  User?: IUser;
  userId?: number;
  Agent?: IAgent;
  agentId?: number;
}

export interface Media {
  id: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Animation {
  id: number;
  name: string;
  description?: string | null;
  animationConfig?: Record<string, unknown> | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: number;
  name?: string | null;
  description?: string | null;
  handle?: string | null;
  walletHoldings: number;
  bio?: string | null;
  socials?: Record<string, unknown> | null;
  colorHexs?: Record<string, unknown> | null;
  logo?: Media | null;
  voiceService?: string | null;
  voiceID?: string | null;
  lore?: string[];
  idle?: string[];
  contractAddress?: string | null;
  vectorID?: string | null;
  vrmId?: number | null;
  vrm?: IVrmProps | null;
  bgId?: number | null;
  bg?: IBgProps | null;
  animationId?: number | null;
  animation?: Animation | null;
  appId?: string | null;
  defaultUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollowingAgents {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  User?: IUser;
  userId?: number;
  Agent?: IAgent;
  agentId?: number;
}

export interface VoiceInstructionCategory {
  affect?: string;
  style?: string;
  pacing?: string;
  pronunciation?: string;
  pitch?: string;
}
