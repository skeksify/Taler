/**
 * Created by Skeksify on 1/12/15.
 */


var express = require('express');
var http = require('http');
var app = express();
//var cons = require('consolidate'); // For Underscore, maybe later go Jade?
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

app.set('port', 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

if (app.get('env') === 'development') {
    app.locals.pretty = true;
}
//	app.use(express.favicon());
//	app.use(express.logger('dev'));

//app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cookieParser());
app.use(session({secret: 'Teleki', resave: false, saveUninitialized: true}));
//////app.use(express.methodOverride());
//////app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use('/rj', express.static(__dirname + '/views/resources/js'));
app.use('/ri', express.static(__dirname + '/views/resources/images'));
app.use('/rs', express.static(__dirname + '/views/resources/styles'));

/*app.configure('development', function(){
    app.use(express.errorHandler());
});*/

require('./controllers/router')(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
})