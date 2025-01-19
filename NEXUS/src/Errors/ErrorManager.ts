import fs from 'fs';
import path from 'path';

interface ErrorDetails {
  description: string;
  messageSend: {
    [key: string]: string;
  };
}

/**
 * CustomError class that extends the native Error class.
 * Includes a type property to identify the error type.
 */
class CustomError extends Error {
  constructor(public type: string, message: string) {
    super(message);
    this.name = type;
  }
}

/**
 * ErrorManager class to handle custom errors based on a JSON file.
 */
class ErrorManager {
  private errors: { [key: string]: ErrorDetails };

  /**
   * Creates an instance of ErrorManager.
   * Loads the errors from the errors.json file.
   */
  constructor() {
    const errorsPath = path.join(__dirname, 'errors.json');
    this.errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'));
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
  public createError(typeError: string, lang: string = 'EN'): CustomError {
    const errorDetails = this.errors[typeError];
    if (!errorDetails) {
      throw new Error(`Error type ${typeError} not found`);
    }

    const message = errorDetails.messageSend[lang] || errorDetails.messageSend['EN'];
    return new CustomError(typeError, message);
  }
}

export default ErrorManager;
export { CustomError };