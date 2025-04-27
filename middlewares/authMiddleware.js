exports.isAuthenticated = (req, res, next) => {
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (!req.session.loggedIn || req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
    }
    next();
};