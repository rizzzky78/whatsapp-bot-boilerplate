import { v4 as generateUuid } from "uuid";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

// Enum for sticker formats to improve type safety
export enum StickerFormat {
  CIRCLE = "circle",
  ROUNDED = "rounded",
  CROPPED = "cropped",
}

// Centralize sticker creation logic
class StickerService {
  /**
   * Create a sticker from media with configurable options
   * @param media - The media buffer to convert to a sticker
   * @param options - Sticker creation options
   * @returns Buffer of the created sticker
   */
  async create(
    media: Buffer,
    options: {
      senderName: string;
      format?: StickerFormat;
    }
  ): Promise<Buffer> {
    const stickerFormat = this.resolveFormat(options.format);

    const sticker = new Sticker(media, {
      pack: options.senderName,
      author: "github.com/rizzzky78",
      type: stickerFormat,
      categories: ["😂"],
      id: `chatbot-${generateUuid()}`,
    });

    return sticker.toBuffer();
  }

  /**
   * Resolve sticker format with sensible default
   * @param format - Optional format input
   * @returns Resolved StickerTypes
   */
  private resolveFormat(format?: StickerFormat): StickerTypes {
    switch (format) {
      case StickerFormat.CIRCLE:
        return StickerTypes.CIRCLE;
      case StickerFormat.ROUNDED:
        return StickerTypes.ROUNDED;
      default:
        return StickerTypes.CROPPED;
    }
  }
}

export const stickerService = new StickerService();
