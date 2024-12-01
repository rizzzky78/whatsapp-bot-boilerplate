# WhatsApp Bot Boilerplate 🚀

A cutting-edge WhatsApp bot boilerplate written in TypeScript, designed for scalability, modularity, and seamless integration with modern AI agents and databases.

## ✨ Features

- **WhatsApp Web Integration**: Built with [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) for robust WhatsApp Web API support.
- **Modular Architecture**: Fully modularized codebase for easy feature management using module aliases.
- **AI-Powered Interactions**: Supports multi-modal AI input with Google Generative AI, Groq AI, and Vercel AI SDK.
- **Runtime Optimized**: Built with [Bun](https://bun.sh), delivering faster performance and lightweight runtime.
- **Database Support**:
  - **Upstash Redis**: For managing chat state efficiently.
  - **Supabase**: For storing files and persistent data.
- **Hot-Reloading**: Ensures instant updates to chatbot features without downtime.
- **Command Module Support**: Easy-to-extend system for adding chatbot commands.

---

## 📂 Project Structure

```plaintext
src/
├── @commands/...       # Chatbot command modules
├── @lib/app/...        # Separated folders for chatbot features
├── @lib/utils/...      # Utility functions
├── @lib/agents/...     # AI integrations and agents
├── @lib/types/...      # Types and definitions
└── index.ts            # Main entry point
```

---

## 🛠️ Installation

### Prerequisites

- [Bun](https://bun.sh/docs/installation) runtime installed.
- A [WhatsApp account](https://www.whatsapp.com/) to connect.
- Access to [Upstash Redis](https://upstash.com/) and [Supabase](https://supabase.io/).

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/whatsapp-bot-boilerplate.git
   cd whatsapp-bot-boilerplate
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and fill in the following:

   ```env
    SESSION_NAME="YOUR-SESSION-NAME"

    # Upstash Redis URL and Token retrieved here: https://console.upstash.com/redis
    UPSTASH_REDIS_REST_URL="REDIS_URL"
    UPSTASH_REDIS_REST_TOKEN="REDIS_TOKEN"

    SUPABASE_URL="SUPABASE_URL"
    SUPABASE_ANON_KEY="SUPABASE_ANON_KEY"

    # Google Generative AI API key retrieved here: https://aistudio.google.com/app/apikey
    GOOGLE_GENERATIVE_AI_API_KEY="APIKEY"

    # Groq API key retrieved here: https://console.groq.com/keys
    GROQ_API_KEY="APIKEY"
    GROQ_API_KEY="APIKEY"

    # Tavily API Key retrieved here: https://app.tavily.com/home
    TAVILY_API_KEY="APIKEY"

    # (optional) Serper API Key retrieved here: https://serper.dev/api-key
    SERPER_API_KEY="APIKEY"
   ```

4. Start the development server in watch mode (will restart if any files changes):
   ```bash
   bun run dev
   ```

---

## Understanding Type Definitions

### Command Module
This TypeScript module defines a robust type system for a WhatsApp bot application, providing comprehensive type definitions for command handling, message processing, and user state management.

The CommandModule type enables creating flexible, feature-rich commands with extensive configuration options:

- Flexible Aliases: Multiple ways to trigger a single command
- Rich Metadata: Categorization and descriptions
- Execution Controls:
  - Permission-based restrictions
  - Argument validation
  - Cooldown mechanisms
```ts
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

```

### Example Features Implementation

Example command *ping*

```ts
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
```
### Overview

The Ping command is a diagnostic utility designed to measure and report the latency between message transmission and bot response in a WhatsApp messaging environment. This command provides real-time performance insights by calculating the time elapsed between a user's message and the bot's reply.

### Technical Specifications

#### Command Characteristics
- **Aliases**: `ping`, `pong`
- **Category**: System Diagnostics
- **Primary Function**: Measure message processing time
- **Response Type**: Detailed latency information

#### Latency Calculation Method
The command leverages the `messageTimestamp` property to compute elapsed time:
1. Retrieves the original message's timestamp
2. Calculates the difference between current time and message timestamp
3. Converts the duration to seconds using Moment.js

### Implementation Details

#### Key Technologies
- TypeScript for type-safe implementation
- Moment.js for precise time calculations
- WhatsApp Web API integration

#### Response Structure
The command generates a JSON-formatted response containing:
- Calculated ping duration in seconds
- Raw timestamp for reference

### Performance Insights

#### Typical Use Cases
- Verify bot responsiveness
- Monitor system latency
- Diagnose potential communication delays

#### Potential Improvements
- Add more granular timing metrics
- Implement logging for latency tracking
- Create comprehensive performance reports

### Operational Considerations

#### Best Practices
- Minimal computational overhead
- Clear, concise response format
- Immediate performance feedback

#### Error Handling
The current implementation includes basic null-checking to prevent potential runtime errors when processing message timestamps.

#### Conclusion

The Ping command serves as a critical diagnostic tool, providing immediate insights into the bot's responsiveness and message processing efficiency within the WhatsApp messaging ecosystem.

## 🚀 Usage

### Adding New Commands

Commands are stored in the `commands/...` directory. To add a new command:

1. Create a new file in `commands/...` or folder and place some file `.ts` file.
2. Export a function that handles the command logic:

```ts
import type { CommandModule } from "@/lib/types/wabot.types";

export default {
  aliases: ["ping", "pong"],
  callback: async ({ message, msg, client }) => {
    return await client.sendMessage(msg.senderRemoteJid, {
      text: "Hello World",
    });
  },
} satisfies CommandModule;
```

3. Will automatically import and register your command in the bot.

---

## 🔥 AI Integration

Leverage the power of AI using integrated SDKs:

- **Google Generative AI**: Natural language understanding and response generation.
- **Groq AI**: Contextual and multi-modal input processing.
- **Vercel AI SDK**: Plug-and-play solutions for generative AI.

See `@lib/agents/...` for examples and setup details.

---

## 🛡️ Deployment

1. Run the application:

   ```bash
   bun run app
   ```

2. Deploy to your preferred hosting provider (e.g., Vercel, Fly.io, etc.).

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🌟 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

---

## 🛠️ Future Improvements

- [ ] Add integration examples for additional AI agents.
- [ ] Include detailed logging and debugging tools.
- [ ] Expand the documentation for advanced customization.

---

## 🙌 Acknowledgements

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
- [Vercel AI SDK](https://vercel.com/docs/ai)
- [Upstash Redis](https://upstash.com/)
- [Supabase](https://supabase.io/)
