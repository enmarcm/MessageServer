import { getModelForClass, prop } from '@typegoose/typegoose';
import mongoose, { Connection } from 'mongoose';

enum LogType {
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
}

class Log {
  @prop({ required: true, type: () => String })
  public message!: string;

  @prop({ required: true, enum: LogType, default: LogType.LOG, type: () => String })
  public type!: LogType;

  @prop({ default: () => new Date(), type: () => Date })
  public timestamp!: Date;
}

/**
 * LogHistory class for logging messages to a MongoDB database.
 *
 * @example
 * ```typescript
 * const uri = 'mongodb://localhost:27017/logs';
 * const collectionName = 'logEntries';
 *
 * const logHistory = new LogHistory(uri, collectionName);
 *
 * logHistory.log('This is a test log message');
 * logHistory.warn('This is a test warning message');
 * logHistory.error('This is a test error message');
 * ```
 */
export default class LogHistory {
  private db: Connection;
  private LogModel: mongoose.Model<any>;

  /**
   * Creates an instance of LogHistory.
   * @param {string} uri - The MongoDB connection URI.
   * @param {string} collectionName - The name of the collection to store logs.
   */
  constructor(uri: string, collectionName: string) {
    mongoose.connect(uri);
    this.db = mongoose.connection;

    this.db.on('error', console.error.bind(console, 'connection error:'));
    this.db.once('open', () => {
      console.log('Connected to MongoDB');
    });

    this.LogModel = getModelForClass(Log, {
      schemaOptions: { collection: collectionName },
    });
  }

  /**
   * Method to log data to the database.
   * @param {string} message - The log message.
   * @param {LogType} type - The type of log.
   * @private
   */
  private logMessage(message: string, type: LogType): void {
    const logEntry = new this.LogModel({ message: typeof message === 'string' ? message : JSON.stringify(message), type });
    logEntry.save().then(() => {
      console.log(`Log saved: ${message} [${type}]`);
    }).catch((error: any) => {
      console.error('Error saving log:', error);
    });
  }

  /**
   * Method to log a general message.
   * @param {string} message - The log message.
   */
  public log(message: string | object): void {
    this.logMessage(typeof message === 'string' ? message : JSON.stringify(message), LogType.LOG);
  }

  /**
   * Method to log a warning message.
   * @param {string} message - The warning message.
   */
  public warn(message: string | object): void {
    this.logMessage(typeof message === 'string' ? message : JSON.stringify(message), LogType.WARN);
  }

  /**
   * Method to log an error message.
   * @param {string | Error} error - The error message or object.
   */
  public error(error: string | Error): void {
    const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : typeof error === 'string' ? error : JSON.stringify(error);
    this.logMessage(message, LogType.ERROR);
  }

  /**
   * Method to get all logs in JSON format.
   * @returns {Promise<Array<{ type: LogType, message: string }>>} - A promise that resolves to an array of logs.
   */
  public async getAllLogs(): Promise<Array<{ type: LogType, message: string }>> {
    const logs = await this.LogModel.find({}, 'type message').exec();
    return logs.map((log: any) => ({
      type: log.type,
      message: log.message,
    }));
  }
}