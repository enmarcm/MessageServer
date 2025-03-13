import { logger } from "../data/instances";

class Security {
  controller: any;
  config: any;
  pathBO: string;
  permissions: Map<string, any>;

  constructor({ controller, config }: { controller: any; config: any }) {
    this.controller = controller;
    this.config = config;
    this.pathBO = this.config.pathBO;
    this.permissions = new Map();

    if (this.config.loadInit || this.config.loadInit === undefined) {
      this.loadPermissions();
    }
  }

  loadPermissions = async (): Promise<void> => {
    try {
      if (this.permissions.size > 0) return;

      const permisos = await this.controller.executeMethod({
        method: "obtainPermissions",
        params: [],
      });

      this.putPermissionsMap({ permisos });
    } catch (error) {
      logger.error(`Error loading permissions: ${error}`);
    }
  };

  private verifyLoadPermissions = async (): Promise<boolean> => {
    try {
      if (this.permissions.size === 0) {
        logger.log("loading services...");
        await this.loadPermissions();
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error verifying load permissions: ${error}`);
      return false;
    }
  };

  private putPermissionsMap = ({ permisos }: { permisos: any[] }): void => {


    const result = permisos.reduce((acc: any, permiso: any) => {
      const { profile, object, method } = permiso;

      acc[profile] = acc[profile] || {};
      acc[profile][object] = acc[profile][object] || [];
      acc[profile][object].push(method);
      return acc;
    }, {});

    for (const profile in result) {
      const porObject = result[profile];
      this.permissions.set(profile, porObject);
    }

  };

  // @ts-ignore
  private reloadPermission = async (): Promise<boolean> => {
    try {
      this.permissions.clear();
      await this.loadPermissions();
      return true;
    } catch (error) {
      logger.error(`Error reloading permissions: ${error}`);
      return false;
    }
  };

  hasPermission = async ({
    profile,
    object,
    method,
  }: {
    profile: string;
    object: string;
    method: string;
  }): Promise<boolean> => {
    try {
      await this.verifyLoadPermissions();


      try {

        const permiso = this.permissions
          .get(profile)
          ?.[object]?.map((permission: string) => permission.toLowerCase())
          .includes(method.toLowerCase());
        return permiso ? true : false;
      } catch (error) {
        return false;
      }
    } catch (error: any) {
      logger.error(
        `Ocurrio un error en hasPermission, el error es: ${error.message}`
      );
      return false;
    }
  };

  executeMethod = async ({
    object,
    method,
    params = [],
  }: {
    object: string;
    method: string;
    params?: any[];
  }): Promise<any> => {
    try {
      const path = `${this.pathBO}/${object}`;
      const module = await import(path);
      const moduleReady = module.default ?? module[object];
      const obj = new moduleReady();

      const methodName = method.toLowerCase();

      const metodoAEjecutar = methodName
        ? obj[methodName] ?? moduleReady[methodName]
        : undefined;


      if (!metodoAEjecutar) {
        throw new Error(`Method ${method} not found in object ${object}`);
      }

      const methodResult = await metodoAEjecutar(
        ...(Array.isArray(params) ? params : [params])
      );

      return methodResult;
    } catch (error: any) {
      logger.error(`Existio un error ${error}`);
      return { error: error.message };
    }
  };

  setPermission = async ({
    object,
    method,
    profile,
    status,
  }: {
    object: string;
    method: string;
    profile: string;
    status: boolean;
  }): Promise<boolean> => {
    try {
      const methodExist = await this.verifyMethod({ object, method });
      if (!methodExist) return false;
      const idMethod = methodExist.id_method;

      const profileExist = await this.verifyProfile({ profile });
      if (!profileExist) return false;
      const idProfile = profileExist.id_profile;

      return status
        ? await this.addPermission({
            object,
            idProfile,
            idMethod,
            profile,
            method,
          })
        : await this.removePermission({
            object,
            idProfile,
            idMethod,
            profile,
            method,
          });
    } catch (error) {
      logger.error(`Error setting permission: ${error}`);
      return false;
    }
  };

  private verifyMethod = async ({
    object,
    method,
  }: {
    object: string;
    method: string;
  }): Promise<any> => {
    try {
      const result = await this.controller.executeMethod({
        method: "verifyMethod",
        params: { object, method },
      });
      return result;
    } catch (error) {
      logger.error(`Error verifying method: ${error}`);
      return null;
    }
  };

  private verifyProfile = async ({
    profile,
  }: {
    profile: string;
  }): Promise<any> => {
    try {
      const result = await this.controller.executeMethod({
        method: "verifyProfile",
        params: { profile },
      });
      return result;
    } catch (error) {
      logger.error(`Error verifying profile: ${error}`);
      return null;
    }
  };

  private addPermission = async (options: {
    idProfile: number;
    idMethod: number;
    profile: string;
    method: string;
    object: string;
  }): Promise<boolean> => {
    try {
      const { idProfile, idMethod, profile, method, object } = options;

      await this.controller.executeMethod({
        method: "addPermission",
        params: { idMethod, idProfile },
      });

      this.permissions.get(profile)[object].push(method);
      return this.permissions.get(profile)[object].includes(method);
    } catch (error) {
      logger.error(`Error adding permission: ${error}`);
      return false;
    }
  };

  private removePermission = async (options: {
    idProfile: number;
    idMethod: number;
    profile: string;
    method: string;
    object: string;
  }): Promise<boolean> => {
    try {
      const { idProfile, idMethod, profile, method, object } = options;

      const execute = await this.controller.executeMethod({
        method: "removePermission",
        params: { idMethod, idProfile },
      });

      const indiceBorrar = this.permissions
        .get(profile)
        ?.[object]?.indexOf(method);

      if (indiceBorrar === -1) return false;
      this.permissions.get(profile)[object].splice(indiceBorrar, 1);
      return execute;
    } catch (error) {
      logger.error(`Error removing permission: ${error}`);
      return false;
    }
  };

  blockProfile = async ({ profile }: { profile: string }): Promise<boolean> => {
    try {
      const profileExist = await this.verifyProfile({ profile });
      if (!profileExist) return false;
      const idProfile = profileExist.id_profile;

      const execute = await this.controller.executeMethod({
        method: "blockProfile",
        params: { idProfile },
      });

      this.permissions.set(profile, {});
      return execute;
    } catch (error) {
      logger.error(`Error blocking profile: ${error}`);
      return false;
    }
  };

  blockMethod = async ({
    object,
    method,
  }: {
    object: string;
    method: string;
  }): Promise<boolean> => {
    try {
      const methodExist = await this.verifyMethod({ object, method });
      if (!methodExist) return false;
      const idMethod = methodExist.id_method;

      const execute = await this.controller.executeMethod({
        method: "blockMethod",
        params: { idMethod },
      });

      this.blockMethodMap({ method });

      return execute;
    } catch (error) {
      logger.error(`Error blocking method: ${error}`);
      return false;
    }
  };

  private blockMethodMap = ({ method }: { method: string }): void => {
    this.permissions.forEach((profile) => {
      for (const key in profile) {
        const indexBorrar = profile[key].indexOf(method);
        if (indexBorrar !== -1) {
          profile[key].splice(indexBorrar, 1);
        }
      }
    });
  };
}

export default Security;
