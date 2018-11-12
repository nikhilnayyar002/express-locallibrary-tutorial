var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require("express-session");
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

var index = require('./routes/index');
var catalog = require('./routes/catalog'); // Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');

// Create the Express application object
var app = express();

app.use(helmet());

var oktaClient = new okta.Client({
  orgUrl: 'https://dev-375260.oktapreview.com',
  token: '00QEa2Yx59IztNSd4yaZsgxf0e0qdih-7aeLMeLfP1'
});

const oidc = new ExpressOIDC({
  issuer: "https://dev-375260.oktapreview.com/oauth2/default",
  client_id: '0oaham3bwjfIsv0DH0h7',
  client_secret: 'vfcp7XcmVMCVDQPu3jbrRS7iprzTYoxMt2g669Ng',
  redirect_uri: 'https://nik-loclib.herokuapp.com/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/login"
    },
    callback: {
      path: "/callback",
      defaultRedirect: "/catalog"
    }
  }
});

// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb://nikhilnayyar:dnaagent6@ds151523.mlab.com:51523/local_library'

var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '6mb'}));
app.use(bodyParser.urlencoded({limit: '6mb', extended: true}));
app.use(cookieParser());

app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '45345jkgre8fwsnjwk8732nmkjlsa93kjw',
  resave: true,
  saveUninitialized: false
}));

app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }
  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

function loginRequired(req, res, next) {
  if (!req.user) return res.status(401).render("unauthenticated");
  next();
}

app.use('/', index);
app.use('/catalog', loginRequired, catalog); 

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
