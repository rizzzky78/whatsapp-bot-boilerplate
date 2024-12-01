import WASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type ConnectionState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { messageHandler } from "@/lib/handler/message-handler";
import { logger } from "@/lib/utils/logger";
import { error } from "@/lib/utils/error";

const SESSION_DIRECTORY = `./auth/${
  process.env.SESSION_NAME || "DEFAULT_SESSION"
}`;

/**
 * Initializes and connects to WhatsApp using Baileys.
 * - Authenticates using multi-file authentication.
 * - Listens for connection updates, messages, and other events.
 * - Handles reconnections on unexpected disconnects.
 */
export async function connectToWhatsApp(): Promise<void> {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIRECTORY);

    const sock = WASocket({
      printQRInTerminal: true,
      auth: state,
    });

    setupEventListeners(sock, saveCreds);

    logger.info("WhatsApp client initialized.");
  } catch (err) {
    error(err);
    throw err;
  }
}

/**
 * Sets up event listeners for the WhatsApp socket.
 * - Handles credential updates.
 * - Monitors connection updates for reconnection logic.
 * - Processes incoming messages via a message handler.
 * @param sock - WhatsApp socket instance.
 * @param saveCreds - Function to save updated credentials.
 */
function setupEventListeners(
  sock: ReturnType<typeof WASocket>,
  saveCreds: () => Promise<void>
): void {
  // Save credentials on update
  sock.ev.on("creds.update", saveCreds);

  // Handle connection updates
  sock.ev.on("connection.update", (update) => {
    handleConnectionUpdate(update);
  });

  // Process incoming messages
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    await messageHandler(sock, { messages, type });
  });
}

/**
 * Handles WhatsApp connection updates, including reconnection logic.
 * @param update - Connection update object from Baileys.
 */
function handleConnectionUpdate(update: Partial<ConnectionState>): void {
  const { connection, lastDisconnect } = update;

  if (connection) {
    logger.info(`Connection status: ${connection}`);

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      logger.warn(
        "Connection closed. Reason: ",
        lastDisconnect?.error,
        " Reconnecting: ",
        shouldReconnect
      );

      if (shouldReconnect) {
        connectToWhatsApp().catch(error);
      }
    } else if (connection === "open") {
      logger.info("Connection successfully opened.");
    }
  }
}
