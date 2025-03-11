import { Request, Response } from "express";
import { AuthModel } from "./AuthModel";
import { IJWTManager, logger } from "../../data/instances";

export default class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const user = await AuthModel.verifyUser({ email });
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const block = await AuthModel.verifyBlock({ email });
      if (!block) {
        return res.status(401).json({ error: "User blocked" });
      }

      const passwordMatch = await AuthModel.verifyPassword({ email, password });
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const [userInfo] = (await AuthModel.getUserInfo({ email })) as any;

      const mappedUserInfo = {
        id: userInfo["id_user"],
        email: userInfo["em_user"],
        name: `${userInfo["na_user"]} ${userInfo["ln_user"]}`,
        profile: userInfo["de_profile"],
      } as any;

      const token = IJWTManager.generateToken(mappedUserInfo);

      return res
        .status(200)
        .json({
          message: "User logged in",
          token,
          ...mappedUserInfo,
        });
    } catch (error: any) {
      logger.error(
        `An error occurred in the method login: ${error.message} of the AuthController.ts object`
      );
      return res.status(500).json({ error: error.message });
    }
  }
}
