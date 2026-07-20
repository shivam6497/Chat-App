import type { ChatMessage } from '@chat-app/types';

export type FeedItem =
  | { kind: 'message'; data: ChatMessage }
  | { kind: 'system'; text: string; ts: number };
