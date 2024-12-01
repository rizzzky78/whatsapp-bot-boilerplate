import {
  type GroupMetadata,
  type MessageType as BaileysMessageType,
  proto,
  type WAMediaUpload,
  type WAMessage,
  type WASocket,
  type DownloadableMessage,
  type MediaType,
  type AnyMessageContent,
  type MessageType,
} from "@whiskeysockets/baileys";
import { Readable } from "stream";

export interface MessageQuote {
  key?: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
  };
  message?: proto.Message;
  download?<T extends keyof DownloadType>(type?: T): Promise<DownloadType[T]>;
  delete?: () => Promise<proto.WebMessageInfo>;
}

export interface MessageTypeCheck {
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isSticker?: boolean;
  isContact?: boolean;
  isLocation?: boolean;
  isQuoted?: boolean;
  isQuotedImage?: boolean;
  isQuotedVideo?: boolean;
  isQuotedAudio?: boolean;
  isQuotedSticker?: boolean;
  isQuotedContact?: boolean;
  isQuotedLocation?: boolean;
}

export interface MessageCollectorOptions {
  filter: RegExp | string;
  time?: number;
  max?: number;
}

export interface MessageCollector {
  on(event: "collect", listener: (msg: Serialize) => Promise<void>): this;
  on(
    event: "end",
    listener: (reason: "timeout" | "limit") => Promise<void>
  ): this;
}

export type DownloadType = {
  buffer: Buffer;
  stream: Readable;
};

export type Serialize = {
  id: string | null | undefined;
  type: MessageType;
  typeCheck?: MessageTypeCheck;
  from: string | null | undefined;
  isSelf: boolean | null | undefined;
  isGroup: boolean | null | undefined;
  groupMetadata?: GroupMetadata;
  responseId?: string | null | undefined;
  sender: string | null | undefined;
  senderNumber: string | null | undefined;
  pushName?: string | null | undefined;
  mentions?: string[];
  quoted?: MessageQuote;
  body: string | null | undefined;

  reply(text: string, quoted?: WAMessage): Promise<proto.WebMessageInfo>;

  replyWithMentions(
    text: string,
    mentions?: string[],
    quoted?: WAMessage
  ): Promise<proto.WebMessageInfo>;

  replyImage(
    image: WAMediaUpload,
    caption?: string
  ): Promise<proto.WebMessageInfo>;

  replyVideo(
    video: WAMediaUpload,
    caption?: string
  ): Promise<proto.WebMessageInfo>;

  replyAudio(
    audio: WAMediaUpload,
    ptt?: boolean
  ): Promise<proto.WebMessageInfo>;

  replyDocument(
    document: WAMediaUpload,
    mimetype: string,
    fileName?: string
  ): Promise<proto.WebMessageInfo>;

  replySticker(sticker: WAMediaUpload): Promise<proto.WebMessageInfo>;

  react(text: string): Promise<proto.WebMessageInfo>;

  download?<T extends keyof DownloadType>(type?: T): Promise<DownloadType[T]>;

  createMessageCollector?(options: MessageCollectorOptions): MessageCollector;
};
