/*
var CT = require('./modules/country-list');
var EM = require('./modules/email-dispatcher');
*/

var AM = require('../modules/account-manager');
var mailer = require('../modules/mailer');
var multer = require('multer');
var file_upload_done = false;

var add_flavors = function(o, req){
    var obj = o;
    obj.loggedin = !!req.session.user;
    if(req.session.user){
        obj.luser = req.session.user;

    }
    return obj;
}

var logged = function(req){ return !!req.session.user }
var homeFunction = function(req, res){
    res.render('home', add_flavors({
        page: 'home',
        page_title: 'Home'
    }, req));
}

module.exports = function(app) {
    app.get( '/', function(req, res){
        console.log(req.session.user);
        if (!req.cookies.user || !req.cookies.pass){ // Not enough cookiz
            homeFunction(req, res);
        } else { // Has cookies
            if (req.session.user == null){
                AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
                    if (o != null){ // Login successful
                        console.log('Got '+o.user+' in through kookie');
                        req.session.user = o;
                        homeFunction(req, res);
                    } else
                        res.json({ success: false, error: 'bad-cookies' });
                });
            } else //Logged in
                homeFunction(req, res);
        }
    });

    app.post( '/upload', function(req, res){
        if(file_upload_done)
            if(req.files)
                res.json({success: true, file: req.files.name});
    });

    app.get(/^\/make\/([\w\d]{24})$/, function(req, res){
        if(logged(req))
            AM.getGame({owner: req.session.user._id, _id: req.params[0]}, function(e, o){
                if(!e && o)
                    res.render('storyline_editor', add_flavors({
                        page: 'storyline_editor',
                        page_title: 'Edit Game',
                        game: o
                    }, req));
                else   // Game not found or no permission
                    res.redirect('/');
            });
        else //Not Logged
            res.redirect('/');
    }); // Work on a game! getGame

    app.get( '/make/my-games', function(req, res){
        if(logged(req))
            AM.getGames(req.session.user._id, function(e, o){
                res.render('my_games',{my_games: o});
            });
        else //Not Logged
            res.redirect('/');
    });

    app.post('/make/save_game', function(req, res){
        if(logged(req))
            AM.saveGame({_id: req.param('game_id'), owner: req.session.user._id , chapters: req.param('chapters')}, function(e){
                if (e)
                    res.json({ success: false, error: e});
                else
                    res.json({ success: true });
            });
        else //Not Logged
            res.json({ success: false, error: 'not-logged-in'});
    });

    app.post('/make/create_game', function(req, res){
        if(logged(req)){
            AM.createNewGame({
                title 	: req.param('title'),
                teaser 	: req.param('teaser'),
                owner	: req.session.user._id
            }, function(e) {
                if (e)
                    res.json({ success: false, error: e});
                else
                    res.json({ success: true });
            });
        }
        else //Not Logged
            res.redirect('/');
    });

    app.post('/users/login', function(req, res){
        AM.manualLogin(req.param('username'), req.param('password'), function(e, o){
            if (!o){
                res.json({success: false, error: e});
            } else {
                req.session.user = o;
                if (req.param('rm') == 'true'){
                    res.cookie('user', o.user, { maxAge: 900000 });
                    res.cookie('pass', o.pass, { maxAge: 900000 });
                }
                res.json({success: true});
            }
        });
    });

    app.get( '/users/logout', function(req, res){
        req.session.destroy(function(){
            req.session = null;
            res.clearCookie('pass');
            res.redirect('/');
        });
    });

    app.get(/^\/users\/activate\/(.+)\/(.+)$/, function(req, res){
        var paramies = req.params;
        AM.activateAccount(paramies[0], paramies[1], function(e, o){
            if(e)
                res.redirect('/')
            else{
                req.session.user = o;
                res.redirect('/');
            }
        })
    });

    app.post('/users/signup', function(req, res){
        AM.addNewAccount({
            email 	: req.param('email'),
            user 	: req.param('username'),
            pass	: req.param('password')
        }, function(e, uh) {
            if (e)
                res.json({ success: false, error: e});
            else{
                mailer.mail({
                    to: req.param('email'),
                    subject: 'Tale-Maker: Activate your account',
                    body: '<h3 style="font-family: verdana;">Tale-Maker Signup</h3>Go to the following link to activate your account<br><br><a href="http://taler.herokuapp.com/users/activate/'+uh.user+'/'+uh.hash+'">Activate</a>'
                });
                mailer.mail({
                    to: 'ben.haran@gmail.com',
                    subject: 'Tale-Maker: Signup Notification',
                    body: req.param('username') + ' signed up with ' + req.param('email')
                });
                res.json({ success: true });
            }
        });
    });

    app.get( '/play/create_character', function(req, res){
        if(logged(req))
            res.render('create_character', add_flavors({
                page: 'create_character',
                page_title: 'Create Character'
            }, req));
        else //Not Logged
            res.redirect('/');
    });

    app.post(/^\/json\/(.+)\/(.+)$/ , function(req, res){
        var paramies = req.params;
        switch(paramies[0]){
            case 'game':
                if(paramies[1]=='save_chapter'){
                    // Use a db object from above
                    res.send('{success: true}');
                }
                break;
        }
    });

    app.get( '/favicon.ico', function(req, res, next){ if(0) next(); } );

    app.get('*', function(req, res) {
        res.render('404', add_flavors({
            page: '404',
            page_title: 'Unfound!'
        }, req));
    });

    app.use(multer({
        dest: './views/resources/images/uploads/',
        /*rename: function (fieldname, filename) {
         return filename+Date.now();
         },*/
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
            file_upload_done = false;
        },
        onFileUploadComplete: function (file) {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
            file_upload_done = true;
        }
    }));
};