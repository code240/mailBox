const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    token:{type:String,require:true},
    username : {type:String,require:true},
});
const TokenSchema = new mongoose.model("tokens",Schema);

module.exports = TokenSchema;