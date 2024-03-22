const authUser=require('../models/auth_user');
const jwt=require('jsonwebtoken');
const SECRET_KEY=process.env.SECRET_KEY || "It's always a Secret";

//handle error
const handleError=(err)=>{
    console.log(err.message, err.code);
    let errors={username: '', email: '', password: ''};


    // Incorrect email
    if(err.message === 'Incorrect email'){
        errors.email="That email isn't registered"
    }

    // Incorrect email
    if(err.message === 'Incorrect Password'){
        errors.password="That password is incorrect"
    }


    //Duplicate error code
    if(err.code === 11000){
        errors.email='That email already exists for a different user'
        return errors;
    }

    if(err.message.includes('auth_user validation failed')){
        Object.values(err.errors).forEach(({properties})=>{
         errors[properties.path]= properties.message
        })
    }
    return errors;
}
const maxDuration=3*24*60*60;
const createToken=(id)=>{
    return jwt.sign({id}, SECRET_KEY, {expiresIn:maxDuration })
}

module.exports.signup_get=(req, res)=>{
    res.render('signup', {title:'SignUp Page'});
}
module.exports.login_get=(req, res)=>{
    res.render('login', {title:'Login Page'});
}
module.exports.signup_post=async (req, res)=>{
    const {username, email, password}= req.body;
    try{
    const user=await authUser.create({username, email, password})
    const token=createToken(user._id)
    res.cookie('jwt',token, {httpOnly: true, maxDuration: maxDuration*1000})
    res.status(200).json({user:user._id})
    }
    catch(err){
       const errors=handleError(err);
       res.status(400).json({errors})
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body; // Extract email and password from req.body
    try {
        const user = await authUser.login({ email, password }); // Pass an object containing email and password
        const token=createToken(user._id)
        res.cookie('jwt',token, {httpOnly: true, maxDuration: maxDuration*1000})
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors=handleError(err);
        res.status(400).json({ errors });
        console.log(errors);
    }
}

module.exports.logout_get=(req, res)=>{
    res.cookie('jwt', "", {maxDuration: 1})
    res.redirect('/login')
}