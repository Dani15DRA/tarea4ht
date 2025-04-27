const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas
router.use(authMiddleware.isAuthenticated);

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware.isAdmin, userController.getAllUsers);

// Obtener usuario por ID
router.get('/:id', userController.getUserById);

// Crear nuevo usuario
router.post('/', userController.createUser);

// Actualizar usuario
router.put('/:id', userController.updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', authMiddleware.isAdmin, userController.deleteUser);

module.exports = router;