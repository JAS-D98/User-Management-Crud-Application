require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY || "It's always a Secret";
const jwt=require('jsonwebtoken');
const authUser=require('../models/auth_user')

const requireAuth=(req, res, next)=>{
    const token=req.cookies.jwt;


    //check web token exists and is verified
    if(token){
        jwt.verify(token,SECRET_KEY,(err, decodedToken)=>{
             if(err){
                console.log(err.message);
                res.redirect('/login')
             }else{
                console.log(decodedToken);
                next();
             }
        })
    }else{
        res.redirect('/login')
    }
}

//admin authentication
// const isAdmin = (req, res, next) => {
//     if (req.session && req.session.user && req.session.user.role === 'admin') {
//         return next();
//     } else {
//         // res.send(403).send('Unauthorized')
//         res.redirect('/');
//     }
// };
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        const token = jwt.sign({ id: req.session.user.id }, SECRET_KEY, { expiresIn: '1h' }); // expiration time set to 1 hour for admin
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // 1hr in milliseconds
        return next();
    } else {
        res.redirect('/');
    }
};



//check current user
const checkUser = (req, res, next )=>{
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token,SECRET_KEY,async (err, decodedToken)=>{
            if(err){
               console.log(err.message);
               res.locals.user=null;
               next()
            }else{
               console.log(decodedToken);
               let user=await authUser.findById(decodedToken.id)
               res.locals.user=user;
               next();
            }
       })  
    }else{
        res.locals.user=null;
        next()
    }
}

module.exports={ requireAuth , checkUser, isAdmin}