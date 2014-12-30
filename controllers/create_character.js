/**
 * Created by Skeksify on 12/25/14.
 */


var fs = require("fs");
var _ = require("underscore");

function editor(metadata){
    var view = read_template('create_character');
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
        headerTitle: 'New Character',
        submitButton: 'Create Character'
    };
    var headersActive = ['ccAc','cgAc'];
    for(var i in headersActive)
        metadata[headersActive[i]] = '';
    metadata.ccAc = ' class="active"';
    result.push(header(metadata));
    result.push(editor(metadata));
    result.push(footer(metadata));
    return result.join('\r\n');
}


function read_template(file){
    return fs.readFileSync("views/"+file+"._",'utf8');
}