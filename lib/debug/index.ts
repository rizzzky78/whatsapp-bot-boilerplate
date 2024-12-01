import fs from "fs";

const DEFAULT_PATH = "./lib/debug/temp/temporary.json";

class DebugerTool {
  temp(v: any, filename: string = "temporary") {
    fs.writeFileSync(
      `./lib/debug/temp/${filename}.json`,
      JSON.stringify(v, null, 2)
    );
  }
}

export const debuggerTool = new DebugerTool();
