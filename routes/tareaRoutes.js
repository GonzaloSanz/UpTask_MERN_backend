import express from 'express';
import { agregartarea, obtenertarea, actualizarTarea, eliminarTarea, cambiarEstado } from "../controllers/tareaController.js";
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.post('/', checkAuth, agregartarea);
router
    .route('/:id')
    .get(checkAuth, obtenertarea)
    .put(checkAuth, actualizarTarea)
    .delete(checkAuth, eliminarTarea)

router.post('/estado/:id', checkAuth, cambiarEstado);

export default router;
