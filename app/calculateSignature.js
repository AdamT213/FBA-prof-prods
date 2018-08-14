const CryptoJS = require("crypto-js");
const agent = require('superagent') 
const moment = require('moment')

//moment.js UTC format seems to be the only thing MWS accepts as valid ISO 8601
var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"


exports.generateSignature = () => { 

  var Message = "POST" + "\n" + "https://mws.amazonservices.com/" + "\n" + "/Products/2011-10-01" + "\n" + "AWSAccessKeyId=" + encodeURIComponent('AKIAJO5TPTZ5YGGPNGQA') + "&Action=" + encodeURIComponent('GetMatchingProductForId') + "&SignatureMethod=" + encodeURIComponent('HmacSHA256') + "&SignatureVersion=" + encodeURIComponent('2') + "&Timestamp=" + encodeURIComponent(timestamp) + "&Version=" + encodeURIComponent("2011-10-01"); 

  var secret = "IrgC8kn+R2WirgIbM8N+hLHUjAS/6CLWvf1dzLcd";

  var hash = CryptoJS.HmacSHA256(Message, secret);
  
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  
  return encodeURIComponent(hashInBase64)

} 

console.log(exports.generateSignature()) 

// UPC=043171884536 
//sellerId=A1N0R958ET8VVH 

exports.sendRequest = () => {
 
  return agent
    .post('https://mws.amazonservices.com/Products/2011-10-01')
    .query({
      AWSAccessKeyId: 'AKIAJO5TPTZ5YGGPNGQA',
      Action: 'GetMatchingProductForId',
      SellerId: 'A1N0R958ET8VVH',
      SignatureVersion: '2',
      Timestamp: timestamp,
      Version: '2011-10-01',
      Signature: exports.generateSignature(),
      SignatureMethod: 'HmacSHA256',
      MarketplaceId: 'ATVPDKIKX0DER',
      IdType: 'UPC',
      'IdList.Id.1': '043171884536'
    })
    .then(res => {
      console.log('here is the response');
      console.log(res)
    })
    .catch(error => {
      console.log('here is the error');
      console.log(error);
    })
} 

console.log(exports.sendRequest())