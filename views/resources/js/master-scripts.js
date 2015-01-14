/**
 * Created by Skeksify on 1/13/15.
 */

var Tmed = 500;

$(document).ready(function(){
    $('#fire_signup').click(function(){ window.location = '/users/signup'});
    $('#fire_login').click(function(){
        var jthat = $(this);
        var settings = {
            username: $('#loginun').val(),
            password: $('#loginps').val(),
            rm: $('#loginrm:checked').length==1
        }
        if(settings.username && settings.password){
            jthat.html('Working...');
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: '/users/login',
                data: settings,
                success: function(result){
                    if(result.success) {
                        jthat.html('Success!');
                        setTimeout(function(){ window.location = '/'}, 1000)
                    } else
                        jthat.html(result.error);
                },
                error: function(){ jthat.html('Failed') }
            });
        } else
            jthat.html('Fill both in...');
    });

    $('#action_box_id .bottom-bar .cancel').click(close_dialog);
});



function open_dialog(dialog, okFunction){
    set_action_box_ok(okFunction);
    var dialogs = {
        'New Action': 'action-form-wrapper',
        'New Entry': 'entry-form-wrapper',
        'New Reply': 'reply-form-wrapper',
        'New Board': 'board-form-wrapper',
        'New Game': 'game-form-wrapper',
        'New Playground': 'playground-form-wrapper',
        'Edit Entry': 'entry-form-wrapper',
        'Edit Reply': 'reply-form-wrapper',
        'msg': 'msg'
    };
    var box_div = $('#action_box_id');
    var form_wrapper_div = $('.'+dialogs[dialog], box_div);
    var bottom_bar_div = $('.bottom-bar', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    if(dialog!='msg')
    $('.top-bar', box_div).html('<div>'+dialog+'</div>');
    form_wrapper_div.hide(); bottom_bar_div.show(); cancel_div.show().css('opacity',1);
    box_div.fadeIn(Tmed, function(){
        $('.wrappers-wrapper>div').fadeOut();
        form_wrapper_div.slideDown(600, function(){
            //bottom_bar_div.fadeIn(Tmed);
        });
    });
}

function show_msg(msg, cb){
    var box_div = $('#action_box_id');
    var msg_div = $('.msg', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    var cont_div = $('.fw:visible', box_div);
    msg_div.hide();
    cancel_div.animate({opacity: 0}, 200, 'linear');
    if(cont_div.length)
        cont_div.slideUp(Tmed, function(){
            msg_div.html(msg);
            msg_div.slideDown(Tmed, function(){
                if(isFu(cb))
                    cb();
            });
        });
    else{
        msg_div.html(msg);
        msg_div.slideDown(Tmed, function(){
            if(isFu(cb))
                cb();
        });
    }
}

function close_dialog(msg, cb, cbparams){
    var box_div = $('#action_box_id');
    var msg_div = $('.msg', box_div);
    var cont_div = $('.fw:visible', box_div);
    if(box_div.is(":visible")){
        $('#action_box_id input, #action_box_id textarea').val('');
        if(msg && isSt(msg)){
            show_msg(msg, function(){
                setTimeout(function(){
                    msg_div.slideUp(Tmed, function(){
                        box_div.fadeOut(Tmed);
                    });
                    if(isFu(cb))
                        cb(cbparams);
                }, 1500);
            });
        } else {
            cont_div.slideUp(Tmed, function(){
                box_div.fadeOut(Tmed);
            });
        }
    }
}

function set_action_box_ok(func){
    $('#action_box_id .ok').unbind().click(func);
}


// Utils //

function isUn(o){ return typeof (o)=='undefined'; }
function isSt(o){ return typeof (o)=='string'; }
function isOb(o){ return typeof (o)=='object'; }
function isFu(o){ return typeof (o)=='function'; }
function mj(){ return JSON.stringify(boards); }
function mjs(){ return JSON.stringify(playgrounds); }
function cl(c){ console.log(c) };



// Override alert!
alert = function(v) {
    var box_div = $('#action_box_id');
    $('.top-bar', box_div).html('<div>Info</div>');
    $('.msg', box_div).html(v);
    open_dialog('msg', close_dialog);
}

