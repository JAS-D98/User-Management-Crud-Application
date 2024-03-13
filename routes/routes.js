const express = require('express');
const router = express.Router();
const User = require('../models/users');

router.get('/login', (req, res)=>{
    res.render('login', {title:'Login Page'});
})

router.post('/login', (req, res)=>{
    res.render('login', {title:'Login Page'});
})

router.get('/signUp', (req, res)=>{
    res.render('signup', {title:'Sign Up Page'});
})

router.post('/signUp', (req, res)=>{
    
})

router.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

router.get('/notification', (req, res) => {
    res.render('notifications', { title: 'Notifications Page' });
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users Page' });
});

// Route to fetch all users
router.get('/registered', async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('registered_members', {
        title: 'Registered Members Page',
        users: users,
        message: req.session.message // Pass any message stored in session
        
    });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
    }
  });

/* router.get('/registered', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('registered_members', {
            title: 'Registered Members Page',
            users: users,
            message: req.session.message // Pass any message stored in session
            
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
}); */

// Insert a user into the database
router.post('/add', async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            admission: req.body.admission,
            payment: req.body.payment,         
        });
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added Successfully!',
        };
        res.redirect("/registered");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// router.post('/add', async (req, res) => {
//     try {
//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             admission: req.body.admission,
//             payment: req.body.payment,
//         });
//         await user.save();
//         req.session.message = {
//             type: 'success',
//             message: 'User added successfully!',
//         };
//         res.redirect("/registered");
//     } catch (err) {
//         req.session.message = {
//             type: 'danger',
//             message: err.message,
//         };
//         res.redirect("/add");
//     }
// });

// Route to delete a user
router.delete('/delete/:id', async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).send('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Error deleting user');
    }
  });

module.exports = router;
