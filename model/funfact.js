const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 

const funFactSchema = new Schema({

    code: {
        type: String, 
        required: true
    },
    
    funfact: {
        type: Array, 
        required: true
    }
 });

module.exports = mongoose.model('funFactSchema', funFactSchema);

