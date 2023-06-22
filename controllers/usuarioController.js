import { emailOlvidePassword, emailRegistro } from "../helpers/email.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Usuario from "../models/Usuario.js";

const registro = async (req, res) => {
    const { nombre, email, password } = req.body;

    // Comprobar si el email ya existe
    const emailExiste = await Usuario.findOne({ email });

    if (emailExiste) {
        const error = new Error('El correo electrónico ya está asociado a otra cuenta');
        return res.status(403).json({ msg: error.message });
    }

    try {
        // Insertar el usuario
        const usuario = new Usuario(req.body);
        await usuario.save();

        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        });

        res.json({msg: 'Usuario registrado con éxito. Revisa tu correo electrónico para confirmar la cuenta'});

    } catch (error) {
        console.log(error);
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Commprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        const error = new Error('La cuenta no está confirmada');
        return res.status(403).json({ msg: error.message });
    }

    // Comprobar si la contraseña es correcta
    if (await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        });

    } else {
        const error = new Error('La contraseña es incorrecta');
        return res.status(403).json({ msg: error.message });
    }

}

const confirmarCuenta = async (req, res) => {
    const { token } = req.params;

    // Comprobar si existe un usuario con ese token
    const usuarioConfirmar = await Usuario.findOne({ token });

    if (!usuarioConfirmar) {
        const error = new Error('El token no es válido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        // Confirmar al usuario y borrar el token
        usuarioConfirmar.token = '';
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.save();

        res.json({ msg: 'Cuenta confirmada correctamente' });


    } catch (error) {

    }

}

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    try {
        // Generar un nuevo token para el usuario
        usuario.token = generarId();
        await usuario.save();

        // Enviar email al usuario
        emailOlvidePassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        });

        res.json({ msg: 'Hemos enviado un correo electrónico con las instrucciones' });

    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    // Comprobar si existe un usuario con ese token
    const usuarioConfirmar = await Usuario.findOne({ token });

    if (!usuarioConfirmar) {
        const error = new Error('El token no es válido');
        return res.status(404).json({ msg: error.message });
    }

    res.json({ msg: 'EL token es válido' });
}

const nuevaPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Comprobar si existe un usuario con ese token
    const usuario = await Usuario.findOne({ token });

    if (!usuario) {
        const error = new Error('El token no es válido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        usuario.password = password;
        usuario.token = '';
        await usuario.save();

        res.json({msg: '¡La contraseña ha sido cambiada con éxito!'});
    } catch (error) {
        console.log(error);
    }
}

const perfil = async (req, res) => {
    const { usuario } = req;

    res.json(usuario);
}

export { registro, login, confirmarCuenta, olvidePassword, comprobarToken, nuevaPassword, perfil }