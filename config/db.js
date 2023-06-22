import mongoose from "mongoose";

// Conectarse a la base de datos MongoDB
const conectarBD = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`);

    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1); // Terminar con todos los procesos de forma síncrona
    }
 }

export default conectarBD;