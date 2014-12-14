/**
 * Created by Skeksify on 12/11/14.
 */

var fs = require("fs");
var _ = require("underscore");

function create_game(){
    var view = read_template('create_game');
    var metadata = {
        headerTitle: 'Create New Game',
        submitButton: 'Create Game'
    };
    return _.template(view)(metadata);
}



function header(){
    return read_template('header');
}
function footer(){
    return read_template('footer');
}

exports.get_view = function(){
    var result = [];
    result.push(header());
    result.push(create_game());
    result.push(footer());
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

