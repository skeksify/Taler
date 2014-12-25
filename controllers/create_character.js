/**
 * Created by Skeksify on 12/25/14.
 */


var fs = require("fs");
var _ = require("underscore");

function editor(){
    var view = read_template('create_character');
    var metadata = {
        headerTitle: 'Storyline Editor',
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
    result.push(editor());
    result.push(footer());
    return result.join('\r\n');
}


function read_template(file){
    return fs.readFileSync("views/"+file+"._",'utf8');
}