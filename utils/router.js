/**
 * Created by Skeksify on 12/8/14 09:01.
 */

var url = require("url");

var allowed = {
    models: {
        'character': {
            path: '../models/play/character.js',
            actions: ['create']
        }
    }
}

var regex_cases = {
    simple_path: {
        regex: /^\/([^\/]+)\/([^\/]+)\/*.*$/,
        director: function(params){
            if(model = allowed.models[params[1]]){
                if(model.actions.inArray(params[2])){
                    return model.path;
                } else { cl('Action ('+params[2]+') not allowed')}
            } else { cl('Model ('+params[1]+') not allowed')}
        }
    }
}

function get_action(path){
    var pathName = url.parse(path).pathname;
    var queryName = url.parse(path).query;

    for(var key in regex_cases){
        if(result = regex_cases[key].regex.exec(path)){
            if(requirePath = regex_cases[key].director(result)) {
                // To Do
                // Require Found Path and send his function
                console.log('Path found: '+requirePath);
                break;
            }
        }
    }


    return function(x){
        return x;
    };
}


exports.get_action = get_action;





function cl($var){console.log($var);}