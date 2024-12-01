import type { CoreMessage } from "ai";
import type { ChatState } from "../types/wabot.types";
import { Redis } from "@upstash/redis";
import { getEnv } from "../env";

export class ChatService {
  private redis: Redis;
  // TTL in seconds (2 hours)
  private static TTL_SECONDS = 2 * 60 * 60; // 2 hours * 60 minutes * 60 seconds

  constructor() {
    this.redis = new Redis({
      url: getEnv("UPSTASH_REDIS_REST_URL"),
      token: getEnv("UPSTASH_REDIS_REST_TOKEN"),
    });
  }

  // Create or Update entire ChatState
  async createOrUpdateChatState(chatState: ChatState) {
    await this.redis.hset(`chatstate:${chatState.userid}`, {
      ...chatState,
      // Serialize chat_prop as it's an array of objects
      chat_prop: JSON.stringify(chatState.chat_prop),
    });

    // Set expiration
    await this.redis.expire(
      `chatstate:${chatState.userid}`,
      ChatService.TTL_SECONDS
    );
  }

  async resetChatState(userId: string) {
    const chatState = await this.getChatState(userId);

    if (chatState) {
      await this.redis.hset(`chatstate:${userId}`, {
        ...chatState,
        chat_prop: [],
      });
      await this.redis.expire(
        `chatstate:${chatState.userid}`,
        ChatService.TTL_SECONDS
      );
    }
  }

  // Retrieve full ChatState
  async getChatState(userId: string): Promise<ChatState | null> {
    const chatState = await this.redis.hgetall(`chatstate:${userId}`);

    if (!chatState) return null;

    return chatState as unknown as ChatState;
  }

  // Append a new message to chat_prop
  async appendMessage(userId: string, message: CoreMessage) {
    // Retrieve current chat state
    const currentState = await this.getChatState(userId);

    if (!currentState) {
      throw new Error("Chat state not found");
    }

    // Add new message
    const updatedMessages = [...currentState.chat_prop, message];

    // Update with new messages
    await this.redis.hset(`chatstate:${userId}`, {
      ...currentState,
      chat_prop: JSON.stringify(updatedMessages),
    });

    return updatedMessages;
  }

  // Update content of a specific message
  async updateMessageContent(
    userId: string,
    messageIndex: number,
    newText: string
  ) {
    const currentState = await this.getChatState(userId);

    if (!currentState) {
      throw new Error("Chat state not found");
    }

    // Create a copy of messages
    const updatedMessages = [...currentState.chat_prop];

    // Update the content text
    updatedMessages[messageIndex].content = [
      {
        type: "text",
        text: newText,
      },
    ];

    // Save updated messages
    await this.redis.hset(`chatstate:${userId}`, {
      ...currentState,
      chat_prop: JSON.stringify(updatedMessages),
    });

    return updatedMessages;
  }

  // Delete a specific message from chat_prop
  async deleteMessage(userId: string, messageIndex: number) {
    const currentState = await this.getChatState(userId);

    if (!currentState) {
      throw new Error("Chat state not found");
    }

    // Remove the message at the specified index
    const updatedMessages = currentState.chat_prop.filter(
      (_, index) => index !== messageIndex
    );

    // Save updated messages
    await this.redis.hset(`chatstate:${userId}`, {
      ...currentState,
      chat_prop: JSON.stringify(updatedMessages),
    });

    return updatedMessages;
  }

  // Get messages filtered by role
  async getMessagesByRole(userId: string, role: CoreMessage["role"]) {
    const currentState = await this.getChatState(userId);

    if (!currentState) {
      throw new Error("Chat state not found");
    }

    return currentState.chat_prop.filter((message) => message.role === role);
  }
}
