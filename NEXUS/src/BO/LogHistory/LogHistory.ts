import { Log } from "../TGoose/Items/LogItem";
import { LogModel } from "../TGoose/models";
import { ITSGooseHandler } from "../../data/instances";
import { LogType } from "../../enums";
import WebSocket from "ws";

class LogHistory {
  private static instance: LogHistory | null = null;
  private LogModel = LogModel;
  private wsServer: WebSocket.Server | null = null;

  private constructor() {
    this.initializeWebSocketServer();
  }

  private initializeWebSocketServer(): void {
    try {
      if (!this.wsServer) {
        this.wsServer = new WebSocket.Server({ port: 8085 });
        console.log("WebSocket server started on port 8085");

        this.wsServer.on("connection", (_socket) => {
          console.log("New WebSocket client connected");
        });

        this.wsServer.on("error", (error) => {
          console.error("WebSocket server error:", error.message);
        });
      }
    } catch (error: any) {
      console.error("Failed to start WebSocket server:", error.message);
    }
  }

  public static getInstance(): LogHistory {
    if (!LogHistory.instance) {
      LogHistory.instance = new LogHistory();
    }
    return LogHistory.instance;
  }

  private async logMessage(message: string, type: LogType): Promise<void> {
    try {
      const logEntry = new this.LogModel({ message, type });
      await ITSGooseHandler.addDocument({
        Model: this.LogModel,
        data: logEntry,
      });
      console.log(`Log saved: ${message} [${type}]`);
      this.emitLog(logEntry);
    } catch (error) {
      console.error("Error saving log:", error);
    }
  }

  public log(message: string | object): void {
    this.logMessage(
      typeof message === "string" ? message : JSON.stringify(message),
      LogType.LOG
    );
  }

  public warn(message: string | object): void {
    this.logMessage(
      typeof message === "string" ? message : JSON.stringify(message),
      LogType.WARN
    );
  }

  public error(error: string | Error): void {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}\n${error.stack}`
        : typeof error === "string"
        ? error
        : JSON.stringify(error);
    this.logMessage(message, LogType.ERROR);
  }

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

  public logEmailActivity(
    from: string,
    to: string,
    subject: string,
    status: string
  ): void {
    const message = `Email from ${from} to ${to} with subject "${subject}" is ${status}`;
    this.logMessage(message, LogType.LOG);
    this.emitLog({ type: "EMAIL", from, to, subject, status });
  }

  public logSMSActivity(
    from: string,
    to: string,
    body: string,
    status: string
  ): void {
    const message = `SMS from ${from} to ${to} with body "${body}" is ${status}`;
    this.logMessage(message, LogType.LOG);
    this.emitLog({ type: "SMS", from, to, body, status });
  }

  private emitLog(log: object): void {
    if (this.wsServer) {
      this.wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(log));
        }
      });
    } else {
      console.error("WebSocket server is not initialized");
    }
  }
}

export const logHistory = LogHistory.getInstance();