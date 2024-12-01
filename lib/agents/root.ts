import { type CoreMessage } from "ai";
import type { proto, WAMessage, WASocket } from "@whiskeysockets/baileys";
import { ChatService } from "../services/chat-service";
import { getMessageContent } from "../services/message-content";
import { logger } from "../utils/logger";
import { fileTypeFromBuffer } from "file-type";
import type { ChatState, Socket } from "../types/wabot.types";
import fs from "fs";
import { Agents } from ".";

export class AgentsWorkflow {
  private waSocket: WASocket;
  private waMessage: WAMessage;
  private isQuoted: boolean;

  private chatService: ChatService;
  private agentsService: Agents;

  constructor({ waSocket, waMessage, isQuoted }: Socket) {
    this.waSocket = waSocket;
    this.waMessage = waMessage[0];
    this.isQuoted = isQuoted;
    this.chatService = new ChatService();
    this.agentsService = new Agents();
  }

  private async getContentMessage() {
    return await getMessageContent(
      this.waMessage,
      this.waMessage.message as proto.IMessage
    );
  }

  async main() {
    logger.info("using workflow agents instance");
    const {
      media,
      text: extractedText,
      metadata,
    } = await this.getContentMessage();

    let userMessage: CoreMessage = {
      role: "user",
      content: [{ type: "text", text: extractedText as string }],
    };

    if (media) {
      const mediaBlobData = new Uint8Array(media);

      const filetype = await fileTypeFromBuffer(mediaBlobData);

      if (Array.isArray(userMessage.content)) {
        userMessage.content = [];

        const content: CoreMessage["content"] = [
          {
            type: "text",
            text: extractedText as string,
          },
          {
            type: "image",
            image: media.toString("base64"),
            mimeType: filetype?.mime,
          },
        ];
        userMessage.content.push(...content);

        this.saveBlobMedia(mediaBlobData, filetype?.ext as string);
      }
    }

    const chatState = await this.chatService.getChatState(metadata.phoneNumber);

    let chatMessages: CoreMessage[];

    let initialChatState: ChatState = {
      userid: metadata.phoneNumber,
      phone_number: metadata.phoneNumber,
      username: metadata.userName,
      created: new Date().toISOString(),
      chat_prop: [],
    };

    if (!chatState || !chatState.chat_prop.length) {
      initialChatState.chat_prop.push(userMessage);
      chatMessages = initialChatState.chat_prop;
    } else {
      chatMessages = chatState.chat_prop;
      chatMessages.push(userMessage);
    }

    const { text: responseText, response } =
      await this.agentsService.googleModel(chatMessages, { enableTool: true });

    chatMessages.push(...response.messages);

    initialChatState.chat_prop = chatMessages;
    await this.chatService.createOrUpdateChatState(initialChatState);
    logger.info("user chat state has been updated!");

    await this.waSocket.sendMessage(
      this.waMessage.key.remoteJid as string,
      {
        text: responseText,
      },
      { quoted: this.isQuoted ? this.waMessage : undefined }
    );
  }

  private saveBlobMedia(data: Uint8Array, ext: string) {
    fs.writeFileSync(`./media/temp-media.${ext}`, data);
  }
}
