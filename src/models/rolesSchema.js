const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  data:{
    type : String,
    required : true
  }
  
  
});

module.exports = mongoose.model("roles", rolesSchema);
