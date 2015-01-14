
var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
//mongodb://<dbuser>:<dbpassword>@ds053139.mongolab.com:53139/taler
var dbPort 		= 53139;
var dbHost 		= 'ds053139.mongolab.com';
var dbName 		= 'taler';

/* establish the database connection 1318006befbc58fd8611725822895b28 */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
        // Authenticate
        db.authenticate('skeksify', '1318006befbc58fd8611725822895b28', function(err, result) {
            if(err)
                console.log(err);
            else
                console.log('Connected to database :: ' + dbName + ' on ' + dbHost);
        });
	}
});
var accounts = db.collection('accounts');


exports.autoLogin = function(user, pass, callback){
    accounts.findOne({user:user}, function(e, o) {
        if (o)
            o.pass == pass ? callback(o) : callback(null);
        else
            callback(null);
    });
}


exports.manualLogin = function(user, pass, callback){
    accounts.findOne({user:user}, function(e, o) {
        if (o == null){
            callback('user-not-found');
        }	else{
            validatePassword(pass, o.pass, function(err, res) {
                if (res){
                    callback(null, o);
                }	else{
                    callback('invalid-password');
                }
            });
        }
    });
}

exports.addNewAccount = function(newData, callback){
    accounts.findOne({user: newData.user}, function(e, o) {
        if (o){
            callback('username-taken');
        } else {
            accounts.findOne({email: newData.email}, function(e, o) {
                if (o){
                    callback('email-taken');
                } else {
                    saltAndHash(newData.pass, function(hash){
                        newData.pass = hash;
                        // append date stamp when record was created //
                        newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                        accounts.insert(newData, {safe: true}, callback);
                    });
                }
            });
        }
    });
}

var saltAndHash = function(pass, callback){
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}

var generateSalt = function(){
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}


var validatePassword = function(plainPass, hashedPass, callback){
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
}
