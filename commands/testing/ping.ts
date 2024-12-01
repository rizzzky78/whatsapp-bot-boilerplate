import moment from "moment";
import type { CommandModule } from "@/lib/types/wabot.types";

export default {
  aliases: ["ping", "pong"],
  callback: async ({ message, msg }) => {
    if (message.messageTimestamp) {
      const value = JSON.stringify(
        {
          ping: `*_${moment
            .duration(
              Date.now() -
                parseInt(message?.messageTimestamp?.toString()) * 1000
            )
            .asSeconds()} second(s)_*`,
          raw: message?.messageTimestamp?.toString(),
        },
        null,
        2
      );
      return msg.reply(value, true);
    }
  },
} satisfies CommandModule;
