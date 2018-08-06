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
const ENV = process.env.NODE_ENV || 'development';

const config = require('../knexfile');
const db = knex(config[ENV]);

// Initialize Express.
const app = express();
var router = express.Router();

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

//const Hand = require('./models/hand');
 
/// ***** Passport Strategies & Helpers ***** //


// ***** Server ***** //


// router.get('/hands', (req, res) => {
//   Hand
//     .collection()
//     .fetch({withRelated: ['sessions', 'tables','hands_tags']})
//     .then((hands) => {
//       res.json(hands);
//     })
//     .catch((error) => {
//       console.error(error);
//       return res.sendStatus(500);
//     });
// });

// router.get('/hand/:id', (req,res) => {
//   Hand
//     .forge({id: req.params.id})
//     .fetch({withRelated: ['sessions', 'tables', 'hands_tags']})
//     .then((hand) => {
//       if (_.isEmpty(hand))
//         return res.sendStatus(404);
//       res.json(hand);
//     })
//     .catch((error) => {
//       console.error(error);
//       return res.sendStatus(500);
//     });
// });

// router.post('/hands', (req, res) => {
//   if(_.isEmpty(req.body))
//     return res.sendStatus(400);
//   Hand
//     .forge(req.body)
//     .save()
//     .then((hand) => {
//       res.json({id: hand.id});
//     })
//     .catch((error) => {
//       console.error(error);
//       return res.sendStatus(500);
//     });
// });



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