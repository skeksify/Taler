/**
 * Created by Skeksify on 12/11/14.
 */

var fs = require("fs");
var _ = require("underscore");

function create_game(metadata){
    var view = read_template('create_game');
    return _.template(view)(metadata);
}

function header(metadata){
    return _.template(read_template('header'))(metadata);
}
function footer(metadata){
    return _.template(read_template('footer'))(metadata);
}

exports.get_view = function(){
    var result = [];
    var metadata = {
        headerTitle: 'Create New Game',
        submitButton: 'Create Game'
    };
    result.push(header(metadata));
    result.push(create_game(metadata));
    result.push(footer(metadata));
    return result.join('\r\n');
}

function read_template(file){
    return fs.readFileSync("views/"+file+"._",'utf8');
}











/*

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

app.get('/', function (req, res) {
    sess = req.session;
//Session set when user Request our app via URL
    if (sess.email) {
        res.redirect('/admin');
    }
    else {
        res.render('index.html');
    }
});

app.post('/login', function (req, res) {
    sess = req.session;
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
    sess.email = req.body.email;
    res.end('done');
});

app.get('/admin', function (req, res) {
    sess = req.session;
    if (sess.email) {
        res.write('\
            < h1 > Hello\
        '+sess.email+' </h1 >\
        ');
        res.end('<a href="+">Logout</a>');
    }
    else {
        res.write('\
            < h1 > Please\
        login\
        first. </h1 >\
        ');
        res.end('<a href="+">Login</a>');
    }

});

app.get('/logout', function (req, res) {

    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    });

});
app.listen(3000, function () {
    console.log("App Started on PORT 3000");
});



*/

