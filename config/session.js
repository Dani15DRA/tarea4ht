const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./db');

const sessionStore = new MySQLStore({}, db.promise());

module.exports = session({
    key: 'session_cookie_name',
    secret: 'tu_secreto_super_seguro', // Cambia esto por una cadena secreta segura
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 día
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});