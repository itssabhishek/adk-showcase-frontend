import { Agent, IAgent } from './agent';
import { IUser } from './user';

export interface IStreams {
  id: number;
  title: string;
  isActive?: boolean;
  endTime?: Date;
  startTime?: Date;
  viewerCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  Agent?: IAgent;
  agentId?: number;
}

export interface Streams {
  id: number;
  title: string;
  isActive: boolean;
  endTime?: Date | null;
  startTime: Date;
  viewerCount: number;
  createdAt: Date;
  updatedAt: Date;
  agentId?: number | null;
  agent?: Agent | null;
}

export interface Message {
  id: number;
  message: string;
  messageMeta: Record<string, unknown>;
  pinned: boolean;
  streamsId?: number | null;
  streams?: Streams | null;
  createdAt: Date;
  updatedAt: Date;
  userId?: number | null;
  User?: IUser | null;
  audio?: string;
}
