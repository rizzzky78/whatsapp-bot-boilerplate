import type { CommandModule } from "../../types/wabot.types";
import fs from "fs";
import path from "path";
import { GlobSync } from "glob";
import { pathToFileURL } from "url";
import { logger } from "../logger";
import { toJSON } from "../json";
import { commands } from "./module";

export class CommandRegister {
  constructor() {
    this.registerCommand();
  }

  private getProjectRootPath(): string {
    // Dynamic root path detection
    const currentDir = __dirname;
    const possiblePaths = [
      path.join(currentDir, "..", "..", "..", "commands"),
      path.join(currentDir, "..", "..", "commands"),
      path.join(currentDir, "..", "commands"),
      path.join(currentDir, "commands"),
    ];

    for (const possiblePath of possiblePaths) {
      logger.info(`Checking path: ${possiblePath}`);
      if (fs.existsSync(possiblePath)) {
        logger.info(`✅ Found valid commands directory: ${possiblePath}`);
        return possiblePath;
      }
    }

    throw new Error("Could not locate commands directory");
  }

  private getAllFiles(directory: string) {
    try {
      const pathFiles = new GlobSync(
        path.join(directory, "**", "*.ts").replace(/\\/g, "/")
      ).found;

      logger.info(`Raw files found: ${pathFiles.length}`);

      const files = pathFiles.map((file) => {
        const basename = path.parse(file).name.toLowerCase();
        return {
          basename,
          file,
          absolutePath: path.resolve(file),
        };
      });

      logger.info(`Processed files: ${files.length}`);
      return files;
    } catch (error) {
      console.error("Error in getAllFiles:", error);
      return [];
    }
  }

  async registerCommand() {
    try {
      const commandsPath = this.getProjectRootPath();
      const files = this.getAllFiles(commandsPath);

      const basenameModule: string[] = [];
      for (const { basename, absolutePath } of files) {
        try {
          const moduleUrl = pathToFileURL(absolutePath).href;
          const module = await import(moduleUrl);

          if (this.isCommandModule(module)) {
            commands.set(basename, module.default);
            basenameModule.push(basename);
          } else {
            logger.warn(`❌ No valid command export in ${basename}`);
          }
        } catch (moduleError) {
          logger.error(
            `Error loading module ${basename}:`,
            moduleError instanceof Error ? moduleError.message : null
          );
        }
      }
      logger.info(`✅ Registered command: ${toJSON(basenameModule)}`);
    } catch (error) {
      logger.error("Fatal error in registerCommand:", error);
    }
  }

  private isCommandModule(module: any): module is { default: CommandModule } {
    return (
      module.default &&
      typeof module.default.callback === "function" &&
      Array.isArray(module.default.aliases)
    );
  }
}
