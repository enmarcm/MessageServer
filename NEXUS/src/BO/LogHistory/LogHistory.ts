/**
 * LogHistory class for logging messages to a MongoDB database.
 *
 * @example
 * ```typescript
 * const logHistory = new LogHistory();
 *
 * logHistory.log('This is a test log message');
 * logHistory.warn('This is a test warning message');
 * logHistory.error('This is a test error message');
 * ```
 */

import { Log } from "../TGoose/Items/LogItem";
import { LogModel } from "../TGoose/models";
import { ITSGooseHandler } from "../../data/instances";
import { LogType } from "../../enums";

export default class LogHistory {
  private LogModel = LogModel;

  /**
   * Method to log data to the database.
   * @param {string} message - The log message.
   * @param {LogType} type - The type of log.
   * @private
   */
  private async logMessage(message: string, type: LogType): Promise<void> {
    try {
      const logEntry = new this.LogModel({ message, type });
      await ITSGooseHandler.addDocument({
        Model: this.LogModel,
        data: logEntry,
      });
      console.log(`Log saved: ${message} [${type}]`);
    } catch (error) {
      console.error("Error saving log:", error);
    }
  }

  /**
   * Method to log a general message.
   * @param {string} message - The log message.
   */
  public log(message: string | object): void {
    this.logMessage(
      typeof message === "string" ? message : JSON.stringify(message),
      LogType.LOG
    );
  }

  /**
   * Method to log a warning message.
   * @param {string} message - The warning message.
   */
  public warn(message: string | object): void {
    this.logMessage(
      typeof message === "string" ? message : JSON.stringify(message),
      LogType.WARN
    );
  }

  /**
   * Method to log an error message.
   * @param {string | Error} error - The error message or object.
   */
  public error(error: string | Error): void {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}\n${error.stack}`
        : typeof error === "string"
        ? error
        : JSON.stringify(error);
    this.logMessage(message, LogType.ERROR);
  }

  /**
   * Method to get all logs in JSON format.
   * @returns {Promise<Array<{ type: LogType, message: string }>>} - A promise that resolves to an array of logs.
   */
  public async getAllLogs(): Promise<
    Array<{ type: LogType; message: string }>
  > {
    try {
      const logs = await ITSGooseHandler.searchAll<Log>({
        Model: this.LogModel,
        condition: {},
        transform: { type: 1, message: 1 },
      });
      return logs.map((log: any) => ({
        type: log.type,
        message: log.message,
      }));
    } catch (error) {
      console.error("Error retrieving logs:", error);
      return [];
    }
  }
}
