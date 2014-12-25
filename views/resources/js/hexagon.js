/**
 * Created by Skeksify on 12/25/14.
 */

function draw_hexagon() {
    var create_character_canvas = document.getElementById("hexagon");
    var context = create_character_canvas.getContext('2d');

    function hex(context, params) {
        var rad = params.rad;
        var x = params.cx;
        var y = params.cy;
        context.beginPath();

        context.moveTo(x + rad, y - rad / 2); //Right Upper
        context.lineTo(x, x - rad); //Upper
        context.lineTo(x - rad, y - rad / 2); //Left Upper
        context.lineTo(x - rad, y + rad / 2); //Left Downer
        context.lineTo(x, y + rad); //Downer
        context.lineTo(x + rad, y + rad / 2); //Right Downer

        context.closePath();
        context.stroke();
    }

    function hex_diagonals(context, params){
        var rad = params.rad;
        var x = params.cx;
        var y = params.cy;

        context.beginPath();
        context.moveTo(x, y - rad); //Upper
        context.lineTo(x, y + rad); //Downer
        context.stroke();

        context.moveTo(x  - rad, y - rad/2); //Left Upper
        context.lineTo(x +rad, y +rad/2); //Right Downer
        context.stroke();

        context.moveTo(x  - rad, y + rad/2); //Left Upper
        context.lineTo(x +rad, y -rad/2); //Right Downer
        context.stroke();

    }

    hex(context, {cx: 200, cy: 200, rad: 50});
    hex(context, {cx: 200, cy: 200, rad: 100});
    hex(context, {cx: 200, cy: 200, rad: 150});
    hex_diagonals(context, {cx: 200, cy: 200, rad: 150});
}

$(document).ready(function () {
    draw_hexagon();
})