"use strict";
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
const pg_pool_1 = __importDefault(require("pg-pool"));
/**
 * Clase que maneja la conexión y ejecución de consultas a una base de datos PostgreSQL usando Pg-Pool.
 */
class PgHandler {
    /**
     * Crea una instancia de PgHandler.
     * @param {Object} options - Opciones para la configuración y consultas de la base de datos.
     * @param {Object} options.config - Configuración de la conexión a la base de datos.
     * @param {Object} options.querys - Consultas predefinidas para la base de datos.
     */
    constructor({ config, querys, }) {
        /**
         * Ejecuta una consulta a la base de datos.
         * @async
         * @param {Object} options - Opciones para la ejecución de la consulta.
         * @param {string} options.key - Clave de la consulta predefinida a ejecutar.
         * @param {Array} [options.params=[]] - Parámetros para la consulta.
         * @returns {Promise<Array|Error>} - Resultado de la consulta o un objeto Error si ocurre un error.
         */
        this.executeQuery = (_a) => __awaiter(this, [_a], void 0, function* ({ key, params = [], }) {
            try {
                const query = this.querys[key];
                const { rows } = yield this.pool.query(query, params);
                return rows;
            }
            catch (error) {
                return { error };
            }
        });
        /**
         * Conecta a la base de datos.
         * @async
         * @returns {Promise<Client>} - Cliente de la conexión a la base de datos.
         */
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.pool.connect();
            }
            catch (error) {
                return { error };
            }
        });
        /**
         * Libera la conexión a la base de datos.
         * @async
         * @returns {Promise<void>}
         */
        this.release = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.pool.end();
            }
            catch (error) {
                return { error };
            }
        });
        /**
         * Ejecuta una transacción de base de datos utilizando una serie de consultas.
         * @async
         * @param {Object} options - Objeto con las opciones para la transacción.
         * @param {Array<String>} options.querys - Un array de objetos que contienen la clave de la consulta y los parámetros de la consulta.
         * @returns {Promise<Object>} - Una promesa que se resuelve con el resultado de la transacción o se rechaza con un error.
         */
        this.transaction = (_b) => __awaiter(this, [_b], void 0, function* ({ querys = [], }) {
            const client = yield this.connect();
            if ("error" in client) {
                return client;
            }
            try {
                yield client.query("BEGIN");
                for (const elemento of querys) {
                    const { key, params } = elemento;
                    yield client.query(this.querys[key], params);
                }
                const result = yield client.query("COMMIT");
                return result;
            }
            catch (error) {
                yield client.query("ROLLBACK");
                return { error };
            }
            finally {
                yield client.end();
            }
        });
        this.config = config;
        this.querys = querys;
        this.pool = new pg_pool_1.default(this.config);
    }
}
exports.default = PgHandler;
