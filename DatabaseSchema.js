const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    name:{type:String,require:true},
    username : {type:String,require:true},
    mobile : {type:String,require:true},
    dp : {type:String,require:true},
    password : {type:String,require:true},
});
const collection = new mongoose.model("users",Schema);

module.exports = collection;