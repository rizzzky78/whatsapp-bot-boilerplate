import { stickerService, type StickerFormat } from "@/lib/app/sticker-maker";
import type { CommandModule } from "@/lib/types/wabot.types";

export default {
  aliases: ["sticker"],
  callback: async ({ client, message, msg, args }) => {
    // Early reaction and validation
    await msg.react("👍🏻");

    // const { media, type } = await msg.downloadMedia();
    const buffData = await msg.donwloadContent();
    if (!buffData) return;

    // Type-safe format extraction
    const [format] = args as [StickerFormat | undefined];

    try {
      const stickerBuffer = await stickerService.create(buffData, {
        senderName: msg.senderName,
        format,
      });

      await client.sendMessage(
        msg.senderRemoteJid,
        { sticker: stickerBuffer },
        { quoted: message }
      );
    } catch (error) {
      console.error("Sticker creation failed:", error);
      await msg.react("❌");
    }
  },
} satisfies CommandModule;
