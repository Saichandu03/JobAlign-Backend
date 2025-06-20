const mongoose = require('mongoose')

const roadMapSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    data :{
        type : String,
        required : true
    }
})

module.exports = mongoose.model('roadMap', roadMapSchema);