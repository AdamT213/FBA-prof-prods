const CryptoJS = require("crypto-js");

exports.generateSignature = () => { 

  var date = new Date() 
  
  var timestamp = encodeURIComponent(date.toISOString())

  var Message = "POST" + "\n" + "https://mws.amazonservices.com/" + "\n"+ "/Products/2011-10-01" + "\n" + "AWSAccessKeyId=AKIAJO5TPTZ5YGGPNGQA&Action=GetMatchingProductForId&SignatureMethod=HmacSHA256&SignatureVersion=2&Timestamp=" + timestamp + "&Version=2011-10-01"; 

  var secret = "IrgC8kn+R2WirgIbM8N+hLHUjAS/6CLWvf1dzLcd";

  var hash = CryptoJS.HmacSHA256(Message, secret);
  
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  
  return hashInBase64 

} 

console.log(exports.generateSignature()) 

// UPC=043171884536 
//sellerId=A1N0R958ET8VVH 
 
//set up fetch request to url constructed from query params, with generated signature

//set up ngrok so i don't have to keep pushing heroku commits 

//test fetch requests 