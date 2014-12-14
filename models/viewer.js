/**
 * Created by Skeksify on 12/11/14.
 */

function get_view(view_key){
    if(['simple_page'].inArray(view_key)){
        return require("./viewes/"+view_key+".js");
    }
}

exports.get_view = get_view;