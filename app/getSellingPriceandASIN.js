const CryptoJS = require("crypto-js");
const agent = require('superagent') 
const moment = require('moment')
const xml2js = require('xml2js');

//generates the signature needed to sign the request to the amazon mws endpoint. Needs to programmatically include the UPC as a param, since each UPC generates a unique signature
var generateSignatureForProductInfo = (UPC) => { 
 
  //moment.js UTC format seems to be the only thing MWS accepts as valid ISO 8601
  var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"

  var Message = "POST" + "\n" + "mws.amazonservices.com" + "\n" + "/Products/2011-10-01" + "\n" + "AWSAccessKeyId=" + encodeURIComponent('AKIAJO5TPTZ5YGGPNGQA') + "&Action=" + encodeURIComponent('GetMatchingProductForId') + "&IdList.Id.1=" + encodeURIComponent(UPC) + "&IdType=" + encodeURIComponent('UPC') + "&MarketplaceId=" + encodeURIComponent('ATVPDKIKX0DER') + "&SellerId=" + encodeURIComponent('A1N0R958ET8VVH') + "&SignatureMethod=" + encodeURIComponent('HmacSHA256') + "&SignatureVersion=" + encodeURIComponent('2') + "&Timestamp=" + encodeURIComponent(timestamp)
  + "&Version=" + encodeURIComponent("2011-10-01"); 

  var secret = "IrgC8kn+R2WirgIbM8N+hLHUjAS/6CLWvf1dzLcd";

  var hash = CryptoJS.HmacSHA256(Message, secret);
  
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

  console.log(timestamp)
  
  return hashInBase64 

} 

// console.log(exports.generateSignatureForProductInfo(UPC)) 

// UPC=043171884536 
//sellerId=A1N0R958ET8VVH 

//setting up parser to convert xml response to JSON 
function myParse (res, cb) {
  res.text = '';
  res.on('data', chunk => res.text += chunk);
  res.on('end', () => xml2js.parseString(res.text, cb));
}
agent.parse['application/xml'] = myParse;

//send request to Amazon MWS Products to retrieve Price and ASIN info. If price is greater than the price of the item, another request will be sent to estimate the amazon fees. If the fees + the cost are less than the selling price obtained here, i.e., there is a profit margin, the item will be saved to the db as a product
exports.getPriceandASIN = (UPC) => { 

  var amazonUPC= '0' + UPC
  var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"
 
  return agent
    .post('https://mws.amazonservices.com/Products/2011-10-01') 
    .query({
      'Action': 'GetMatchingProductForId',
      'AWSAccessKeyId': 'AKIAJO5TPTZ5YGGPNGQA',
      'IdList.Id.1': amazonUPC,
      'IdType': 'UPC',
      'MarketplaceId': 'ATVPDKIKX0DER',
      'SellerId': 'A1N0R958ET8VVH',
      'Signature': generateSignatureForProductInfo(amazonUPC),
      'SignatureMethod': 'HmacSHA256',
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': '2011-10-01'
    })
    .buffer(true).parse(myParse) 
    .then(res => {
      console.log('here is the response');
      console.log(res.body);  
      return res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult[0].Error ? {ASIN: null, Price: null} : {ASIN: res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult[0].Products[0].Product[0].Identifiers[0].MarketplaceASIN[0].ASIN[0], Price: res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult[0].Products[0].Product[0].AttributeSets[0]['ns2:ItemAttributes'][0]['ns2:ListPrice'][0]['ns2:Amount'][0]}
    }) 
    .catch(error => {
      console.log('here is the error');
      console.log(error); 
    })
} 

console.log(exports.getPriceandASIN('43171080044'))