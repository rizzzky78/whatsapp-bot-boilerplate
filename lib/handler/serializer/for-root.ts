import {
  getContentType,
  type MessageType,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import type { Serialize } from "./index";
import { extractTextMessage } from "@/lib/services/message-content";

export const serialize = async (msg: any, client: any) => {
  let m: any = {};

  if (msg.key) {
    m.id = msg.key.id;
    m.isSelf = msg.key.fromMe;
    m.from = msg.key.remoteJid;
    m.isGroup = m.from?.endsWith("@g.us");
    m.sender = m.isGroup ? msg.key.participant : msg.key.remoteJid;
    m.sender = m.sender?.includes(":")
      ? m.sender.split(":")[0] + "@s.whatsapp.net"
      : m.sender;
    m.senderNumber = m.sender?.split("@")[0] || "";
  }

  m.type = getContentType(msg.message!)!;
  if (m.type === "ephemeralMessage" || m.type === "viewOnceMessage") {
    msg.message = msg.message![m.type]?.message;
    m.type = getContentType(msg.message!)!;
  }

  m.pushName = msg.pushName || undefined; // Ensuring type matches

  if (m.type) {
    const extract = extractTextMessage(msg.message!);
    m.body = extract?.t;
  }

  if (m.body?.[1] === " ") {
    m.body = m.body.replace(" ", "");
  }

  m.responseId =
    msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    msg.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message?.templateButtonReplyMessage?.selectedId ||
    undefined;

  m.mentions = msg.message?.[m.type!]?.contextInfo?.mentionedJid || [];

  if (msg.message?.[m.type]?.contextInfo?.quotedMessage) {
    m.quoted = {
      message: msg.message[m.type].contextInfo.quotedMessage,
      key: {
        id: msg.message[m.type].contextInfo.stanzaId,
        fromMe:
          msg.message[m.type].contextInfo.participant ===
          client.user.id.split(":")[0] + "@s.whatsapp.net",
        remoteJid: m.from,
      },
      delete: () => client.sendMessage(m.from, { delete: m.quoted?.key }),
      download: async (type = "stream") =>
        downloadMedia(m.quoted?.message, type),
    };
  } else {
    m.quoted = undefined;
  }

  if (m.type) {
    m.typeCheck = {
      isImage: m.type === "imageMessage",
      isVideo: m.type === "videoMessage",
      isAudio: m.type === "audioMessage",
      isSticker: m.type === "stickerMessage",
      isContact: m.type === "contactMessage",
      isLocation: m.type === "locationMessage",
    };

    if (m.quoted) {
      const typeQuoted = Object.keys(m.quoted.message || {})[0];
      m.typeCheck.isQuotedImage = typeQuoted === "imageMessage";
      m.typeCheck.isQuotedVideo = typeQuoted === "videoMessage";
      m.typeCheck.isQuotedAudio = typeQuoted === "audioMessage";
      m.typeCheck.isQuotedSticker = typeQuoted === "stickerMessage";
      m.typeCheck.isQuotedContact = typeQuoted === "contactMessage";
      m.typeCheck.isQuotedLocation = typeQuoted === "locationMessage";
    }
  }

  m.groupMetadata = m.isGroup ? await client.groupMetadata(m.from) : undefined;

  m.reply = (text: string, quoted: any) =>
    !m.isSelf &&
    client.sendMessage(
      m.from,
      { text: text.trim() },
      { quoted: quoted || msg }
    );

  m.replyWithMentions = (text: string, mentions: any, quoted: any) =>
    !m.isSelf &&
    client.sendMessage(
      m.from,
      { text: text.trim(), mentions },
      { quoted: quoted || msg }
    );

  m.replyImage = (image: any, caption: any) =>
    !m.isSelf &&
    client.sendMessage(m.from, { image, caption }, { quoted: msg });

  m.replyVideo = (video: any, caption: any) =>
    !m.isSelf &&
    client.sendMessage(
      m.from,
      { video, mimetype: "video/mp4", caption },
      { quoted: msg }
    );

  m.replyAudio = (audio: any, ptt: any) =>
    !m.isSelf &&
    client.sendMessage(
      m.from,
      { audio, mimetype: "audio/mp4", ptt },
      { quoted: msg }
    );

  m.replyDocument = (document: any, mimetype: any, fileName: any) =>
    !m.isSelf &&
    client.sendMessage(
      m.from,
      { document, mimetype, fileName },
      { quoted: msg }
    );

  m.replySticker = (sticker: any) =>
    !m.isSelf && client.sendMessage(m.from, { sticker }, { quoted: msg });

  m.react = (text: any) =>
    !m.isSelf && client.sendMessage(m.from, { react: { text, key: msg.key } });

  m.download = (type = "stream") => downloadMedia(msg.message, type);

  // m.createMessageCollector = (options = { filter: null }) =>
  //   new collector.MessageCollector(client, options, m);

  return m;
};
function downloadMedia(message: any, type: string) {
  throw new Error("Function not implemented.");
}
