var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var testRouter = require('./routes/test');
const app = express();
const createWorld = require('./externalAPI/api');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//

// global.worldURL = "vcm-24918.vm.duke.edu";        // CONNECTION
global.worldURL = "vcm-25468.vm.duke.edu";

global.worldAmazonPort = "23456";
global.worldUpsPort = "12345";
global.worldid = -1;
global.seqnum = 1000;
global.generateSeqnum = () => global.seqnum++;
global.connectionSuccess = "success";
global.connectWorld = false;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(createWorld.createWorld);

app.use('/test', testRouter);
app.use('/', indexRouter);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
