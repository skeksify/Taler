/**
 * Created by Skeksify on 12/11/14.
 */

var actions = {
    create_game:
        function (key){
            var view = require("../../controllers/create_game.js"); // Controller
            return view.get_view(key);
        },

    storyline_editor:
        function (key){
            var view = require("../../controllers/storyline_editor.js"); // Controller
            return view.get_view(key);
        },

    create_character:
        function(key){
            var view = require("../../controllers/create_character.js"); // Controller
            return view.get_view(key);
        }
};

for(var Action_Name in actions){
    exports[Action_Name] = actions[Action_Name];
}
