const mongoose=require('mongoose');
const {isEmail}=require('validator');
const bycrypt=require('bcrypt');

const authSchema=new mongoose.Schema({
    username:{type: String, required:[true, 'Please enter your username']},
    email:{ type: String, required: [true, 'Please enter your email'], unique:true, lowercase:true, validate:[isEmail, 'Please enter a valid email']},
    password:{ type: String, required: [true, 'Please enter your password'], minlength: [6, 'minimum password length is 6 characters']},
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
})
authSchema.post('save',(doc, next)=>{
    console.log('new user created and saved', doc)
    next();
});

authSchema.pre('save', async function(next){
    console.log('user about to be created and saved', this);
    const salt=await bycrypt.genSalt();
    this.password=await bycrypt.hash(this.password, salt);
    next();
});

//static method to login user
authSchema.statics.login = async function({ email, password }) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bycrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Incorrect Password');
    }
    throw Error('Incorrect email');
}


const authUser=mongoose.model('auth_user', authSchema);
module.exports=authUser;