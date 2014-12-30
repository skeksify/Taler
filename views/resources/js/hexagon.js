/**
 * Created by Skeksify on 12/25/14.
 */
var my_hex;

function draw_hexagon() {
    var create_character_canvas = document.getElementById("hexagon");
    var context = create_character_canvas.getContext('2d');
    var rad = 140;
    var levels = 7;
    var distance = rad / levels;
    var cosine = Math.cos(Math.PI/6);
    var vertices = {
        STR: function (x, y, rad) {
            return {x: x, y: y - rad};
        },
        DEX: function (x, y, rad) {
            return {x: x + rad*cosine, y: y - rad / 2};
        },
        CON: function (x, y, rad) {
            return {x: x + rad*cosine, y: y + rad / 2};
        },
        INT: function (x, y, rad) {
            return {x: x, y: y + rad};
        },
        WIS: function (x, y, rad) {
            return {x: x - rad*cosine, y: y + rad / 2};
        },
        CHA: function (x, y, rad) {
            return {x: x - rad*cosine, y: y - rad / 2};
        }
    }
    var abilityCaptions = {
        STR: {x: -10, y: -10},
        DEX: {x: 5, y: -5},
        CON: {x: 5, y: 5},
        INT: {x: -15, y: 20},
        WIS: {x: -45, y: 5},
        CHA: {x: -45, y: -5}
    }
    var firstSettings;

    function hex_grid(context, params) {
        var x = params.cx;
        var y = params.cy;
        if (1) { //Diagonals
            context.strokeStyle = '#333';
            context.beginPath();
            context.moveTo(vertices.STR(x, y, rad).x, vertices.STR(x, y, rad).y);
            context.lineTo(vertices.INT(x, y, rad).x, vertices.INT(x, y, rad).y);

            context.moveTo(vertices.CHA(x, y, rad).x, vertices.CHA(x, y, rad).y);
            context.lineTo(vertices.CON(x, y, rad).x, vertices.CON(x, y, rad).y);

            context.moveTo(vertices.WIS(x, y, rad).x, vertices.WIS(x, y, rad).y);
            context.lineTo(vertices.DEX(x, y, rad).x, vertices.DEX(x, y, rad).y);
            context.stroke();
        }
        for (var i = 0; i <= levels; i++) {
            context.strokeStyle = i == (levels - 2) ? '#ddd' : '#000';
            context.beginPath();
            context.moveTo(vertices.STR(x, y, rad - i * distance).x, vertices.STR(x, y, rad - i * distance).y); // Start with STR
            for (var Ability in vertices) {
                var nextPoint = vertices[Ability](x, y, rad - i * distance);
                context.lineTo(nextPoint.x, nextPoint.y);
                if (!i) {
                    context.font = 'italic 16px Verdana';
                    context.fillStyle = '#eee';
                    context.fillText(Ability, nextPoint.x + abilityCaptions[Ability].x, nextPoint.y + abilityCaptions[Ability].y);
                } else if(Ability=='DEX'){
                    context.font = 'italic 14px Arial';
                    context.fillStyle = '#eee';
                    var mod = levels-i-2;
                    context.fillText((mod>-1?'+':'')+mod, nextPoint.x-4, nextPoint.y);
                }
            }
            context.closePath();
            context.stroke();
        }
    }

    this.init = function (settings) {
        // Store first settings for later redraws of the grid
        if (settings) // First Init, regular
            firstSettings = settings;
        else // Not first, clear context
            context.clearRect(0, 0, firstSettings.width, firstSettings.height);
        hex_grid(context, {cx: firstSettings.width / 2, cy: firstSettings.height / 2}); // Rad here defines the outer hex
    }

    this.draw_set = function (set) {
        this.init();
        context.beginPath();
        context.strokeStyle = '#ff0';
        var x = firstSettings.width / 2;
        var y = firstSettings.height / 2;
        var start = {
            x: vertices.STR(x, y, (set.STR * distance) + (distance * 2)).x,
            y: vertices.STR(x, y, (set.STR * distance) + (distance * 2)).y
        };
        context.moveTo(start.x, start.y);
        for (var Ability in vertices) {
            var nextPoint = vertices[Ability](x, y, (set[Ability] * distance) + (distance * 2));
            context.lineTo(nextPoint.x, nextPoint.y);
        }
        context.lineTo(start.x, start.y);
        context.stroke();
    }

    this.drawFromCreateCharBoard = function(){
        var stats = {
            STR: $('#str_id').val(),
            DEX: $('#dex_id').val(),
            CON: $('#con_id').val(),
            INT: $('#int_id').val(),
            WIS: $('#wis_id').val(),
            CHA: $('#cha_id').val()
        }
        this.draw_set(stats);
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

$(document).ready(function () {
    my_hex = new draw_hexagon();

    my_hex.init({width: 420, height: 400});
    my_hex.drawFromCreateCharBoard();
})