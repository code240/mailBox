const express = require("express");
const path = require("path");
const hbs = require("hbs");
const app = express();
const fs = require("fs");
const mongoose = require("mongoose");
const collection = require("./DatabaseSchema");
const CreateToken = require("./token");
const TokenSchema = require("./TokenDbSchema");
const mailCollection = require("./EmailSchema");
const createMailCode = require("./EmailCode");
const createName = require("./ImageNameCreater");
const formidable = require("formidable");
const port = process.env.PORT || 8000;


// FOR SESSION
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const { ifError } = require("assert");
app.use(cookieParser());

app.use(
    sessions({
        resave: true,
        saveUninitialized: true,
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    })
);




// DATABASE CONNECTION
// Q39b0Hib600JY4zu || Si4YokGXOA5Qwlb6
// mongodb+srv://vipinCreation:Q39b0Hib600JY4zu@cluster0.0sgqz.mongodb.net/mailBox?retryWrites=true&w=majority
// mongodb+srv://vipinrao:vipin@12345@cluster0.fde2c.mongodb.net/mailBox?retryWrites=true&w=majority
 
const db = "mongodb+srv://vipinrao:Si4YokGXOA5Qwlb6@cluster0.fde2c.mongodb.net/mailBox?retryWrites=true&w=majority";
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("User Vipinrao successfully connect to database!!"))
    .catch(() => console.log("Error : user vipinrao cannot connect with database"));


// NECESSORY FOR POST PARAMETER
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
 

// NECESSORY FOR RENDER HBS
const templates = path.join(__dirname, "public");
app.set("view engine", "hbs");
app.set("views", templates);
app.use(express.static(path.join(__dirname, "public")));


// Get Time Date
var today = new Date();
var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
var time = today.getHours() + ":" + today.getMinutes(); 





// ROUTING START FROM HERE
// Routing : Login page 
app.get("/", (req, res) => {
    var alreadyLogin = req.cookies.mailBoxUser;
    if (alreadyLogin === undefined) {
        if (req.session.message != null) {
            var msg = req.session.message;
            req.session.destroy();
            res.render("index", msg);
        } else if (req.session.LoginError != null) {
            var msg = req.session.LoginError;
            req.session.destroy();
            res.render("index", msg);
        } else {
            res.render("index");
        } 
    } else {
        res.redirect("/home");
    }
});


// Routing : Register page
app.get("/register", (req, res) => {
    if (req.session.RegisterError != null) {
        var msg = req.session.RegisterError;
        req.session.destroy();
        res.render("register", msg);
    }
    else {
        res.render("register");
    }
});


// Routing : Backend code while register user.
app.post("/register", (req, res) => {
    var exist = 0;
    const saveDocument = async () => {
        try {
            const newUser = new collection({
                name: req.body.name_inp.toLowerCase(),
                username: req.body.user_name.toLowerCase(),
                mobile: req.body.phonenumber,
                dp : "no_image.jpg",
                password: req.body.user_ps,
            });
            await newUser.save()
        } catch (err) {
            console.log(err);
        }
    }
    const getUsernames = async () => {
        try {
            const userExists = await collection.find().select({ username: 1 });
            var i = 0;
            while (i < userExists.length) {
                if (req.body.user_name.toLowerCase() === userExists[i].username.toLowerCase()) {
                    exist = 1;
                    var message = { RegisterError: `Username "${req.body.user_name}" has already been taken.` }
                    req.session.RegisterError = message;
                    req.session.save();
                    res.redirect("/register");
                }
                i = i + 1;
            }
            if (exist == 0) {
                saveDocument();
                var message = { message: "User registered successfully! Login Now" }
                req.session.message = message;
                req.session.save();
                res.redirect("/");
            }
        } catch (err) {
            console.log(err);
        }
    };
    getUsernames();

});



// Routing : Check Login Credentials
app.post("/check", (req, res) => {
    const checkForTokenExistance = async () => {
        let token_existance = await TokenSchema.find({ username: req.body.user_name.toLowerCase() });
        if (token_existance != 0) {
            req.session.LoginExist = req.body.user_name.toLowerCase();
            req.session.save();
            return 1;
        }
        return 0;
    }
    const saveToken = async (t) => {
        try {
            const newToken = new TokenSchema({
                token: t,
                username: req.body.user_name.toLowerCase(),
            });
            await newToken.save()
        } catch (err) {
            console.log(err);
        }
    }
    const checkCredential = async () => {
        try {
            const user_data = await collection.find().select({ username: 1, password: 1 });
            var i = 0;
            var email_match = 0, password_match = 0;
            while (i < user_data.length) {
                if (req.body.user_name.toLowerCase() === user_data[i].username.toLowerCase()) {
                    email_match = 1;
                    if (req.body.user_ps === user_data[i].password) {
                        password_match = 1;
                        const signal = await checkForTokenExistance();
                        if (signal === 1) {
                            return res.redirect("/securityIssue");
                        }
                        if (signal === 0) {
                            let Token = CreateToken(req.body.user_name.toLowerCase());
                            saveToken(Token);
                            res.cookie("mailBoxUser", Token, {
                                expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 365)),
                                httpOnly: true,
                            });
                            return res.redirect("/home");
                        }
                    } else {
                        break;
                    }
                }
                i = i + 1;
            }
            if (email_match === 0) {
                var message = { LoginError: `User Not Found! Please check your username & try again.` }
                req.session.LoginError = message;
                req.session.save();
                return res.redirect("/");
            }
            if (password_match === 0) {
                var message = { LoginError: `Incorrect password! Please try again.` }
                req.session.LoginError = message;
                req.session.save();
                return res.redirect("/");
            }
        } catch (err) {
            console.log(err);
        }
    }
    checkCredential();
});


app.get("/securityIssue", (req, res) => {
    var user = req.session.LoginExist;

    if (user == null) {
        return res.redirect("/");
    }
    if (req.query.choice === "yes") {
        // Delete Old Token
        const deleteRecentToken = async (id) => {
            const result = await TokenSchema.deleteMany({ username: id });
        }
        // Save New Token 
        const saveNewToken = async (t) => {
            try {
                const newToken = new TokenSchema({
                    token: t,
                    username: user.toLowerCase(),
                });
                await newToken.save()
            } catch (err) {
                console.log(err);
            }
        }
        // This will resolve token conflicts
        const resolveTokens = async () => {
            await deleteRecentToken(user);
            let Token = CreateToken(user.toLowerCase());
            await saveNewToken(Token);
            res.cookie("mailBoxUser", Token, {
                expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 365)),
                httpOnly: true,
            });
            return res.redirect("/home");
        }
        resolveTokens();

    } else if (req.query.choice === "no") {
        req.session.destroy();
        return res.redirect("/");
    } else {
        return res.render("securityIssue");
    }

});


 
// AFTER LOGIN ###################

// Routing : Home Page After Login
app.get("/home", (req, res) => {
    var isset = req.cookies.mailBoxUser;
    // Verify Cookie Function
    const verify = async () => {
        // fetch data from token to verify
        const getTokens = await TokenSchema.find({ token: isset });
        if (getTokens.length == 0) {
            return 0;
        }
        if (getTokens.length == 1) {
            return 1;
        }
        if (getTokens.length < 1) {
            return 2;
        }
    }
    // Check cookie yes and no
    if (isset === undefined) {
        return res.redirect("/");
    } else {
        const handleCookie = async () => {
            const verifyStatus = await verify();
            if (verifyStatus == 0) {
                res.cookie("mailBoxUser", "Token", {
                    expires: new Date(Date.now() + (-10)),
                    httpOnly: true,
                });
                res.redirect("/");
            }
            if (verifyStatus == 1) {
                // If everything fine.... then this code will be execute
                // Safe code.
                let owner = isset.split("*")[1];
                req.session.accountOwner = owner;
                req.session.save(); 
                const serveRecivedMails = async() => {
                    var myMails = await mailCollection.find({receivername:owner});
                    var j = 0,myMailsUpdated=[],mini={},i=myMails.length-1;
                    var yourData = await collection.find({username:owner.toLowerCase()}).select({dp:1});
                    yourDp = yourData[0].dp;
                    while(j<myMails.length){
                        var senderInfo = await collection.find({username:myMails[i].sendername.toLowerCase()}).select({name:1,dp:1});
                        // console.log(myMails[i]); 
                        mini = {
                            sendername : senderInfo[0].name,
                            senderUsername : myMails[i].sendername,
                            senderDp : senderInfo[0].dp,
                            date : myMails[i].date,
                            subject : myMails[i].subject,
                            message : myMails[i].message,
                            code :  myMails[i].mailcode,
                            link : myMails[i].link,
                            seen : myMails[i].seen,
                            receivername : owner,
                        }
                        myMailsUpdated.push(mini)
                        j=j+1;
                        i=i-1;
                    }
                    // console.log(myMailsUpdated);

                    var i=0,mails={}; 
                    while(i<myMailsUpdated.length){
                        Object.assign(mails,{[i]:myMailsUpdated[i]});
                        i = i+1;
                    }
                    // console.log(mails);
                    res.render("home",{mails : mails,yourDp : yourDp});

                }

                serveRecivedMails();


                


                // safe code end
            }
            if (verifyStatus < 1) {
                res.cookie("mailBoxUser", "Token", {
                    expires: new Date(Date.now() + (-10)),
                    httpOnly: true,
                });
                const deleteRecentToken = async (id) => {
                    var results = await TokenSchema.deleteMany({ username: id });
                }
                deleteRecentToken(isset);
            }
        }
        handleCookie();
    }
});



app.get("/compose", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        var youDp=""; 
        const getDp = async() => {
            var yourData = await collection.find({username:req.session.accountOwner.toLowerCase()}).select({dp:1});
            yourDp = yourData[0].dp;
        }
        getDp();
        res.render("compose",{yourDp:yourDp});
    }
});



app.get("/sent", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{

        const serveSentMails = async() => {
            var myMails = await mailCollection.find({sendername:req.session.accountOwner});
            var j = 0,myMailsUpdated=[],mini={},i=myMails.length-1;
            var yourData = await collection.find({username:req.session.accountOwner.toLowerCase()}).select({dp:1});
            yourDp = yourData[0].dp;
            while(j<myMails.length){
                // var receiverInfo = await collection.find({username:myMails[i].receivername}).select({name:1,dp:1});
                // var receiverInfo = [{name:"kunal",dp:"user.png"}]
                var receiverInfo = await collection.find({username:myMails[i].receivername.toLowerCase()});
                mini = {
                    receivername : receiverInfo[0].name,
                    receiverUsername : myMails[i].receivername,
                    receiverDp : receiverInfo[0].dp, 
                    date : myMails[i].date,
                    subject : myMails[i].subject,
                    message : myMails[i].message,
                    code :  myMails[i].mailcode,
                    link : myMails[i].link,
                    seen : myMails[i].seen,
                    sendername :req.session.accountOwner,
                }
                myMailsUpdated.push(mini)
                j=j+1;
                i=i-1;
            }
            // console.log(myMailsUpdated);

            var i=0,mails={}; 
            while(i<myMailsUpdated.length){
                Object.assign(mails,{[i]:myMailsUpdated[i]});
                i = i+1;
            }
            // console.log(mails);
            // var x = {name : "hii"}
            res.render("sent",{mails : mails,yourDp:yourDp});
        }

        serveSentMails();




        // res.render("sent");
    }
});
app.get("/show",(req,res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        if(req.query.mail==undefined){
            return res.redirect("/home");
        }else{
            const ShowMail = async() => {
                var mailData = await mailCollection.find({mailcode:req.query.mail});
                if(mailData.length==0){
                    return res.redirect("/home");
                }
                var senderName = await collection.find({username:mailData[0].sendername.toLowerCase()}).select({name:1,dp:1})
                // console.log(senderName);
                var redirectUrl = mailData[0].link;
                if(mailData[0].link == " "){
                    mailData[0].link = "No Link Attached to this mail";
                    redirectUrl =  "";
                }
                
                if(mailData[0].receivername.toLowerCase() == req.session.accountOwner.toLowerCase()){
                    var sendData = {    
                        sendername : senderName[0].name,
                        senderDp : senderName[0].dp,
                        receiverUsername : req.session.accountOwner,
                        senderUsername : mailData[0].sendername,
                        subject : mailData[0].subject,
                        message : mailData[0].message,
                        link : mailData[0].link,
                        redirect : redirectUrl,
                        mailcode: mailData[0].mailcode,
                        date : mailData[0].date,
                        time : mailData[0].time,
                        seen : true
                    } 
                    if(mailData[0].theme=="1"){Object.assign(sendData,{Formal:true});}
                    if(mailData[0].theme=="2"){Object.assign(sendData,{Love:true});}
                    if(mailData[0].theme=="3"){Object.assign(sendData,{Cloudy:true});}
                    if(mailData[0].theme=="4"){Object.assign(sendData,{DarkFeel:true});}
                    var seenStatus = await mailCollection.updateOne({mailcode:req.query.mail},{$set : {seen : true}});
                    // console.log(sendData)
                    return res.render("show",{data : sendData});
                    
                }else{
                    return res.redirect("/home");
                }
            }
            ShowMail();
        }
    }
}) 

app.get("/sentShow",(req,res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        if(req.query.mail==undefined){
            return res.redirect("/home");
        }else{
            const ShowSentMail = async() => {
                var mailData = await mailCollection.find({mailcode:req.query.mail});
                if(mailData.length==0){
                    return res.redirect("/home");
                }
                var ReceiverName = await collection.find({username:mailData[0].receivername.toLowerCase()}).select({name:1,dp:1})
                // console.log(ReceiverName);
                var redirectUrl = mailData[0].link;
                if(mailData[0].link == " "){
                    mailData[0].link = "No Link Attached to this mail";
                    redirectUrl =  "";
                }
                
                if(mailData[0].sendername.toLowerCase() == req.session.accountOwner.toLowerCase()){
                    var sendData = {    
                        receivername : ReceiverName[0].name,
                        receiverDp : ReceiverName[0].dp,
                        receiverUsername : mailData[0].receivername,
                        senderUsername : req.session.accountOwner,
                        subject : mailData[0].subject,
                        message : mailData[0].message,
                        link : mailData[0].link,
                        redirect : redirectUrl,
                        mailcode: mailData[0].mailcode,
                        date : mailData[0].date,
                        time : mailData[0].time,
                        seen : mailData[0].seen,
                        draft : mailData[0].draft,
                    } 
                    if(mailData[0].theme=="1"){Object.assign(sendData,{Formal:true});}
                    if(mailData[0].theme=="2"){Object.assign(sendData,{Love:true});}
                    if(mailData[0].theme=="3"){Object.assign(sendData,{Cloudy:true});}
                    if(mailData[0].theme=="4"){Object.assign(sendData,{DarkFeel:true});}
                    // console.log(sendData)
                    return res.render("showSents",{data : sendData});
                }else{
                    return res.redirect("/home");
                }
            }
            ShowSentMail();
        }
    }
}) 



app.post("/send", (req, res) => {
    if(req.body.link_inp == ""){
        req.body.link_inp = " ";
    }
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }

    const savemail = async() => {
        const code = await createMailCode();
        const existingUsers = await collection.find({username:req.body.sendTo.toLowerCase()});
        console.log(existingUsers.length);
        if(existingUsers.length == 1 && req.body.sendTo.toLowerCase()!="draft@vip.in"){
            const mail = new mailCollection({ 
                sendername : req.session.accountOwner.toLowerCase(),
                receivername : req.body.sendTo.toLowerCase(),
                subject : req.body.subject,
                link : req.body.link_inp,
                message : req.body.message,
                mailcode :code,
                date : date,
                time : time, 
                seen : false, 
                theme : req.body.theme,
                draft : false,
            });
            var res = await mail.save();

        }else{
            const mail = new mailCollection({ 
                sendername :req.session.accountOwner.toLowerCase(),
                receivername : "draft@vip.in",
                subject : req.body.subject,
                link : req.body.link_inp,
                message : req.body.message,
                mailcode :code,
                date : date,
                time : time, 
                seen : true, 
                theme : req.body.theme,
                draft : true,
            });
            var res = await mail.save();

        }
    }  
    savemail();
    res.redirect("/sent");
});







app.post("/sendDrafts", (req, res) => {
    if(req.body.link_inp == ""){
        req.body.link_inp = " ";
    }
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }

    const savemail = async() => {
        const code = await createMailCode();
        const existingUsers = await collection.find({username:req.body.sendTo.toLowerCase()});
        console.log(existingUsers.length);
        if(existingUsers.length == 1){
            var deleteDraft = await mailCollection.deleteOne({mailcode:req.body.mailcode});
            const mail = new mailCollection({ 
                sendername : req.session.accountOwner.toLowerCase(),
                receivername : req.body.sendTo.toLowerCase(),
                subject : req.body.subject,
                link : req.body.link_inp,
                message : req.body.message,
                mailcode :code,
                date : date,
                time : time, 
                seen : false, 
                theme : req.body.theme,
                draft : false,
            });
            var res = await mail.save();

        }else{
            const mail = new mailCollection({ 
                sendername :req.session.accountOwner.toLowerCase(),
                receivername : "Draft@vip.in",
                subject : req.body.subject,
                link : req.body.link_inp,
                message : req.body.message,
                mailcode :code,
                date : date,
                time : time, 
                seen : true, 
                theme : req.body.theme,
                draft : true,
            });
            var res = await mail.save();

        }
    }  
    savemail();
    res.redirect("/sent");
});







app.get("/profile",(req,res) =>{
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        const profileInfo = async() => { 
            try{
                let getProfile = await collection.find({username:req.session.accountOwner.toLowerCase()});
            let SendThis = {
                name : getProfile[0].name,
                dp : getProfile[0].dp,
            }
            return res.render("profile",{data:SendThis});
            }catch(err){
                console.log(err);
            }
        }
        profileInfo();
    }
})





app.get("/user", (req, res) => { 
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        if(req.query.id==undefined){
            return res.redirect("/home");
        }
        if(req.query.id.toLocaleLowerCase()==req.session.accountOwner.toLowerCase()){
            return res.redirect("/profile");
        }
        const isUserFun = async() => {
            const isUser = await collection.find({username:req.query.id.toLowerCase()});
            const sended = await mailCollection.find({sendername:req.session.accountOwner.toLowerCase(),receivername:req.query.id.toLowerCase()})
            const received = await mailCollection.find({receivername:req.session.accountOwner.toLowerCase(),sendername:req.query.id.toLowerCase()})
            if(isUser.length==0){
                return res.redirect("/home");
            }
            const synergy = Math.floor((sended.length + received.length)/2);
            var firstname = isUser[0].name.split(" ");
            var firstname = firstname[0];
            var user = {
                name : isUser[0].name,
                firstname : firstname,
                username : isUser[0].username,
                dp : isUser[0].dp,
                totalReceived : received.length,
                totalSended : sended.length,
                synergy : synergy,
            }
            res.render("user",{user:user});
        }
        isUserFun();
    }
});








app.post("/updateName",(req,res) =>{
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        const updataion = async() => {
            var newName = req.body.updatedName;
            var newUpdate = await collection.updateOne({username:req.session.accountOwner},{ $set : {name:newName}});
            res.redirect("/profile");
        }
        if(req.body.updatedName==undefined){
            return res.redirect("/home");
        }else{
            updataion();
        }
    }
})
app.post("/updateDp",(req,res) =>{
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        res.send("Currently This site is hosted on a platform which doesnot allowed to upload images.<br> For now, you can only change your dp by contact the developer. Once this site will hosted on some different platform then this feature will enable for every user.")
        // var newNameForImage = createName();
        
        // var form = new formidable.IncomingForm();
        // form.parse(req);

        // form.on('fileBegin', function (name, file){
        //     file.path = __dirname + '/public/profiles/' + newNameForImage;
        // });

        // form.on('file', function (name, file){
            
        // });
        // const updateImage = async() =>{
        //     var getOldDp = await collection.find({username:req.session.accountOwner.toLowerCase()});
        //     var oldDp = getOldDp[0].dp;
        //     oldDp = "public/profiles/"+oldDp;
        //     await collection.updateOne({username:req.session.accountOwner.toLowerCase()},{$set : {dp : newNameForImage}});
        //     if(oldDp!="public/profiles/no_image.jpg"){
        //         fs.unlink(oldDp,(err)=>{ if(err!=null){console.log(err);}});
        //     }
        // }
        // updateImage();
        // res.redirect("/profile");
    }
})

app.post("/updatePs",(req,res) =>{
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        const PasswordUpdataion = async() => {
            var newPs = req.body.newps;
            var oldPs = req.body.oldps;
            var getPs = await collection.find({username:req.session.accountOwner});
            var currrent_ps = getPs[0].password;
            if(currrent_ps==oldPs){
                await collection.updateOne({username:req.session.accountOwner},{$set : {password:newPs}});
            }else{
                res.redirect("/home");
            }
            var m = "Your Password Has been Change Successfully. Do You want to logout?";
            res.cookie("message", m, {
                expires: new Date(Date.now() + (1000*400)),
                httpOnly: true,
            });
            res.redirect("/Security");
        }
        if(req.body.oldps==undefined || req.body.newps==undefined){
            return res.redirect("/home");
        }else{
            PasswordUpdataion();
        }
    }
})


app.get("/Security",(req,res) =>{
    if(req.cookies.message==undefined){
        res.redirect("/home");
    }else{
        var msg = req.cookies.message;
        res.cookie("message", " ", {
            expires: new Date(Date.now() + (-10)),
            httpOnly: true,
        });
        res.render("askLogout",{msg:msg})
    }
})




app.get("/help", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        var youDp=""; 
        const getDp = async() => {
            var yourData = await collection.find({username:req.session.accountOwner.toLowerCase()}).select({dp:1});
            yourDp = yourData[0].dp;
        }
        getDp();
        res.render("help",{yourDp:yourDp});
    }
});

app.get("/guide", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        var youDp=""; 
        const getDp = async() => {
            var yourData = await collection.find({username:req.session.accountOwner.toLowerCase()}).select({dp:1});
            yourDp = yourData[0].dp;
        }
        getDp();
        res.render("guide",{yourDp:yourDp});
    }
});




app.get("/feedback", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        var youDp=""; 
        const getDp = async() => {
            var yourData = await collection.find({username:req.session.accountOwner.toLowerCase()}).select({dp:1});
            yourDp = yourData[0].dp;
        }
        getDp();
        res.render("feedback",{yourDp:yourDp});
    }
});





app.get("/contact", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        var youDp=""; 
        const getDp = async() => {
            var yourData = await collection.find({username:req.session.accountOwner.toLowerCase()}).select({dp:1});
            yourDp = yourData[0].dp;
        }
        getDp();
        res.render("contactus",{yourDp:yourDp});
    }
});









app.get("/logout", (req, res) => {
    if(req.session.accountOwner==null){
        return res.redirect("/home");
    }else{
        const logout = async() => {
            var r = await TokenSchema.deleteMany({ username: req.session.accountOwner});
            res.cookie("mailBoxUser", "Token", {
                expires: new Date(Date.now() + (-10)),
                httpOnly: true,
            });
            return res.redirect("/");
        }
        logout();
    }
});


//  Tests



app.listen(port, () => {
    console.log("server ready!!!");
});
