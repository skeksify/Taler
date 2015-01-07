/**
 * Created by Skeksify on 12/11/14.
 */

var conn = require("../db.js"); // DB

var actions = {
    create_game:
        function (){
            var view = require("../../controllers/create_game.js"); // Controller
            return view.get_view();
        },

    storyline_editor:
        function (){
            var view = require("../../controllers/storyline_editor.js"); // Controller
            return view.get_view();
        },

    save_playground: function(params, callback){
        if(!conn.isInit())
            conn.init_connection();
        conn.save_playground('1', params, callback);
    },

    create_character:
        function(){
            var view = require("../../controllers/create_character.js"); // Controller
            return view.get_view();
        }
};

for(var Action_Name in actions){
    exports[Action_Name] = actions[Action_Name];
}

function cl($var) {
    console.log($var);
}