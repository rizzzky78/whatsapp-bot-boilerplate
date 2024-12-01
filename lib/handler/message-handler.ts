import {
  type MessageUpsertType,
  type WAMessage,
  type WASocket,
  getContentType,
} from "@whiskeysockets/baileys";
import { logger } from "@/lib/utils/logger";
import { commands } from "@/lib/utils/command-register/module";
import { AgentsWorkflow } from "@/lib/agents/root";
import { error } from "@/lib/utils/error";
import { extractMessageBody } from "@/lib/services/message-content";
import { Serialize } from "@/lib/handler/serializer/root";
import { getCommandModule } from "@/lib/utils/command-register/module";
import { debuggerTool } from "../debug";

const ENABLE_AGENTS: boolean = process.env.ENABLE_AGENTS === "ENABLE";

interface Message {
  messages: WAMessage[];
  type: MessageUpsertType;
}

export async function messageHandler(
  client: WASocket,
  { messages, type }: Message
) {
  if (type !== "notify") return;

  debuggerTool.temp(messages);

  const message = messages[0];

  if (message.key && message.key.remoteJid === "status@broadcast") return;
  if (!message.message) return;

  const messageType = getContentType(message.message);

  if (
    ["protocolMessage", "senderKeyDistributionMessage"].includes(
      messageType as string
    ) ||
    !messageType
  )
    return;

  const {
    command: commandPrefix,
    args,
    fullArgs,
    senderName,
    senderNumber,
    origin,
    body,
    isGroup,
  } = extractMessageBody(message);

  const commandObject = getCommandModule(commands, commandPrefix.trim());

  /**
   * Auto Read Messages
   */
  await client.readMessages([message.key]);

  const serialize = new Serialize({
    waSocket: client,
    waMessage: messages,
    isQuoted: isGroup,
  });

  if (commandObject) {
    logger.info(
      `received cmd: [${commandPrefix.trim()}] ${origin} message from ${senderName} with phone_id: ${senderNumber}`
    );
    try {
      return await commandObject.callback({
        message,
        client,
        args,
        fullArgs,
        msg: serialize,
        messageBody: body,
        command: commandPrefix,
      });
    } catch (e) {
      logger.error(`Error: ${error(e)}`);
      return client.sendMessage(message.key.remoteJid as string, {
        text: `Error when executing command: ${commandPrefix}`,
      });
    }
  } else {
    if (ENABLE_AGENTS) {
      const agentsWorkflow = new AgentsWorkflow({
        waSocket: client,
        waMessage: messages,
        isQuoted: isGroup,
      });
      await agentsWorkflow.main();
    }
  }
}
