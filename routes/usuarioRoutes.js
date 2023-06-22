import express from 'express';
import { registro, login, confirmarCuenta, olvidePassword, comprobarToken, nuevaPassword, perfil } from '../controllers/usuarioController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.post ('/', registro);
router.post ('/login', login);
router.get('/confirmar-cuenta/:token', confirmarCuenta);
router.post('/olvide-password', olvidePassword);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevaPassword);

router.get('/perfil', checkAuth, perfil);

export default router;