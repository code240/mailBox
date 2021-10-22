function validation(){
       let name = document.forms["register_form"]["name_inp"].value;
       let id = document.forms["register_form"]["user_name"].value;
       let num = document.forms["register_form"]["phonenumber"].value;
       let ps = document.forms["register_form"]["user_ps"].value;
       
       if(name.trim()===""){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter your name.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       if(name.trim().length < 3){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Name must contain 3 characters.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       if(id.trim()===""){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter a unique username.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       if(id.length < 12){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").style.top = "1rem";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Your username cannot be less than 12 character.<br> Use <b>@vipin.in</b> at the end of your username";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       var domain = id.slice(-7);
       if(domain != "@vip.in"){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").style.top = "1rem";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b> Please use <b>@vip.in</b> at the end of your username";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       if(num.trim()===""){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter your phone number.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       var num1 = Number(num);
       if(isNaN(num1)){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter your phone number carefully.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       num = num.toString(); 
       if(num.length!=10){
           document.getElementById("alert-div").style.display = "block";
            document.getElementById("alert-div").style.top = "1rem";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Your mobile info must contain 10 number.<br/>Please remove 0 and country code from your number.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }

       if(ps.trim()===""){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter the password.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       if(ps.trim().length<6){
           document.getElementById("alert-div").style.display = "block";
           document.getElementById("alert-div").innerHTML = "<b>Note : </b>Password must contain 6 characters.";
           setTimeout(()=>{
               document.getElementById("alert-div").style.display = "none";
           },5000);
           return false; 
       }
       return true;
   }   



   function validationLogin(){
    let id = document.forms["login_form"]["user_name"].value;
    let ps = document.forms["login_form"]["user_ps"].value;
    if(id.trim()===""){
        document.getElementById("alert-div").style.display = "block";
        document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter the username.";
        setTimeout(()=>{
            document.getElementById("alert-div").style.display = "none";
        },5000);
        return false; 
    }
    if(ps.trim()===""){
        document.getElementById("alert-div").style.display = "block";
        document.getElementById("alert-div").innerHTML = "<b>Note : </b>Please enter the password.";
        setTimeout(()=>{
            document.getElementById("alert-div").style.display = "none";
        },5000);
        return false; 
    }
    return true;
}