/**
 * Created by Skeksify on 12/8/14 08:43.
 */

var mongoose = require("mongoose");
var playgroundSchema,playgroundModel;
var initialized = false;
function init_connection(){

    mongoose.connect('mongodb://localhost/Taler');

    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () { cl("Connection to MongoDB Established.") });

    playgroundSchema = mongoose.Schema({
        'owner': Number,
        'playground[]': [mongoose.Schema.Types.Mixed]
    });
    playgroundModel = mongoose.model('Playground', playgroundSchema);
    initialized = true;
    return;
}
exports.isInit = function(){ return initialized }

exports.init_connection = init_connection;

exports.save_playground = function(user, playground) {
    cl('coming to save playground to '+user);
    var new_to_store = {
        'owner': user,
        'playground[]': JSON.parse(playground.playground)
    };
    cl('-------------------------------');
    cl(new_to_store);
    cl('-------------------------------');
    var myPlayground = new playgroundModel(new_to_store);
    myPlayground.save(function (err, saved_playground) {
        if (err) {console.error(err); return {success: false}}
        else cl('Saved!');

        return {success: true, view: 'a'+saved_playground._id};
        //saved_playground should be == params?
    });
}



function cl($var){
    console.log($var);
}
/*


var conn = require("../Taler/models/db.js"); // DB
conn.init_connection();
var result = conn.save_playground('1', {boards: [1,2,3]});
 */