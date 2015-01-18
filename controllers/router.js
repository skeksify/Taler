/*
var CT = require('./modules/country-list');
var EM = require('./modules/email-dispatcher');
*/
var AM;// = require('../modules/account-manager');
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

module.exports = function(app) {

    app.get( '/', function(req, res){
        if (req.cookies.user == undefined || req.cookies.pass == undefined){ // No saved cookies
            res.redirect('/home');
        } else { // Has cookies
            if (req.session.user == null){
                AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
                    if (o != null){ // Login successful
                        console.log('Got '+o.user+' in through kookie');
                        req.session.user = o;
                        res.redirect('/home');
                    } else
                        res.json({ success: false, error: 'bad-cookies' });
                });
            } else //Logged in
                res.redirect('/home');
        }
    });

    app.post( '/upload', function(req, res){
        if(file_upload_done)
            if(req.files)
                res.json({success: true, file: req.files.name});
    });

    app.get( '/home', function(req, res){
        console.log(req.files);
        res.render('home', add_flavors({
            page: 'home',
            page_title: 'Home'
        }, req));
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
                    res.redirect('/home');
            });
        else //Not Logged
            res.redirect('/home');
    }); // Work on a game! getGame

    app.get( '/make/my-games', function(req, res){
        if(logged(req))
            AM.getGames(req.session.user._id, function(e, o){
                res.render('my_games', add_flavors({
                    page: 'my_games',
                    page_title: 'My Games',
                    my_games: o
                }, req));
            });
        else //Not Logged
            res.redirect('/home');
    });

    app.post('/make/save_game', function(req, res){
        if(logged(req))
            AM.saveGame({_id: req.param('game_id'), owner: req.session.user._id , playgrounds: req.param('playgrounds')}, function(e){
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
            console.log(req.session.user);
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
            res.redirect('/home');
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

    app.post('/users/logout', function(req, res){
        req.session.destroy();
        req.session = null;
        res.redirect('/home');
    });

    app.get( '/users/signup', function(req, res){
        if(logged(req))
            res.redirect('/home')
        else
            res.render('signup', add_flavors({
                page: 'signup',
                page_title: 'Sign Up'
            }, req));
    });

    app.post('/users/signup', function(req, res){
        AM.addNewAccount({
            email 	: req.param('email'),
            user 	: req.param('username'),
            pass	: req.param('password')
        }, function(e) {
            if (e)
                res.json({ success: false, error: e});
            else
                res.json({ success: true });
        });
    });

    app.get( '/game/create_character', function(req, res){
        if(logged(req))
            res.render('create_character', add_flavors({
                page: 'create_character',
                page_title: 'Create Character'
            }, req));
        else //Not Logged
            res.redirect('/home');
    });

    app.post(/^\/json\/(.+)\/(.+)$/ , function(req, res){
        var paramies = req.params;
        switch(paramies[0]){
            case 'game':
                if(paramies[1]=='save_playground'){
                    // Use a db object from above
                    res.send('{success: true}');
                }
                break;
        }
    });

    app.get( '/favicon.ico', function(req, res, next){ if(0) next(); } );

    app.get('*', function(req, res) {
        res.render('404', {
            page: '404',
            page_title: 'Unfound!'
        });
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