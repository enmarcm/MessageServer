import { Router } from "express";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // Carpeta donde se guardarán los archivos
  },
  filename: (_req, file, cb) => {
    // const _uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.originalname}`); // Nombre único para evitar conflictos
  },
});

const upload = multer({ storage });

export const UploadRouter = Router();

UploadRouter.post("/", upload.single("file"), (req, res) => {
    
    console.log(req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log(`Archivo subido: ${req.file.originalname}`);

  return res.status(200).json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});
