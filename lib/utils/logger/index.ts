import winston, {
  Logger as WinstonLogger,
  type LoggerOptions,
  format,
  transports,
} from "winston";

class Logger {
  private static instance: WinstonLogger;

  private constructor() {} // Prevent direct instantiation

  /**
   * Returns the singleton logger instance.
   */
  public static getInstance(): WinstonLogger {
    if (!Logger.instance) {
      Logger.instance = Logger.createLogger();
    }
    return Logger.instance;
  }

  /**
   * Creates a configured winston logger instance.
   */
  private static createLogger(): WinstonLogger {
    const logFormat = format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    });

    const options: LoggerOptions = {
      level: process.env.LOG_LEVEL || "info", // Default log level
      format: format.combine(
        format.colorize(), // Colorize log levels
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
        logFormat // Apply custom format
      ),
      transports: [
        new transports.Console(), // Log to console
        new transports.File({
          filename: "logs/error.log",
          level: "error", // Log only errors
        }),
        new transports.File({
          filename: "logs/combined.log", // Log all levels
        }),
      ],
    };

    return winston.createLogger(options);
  }
}

export const logger = Logger.getInstance();
