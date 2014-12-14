/**
 * Created by Skeksify on 12/8/14 07:51.
 */

Array.prototype.inArray = function(str){
    return this.indexOf(str)>-1;
}

var global_models = {
    router: require("./utils/router.js"),
    server: require("./models/server.js"),
    dbconn: require("./models/db.js")
};

global_models.server.init_server(global_models.router.get_action)

