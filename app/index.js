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
const multer  = require('multer');
const upload = multer().single();
const parse = require('csv-parse');
const ENV = process.env.NODE_ENV || 'development';

const config = require('../knexfile');
const db = knex(config[ENV]);

// Initialize Express.
const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
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
 
/// ***** Passport Strategies & Helpers ***** //


// ***** Server ***** //


router.get('/distributors', (req, res) => {
  Distributor
    .collection()
    .fetch({withRelated: ['related items needed for distributors']})
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
    .fetch({withRelated: ['related items needed for distributors']})
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

router.post('/distributor/:id/files', (req,res) => { 
  upload(req, res, function (err) {
    if (err) {
      console.error("An error occurred when uploading. Please try again. Note that you may only upload one file at a time, and we only support .csv files.")
      return
    }
    console.log("We have received your file. Now we will parse it and find your profitable products!")
  })
}); 

// router.get('/distributor/:id/files/:id', (req, res) => { 
//   File
//     .forge({id: req.params.id})
//     .fetch()
//     .then((file) => {
//       if (_.isEmpty(file))
//         return res.sendStatus(404);
//       return parseJson(file)
//     })
//     .then((jsonData) => { 
//       for (var i in jsonData) { 
//         fetch("pathtoAmazonsellerapiitem=JsonData[i]", {
//           if (isProfitable(jsonData[i])) { 
//             ProfProd
//             .forge(JsonData[i])
//             .save()
//             .then((profProd) => {
//               res.json({id: profProd.id});
//             })
//           }
//         }) 
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       return res.sendStatus(500);
//     });
// }) 

// function parseJson(file) { 
//     var output = [];
//       // Create the parser
//     var parser = parse({delimiter: ':'});
//     // Use the writable stream api
//     parser.on('readable', function(){
//       while(record = parser.read()){
//         output.push(record);
//       }
//     });
//     // Catch any error
//     parser.on('error', function(err){
//       console.log(err.message);
//     });
//     parser.end(); 
// } 

// function isProfitable(item) { 
//   //algorithm to determine if a given item can be sold profitably
// }


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