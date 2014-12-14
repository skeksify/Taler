/**
 * Created by Skeksify on 12/11/14.
 */


function dw(key){
    var view = require("../../views/simple_page.js");
    return view.get_view(key);
}

exports.dd = dw;