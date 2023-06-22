import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import generarId from "../helpers/generarId.js";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    token: {
        type: String,
        default: generarId()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Verificar si la contraseña es correcta al iniciar sesión
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
}

// Antes de almacenarse en la base de datos 
usuarioSchema.pre('save', async function(next) {
    // Si no se modifica la contraseña del usuario, salta al siguiente middleware
    if(!this.isModified('password')) {
        next();
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;