import Pool from "pg-pool";
import { QueryResult, Client } from "pg";

interface PoolConfig {
  database: string;
  user: string;
  password: string;
  port: number;
  ssl: boolean;
  max: number;
  idleTimeoutMillis: number;
  maxUses: number;
}

type QueryType = {[key: string]: string}

/**
 * Clase que maneja la conexión y ejecución de consultas a una base de datos PostgreSQL usando Pg-Pool.
 */
class PgHandler {
  private config: PoolConfig;
  private querys: QueryType;
  private pool: Pool<Client>;

  /**
   * Crea una instancia de PgHandler.
   * @param {Object} options - Opciones para la configuración y consultas de la base de datos.
   * @param {Object} options.config - Configuración de la conexión a la base de datos.
   * @param {Object} options.querys - Consultas predefinidas para la base de datos.
   */
  constructor({
    config,
    querys,
  }: {
    config: PoolConfig;
    querys: QueryType;
  }) {
    this.config = config;
    this.querys = querys;
    this.pool = new Pool<Client>(this.config);
  }

  /**
   * Ejecuta una consulta a la base de datos.
   * @async
   * @param {Object} options - Opciones para la ejecución de la consulta.
   * @param {string} options.key - Clave de la consulta predefinida a ejecutar.
   * @param {Array} [options.params=[]] - Parámetros para la consulta.
   * @returns {Promise<Array|Error>} - Resultado de la consulta o un objeto Error si ocurre un error.
   */
  executeQuery = async ({
    key,
    params = [],
  }: {
    key: string;
    params?: any[];
  }): Promise<any[] | { error: any }> => {
    try {
      const query = this.querys[key];

      const { rows }: QueryResult = await this.pool.query(query, params);

      return rows;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Conecta a la base de datos.
   * @async
   * @returns {Promise<Client>} - Cliente de la conexión a la base de datos.
   */
  connect = async (): Promise<Client | { error: any }> => {
    try {
      return await this.pool.connect();
    } catch (error) {
      return { error };
    }
  };

  /**
   * Libera la conexión a la base de datos.
   * @async
   * @returns {Promise<void>}
   */
  release = async (): Promise<void | { error: any }> => {
    try {
      await this.pool.end();
    } catch (error) {
      return { error };
    }
  };

  /**
   * Ejecuta una transacción de base de datos utilizando una serie de consultas.
   * @async
   * @param {Object} options - Objeto con las opciones para la transacción.
   * @param {Array<String>} options.querys - Un array de objetos que contienen la clave de la consulta y los parámetros de la consulta.
   * @returns {Promise<Object>} - Una promesa que se resuelve con el resultado de la transacción o se rechaza con un error.
   */
  transaction = async ({
    querys = [],
  }: {
    querys: { key: string; params: any[] }[];
  }): Promise<QueryResult | { error: any }> => {
    const client = await this.connect();
    if ("error" in client) {
      return client;
    }
    try {
      await client.query("BEGIN");
      for (const elemento of querys) {
        const { key, params } = elemento;
        await client.query(this.querys[key], params);
      }
      const result = await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      return { error };
    } finally {
      await client.end();
    }
  };
}

export default PgHandler;
