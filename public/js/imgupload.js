function encodeImageFileAsURL(element) {
  var file = element.files[0];
  var reader = new FileReader();
  if (!file) document.getElementById("demo").src ='/images/noimage.jpg'; 
  else {
   reader.onloadend = function() {
   document.getElementById("demo").src =reader.result;  
   document.forms[0].elements.imgbot.value=reader.result; 
   console.log(document.forms[0].elements.imgbot.value);
   }
   reader.readAsDataURL(file);
  }
}
