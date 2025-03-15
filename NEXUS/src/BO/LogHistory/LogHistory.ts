import { Log } from "../TGoose/Items/LogItem";
import { LogModel } from "../TGoose/models";
import { ITSGooseHandler } from "../../data/instances";
import { LogType } from "../../enums";
import WebSocket from "ws";

export default class LogHistory {
  private LogModel = LogModel;
  private wsServer: WebSocket.Server;

  constructor() {
    this.wsServer = new WebSocket.Server({ port: 8080 });
  }

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

  /**
   * Method to log email activity.
   * @param {string} from - The sender email address.
   * @param {string} to - The recipient email address.
   * @param {string} subject - The email subject.
   * @param {string} status - The status of the email (PROCESSING, COMPLETED, ERROR).
   */
  public logEmailActivity(from: string, to: string, subject: string, status: string): void {
    const message = `Email from ${from} to ${to} with subject "${subject}" is ${status}`;
    this.logMessage(message, LogType.LOG);
    this.emitLog({ type: "EMAIL", from, to, subject, status });
  }

  /**
   * Method to log SMS activity.
   * @param {string} from - The sender identifier.
   * @param {string} to - The recipient phone number.
   * @param {string} body - The SMS body.
   * @param {string} status - The status of the SMS (PROCESSING, COMPLETED, ERROR).
   */
  public logSMSActivity(from: string, to: string, body: string, status: string): void {
    const message = `SMS from ${from} to ${to} with body "${body}" is ${status}`;
    this.logMessage(message, LogType.LOG);
    this.emitLog({ type: "SMS", from, to, body, status });
  }

  /**
   * Method to emit log messages via WebSocket.
   * @param {object} log - The log message object.
   * @private
   */
  private emitLog(log: object): void {
    this.wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(log));
      }
    });
  }
}