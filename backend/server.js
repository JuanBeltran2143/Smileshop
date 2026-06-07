/**
 * Establece la conexion asincrona con el cluster de MongoDB Atlas.
 * Utiliza la URI configurada en las variables de entorno para inicializar
 * el pool de conexiones del ODM (Mongoose) de forma segura.
 * * @async
 * @function connectDatabase
 * @param {string} connectionString - URL de conexion cifrada de MongoDB Atlas.
 * @throws {MongoParseError} Si la cadena de conexion no tiene el formato correcto.
 * @returns {Promise<void>} Promesa resuelta cuando la conexion es exitosa.
 */
async function connectDatabase(connectionString) {
try {
    await mongoose.connect(connectionString);
    console.log("Conexión exitosa a MongoDB Atlas");
} catch (error) {
    console.error("Error crítico de conexión:", error);
    process.exit(1);
}
}

// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// --- 1. CONEXIÓN CON LOGS DE ESTADO ---
const mongoURI = 'mongodb://admin:1234@ac-hfeusy4-shard-00-00.kqhbrtp.mongodb.net:27017,ac-hfeusy4-shard-00-01.kqhbrtp.mongodb.net:27017,ac-hfeusy4-shard-00-02.kqhbrtp.mongodb.net:27017/?ssl=true&replicaSet=atlas-kpofsu-shard-0&authSource=admin&appName=SmileShop';
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Conexión exitosa a MongoDB Atlas"))
    .catch(err => console.error("❌ Error de conexión a la BD:", err));

// --- 2. MODELO ACTUALIZADO (Con todos los campos que usas en login) ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    idNumber: { type: String, default: "" },
    phone: { type: String, default: "" },
    cards: { type: Array, default: [] },
    addresses: { type: Array, default: [] }
});
const User = mongoose.model('User', UserSchema);

// --- 3. RUTA DE REGISTRO ---
app.post('/register', async (req, res) => {
    try {
        const { email, password, name, idNumber, phone } = req.body;
        // Creamos el usuario con todos los campos recibidos
        const newUser = new User({ email, password, name, idNumber, phone });
        await newUser.save();
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(400).json({ message: "Error al registrar: " + error.message });
    }
});

// --- 4. RUTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: "El correo no está registrado" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Devolvemos los datos completos
        res.json({
            message: "Login exitoso",
            user: {
                name: user.name,
                idNumber: user.idNumber,
                phone: user.phone,
                cards: user.cards,
                addresses: user.addresses
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// --- 5. UN SOLO LISTEN ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor encendido en el puerto ${PORT}`);
});