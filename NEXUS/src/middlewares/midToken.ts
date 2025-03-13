import { Request as ExpressRequest, Response, NextFunction } from "express";
import { IJWTManager } from "../data/instances";
import { GenerateTokenData } from "../types";
import { AuthModel } from "../BO/Auth/AuthModel";

// Extiende la interfaz Request para incluir las nuevas propiedades
interface Request extends ExpressRequest {
  idUser?: string;
  email?: string;
  profile?: string;
}

export default async function midToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;

    if (!authorization && !authorization?.toLowerCase().startsWith("bearer")) {
      return res.status(401).json({ message: "Token not found" });
    }

    const token = authorization.replace("Bearer ", "");
    const decodedToken = IJWTManager.verifyToken(token) as GenerateTokenData;

    if (!token || !decodedToken.id)
      res.status(401).json({ message: "Token not found" });

    const { id } = decodedToken;

    const [user] = (await AuthModel.searchUserById({ id })) as any;

    if (!user) return res.status(401).json({ message: "User not found" });

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    req.idUser = user.id_user;
    req.email = user.em_user;
    req.profile = user.de_profile;

    return next();
  } catch (error) {
    next(error);
  }
}
