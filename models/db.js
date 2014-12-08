/**
 * Created by Skeksify on 12/8/14 08:43.
 */

var mongoose = require("mongoose");

function init_connection(){

}
//Connect
mongoose.connect('mongodb://localhost/Taler');

var Schema = mongoose.Schema;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () { cl("Connection to MongoDB Established.") });









function cl($var){
    console.log($var);
}