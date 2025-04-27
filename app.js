const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('./config/session');

const app = express();

// Configuración
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para evitar caché en rutas protegidas
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Ruta para el frontend
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/home');
    }
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/home', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'views', 'home.html'));
});

app.get('/users', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'views', 'users.html'));
});

module.exports = app;