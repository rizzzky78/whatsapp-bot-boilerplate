import { proto } from "@whiskeysockets/baileys";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export interface MessageContent {
  media: Buffer | null;
  text: string | null;
  metadata: {
    userName: string;
    phoneNumber: string;
  };
}

export type MessageType =
  | "extendedTextMessage"
  | "imageMessage"
  | "videoMessage"
  | "conversation";

export type Extractors = {
  q: proto.IMessage | string | null | undefined;
  t: string | null | undefined;
};

export function extractTextMessage(message: proto.IMessage) {
  type Keys = keyof Pick<proto.IMessage, MessageType>;
  message.imageMessage?.contextInfo?.quotedMessage;
  // Define a type-safe way to extract message content
  const extractors: Record<Keys, () => Extractors> = {
    extendedTextMessage: () => {
      const q = message.extendedTextMessage?.contextInfo?.quotedMessage;
      const t = message.extendedTextMessage?.text;
      return { q, t };
    },
    imageMessage: () => {
      const q = message.imageMessage?.contextInfo?.quotedMessage;
      const t = message.imageMessage?.caption;
      return { q, t };
    },
    videoMessage: () => {
      const q = message.imageMessage?.contextInfo?.quotedMessage;
      const t = message.imageMessage?.caption;
      return { q, t };
    },
    conversation: () => {
      const q = undefined;
      const t = message.conversation;
      return { q, t };
    },
  };

  // Iterate through possible message types in a prioritized order
  for (const [type, extractor] of Object.entries(extractors)) {
    if (message[type as keyof proto.IMessage]) {
      return extractor();
    }
  }

  return null;
}

/**
 * Fetches message content including text and media.
 * @param client - The Baileys client.
 * @param message - The WhatsApp message to process.
 * @returns An object containing media and text.
 */
export async function getMessageContent(
  client: proto.IWebMessageInfo,
  message: proto.IMessage
) {
  const origin = client?.key?.remoteJid?.includes("@g.us")
    ? "group"
    : "private";

  // Extract sender number
  let senderNumber: string | undefined;
  if (origin === "group") {
    // For group messages, use the participant number
    senderNumber = client.key.participant
      ? client?.key?.participant?.split("@")[0]
      : client?.key?.remoteJid?.split("@")[0];
  } else {
    // For personal messages, use the remote JID
    senderNumber = client?.key?.remoteJid?.split("@")[0];
  }

  const metadata = {
    userName: client.pushName || "anonymous",
    phoneNumber: senderNumber || "null",
  };

  // Use a more robust way to determine message type
  const messageType = Object.keys(message).find((key) =>
    [
      "extendedTextMessage",
      "imageMessage",
      "videoMessage",
      "conversation",
    ].includes(key)
  ) as MessageType | undefined;

  // Early return if no valid message type found
  if (!messageType) {
    return { media: null, text: null, metadata };
  }

  // Extract text content
  const extractor = extractTextMessage(message);

  // Conditionally download media based on message type
  const media = await (messageType === "imageMessage" ||
  messageType === "videoMessage"
    ? downloadMediaMessage(client, "buffer", {})
    : Promise.resolve(null));

  return {
    media,
    text: extractor?.t,
    metadata,
    type: messageType,
    quotedContext: extractor?.q,
  };
}

export type MessageBody = {
  command: string;
  args: string[];
  fullArgs: string;
  senderName: string;
  origin: string;
  senderNumber: string;
  body: string;
  isGroup: boolean;
};

export function extractMessageBody(m: proto.IWebMessageInfo): MessageBody {
  const origin = m?.key?.remoteJid?.includes("@g.us") ? "group" : "private";

  let senderNumber: string;
  if (origin === "group") {
    // For group messages, use the participant number
    senderNumber = m?.key?.participant
      ? m.key.participant.split("@")[0]
      : m?.key?.remoteJid?.split("@")[0] || "anonymous";
  } else {
    // For personal messages, use the remote JID
    senderNumber = m?.key?.remoteJid?.split("@")[0] || "anonymous";
  }

  // Extract message text
  const t = extractTextMessage(m.message!);
  const body = t?.t || "";

  const isGroup = origin === "group";
  const [command, ...args] = body.trim().split(/ +/);
  const fullArgs = body.slice(command.length).trim();
  const senderName = m.pushName || "anonymous";
  return {
    command,
    args,
    fullArgs,
    senderName,
    origin,
    senderNumber,
    body,
    isGroup,
  };
}
