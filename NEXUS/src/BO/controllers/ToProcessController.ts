import { Request, Response } from "express";
import { iSecurity } from "../../data/instances";

/**
 * Clase que representa un controlador para ejecutar métodos de diferentes áreas y objetos.
 */
class ToProcessController {
  /**
   * Ejecuta un método de un objeto de una determinada área.
   * @async
   * @param {Request} req - El objeto de solicitud.
   * @param {Response} res - El objeto de respuesta.
   * @returns {Promise<Response>} El objeto JSON con el resultado de la ejecución del método o un mensaje de error.
   */
  static toProcessPost = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { profile } = req as any;
      const { method, object, params } = req.body;
      if ( !method || !object) {
        return res
          .status(400)
          .json({ error: "Faltan datos para ejecutar el método" });
      }

      const permiso = await iSecurity.hasPermission({
        profile,
        object,
        method,
      });


      if (permiso) {
        const resultMethod = await iSecurity.executeMethod({
          object,
          method,
          params,
        });

        return res.json(resultMethod);
      } else {
        return res
          .status(403)
          .json({ error: "No tienes permiso para ejecutar este método" });
      }
    } catch (error: any) {
      console.error(
        `Ocurrió un error en el método toProcessPost del objeto ToProcessController, error: ${error.message}`
      );
      return res.status(500).json({ error: error.message });
    }
  };

  /**
   * Controlador del método GET de /toProcess.
   * @param {Request} req - El objeto de solicitud.
   * @param {Response} res - El objeto de respuesta.
   * @returns {Response} El objeto JSON con el mensaje de información.
   */
  static toProcessGet = (_req: Request, res: Response): Response => {
    return res.json({
      message:
        "Estás en el GET de /toProcess, usa el POST para ejecutar métodos",
    });
  };
}

export default ToProcessController;
