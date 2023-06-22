import express from 'express';
import conectarBD from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';

import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

// Crear la aplicación con Express
const app = express();

// Habilitar la lectura de datos que vengan como JSON
app.use(express.json());

// Buscar por archivo .env
dotenv.config();

// Conectarse a la base de datos MongoDB
conectarBD();

// Habilitar dominio del frontend para evitar el bloqueo CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    })
);

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

// Definición del puerto para el servidor
const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});

// Configuración socket.io
const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', socket => {
    console.log('Conectado a socket.io');

    // Definir los eventos
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto);
    });

    socket.on('nueva tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea);
    });

    socket.on('eliminar tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea eliminada', tarea);
    });

    socket.on('actualizar tarea', tarea => {
        socket.to(tarea.proyecto._id).emit('tarea actualizada', tarea);
    });

    socket.on('cambiar estado', tarea => {
        socket.to(tarea.proyecto._id).emit('nuevo estado', tarea);
    });
});
