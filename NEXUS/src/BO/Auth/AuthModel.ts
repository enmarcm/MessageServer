import {iPgHandler, logger } from "../../data/instances";
import CryptManager from "../../utils/CryptManager";

const enum EAuthModelQuerys {
  VERIFY_BLOCK = "verifyBlockUser",
  VERIFY_ATTEMPS = "verifyAttemps",
  SEARCH_USER = "getUserByEmail",
  REDUCE_ATTEMPS = "reduceAttemps",
  BLOCK_USER = "blockUser",
  RESET_ATTEMPS = "resetAttemps",
  SEARCH_USER_ID = "getUserById"
}

const enum EAuthModelProps {
  BLOCKED = "bl_user",
  ATTEMPS = "at_user",
  ID_USER = "id_user",
  PASSWORD = "pa_user",
}

export class AuthModel {
  static async verifyBlock({ email }: { email: string }) {

    
    try {
    const blocked = await iPgHandler.returnByProp({
      key: EAuthModelQuerys.VERIFY_BLOCK,
      params: [email],
      prop: EAuthModelProps.BLOCKED,
      })  == "false" ? false : true;

      const attemps = await iPgHandler.returnByProp({
        key: EAuthModelQuerys.VERIFY_ATTEMPS,
        params: [email],
        prop: EAuthModelProps.ATTEMPS,
      });
  
      if (blocked || attemps <= 0) {
        return false;
      }

  
      return true;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method verifyBlock: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }

  static async verifyUser({ email }: { email: string }) {
    //En este metodos se debe verificar que el usuario exista, es decir, el correo
    try {
      const user = await iPgHandler.returnByProp({
        key: EAuthModelQuerys.SEARCH_USER,
        params: [email],
        prop: EAuthModelProps.ID_USER,
      });

      if (!user || user == "") {
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method verifyUser: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }

  static async verifyPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    //En este metodos se debe verificar que la contraseña sea correcta

    try {
      const passwordUser = await iPgHandler.returnByProp({
        key: EAuthModelQuerys.SEARCH_USER,
        params: [email],
        prop: EAuthModelProps.PASSWORD,
      });

      const result = await CryptManager.compareBcrypt({
        data: password,
        hash: passwordUser,
      });

      return result;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method verifyPassword: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }

  static async reduceAttemps({ email }: { email: string }) {
    try {
      const verifyBlock = await AuthModel.verifyBlock({ email });
      if (!verifyBlock) return;

      await iPgHandler.executeQuery({
        key: EAuthModelQuerys.REDUCE_ATTEMPS,
        params: [email],
      });

      const attemps = await iPgHandler.returnByProp({
        key: EAuthModelQuerys.VERIFY_ATTEMPS,
        params: [email],
        prop: EAuthModelProps.ATTEMPS,
      });

      if (attemps <= 0) {
        AuthModel.blockUser({ email });
      }

      return true;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method reduceAttemps: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }

  static async resetAttemps({ email }: { email: string }) {
    try {
      await iPgHandler.executeQuery({
        key: EAuthModelQuerys.RESET_ATTEMPS,
        params: [email],
      });

      return true;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method resetAttemps: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }

  static async blockUser({ email }: { email: string }) {
    try {
      const verifyBlock = await AuthModel.verifyBlock({ email });
      if (!verifyBlock) return;

      await iPgHandler.executeQuery({
        key: EAuthModelQuerys.BLOCK_USER,
        params: [email],
      });

      return true;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method blockUser: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }


  static async getUserInfo({ email }: { email: string }) {
    try {
      const userInfo = await iPgHandler.executeQuery({
        key: EAuthModelQuerys.SEARCH_USER,
        params: [email],
      });

      return userInfo;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method getUserInfo: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }

  static executeMethod = async ({ method, params }: {method: any, params: any}) => {

    try {
      const parametros = [];
      for (const key in params) {
        parametros.push(params[key]);
      }

      const result = await iPgHandler.executeQuery({
        key: method,
        params: parametros,
      });

      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  };

  static searchUserById = async ({id}: any) =>{
    try {
      const userInfo = await iPgHandler.executeQuery({
        key: EAuthModelQuerys.SEARCH_USER_ID,
        params: [id],
      });

      return userInfo;
    } catch (error: any) {
      logger.error(
        `An error occurred in the method getUserInfo: ${error.message} of the AuthModel.ts object`
      );
      return { error: error.message };
    }
  }
}
