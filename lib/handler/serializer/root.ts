import {
  downloadContentFromMessage,
  downloadMediaMessage,
  type proto,
  type WAMediaUpload,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import type { Socket } from "../../types/wabot.types";
import {
  extractTextMessage,
  getMessageContent,
} from "@/lib/services/message-content";
import { fileTypeFromBuffer, type MimeType } from "file-type";

export class Serialize {
  private client: WASocket;
  private waMessage: WAMessage;

  private isSelf: boolean;

  public senderRemoteJid: string;
  public senderNumber: string;
  public senderName: string;

  constructor({ waSocket, waMessage }: Socket) {
    this.client = waSocket;
    this.waMessage = waMessage[0];
    this.senderRemoteJid = this.waMessage.key?.remoteJid ?? "";
    this.isSelf = this.waMessage.key.fromMe as boolean;
    this.senderNumber = this.extractSenderNumber();
    this.senderName = this.waMessage.pushName ?? "no name";
  }

  private extractSenderNumber(): string {
    const jid = this.senderRemoteJid.endsWith("@g.us")
      ? this.waMessage.key.participant
      : this.waMessage.key.remoteJid;

    return jid?.split("@")[0]?.split(":")[0] || "";
  }

  private getContextMessage() {
    return extractTextMessage(this.waMessage.message!);
  }

  async reply(text: string | number, quoted?: boolean) {
    return (
      !this.isSelf &&
      this.client.sendMessage(
        this.senderRemoteJid,
        {
          text: text.toString().trim(),
        },
        { quoted: quoted ? this.waMessage : undefined }
      )
    );
  }

  async replySticker(sticker: WAMediaUpload) {
    return (
      !this.isSelf &&
      this.client.sendMessage(
        this.senderRemoteJid,
        {
          sticker,
        },
        {
          quoted: this.waMessage,
        }
      )
    );
  }

  async react(emoji: string) {
    return (
      !this.isSelf &&
      this.client.sendMessage(this.senderRemoteJid, {
        react: { text: emoji, key: this.waMessage.key },
      })
    );
  }

  async downloadMedia() {
    const { media, type, quotedContext } = await getMessageContent(
      this.waMessage,
      this.waMessage.message!
    );

    return { media, type };
  }

  async donwloadContent() {
    const quoted =
      this.waMessage.message?.imageMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      const data = await downloadContentFromMessage(
        quoted.imageMessage!,
        "image"
      );
      let buff = Buffer.from([]);
      for await (const chunk of data) {
        buff = Buffer.concat([buff, chunk]);
      }
      return buff;
    } else if (this.waMessage.message?.imageMessage) {
      const data = await downloadContentFromMessage(
        this.waMessage.message?.imageMessage!,
        "image"
      );
      let buff = Buffer.from([]);
      for await (const chunk of data) {
        buff = Buffer.concat([buff, chunk]);
      }
      return buff;
    }
    return null;
  }
}
