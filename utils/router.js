/**
 * Created by Skeksify on 12/8/14 09:01.
 */

var url = require("url");

var allowed = {
    models: {
        'character': {
            path: '../models/play/character.js',
            actions: ['create', 'dd']
        },
        'game': {
            path: '../models/play/game.js',
            actions: ['create','storyline_editor']
        }
    }
}

var regex_cases = {
    resource: {
        regex: /^\/r(s|i|j)\/(.+)\.(jpeg|jpg|gif|png|css|js)$/,
        director: function (params) {
            switch (params[1]) {
                case 's': // Stylesheet
                    return {
                        type: 'resource',
                        path: 'views/resources/styles/' + params[2] + '.css',
                        cType: 'text/css'
                    };
                    break;
                case 'i': // Image
                    return {
                        type: 'resource',
                        path: 'views/resources/images/' + params[2] + '.' + params[3],
                        cType: 'image/'+(params[3]=='jpg'?'jpeg':params[3])
                    };
                    break;
                case 'j': // Script
                    return {
                        type: 'resource',
                        path: 'views/resources/js/' + params[2] + '.js',
                        cType: 'application/javascript'
                    };
                    break;
            }
        }
    },
    model: {
        regex: /^\/([^\/]+)\/([^\/]+)\/*(.*)$/,
        director: function (params) { // Params are the captures from the Regex, prepared outside
            if (model = allowed.models[params[1]]) {
                if (model.actions.inArray(params[2])) {
                    return {type: 'markup', path: model.path};
                } else { cl('Action (' + params[2] + ') not allowed') }
            } else { cl('Model (' + params[1] + ') not allowed') }
        }
    }
}

function get_action(path) {
    var pathName = url.parse(path).pathname;
    var queryName = url.parse(path).query;

    for (var key in regex_cases) {
        if (result = regex_cases[key].regex.exec(path)) {
            if (direction = regex_cases[key].director(result)) {
                cl('Returning '+direction.type);
                if (direction.type == 'resource') {
                    return { success: true, type: 'resource', path: direction.path, cType: direction.cType };
                } else {
                    var modelObj = require(direction.path);
                    if (typeof(return_function = modelObj[result[2]]) == 'function') {
                        // Return the result of the end function, with the proper arguments sent
                        return { success: true, type: 'markup', view: return_function(result[3]) };
                    } else {
                        console.error("Allowed action not implemented" + result[2] + "|||");
                        return { success: false, error: 13};
                    }
                }
            }
        }
    }
    return { success: false, error: 11};
}


exports.get_action = get_action;


function cl($var) {
    console.log($var);
}