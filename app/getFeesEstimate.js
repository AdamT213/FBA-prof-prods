const CryptoJS = require("crypto-js");
const agent = require('superagent') 
const moment = require('moment')
const xml2js = require('xml2js'); 
require('dotenv').config(); 

//generates the signature needed to sign the request to the amazon mws endpoint. Needs to programmatically include the ASIN and Price as params, since each ASIN and Price generates a unique signature
var generateSignatureForFeesEstimate = (ASIN,Price) => { 

  //moment.js UTC format seems to be the only thing MWS accepts as valid ISO 8601
  var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"

  var Message = "POST" + "\n" + "mws.amazonservices.com" + "\n" + "/Products/2011-10-01" + "\n" + "AWSAccessKeyId=" + encodeURIComponent(process.env.AWS_ACCESS_KEY_ID) + "&Action=" + encodeURIComponent('GetMyFeesEstimate') + "&FeesEstimateRequestList.FeesEstimateRequest.1.IdType=ASIN" + "&FeesEstimateRequestList.FeesEstimateRequest.1.IdValue=" + encodeURIComponent(ASIN) + "&FeesEstimateRequestList.FeesEstimateRequest.1.Identifier=request1" + "&FeesEstimateRequestList.FeesEstimateRequest.1.IsAmazonFulfilled=" + true + "&FeesEstimateRequestList.FeesEstimateRequest.1.MarketplaceId=" + encodeURIComponent('ATVPDKIKX0DER') + "&FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.ListingPrice.Amount=" + encodeURIComponent(Price) + "&FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.ListingPrice.CurrencyCode=USD" + "&FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Points.PointsNumber=0" + "&FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Shipping.Amount=0.00" + "&FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Shipping.CurrencyCode=USD" + "&SellerId=" + encodeURIComponent(process.env.SELLER_Id) + "&SignatureMethod=" + encodeURIComponent('HmacSHA256') + "&SignatureVersion=" + encodeURIComponent('2') + "&Timestamp=" + encodeURIComponent(timestamp)
  + "&Version=" + encodeURIComponent("2011-10-01"); 

  var secret = process.env.SECRET;

  var hash = CryptoJS.HmacSHA256(Message, secret);
  
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  
  return hashInBase64 

} 

//console.log(exports.generateSignatureForFeesEstimate("B002KT3XQM", "30.00")) 
 

//setting up parser to convert xml response to JSON 
function myParse (res, cb) {
  res.text = '';
  res.on('data', chunk => res.text += chunk);
  res.on('end', () => xml2js.parseString(res.text, cb));
}
agent.parse['application/xml'] = myParse;

//send request to Amazon MWS Products to retrieve Price and ASIN info. If price is greater than the price of the item, another request will be sent to estimate the amazon fees. If the fees + the cost are less than the selling price obtained here, i.e., there is a profit margin, the item will be saved to the db as a product
exports.getFeesEstimate = (ASIN, Price) => { 

  var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"
 
  return agent
    .post('https://mws.amazonservices.com/Products/2011-10-01') 
    .query({
      'Action': 'GetMyFeesEstimate',
      'AWSAccessKeyId': process.env.AWS_ACCESS_KEY_ID,
      'FeesEstimateRequestList.FeesEstimateRequest.1.MarketplaceId': 'ATVPDKIKX0DER', 
      'FeesEstimateRequestList.FeesEstimateRequest.1.IdType': 'ASIN',
      'FeesEstimateRequestList.FeesEstimateRequest.1.IdValue': ASIN, 
      'FeesEstimateRequestList.FeesEstimateRequest.1.IsAmazonFulfilled': true, 
      'FeesEstimateRequestList.FeesEstimateRequest.1.Identifier': 'request1', 
      'FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.ListingPrice.Amount': Price, 
      'FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.ListingPrice.CurrencyCode': 'USD',
      'FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Shipping.Amount': '0.00', 
      'FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Shipping.CurrencyCode': 'USD', 
      'FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Points.PointsNumber': '0',
      'SellerId': process.env.SELLER_Id,
      'Signature': generateSignatureForFeesEstimate(ASIN, Price),
      'SignatureMethod': 'HmacSHA256',
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': '2011-10-01'
    })
    .buffer(true).parse(myParse) 
    .then(res => {
      return res.body.GetMyFeesEstimateResponse.GetMyFeesEstimateResult[0].FeesEstimateResultList[0].FeesEstimateResult[0].FeesEstimate[0].TotalFeesEstimate[0].Amount[0]
    }) 
    .catch(error => {
      console.log('here is the error');
      console.log(error);
    })
} 

// console.log(exports.getFeesEstimate("B000H7LEDS", "4.99")) 

