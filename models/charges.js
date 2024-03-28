const mongoose=require('mongoose')
const chargeSchema= new mongoose.Schema({
    charge:{
        type:Number,
        required: true,
    }
})

const Charge= mongoose.model('Charge', chargeSchema);
module.exports=Charge;