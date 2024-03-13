require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('There was a problem connecting to the database '+err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'My secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Render ejs templates
app.set('view engine', 'ejs');
// Render static pages
app.use('/css', express.static('css'));
// Routing different routes
app.use("", require('./routes/routes'));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});