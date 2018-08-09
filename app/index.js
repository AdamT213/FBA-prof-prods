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
const csv=require('csvtojson');
const multer  = require('multer');
const upload = multer();
const ENV = process.env.NODE_ENV || 'development';
const config = require('../knexfile');
const db = knex(config[ENV]);
require('dotenv').config()

// Initialize Express.
const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({limit: '50mb',
extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(session({ secret: 'some secret' }));
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', router);

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

router.post('/distributors', (req, res) => {
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

router.post('/distributor/:id/upload', upload.single(), function (req, res, next) {
  console.log(req.body); 
  console.log("Adam is a stupid faggot");
  console.log(next); 
  return res;
})
  // .then((req, res) => {
  //   console.log(req)
  //   // return csv()
  //   // .fromString(req.body.toString('utf8'))
  //   // .on('json', (item) => { 
  //   //   item.distributor_id = req.params.id 
  //   //   Product
  //   //   .forge(item.body)
  //   //   .save()
  //   //   .then((product) => {
  //   //     res.json({id: product.id});
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error(error);
  //   //     return res.sendStatus(500);
  //   //   })
  //   // })
  //   // .on('done', () => { 
  //   //   console.log('done parsing'); 
  //   //   resolve();
  //   // });
  // }) 



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