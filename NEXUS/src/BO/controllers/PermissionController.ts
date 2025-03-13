import { AuthModel } from "../Auth/AuthModel";

/**
 * Clase que representa un controlador para ejecutar métodos de UserModel.
 */
class PermissionController {
  /**
   * Método estático para ejecutar un método de UserModel.
   * @async
   * @param {Object} options - Las opciones para ejecutar el método.
   * @param {string} options.method - El nombre del método a ejecutar.
   * @param {Array} options.params - Los parámetros para el método.
   * @returns {Promise<Object>} Un objeto con el resultado de la ejecución del método o un objeto con un error.
   */
  static executeMethod = async ({ method, params }:any) => {
    //Importante, los params deben estar ordenados, tal cual como estan en el archivo de querys para que funcione

    try {
      const result = await AuthModel.executeMethod({ method, params });
      return result;
    } catch (error) {
      return { error };
    }
  };
}

export default PermissionController;