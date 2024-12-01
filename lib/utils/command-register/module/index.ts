import type { CommandModule } from "@/lib/types/wabot.types";
import { utility } from "../../utility";

export const commands = new Map<string, CommandModule>();

export function getCommandModule<V extends Map<string, CommandModule>>(
  value: V,
  key: string
) {
  return (
    utility.find(
      value,
      (c) => c.aliases && c.aliases.includes(key.toLowerCase())
    ) || value.get(key.toLowerCase())
  );
}
