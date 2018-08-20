const _ = require('lodash');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const knex = require('knex');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const request=require('request')
const csv = require('csvtojson');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const ENV = process.env.NODE_ENV || 'development';
const config = require('../knexfile');
const db = knex(config[ENV]);
require('dotenv').config();
const cors = require('cors'); 
const getPriceandASIN = require('./getSellingPriceandASIN'); 
const getFeesEstimate = require('./getFeesEstimate');

// Initialize Express.
const app = express();
const router = express.Router();
// create application/json parser
const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(session({ secret: 'some secret' }));
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', router); 
router.use(cors())


// Configure & Initialize Bookshelf & Knex.
console.log(`Running in environment: ${ENV}`);

// ***** Models ***** //

const Distributor = require('./models/distributor');
const Product = require('./models/product')
 
/// ***** Passport Strategies & Helpers ***** //


// ***** Server ***** //


router.get('/distributors', (req, res) => {
  Distributor
    .collection()
    .fetch()
    .then((distributors) => {
      res.json(distributors);
    })
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

router.get('/distributor/:id', (req,res) => {
  Distributor
    .forge({id: req.params.id})
    .fetch({withRelated: ['products']})
    .then((distributor) => {
      if (_.isEmpty(distributor))
        return res.sendStatus(404);
      res.json(distributor);
    })
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

router.post('/distributors', urlencodedParser, jsonParser, (req, res) => {
  if(_.isEmpty(req.body))
    return res.sendStatus(400);
  Distributor
    .forge(req.body)
    .save()
    .then((distributor) => {
      res.json({id: distributor.id});
    })
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
}); 

router.post('/distributor/:id/upload', upload.single('file'), function (err,req, res, next ) { 
  if (err) { 
    console.log(req);
    console.log(req.file);
    console.error(err);
    return res.sendStatus(500);
  }
  next()
}, function (req, res, next) {  
    // console.log(req.file);
    csv()
      .fromFile(req.file.path)
      .subscribe((json)=>{ 
        // console.log(json)
        return new Promise((resolve,reject)=>{
          let product = new Item(json.Title); 
          product.distributor_id = req.params.id 
          product.SKU = json.SKU 
          product.UPC = json.UPC 
          product.Price = json.Price 
          return resolve(product) 
          //make request to Amazon for product info, including selling price and ASIN 
        }).then((product) => {
          // console.log(product) 
          var productInfo = getPriceandASIN.getPriceandASIN(product.UPC) 
          return {info: productInfo, product: product}
        }).setTimeout((productStuff) => { 
          console.log(productStuff.product)
          console.log(productStuff.info)  
          // console.log(info.Price)
          // console.log(product)
          //will return null if no product matching UPC is found
          // if (info.ASIN !== null && info.Price !== null) {
          //   product.ASIN = info.ASIN 
          //   product.retailSellingPrice = info.Price  
          //   console.log(product)
            //Use ASIN to make request to Amazon for estimated fees, if and only if the selling price is greater than the buying price 
            // if (product.retailSellingPrice > product.Price) { 
            //   var feeEstimateInfo = getFeesEstimate(product.ASIN, product.retailSellingPrice)  
            //   console.log(feeEstimateInfo)
          //     product.amazonFees = feeEstimateInfo.Amount 
          //     //calculate selling price - buying price - fees to see if product is profitable
          //     var profitability = product.retailSellingPrice - product.Price - Product.amazonFees 
          //     //save product to db if it is profitable
          //     if (profitability > 0) { 
          //       product.isProfitable = true 
          //       product.profitMargin = profitability/retailSellingPrice
          //       Product
          //       .forge(product)
          //       .save()
          //       .then((prod) => {
          //         console.log({id: prod.id})
          //       }) 
          //     }
          //   } 
          // } 
          // else { 
          //   return resolve(res.end())
          // }
          // return res.end()
         })
      });
    })


//class constructor to aid in saving products from parsed items 
class Item {
  constructor(title) {
    this.title = title;   
  }
}

// Exports for Server Hoisting.

const listen = (port) => {
  return new Promise((resolve, reject) => {
    return resolve(app.listen(port));
  });
};

exports.up = (justBackend) => {
  return db.migrate.latest([ENV])
    .then(() => {
      return db.migrate.currentVersion();
    })
    .then((val) => {
      console.log('Done running latest migration:', val);
      return listen(process.env.PORT || 3000);
    })
    .then((server) => {
      console.log(`Listening on port ${process.env.PORT || 3000}...`);
      return server
    });
};