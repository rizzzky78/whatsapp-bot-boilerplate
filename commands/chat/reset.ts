import moment from "moment";
import type { CommandModule } from "@/lib/types/wabot.types";
import { ChatService } from "@/lib/services/chat-service";

export default {
  aliases: ["reset"],
  callback: async ({ client, message, msg }) => {
    const chatService = new ChatService();

    await chatService.resetChatState(msg.senderNumber);
    return msg.reply("success reset chat state!");
  },
} satisfies CommandModule;
