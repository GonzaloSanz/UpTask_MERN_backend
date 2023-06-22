import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        '$or': [
            { 'colaboradores': { $in: req.usuario } },
            { 'creador': { $in: req.usuario } }
        ]
    }).select('-tareas -__v');

    res.json(proyectos);
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();

        res.json(proyectoAlmacenado);

    } catch (error) {
        console.log(error);
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;

    // Comprobar si el proyecto existe
    const proyecto = await Proyecto.findById(id)
    .populate({path: 'tareas', populate: { path: 'completado', select: 'nombre'}})
    .populate('colaboradores', "nombre email");

    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return json.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Acción no permitida');
        return res.status(401).json({ msg: error.message });
    }

    res.json(proyecto);
}

const editarProyecto = async (req, res) => {
    const { id } = req.params;

    // Comprobar si el proyecto existe
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return json.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return json.status(401).json({ msg: error.message });
    }

    // Editar los datos del proyecto
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        // Guardar el proyecto editado
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);

    } catch (error) {
        console.log(error);
    }
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;

    // Comprobar si el proyecto existe
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return json.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return json.status(401).json({ msg: error.message });
    }

    try {
        // Eliminar el proyecto
        await proyecto.deleteOne();
        res.json({ msg: '¡Proyecto eliminado con éxito!' });

    } catch (error) {
        console.log(error);
    }
}

const buscarColaborador = async (req, res) => {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -updatedAt -password -token -__v');

    // Comprobar si el usuario existe
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    res.json(usuario);
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    // Comprobar si el proyecto existe
    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario sea el creador del proyecto
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return res.status(403).json({ msg: error.message });
    }

    const { email } = req.body;

    const usuario = await Usuario.findOne(email).select('-confirmado -createdAt -updatedAt -password -token -__v');

    // Comprobar si el usuario existe
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el colaborador no sea el creador de proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(403).json({ msg: error.message });
    }

    // Comprobar que no esté agregado ya al proyecto
    if (proyecto.colaboradores.includes(usuario.id)) {
        const error = new Error('El usuario ya es colaborador del proyecto');
        return res.status(403).json({ msg: error.message });
    }

    // Agregar al proyecto
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();

    res.json({ msg: '¡Colaborador agregado con éxito!' });
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    // Comprobar si el proyecto existe
    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario sea el creador del proyecto
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return res.status(403).json({ msg: error.message });
    }

    // Eliminar del proyecto
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();

    res.json({ msg: '¡Colaborador eliminado con éxito!' });
}

export { obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, buscarColaborador, agregarColaborador, eliminarColaborador }