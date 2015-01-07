/**
 * Created by Skeksify on 12/8/14 07:55.
 */

var http = require("http");
var fs = require("fs");
var qs = require('querystring');

function init_server(get_action) {
    function on_request(request, response) {
        function respond(params){
            if(/^\/json\/(.+)$/.test(request.url)){ //Asynch
                get_action(request.url, params, function(result){
                    if (result.success) {
                        response.writeHead(200, {"Content-Type": "application/json"});
                        var ress = (typeof (result.view)=='object') ? JSON.stringify(result.view) : result.view;
                        if(ress)
                            response.write(ress);
                        response.end();
                    }
                });
            } else {
                var result = get_action(request.url, params);
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
        }
        /*******************/
        if (request.method == 'POST') {
            var body = '';
            request.on('data', function (data) {
                body += data;
                if (body.length > 1e6) // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                    request.connection.destroy();
            });
            request.on('end', function () {
                var POST = qs.parse(body);
                respond(POST);
            });
        } else
            respond();

    }

    http.createServer(on_request).listen(8888);
}

exports.init_server = init_server;


function cl($var) {
    console.log($var);
}