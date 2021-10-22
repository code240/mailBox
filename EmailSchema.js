const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    sendername : {type:String,require:true},
    receivername : {type:String,require:true},
    subject : {type:String,require:true},
    link : {type:String,require:true},
    message : {type:String,require:true},
    mailcode :{type:String,require:true},
    date : {type:String,require:true},
    time : {type:String,require:true},
    seen : {type:Boolean,require:true},
    theme : {type:String,require:true},
    draft : {type:Boolean,require:true},
});
const mailCollection = new mongoose.model("mails",Schema);

module.exports = mailCollection;

/*

{type:String,require:true}

*/