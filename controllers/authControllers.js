module.exports.signup_get=(req, res)=>{
    res.render('signup', {title:'SignUp Page'});
}
module.exports.login_get=(req, res)=>{
    res.render('login', {title:'Login Page'});
}
module.exports.signup_post=(req, res)=>{
    res.render('new signup', {title:'New SignUp Page'});
}
module.exports.login_post=(req, res)=>{
    res.render('user login', {title:'User Login'});
}