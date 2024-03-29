const CryptoJS = require("crypto-js");
const agent = require('superagent') 
const moment = require('moment')
const xml2js = require('xml2js'); 
require('dotenv').config(); 

//generates the signature needed to sign the request to the amazon mws endpoint. Needs to programmatically include the UPC as a param, since each UPC generates a unique signature
var generateSignatureForProductInfo = (UPC) => { 
 
  //moment.js UTC format seems to be the only thing MWS accepts as valid ISO 8601
  var timestamp = moment().utc().format("YYYY-MM-DDTHH:mm:ss.sss") + "Z"

  var Message = "POST" + "\n" + "mws.amazonservices.com" + "\n" + "/Products/2011-10-01" + "\n" + "AWSAccessKeyId=" + encodeURIComponent(process.env.AWS_ACCESS_KEY_ID) + "&Action=" + encodeURIComponent('GetMatchingProductForId') + "&IdList.Id.1=" + encodeURIComponent(UPC) + "&IdType=" + encodeURIComponent('UPC') + "&MarketplaceId=" + encodeURIComponent('ATVPDKIKX0DER') + "&SellerId=" + encodeURIComponent(process.env.SELLER_Id) + "&SignatureMethod=" + encodeURIComponent('HmacSHA256') + "&SignatureVersion=" + encodeURIComponent('2') + "&Timestamp=" + encodeURIComponent(timestamp)
  + "&Version=" + encodeURIComponent("2011-10-01"); 

  var secret = process.env.SECRET;

  var hash = CryptoJS.HmacSHA256(Message, secret);
  
  var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

  
  return hashInBase64 

} 

// console.log(exports.generateSignatureForProductInfo(UPC)) 

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
      'AWSAccessKeyId': process.env.AWS_ACCESS_KEY_ID,
      'IdList.Id.1': amazonUPC,
      'IdType': 'UPC',
      'MarketplaceId': 'ATVPDKIKX0DER',
      'SellerId': process.env.SELLER_Id,
      'Signature': generateSignatureForProductInfo(amazonUPC),
      'SignatureMethod': 'HmacSHA256',
      'SignatureVersion': '2',
      'Timestamp': timestamp,
      'Version': '2011-10-01'
    })
    .buffer(true).parse(myParse) 
    .then(res => { 
      //check if any products matching UPC are found 
      if(!res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult[0].Error) {
        
        //find first product in returned list that has an associated listPrice
        
        let productWithPrice = res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult[0].Products[0].Product.find((p) => p.AttributeSets[0]['ns2:ItemAttributes'][0]['ns2:ListPrice']) 
        
        //set sales rank to arbitrarily large number, then set it to actual rank if ranking info is found for product. This way, products with no sales rank info will still be added, but they will be displayed behind products with sales rank info

        let SalesRank = 1000000000
        
        if (productWithPrice && productWithPrice.SalesRankings[0] !== '') {
          SalesRank = productWithPrice.SalesRankings[0].SalesRank[0].Rank[0]
        }

       return productWithPrice !== undefined ? 
          {ASIN: res.body.GetMatchingProductForIdResponse.GetMatchingProductForIdResult[0].Products[0].Product[0].Identifiers[0].MarketplaceASIN[0].ASIN[0], Price: productWithPrice.AttributeSets[0]['ns2:ItemAttributes'][0]['ns2:ListPrice'][0]['ns2:Amount'][0], SalesRank: SalesRank} : 
          {ASIN: null, Price: null, SalesRank: null} 
      }
      return {ASIN: null, Price: null, SalesRank: null}
    }) 
    .catch(error => {
      console.log('Error uploading UPC ' + UPC);
      console.log(error);
      return "Error uploading this record";
    })
} 

// console.log(exports.getPriceandASIN('855491007096'))