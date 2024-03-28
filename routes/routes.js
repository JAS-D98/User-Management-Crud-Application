const express = require('express');
const router = express.Router();
const User = require('../models/users');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const authController=require('../controllers/authControllers');
const Notification=require('../models/notifications');
const cookieParser=require('cookie-parser');
const { requireAuth, checkUser } = require('../authmiddleware/authMiddleware');
const { Parser } = require('json2csv');
const isAdmin=require('../adminmiddleware/adminmiddleware')
const nodemailer=require('nodemailer');
const Charge=require('../models/charges');

router.use(cookieParser());


// Route for sending emails

const transporter=nodemailer.createTransport({
    service:'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth:{
        user: 'mutchristianunion@gmail.com',
        pass:"",
    }
})
// router.post('/send-emails',isAdmin, async (req, res)=>{
//     const { subject, text } = req.body;
//     try{
//         const users= await User.find({}, 'email');
//         const userEmails=users.map(user=>user.email);

//         const mailOptions={
//             from: 'Mutchristianunion@gmail.com',
//             to: userEmails.join(','),
//             subject: subject,
//             text: `Hi ${users.name}`+text,
//         }
//         await transporter.sendMail(mailOptions)
//         res.status(200).json({ type:'success' ,message: 'Email sent to all users successfully' });
//     }catch(err){
//         console.log(err)
//     }
// })

// router.post('/send-emails',isAdmin, async (req, res)=>{
//     const { subject, text } = req.body;
//     try{
//         const users= await User.find({}, 'email');
//         const userEmails=users.map(user=>user.email);

//         users.forEach(async(user)=>{
//             const mailOptions={
//                 from: 'Mutchristianunion@gmail.com',
//                 to: userEmails.join(','),
//                 subject: subject,
//                 text: `Hello ${user.name}<br>`+text,
//             }
//             await transporter.sendMail(mailOptions)
//             res.status(200).json({ type:'success' ,message: 'Email sent to all users successfully' });
//             res.redirect('/admin')
//         })
//     }catch(err){
//         console.log(err)
//     }
// })

// POST route to handle sending emails
router.post('/send-email', async (req, res) => {
    const { subject, text } = req.body;

    try {
        // Find all users from the database
        const users = await User.find({}, 'email');

        // Extract email addresses from users
        const userEmails = users.map(user => user.email);

        // Compose email options
        const mailOptions = {
            from: 'mutchristianunion@gmail.com', // Sender address
            to: userEmails.join(','), // Recipient addresses
            subject: subject, // Subject line
            text: text // Plain text body
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Respond with success message
        res.status(200).json({ type: 'success', message: 'Email sent to all users successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        // Respond with error message
        res.status(500).json({ type: 'error', message: 'Internal Server Error' });
    }
});

// //route for setting charges
router.post('/charges', requireAuth, isAdmin, async (req, res) => {
    try {
        const existingCharge = await Charge.findOne();

        if (existingCharge) {
            existingCharge.charge = req.body.charge;
            await existingCharge.save();
            console.log('Successfully updated charges in the database');
        } else {
            const charge = new Charge({ charge: req.body.charge });
            await charge.save();
            console.log('Successfully stored charges to the database');
        }
        res.redirect('/registered');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the CSV download request
router.get('/download-csv', async (req, res) => {
    try {
        // Fetch data from MongoDB
        const users = await User.find({}, 'name email phone admission payment').lean();

        // Convert data to CSV format
        const fields = ['name', 'email','phone','admission', 'payment'];
        const json2csvParser = new Parser({ fields });
        const csvData = json2csvParser.parse(users);

        // Set headers for CSV download
        res.setHeader('Content-disposition', 'attachment; filename=users.csv');
        res.set('Content-Type', 'text/csv');

        // Send the CSV data as a response
        res.status(200).send(csvData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

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

router.get('/logout', authController.logout_get)

router.get('/mutcu-admin',requireAuth,isAdmin, (req, res)=>{
    res.render('admin', {title: 'MUTCU Admin Page',user: req.session.user })
})

//Routes for pages
router.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

router.get('/notifications', async (req, res) => {

    Notification.find().sort({createdAt: -1})
    .then((result)=>{
        res.render('notifications', {title : 'Notifications Page', notices: result, user: req.session.user })
    })
    .catch(err=>console.log(err))
});

//delete all notifications
router.get('/del-notice',isAdmin, (req, res)=>{
    Notification.deleteMany({})
        .then((result)=>{
            console.log('Successfully deleted all notifications')
            res.redirect('/notifications')
        })
        .catch(err=>console.log(err))
   
})

// Insert a user into the database
router.post('/notifications',isAdmin, async (req, res) => {
    const notification=new Notification(req.body)
    notification.save()
        .then((result)=>{
            req.session.message = {type: "success",message: "Notifications sent successfully"};
            console.log('Successfully stored notifications in the database');
            res.redirect('/notifications')
        })
        .catch(err=>console.log(err))
});


router.get('/add',requireAuth, isAdmin, (req, res) => {
    res.render('add_users', { title: 'Add Users Page' });
});

// Route to display search results on a different page
router.get('/search-results', (req, res) => {
    const users = req.query.users; // Get search results from query parameters
    res.render('search_results', { title: 'Search Results', users: users });
});

// // // Route to handle search request
// router.get('/search', async (req, res) => {
//     try {
//         const query = req.query.query; // Get search query from request
//         const users = await User.find({ $or: [{ name: query }, { email: query }, { admission: query }] }); // Search for users with name, email, or admission number matching the query
//         res.render('search_results', { title: 'Search Results', users: users }); // Render search_results template with search results
//     } catch (err) {
//         console.error('Error searching users:', err);
//         res.status(500).send('Internal Server Error');
//     }
// });
// Route to handle search request
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query; // Get search query from request
        const regexQuery = new RegExp(query, 'i'); // Create case-insensitive regex query

        // Search for users with name, email, or admission number partially matching the query
        const users = await User.find({
            $or: [
                { name: { $regex: regexQuery } }, 
                { email: { $regex: regexQuery } }, 
                { admission: { $regex: regexQuery } }
            ]
        }); 

        res.render('search_results', { title: 'Search Results', users: users }); // Render search_results template with search results
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route for filtered members
router.get('/membersList',requireAuth,isAdmin, async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('membersList', {
        title: 'Members List',
        users: users,
    });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
    }
  });

// Route to fetch all users
router.get('/registered',requireAuth,isAdmin, async (req, res) => {
    try {
      const users = await User.find().exec();
      const charges = await Charge.findOne();
      res.render('registered_members', {
        title: 'Registered Members Page',
        users: users,
        charges: charges ? charges.charge: 0,
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
router.get("/edit/:id",isAdmin, async (req, res) => {
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
router.post('/add',requireAuth,isAdmin, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            admission: req.body.admission,
            payment: req.body.payment,         
        });
        // const { name, email, phone, admission, payment } = req.body;
        // // Read csv file
        
        // // Write form data to CSV file
        // csvWriter.writeRecords([{ name, email, phone, admission, payment }])
        //   .then(() => {
        //     console.log('Form data written to CSV file');
        //   })
        //   .catch(err => {
        //     console.error('Error writing to CSV file:', err);
        //   });
        await user.save();
        req.session.message = {type: "success",message: "Member added successfully"};
        res.redirect("/registered");
    } catch (err) {
        // res.json({ message: err.message, type: 'danger' });
        req.session.message = {type: 'error',message: 'That Registration Number is already registered to a different member, Kindly try a different Registration Number!',};
        // req.session.message = {type: 'danger',message: err.message,};
        res.redirect('/add')
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
router.post('/update/:id',isAdmin, async(req, res)=>{
    User.findByIdAndUpdate(req.params.id, req.body)
        .then((result)=>{
            req.session.message = {type: "success",message: "Member details have been edited successfully"};
            console.log('Member details successfully edited')
            res.redirect('/registered')
        })
        .catch(err=>{
            req.session.message = {type: "error",message: "There was a problem editing member details, please try again!"};
            console.log(err)})
});

// Route to delete a user
router.get('/delete/:id',isAdmin, async (req, res) => {
    User.findByIdAndDelete(req.params.id)
    .then((result)=>{
        req.session.message = {type: "success",message: "Member details have been successfully deleted"};
        res.redirect('/registered')})
    .catch(err=>{
        req.session.message = {type: "error",message: "There was a problem deleting member details"};
        console.log(err)})
  });

  // Route to delete all users
router.post('/delete/all',isAdmin, async (req, res) => {
    await User.deleteMany({});
    res.redirect('/registered');
});

router.use((req, res)=>{
    res.render('404',{ title: '404'})
})

module.exports = router;
