function createName(){
    var x = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","z"];
    var ImageName="";
    var d = new Date();
    var n = d.getTime(); 
 
    for(var i = 0; i<15;i++){ 
        var ran = Math.floor(Math.random() * 26);
        ImageName += x[ran];
    }
    ImageName += n;
    ImageName = ImageName+".jpg";
    return ImageName;
             
}

module.exports = createName;