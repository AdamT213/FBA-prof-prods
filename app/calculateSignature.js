const CryptoJS = require("crypto-js");
const agent = require('superagent') 
const moment = require('moment')
const xml2js = require('xml2js');

//moment.js UTC format seems to be the only thing MWS accepts as valid ISO 8601
var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"

exports.generateSignature = () => { 

  var Message = "POST" + "\n" + "mws.amazonservices.com" + "\n" + "/Products/2011-10-01" + "\n" + "AWSAccessKeyId=" + encodeURIComponent('AKIAJO5TPTZ5YGGPNGQA') + "&Action=" + encodeURIComponent('GetMatchingProductForId') + "&IdList.Id.1=" + encodeURIComponent('043171884536') + "&IdType=" + encodeURIComponent('UPC') + "&MarketplaceId=" + encodeURIComponent('ATVPDKIKX0DER') + "&SellerId=" + encodeURIComponent('A1N0R958ET8VVH') + "&SignatureMethod=" + encodeURIComponent('HmacSHA256') + "&SignatureVersion=" + encodeURIComponent('2') + "&Timestamp=" + encodeURIComponent(timestamp)
  + "&Version=" + encodeURIComponent("2011-10-01"); 

  var secret = "IrgC8kn+R2WirgIbM8N+hLHUjAS/6CLWvf1dzLcd";

  var hash = CryptoJS.HmacSHA256(Message, secret);
  
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

  console.log(timestamp)
  
  return hashInBase64 

} 

console.log(exports.generateSignature()) 

// UPC=043171884536 
//sellerId=A1N0R958ET8VVH 

//setting up parser to convert xml response to JSON 
function myParse (res, cb) {
  res.text = '';
  res.on('data', chunk => res.text += chunk);
  res.on('end', () => xml2js.parseString(res.text, cb));
}
agent.parse['application/xml'] = myParse;

exports.sendRequest = () => {
 
  return agent
    .post('https://mws.amazonservices.com/Products/2011-10-01') 
    .query({
      'Action': 'GetMatchingProductForId',
      'AWSAccessKeyId': 'AKIAJO5TPTZ5YGGPNGQA',
      'IdList.Id.1': '043171884536',
      'IdType': 'UPC',
      'MarketplaceId': 'ATVPDKIKX0DER',
      'SellerId': 'A1N0R958ET8VVH',
      'Signature': exports.generateSignature(),
      'SignatureMethod': 'HmacSHA256',
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': '2011-10-01'
    })
    .buffer(true).parse(myParse) 
    .then(res => {
      console.log('here is the response');
      console.log(res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult);
    })
    .catch(error => {
      console.log('here is the error');
      console.log(error);
    })
} 

console.log(exports.sendRequest())