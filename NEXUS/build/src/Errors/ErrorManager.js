"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * CustomError class that extends the native Error class.
 * Includes a type property to identify the error type.
 */
class CustomError extends Error {
    constructor(type, message) {
        super(message);
        this.type = type;
        this.name = type;
    }
}
exports.CustomError = CustomError;
/**
 * ErrorManager class to handle custom errors based on a JSON file.
 */
class ErrorManager {
    /**
     * Creates an instance of ErrorManager.
     * Loads the errors from the errors.json file.
     */
    constructor() {
        const errorsPath = path_1.default.join(__dirname, 'errors.json');
        this.errors = JSON.parse(fs_1.default.readFileSync(errorsPath, 'utf-8'));
    }
    /**
     * Creates a custom error based on the error type and language.
     * @param {string} typeError - The type of the error.
     * @param {string} [lang='EN'] - The language for the error message.
     * @returns {CustomError} - The custom error instance.
     * @throws {Error} - If the error type is not found.
     * @example
     * const errorManager = new ErrorManager();
     * throw errorManager.createError('A11', 'ES');
     */
    createError(typeError, lang = 'EN') {
        const errorDetails = this.errors[typeError];
        if (!errorDetails) {
            throw new Error(`Error type ${typeError} not found`);
        }
        const message = errorDetails.messageSend[lang] || errorDetails.messageSend['EN'];
        return new CustomError(typeError, message);
    }
}
exports.default = ErrorManager;
