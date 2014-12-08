/**
 * Created by Skeksify on 12/8/14 07:55.
 */

var http = require("http");

function init_server(get_action) {
    function on_request(request, response) {
        var result = get_action(request.url);
        if(request.url=='/favicon.ico')
            return;
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write('');
        response.end();
    }
    http.createServer(on_request).listen(8888);
}

exports.init_server = init_server;



function cl($var){
    console.log($var);
}