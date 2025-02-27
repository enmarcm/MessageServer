import fs from "fs";
import path from "path";
import CryptManager from "./CryptManager";
import config from "../config.json";

interface ApiKeyData {
  apiKey: string;
  remainingUses: number;
  user: string;
}

/**
 * ApiKeyHandler class to manage API key operations.
 */
class ApiKeyHandler {
  private apiKeys: ApiKeyData[];
  private dataPath: string;

  /**
   * Creates an instance of ApiKeyHandler.
   */
  constructor() {
    this.dataPath = path.join(__dirname, "../data/jsons/apiKey.json");
    const data = fs.readFileSync(this.dataPath, "utf-8");
    this.apiKeys = JSON.parse(data) as ApiKeyData[];
  }

  /**
   * Validates the provided API key.
   * @param {string} key - The API key to validate.
   * @returns {boolean} - True if the API key is valid, false otherwise.
   */
  public validateApiKey(key: string): boolean {
    const apiKeyData = this.apiKeys.find((apiKey) => apiKey.apiKey === key);
    if (!apiKeyData || apiKeyData.remainingUses <= 0) {
      return false;
    }
    return true;
  }

  /**
   * Updates the remaining uses of the provided API key.
   * @param {string} key - The API key to update.
   */
  public updateApiKeyUsage(key: string): void {
    const apiKeyData = this.apiKeys.find((apiKey) => apiKey.apiKey === key);
    if (apiKeyData && apiKeyData.remainingUses > 0) {
      apiKeyData.remainingUses -= 1;
      this.saveApiKeys();
    }
  }

  /**
   * Saves the API keys data to the JSON file.
   * @private
   */
  private saveApiKeys(): void {
    fs.writeFileSync(
      this.dataPath,
      JSON.stringify(this.apiKeys, null, 2),
      "utf-8"
    );
  }

  /**
   * Generates a new API key and adds it to the list of valid API keys.
   * @returns {string} - The newly generated API key.
   */
  public generateApiKey(): string {
    const newApiKey: ApiKeyData = {
      apiKey: CryptManager.generateRandom({ size: 6 }),
      remainingUses: config.security.API_KEY.default_uses,
      user: "",
    };

    this.apiKeys.push(newApiKey);
    this.saveApiKeys();

    return newApiKey.apiKey;
  }
}

export default ApiKeyHandler;
