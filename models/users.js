const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true,},
    phone: {type: String, required: true},
    admission: {type: String, required: true,unique:true},
    payment: {type: String, required: true},
});
module.exports = mongoose.model('User', userSchema);
  
