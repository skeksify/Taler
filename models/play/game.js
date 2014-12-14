/**
 * Created by Skeksify on 12/11/14.
 */

function create_game(key){
    var view = require("../../controllers/create_game.js"); // Controller
    return view.get_view(key);
}

function storyline_editor(key){
    var view = require("../../controllers/storyline_editor.js"); // Controller
    return view.get_view(key);
}


exports.create = create_game;
exports.storyline_editor = storyline_editor;