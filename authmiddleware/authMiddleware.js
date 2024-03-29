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

module.exports={ requireAuth , checkUser}