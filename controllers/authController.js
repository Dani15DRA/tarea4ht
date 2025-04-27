const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    try {
        const [results] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (results.length === 0) {
            console.log(`No se encontró usuario con email: ${email}`);
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
        
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Contraseña no coincide para usuario:', user.email);
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
        
        req.session.loggedIn = true;
        req.session.user = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol
        };
        
        console.log('Usuario autenticado:', user.email);
        res.json({ 
            success: true,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
};

exports.checkAuth = (req, res) => {
    if (req.session.loggedIn) {
        res.json({ 
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({ authenticated: false });
    }
};