const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
    }
    
    try {
        const [results] = await db.promise().query('SELECT id, nombre, email, rol FROM usuarios');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    
    // Solo admin puede ver otros usuarios, o el propio usuario puede verse a sí mismo
    if (req.session.user.rol !== 'admin' && req.session.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'No autorizado' });
    }
    
    try {
        const [results] = await db.promise().query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener usuario:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.createUser = async (req, res) => {
    const { nombre, email, password, rol = 'usuario' } = req.body;
    
    // Solo admin puede crear usuarios con rol admin
    if (rol === 'admin' && req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No autorizado para crear usuarios admin' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.promise().query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, rol]
        );
        
        res.status(201).json({
            id: result.insertId,
            nombre,
            email,
            rol
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        console.error('Error al crear usuario:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;
    
    // Solo admin puede modificar otros usuarios o cambiar roles
    if (req.session.user.rol !== 'admin' && req.session.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Solo admin puede cambiar roles
    if (rol && req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No autorizado para cambiar roles' });
    }
    
    try {
        let updateFields = [];
        let updateValues = [];
        
        if (nombre) {
            updateFields.push('nombre = ?');
            updateValues.push(nombre);
        }
        
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        
        if (rol) {
            updateFields.push('rol = ?');
            updateValues.push(rol);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }
        
        updateValues.push(id);
        
        const sql = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await db.promise().query(sql, updateValues);
        
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    
    // Solo admin puede eliminar usuarios
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
    }
    
    // No permitir eliminarse a sí mismo
    if (req.session.user.id === parseInt(id)) {
        return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    
    try {
        await db.promise().query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};