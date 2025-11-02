const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("📦 Configurando Multer para carga de imágenes");

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, "../../uploads/galeria");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Carpeta de uploads creada:", uploadsDir);
} else {
  console.log("📁 Carpeta de uploads ya existe:", uploadsDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📂 Guardando archivo en:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-nombreoriginal
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const finalName = `${name}-${uniqueSuffix}${ext}`;

    console.log("💾 Guardando archivo como:", finalName);
    cb(null, finalName);
  },
});

// Filtro para validar tipo de archivo
const fileFilter = (req, file, cb) => {
  console.log("🔍 Validando archivo:", file.originalname);
  console.log("  └─ MIME type:", file.mimetype);

  // Solo permitir imágenes
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log("  ✅ Tipo de archivo válido");
    cb(null, true);
  } else {
    console.log("  ❌ Tipo de archivo NO válido");
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se permiten: JPG, JPEG, PNG, GIF, WEBP"
      ),
      false
    );
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
  },
});

console.log("✅ Multer configurado correctamente");
console.log("📋 Límites:");
console.log("  └─ Tamaño máximo: 5MB por archivo");
console.log("  └─ Tipos permitidos: JPG, JPEG, PNG, GIF, WEBP");

module.exports = upload;
