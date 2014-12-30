/**
 * Created by Skeksify on 12/13/14.
 */

var fs = require("fs");
var _ = require("underscore");

function editor(metadata){
    var view = read_template('storyline_editor');
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
        headerTitle: 'Storyline Editor',
        submitButton: 'Create Game'
    };
    var headersActive = ['ccAc','cgAc'];
    for(var i in headersActive)
        metadata[headersActive[i]] = '';
    metadata.cgAc = ' class="active"';
    result.push(header(metadata));
    result.push(editor(metadata));
    result.push(footer(metadata));
    return result.join('\r\n');
}


function read_template(file){
    return fs.readFileSync("views/"+file+"._",'utf8');
}








