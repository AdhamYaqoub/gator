import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();

  const data = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig.db_url) {
    throw new Error("Invalid config: missing db_url");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const file = fs.readFileSync(filePath, { encoding: "utf-8" });
  const parsed = JSON.parse(file);
  return validateConfig(parsed);
}

export function setUser(userName: string): void {
  const cfg = readConfig();
  cfg.currentUserName = userName;
  writeConfig(cfg);
}
