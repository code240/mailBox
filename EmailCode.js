function createMailCode(){
    var x = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","z"];
    var code="mail";
    var d = new Date();
    var n = d.getTime(); 
 
    for(var i = 0; i<15;i++){ 
        var ran = Math.floor(Math.random() * 26);
        code += x[ran];
    }
    code += n;
    return code;
             
}
module.exports = createMailCode;