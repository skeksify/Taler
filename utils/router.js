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
            actions: ['create','storyline_editor','create_character']
        }
    },
    jsons: {
        'game': {
            path: '../models/play/game.js',
            actions: ['save_playground']
        }
    }
}

var regex_cases = {
    json: {
        regex: /^\/json\/(.+)\/(.+)$/,
        director: function (params) {
            console.log('Serving JSON!');
            if (json = allowed.jsons[params[1]]) {
                if (json.actions.inArray(params[2])) {
                    return {
                        type: 'json',
                        path:  json.path
                    }
                } else { cl('Action (' + params[2] + ') not allowed') }
            } else { cl('Model (' + params[1] + ') not allowed') }
        }
    },
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
        director: function (params) { // Params are the captures from this Regex, prepared outside
            if (model = allowed.models[params[1]]) {
                if (model.actions.inArray(params[2])) {
                    return {type: 'markup', path: model.path};
                } else { cl('Action (' + params[2] + ') not allowed') }
            } else { cl('Model (' + params[1] + ') not allowed') }
        }
    }
}

function get_action(path, params) {
    var pathName = url.parse(path).pathname;
    var queryName = url.parse(path).query;

    for (var key in regex_cases) {
        if (result = regex_cases[key].regex.exec(path)) {
            if (direction = regex_cases[key].director(result)) {
                //cl('Returning '+direction.type);
                if (direction.type == 'resource') {
                    return { success: true, type: 'resource', path: direction.path, cType: direction.cType };
                } else {
                    var modelObj = require(direction.path);
                    if (typeof(return_function = modelObj[result[2]]) == 'function') {
                        // Return the result of the end function, with the proper arguments sent
                        var result = return_function(params);
                        return { success: true, type: direction.type, view: result };
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