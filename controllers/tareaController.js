import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregartarea = async (req, res) => {
    const { proyecto } = req.body;

    // Comprobar si el proyecto de la tearea existe
    const existeProyecto = await Proyecto.findById(proyecto);

    if (!existeProyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes permiso para añadir tareas');
        return json.status(403).json({ msg: error.message });
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);

        // Almacenar tarea en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();

        res.json(tareaAlmacenada);

    } catch (error) {
        console.log(error);
    }
}

const obtenertarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate('proyecto');

    // Comprobar que existe la tarea
    if (!tarea) {
        const error = new Error('La tarea no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return json.status(401).json({ msg: error.message });
    }

    res.json(tarea);
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate('proyecto');

    // Comprobar que existe la tarea
    if (!tarea) {
        const error = new Error('La tarea no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return json.status(401).json({ msg: error.message });
    }

    // Modificar datos de la tarea
    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
        // Guardar cambios
        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada);

    } catch (error) {
        console.log(error);
    }
}

const eliminarTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate('proyecto');

    // Comprobar que existe la tarea
    if (!tarea) {
        const error = new Error('La tarea no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar que el usuario autenticado sea el creador
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no permitida');
        return json.status(401).json({ msg: error.message });
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto);
        proyecto.tareas.pull(tarea._id);

        // Eliminar la tarea y su referencia en el proyecto, siendo operaciones en paralelo
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);

        res.json({ msg: '¡Tarea eliminada con éxito!' });

    } catch (error) {
        console.log(error);
    }
}

const cambiarEstado = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate('proyecto').populate('completado');

    // Comprobar que existe la tarea
    if (!tarea) {
        const error = new Error('La tarea no existe');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar si el usuario es el creador o un colaborador
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('No tienes los permisos necesarios');
        return res.status(403).json({ msg: error.message });
    }

    // Modificar el estado y guardar los cambios
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado');

    res.json(tareaAlmacenada);
}

export { agregartarea, obtenertarea, actualizarTarea, eliminarTarea, cambiarEstado }