/**
 * Created by Skeksify on 1/13/15.
 */

var Tmed = 500;
var my_games_loaded = false;


$(document).ready(function(){
    $('#new_entry_labelI').on('focus', function(){ this.select(); });
    $('.my_games_link').unbind().click(loadGameList);
    $('#konssl .x').click(function(){$('#konssl').fadeOut()})
    $('#fire_signup').click(function(){
        open_dialog('Sign Up', function(){
            var settings = {
                username: $('#signup_username').val(),
                password: $('#signup_password').val(),
                email: $('#signup_email').val()
            }
            if(settings.username && settings.password){
                var fail = function(){ alert('Signup Failed, please report to Ben if trying again doesn\'t help (Maybe even a refresh?)') };
                show_msg('<i class="fa fa-spinner fa-pulse"></i> Working...', function(){
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: '/users/signup',
                        data: settings,
                        success: function(result){
                            if(result.success){
                                setActionBoxOk(close_dialog);
                                show_msg('Success!<br /><br />You may log in');
                            }
                            else
                                fail()
                        },
                        error: fail
                    });
                });
            }
        })
    });
    $('#fire_login').click(function(){
        var jthat = $(this);
        var settings = {
            username: $('#loginun').val(),
            password: $('#loginps').val(),
            rm: $('#loginrm:checked').length==1
        }
        if(settings.username && settings.password){
            jthat.html('<i class="fa fa-spinner fa-pulse"></i> Working...');
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
                        jthat.html(result.error.replace(/-/g,' '));
                },
                error: function(){ jthat.html('Failed') }
            });
        } else
            jthat.html('Fill both in...');
    });

    $('#action_box_id .bottom-bar .cancel').click(close_dialog);
});

var indicator_manager = function(who, onoff){
    switch (who){
        case 'save_game':
            if(onoff && onoff.toLowerCase()!='off'){ // On
                $('#save_game').css('cursor', 'wait');
                $('#save_game_loader').fadeIn(200).css("display","inline-block");
            }
            else{
                $('#save_game').css('cursor', 'pointer');
                $('#save_game_loader').fadeOut(200);
            }
            break;
    }
}

var loadGameList = function(){
    if(!my_games_loaded){
        $('#games_list').html('<li class="dropdown-header" style="font-size: 16px;"><i class="fa fa-spinner fa-pulse"></i> Loading...</li>');
        $.ajax({
            type: 'get',
            url: '/make/my-games',
            success: function(result){
                $('#games_list').html(result);
                my_games_loaded = true;
                $('#new_game_btn').click(newGame)
            }
        });
    }
}
var newGame = function(){
    resetActionboxValues();
    open_dialog('New Game', function(){
        var settings = {
            title: $('#new_game_titleI').val(),
            teaser: $('#new_game_teaserI').val()
        }
        if(settings.title)
            show_msg('<i class="fa fa-spinner fa-pulse"></i> Working...', function(){
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/make/create_game',
                    data: settings,
                    success: function(result){
                        if(result.success) {
                            my_games_loaded = false;
                            loadGameList();
                            setActionBoxOk(close_dialog);
                            show_msg('Success!');
                            eureka('.my_games_link');
                        } else
                            show_msg('Error!<br>'+result.error);
                    },
                    error: function(){ show_msg('Failed') }
                });
            });
    })
}

function open_dialog(dialog, okFunction){
    setActionBoxOk(okFunction);
    var dialogs = {
        'New Action': 'action-form-wrapper',
        'New Entry': 'entry-form-wrapper',
        'New Reply': 'reply-form-wrapper',
        'New Board': 'board-form-wrapper',
        'New Game': 'game-form-wrapper',
        'New Playground': 'playground-form-wrapper',
        'Edit Entry': 'entry-form-wrapper',
        'Edit Reply': 'reply-form-wrapper',
        'Edit Board': 'board-form-wrapper',
        'Sign Up': 'signup-form-wrapper',
        'msg': 'msg'
    };
    var box_div = $('#action_box_id');
    var form_wrapper_div = $('.'+dialogs[dialog], box_div);
    var bottom_bar_div = $('.bottom-bar', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    if(dialog!='msg'){
        $('.msg', box_div).hide();
        $('.top-bar', box_div).html('<div>'+dialog+'</div>');
        $('.wrappers-wrapper').show();
    }
    else
        $('.wrappers-wrapper').hide();
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
        resetActionboxValues();
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


var resetActionboxValues = function(who){
    if(who || !who){
        $('#action_box_id input:not([type=radio]), #action_box_id textarea').val('');
        $('input[name=new_board_type][value=con]').prop('checked', true);
        $('input[name=new_action_effect][value=redirect]').prop('checked', true);
    }
}

function setActionBoxOk(func){
    var ok = $('#action_box_id .ok').unbind();
    if(isFu(func))
        ok.click(func);
}


// Utils //

function isUn(o){ return typeof (o)=='undefined'; }
function isSt(o){ return typeof (o)=='string'; }
function isOb(o){ return typeof (o)=='object'; }
function isFu(o){ return typeof (o)=='function'; }
function mjs(){ return JSON.stringify(playgrounds); }
function cl(c){ eureka($('.text', $('#konssl').fadeIn()).prepend('<div><div class="cont">'+c+'</div><div class="time">'+getShortTime()+'</div><div class="clr"></div></div>').scrollTop(0)) };


var getShortTime = function(){
    function pad(x){ return !x ? '00':(x<10 ? ('0'+x) : x) }
    var now = new Date();
    return pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
}

function eureka(jQuery_str, box){
    var obj = $(jQuery_str);
    var boxtext = box ? 'Box' : 'Text';
    var withSh = 'yellow'+boxtext+'Shadow';
    var withoSh = 'fadeOut'+boxtext+'Shadow';
    obj.addClass(withSh);
    setTimeout(function(){
        obj.addClass(withoSh);
        setTimeout(function(){
            obj.removeClass(withoSh).removeClass(withSh);
        }, 3000);
    }, 1000);
}


// Override alert!
alert = function(v, cb) {
    var box_div = $('#action_box_id');
    $('.top-bar', box_div).html('<div>Info</div>');
    $('.msg', box_div).html(v);
    open_dialog('msg', (isFu(cb) ? cb : close_dialog));
}

