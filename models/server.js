/**
 * Created by Skeksify on 12/8/14 07:55.
 */

var http = require("http");
var fs = require("fs");

function init_server(get_action) {
    function on_request(request, response) {
        var result = get_action(request.url);
        if (result.success) {
            switch (result.type) {
                case 'markup':
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(result.view);
                    response.end();
                    break;
                case 'resource':
                    var encoding = (!result.cType.indexOf('image/'))?'binary':'utf8';
                    fs.readFile(result.path, encoding, function (err, data) {
                        if(err)
                            return console.error(err);
                        response.writeHead(200, {"Content-Type": result.cType});
                        response.end(data, encoding);
                    });
                    break;
            }
        } else {
            response.writeHead(404);
            response.end();
            //console.error(result.error);
        }
    }

    http.createServer(on_request).listen(8888);
}

exports.init_server = init_server;


function cl($var) {
    console.log($var);
}