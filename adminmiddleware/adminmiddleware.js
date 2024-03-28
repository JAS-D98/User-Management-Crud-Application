const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Unauthorized');
    }
};

module.exports = isAdmin;
