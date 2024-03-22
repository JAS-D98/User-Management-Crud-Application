const express = require('express');
const router = express.Router();
const User = require('../models/users');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const authController=require('../controllers/authControllers');
const Notification=require('../models/notifications');
const cookieParser=require('cookie-parser');
const { requireAuth, checkUser } = require('../authmiddleware/authMiddleware');
// const fs=require('fs');
// const { Parser } = require('json2csv');

router.use(cookieParser());

// User.find({}, (err, users)=>{
//     if(err){
//         console.log('Error retrieving data to database', err);
//         return;
//     }

//     //converting data to csv format
//     const fields = ['name', 'email', 'admission', 'phone', 'payment']; // fields to include in CSV
//     const json2csvParser = new Parser({ fields });
//     const csvData = json2csvParser.parse(users);

//     // Write CSV data to file
//     fs.writeFile('./public/users.csv', csvData, (err) => {
//         if (err) {
//         console.error('Error writing to CSV file:', err);
//         return;
//         }
//         console.log('CSV file created successfully');
//     });

// })
// Define CSV writer
const csvWriter = createCsvWriter({
  path: './public/users.csv',
  header: [
    { id: 'name', title: 'Name' },
    { id: 'email', title: 'Email' },
    { id: 'phone', title: 'Phone' },
    { id: 'admission', title: 'Registration Number' },
    { id: 'payment', title: 'Payment (Kshs)' },
    // Add more fields as needed
  ]
});

router.get('*', checkUser)

// login and signup routes
router.get('/login', authController.login_get)

router.post('/login',authController.login_post)

router.get('/signUp', authController.signup_get)

router.post('/signUp', authController.signup_post)

router.post('/logout', authController.logout_get)

router.get('/mutcu-admin', (req, res)=>{
    res.render('admin', {title: 'MUTCU Admin Page'})
})

//Routes for pages
router.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

router.get('/notifications', async (req, res) => {

    Notification.find().sort({createdAt: -1})
    .then((result)=>{
        res.render('notifications', {title : 'Notifications Page', notices: result})
    })
    .catch(err=>console.log(err))
});

//delete all notifications
router.get('/del-notice', (req, res)=>{
    Notification.deleteMany({})
        .then((result)=>{
            console.log('Successfully deleted all notifications')
            res.redirect('/notifications')
        })
        .catch(err=>console.log(err))
   
})

// Insert a user into the database
router.post('/notifications', async (req, res) => {
    const notification=new Notification(req.body)
    notification.save()
        .then((result)=>{
            console.log('Successfully stored in the database');
            res.redirect('/notifications')
        })
        .catch(err=>console.log(err))
});

// router.post('/notifications', (req, res) => {
//     const notification= new Notification(req.body);

//     notification.save()
//         .then((result)=>{
//             console.log('Notification sent successfuly')
//         })
//         .catch(err=>console.log(err))
        
//     // try{
//     //     const notice=await notice.create(update)
//     //     res.status(200).json(notice)
//     //     }
//     //     catch(err){
//     //        console.log(err) 
//     //        res.status(400).send('Error Notification not sent')
//     //     }
//     // Notice.create({title, time, notice})
//     //     .then((result)=>{
//     //         console.log('notification sent')
//     //     })
//     //     .catch(err=>console.log(err));
// });

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users Page' });
});

// Route to fetch all users
router.get('/registered',requireAuth, async (req, res) => {
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

// Get user route
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect('/registered');
        }

        res.render("edit_users", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

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
        const { name, email, phone, admission, payment } = req.body;
        // Read csv file
        
        // Write form data to CSV file
        csvWriter.writeRecords([{ name, email, phone, admission, payment }])
          .then(() => {
            console.log('Form data written to CSV file');
          })
          .catch(err => {
            console.error('Error writing to CSV file:', err);
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

//update a users info
router.post('/update/:id', async(req, res)=>{
    User.findByIdAndUpdate(req.params.id, req.body)
        .then((result)=>{
            console.log('Member details successfully edited')
            res.redirect('/registered')
        })
        .catch(err=>console.log(err))
});

// Route to delete a user
router.get('/delete/:id', async (req, res) => {
    User.findByIdAndDelete(req.params.id)
    .then((result)=>{res.redirect('/registered')})
    .catch(err=>console.log(err))
  });

  // Route to delete all users
router.post('/delete/all', async (req, res) => {
    await User.deleteMany({});
    res.redirect('/registered');
});

router.use((req, res)=>{
    res.render('404',{ title: '404'})
})

module.exports = router;
