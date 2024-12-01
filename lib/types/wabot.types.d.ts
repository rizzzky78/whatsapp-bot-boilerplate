import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import type { CoreMessage } from "ai";
import type { Serialize } from "../handler/serializer/root";

type CmdProps = {
  /**
   * The active WhatsApp socket connection used for sending and receiving messages
   * Provides methods to interact with the WhatsApp Web API
   */
  client: WASocket;

  /**
   * Raw WhatsApp message object containing complete message metadata
   * Includes information about sender, timestamp, message content, and other low-level details
   */
  message: WAMessage;

  /**
   * The specific command name or alias that was used to trigger this command
   * Represents the exact text matched against registered command aliases
   */
  command: string;

  /**
   * Optional command prefix that triggered the command
   * Can be a symbol like '!', '/', '.', or a custom-defined prefix
   * @optional
   */
  prefix?: string;

  /**
   * Parsed array of command arguments
   * Splits the full message text into individual arguments after the command
   * Excludes the command itself from the array
   */
  args: string[];

  /**
   * Complete argument string without the command
   * Preserves the original argument text exactly as sent by the user
   */
  fullArgs: string;

  /**
   * Message serializer instance
   * This prop has access to internal message data
   */
  msg: Serialize;

  /**
   * The complete raw text of the message sent by the user
   * Contains the entire message content before any parsing or processing
   */
  messageBody: string;
};

/**
 * **Command Builder**
 * Defines the structure and configuration for a command module in the application
 * Provides comprehensive options for command behavior and execution
 */
export type CommandModule = {
  /**
   * Alternative names or shortcuts for invoking the command
   * Allows multiple ways to trigger the same command functionality
   * @example aliases: ['help', 'h', '?']
   */
  aliases: string[];

  /**
   * Categorization for the command
   * Helps in organizing and grouping related commands
   * @optional
   */
  category?: string;

  /**
   * Human-readable explanation of what the command does
   * Helps users understand the command's purpose
   * @optional
   * @example description: 'Retrieves user information'
   */
  description?: string;

  /**
   * Restricts command usage to group administrators only
   * When true, prevents non-admin users from executing the command
   * @optional
   */
  adminOnly?: boolean;

  /**
   * Limits command execution to group contexts only
   * When true, prevents use of the command in private chats
   * @optional
   */
  groupOnly?: boolean;

  /**
   * Restricts command usage to private chat contexts
   * When true, prevents use of the command in group chats
   * @optional
   */
  privateOnly?: boolean;

  /**
   * Defines the minimum number of arguments required for command execution
   * Triggers an error if fewer arguments are provided
   * @optional
   * @example minArgs: 2 // Requires at least 2 arguments
   */
  minArgs?: number;

  /**
   * Provides a usage example demonstrating how to use the command
   * Helps users understand the correct command syntax
   * @optional
   * @example exampleArgs: '{prefix}weather [city]'
   */
  exampleArgs?: string;

  /**
   * Configures a waiting/loading message before command execution
   * Can be a boolean or a custom message string
   * @optional
   */
  waitMessage?: boolean | string;

  /**
   * Implements a cooldown mechanism to prevent command spam
   * Specifies time (in milliseconds) between allowed command uses
   * @optional
   * @example cooldown: 10 * 1000 // 10-second cooldown
   */
  cooldown?: number;

  /**
   * Primary command execution function
   * Asynchronous callback that defines the command's core logic
   * Receives command context and executes the desired functionality
   * @required
   * @example callback: async ({ msg }) => await msg.reply('Command executed!')
   */
  callback: (obj: CmdProps) => Promise<any>;
};

/**
 * Comprehensive user schema representing chat-related user information
 */
export type ChatState = {
  /**
   * Unique user identifier
   * - Generated using UUID to ensure global uniqueness
   * - Follows UUID v4 standard for random generation
   */
  userid: string;

  /**
   * User's phone number
   * - Stored in E.164 international format
   * - Validated to ensure correct phone number structure
   * @example "+1234567890"
   */
  phone_number: string;

  /**
   * User's display name
   * - Represents the name shown in messaging interface
   * - Can be different from legal name
   * @maxLength 50
   */
  username: string;

  /**
   * Timestamp of user chat state creation/last update
   * - Uses ISO 8601 format for standardization
   * - Represents the most recent interaction or state change
   * @example "2024-01-15T10:30:00Z"
   */
  created: string;

  /**
   * Array of messages in the user's chat history
   * - Ordered chronologically
   * - Contains detailed message information
   */
  chat_prop: CoreMessage[];
};

/**
 * **Class Serializer/Agents Properties**
 */
export type Socket = {
  waSocket: WASocket;
  waMessage: WAMessage[];
  isQuoted: boolean;
};
