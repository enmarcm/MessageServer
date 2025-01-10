import "dotenv/config";

export const PORT = Number(process.env.PORT_API) || 3030;


// export const BASE_URL:string = process.env.BASE_URL || `http://localhost:${PORT}`;
export const BASE_URL: string =
  process.env.BASE_URL || `http://192.168.109.126:${PORT}`;
