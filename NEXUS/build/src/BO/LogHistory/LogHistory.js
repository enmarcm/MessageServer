"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = __importDefault(require("mongoose"));
var LogType;
(function (LogType) {
    LogType["LOG"] = "log";
    LogType["WARN"] = "warn";
    LogType["ERROR"] = "error";
})(LogType || (LogType = {}));
class Log {
}
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => String })
], Log.prototype, "message", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, enum: LogType, default: LogType.LOG, type: () => String })
], Log.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: () => new Date(), type: () => Date })
], Log.prototype, "timestamp", void 0);
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
class LogHistory {
    /**
     * Creates an instance of LogHistory.
     * @param {string} uri - The MongoDB connection URI.
     * @param {string} collectionName - The name of the collection to store logs.
     */
    constructor(uri, collectionName) {
        mongoose_1.default.connect(uri);
        this.db = mongoose_1.default.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => {
            console.log('Connected to MongoDB');
        });
        this.LogModel = (0, typegoose_1.getModelForClass)(Log, {
            schemaOptions: { collection: collectionName },
        });
    }
    /**
     * Method to log data to the database.
     * @param {string} message - The log message.
     * @param {LogType} type - The type of log.
     * @private
     */
    logMessage(message, type) {
        const logEntry = new this.LogModel({ message: typeof message === 'string' ? message : JSON.stringify(message), type });
        logEntry.save().then(() => {
            console.log(`Log saved: ${message} [${type}]`);
        }).catch((error) => {
            console.error('Error saving log:', error);
        });
    }
    /**
     * Method to log a general message.
     * @param {string} message - The log message.
     */
    log(message) {
        this.logMessage(typeof message === 'string' ? message : JSON.stringify(message), LogType.LOG);
    }
    /**
     * Method to log a warning message.
     * @param {string} message - The warning message.
     */
    warn(message) {
        this.logMessage(typeof message === 'string' ? message : JSON.stringify(message), LogType.WARN);
    }
    /**
     * Method to log an error message.
     * @param {string | Error} error - The error message or object.
     */
    error(error) {
        const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : typeof error === 'string' ? error : JSON.stringify(error);
        this.logMessage(message, LogType.ERROR);
    }
    /**
     * Method to get all logs in JSON format.
     * @returns {Promise<Array<{ type: LogType, message: string }>>} - A promise that resolves to an array of logs.
     */
    getAllLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            const logs = yield this.LogModel.find({}, 'type message').exec();
            return logs.map((log) => ({
                type: log.type,
                message: log.message,
            }));
        });
    }
}
exports.default = LogHistory;
