/**
 * Created by Skeksify on 1/13/15.
 */

var Tmed = 500;
var my_games_loaded = false;
var tc, game_id, tut_step_indication;
var key = 'breadcrumbs';
var background_cycler = 1;

var logo = new Image();
logo.onload = function (x) {
    if (background_cycler < 4) {
        setTimeout(function () {
            logo.src = '../ri/def_theme/bg-pack/bg' + background_cycler++ + '.jpg';
            console.log('just pulled ;'+logo.src);
            $('body').css('background-image','url("'+logo.src+'")');
        }, 7500);
        console.log('prepared '+background_cycler);
    } else {
        logo.src = '../ri/def_theme/bg-pack/bg' + (background_cycler = 1) + '.jpg';
        console.log('just pulled ;'+logo.src);
        $('body').css('background-image','url("'+logo.src+'")');
    }
};

var background_i = 1;
var back_img = new Image(), new_image, back_img_fade_velocity = 6200;

goBackground = function(){
    if(background_i>11)
        background_i = 1;
    console.log('Cycling '+background_i);
    back_img.onload = function(){
        new_image = $('<div />').css('display', 'none').css('background-image','url("'+back_img.src+'")').appendTo('.background');
        $('.background div:visible').fadeOut(back_img_fade_velocity, function(){ $(this).remove(); });
        new_image.fadeIn(back_img_fade_velocity);
        console.log('Body set to: '+back_img.src);
    };
    back_img.src = '../ri/def_theme/bg-pack/bg' + background_i++ + '.jpg';
};
if(1)
    var back_interval = setInterval(goBackground, 20000);




var pathMaker = function (pstr) {
    var p = isSt(pstr) ? pstr.split(',') : pstr;
    var res = '.boards>[breadcrumbs="' + p.splice(0, 1) + '"]>.board-scroller>.drawing_board>'
    for (var i in p)
        res += !isNaN(parseInt(p[i])) ?
            (('[' + key + '="' + p[i] + '"]>.replyHolder>') + ((i != (p.length - 1)) ? '.tableBox>' : '')) :
            ('[' + key + '="' + p[i] + '"]>.replyHolder>');
    return res;
}

function slidelinetut() {
    var line_el = $(pathMaker('0,+,0,+') + ' [' + key + ']').addClass('tut-show');
    var addnew_el = $(pathMaker('0,+,0,+') + ' div:not(.entryLabel, [' + key + '], .curled)');
    var balloon = $('.trip-block').addClass('no-events');
    var lFix = parseInt(balloon.css('width')) / 2;
    var tFix = parseInt(balloon.css('height'));
    var addFix = parseInt($(pathMaker('0,+,0,+,0,+') + ' div:not(.entryLabel, [' + key + ']) .replyHolder').css('width')) / 2 + 10; //Padding
    balloon.animate({ // Go to top of line
        top: line_el.offset().top - tFix,
        left: line_el.offset().left - lFix
    }, 1000, function () {
        $('#tut_balloon_label').html('Right....');
        setTimeout(function () { // Pause
            balloon.animate({ // Go down the line
                top: addnew_el.offset().top - tFix
            }, 1000, function () {
                line_el.removeClass('tut-show');
                balloon.animate({ // Go right to the +
                    left: addnew_el.offset().left - lFix + addFix
                }, 400, function () {
                    $('#tut_balloon_label').html('Here!');
                });
            });
        }, 300)
    })
}

var tripController = function (params) {
    params = params || {};
    var step = 0, dt = 3500;
    var started = false;
    var trip;

    var toptions = {
        delay: params.delay || -1,
        tripTheme: params.theme || 'white',
        enableKeyBinding: false,
        showNavigation: true
    };
    var trips = {
        tutorials_trip: [
            {
                sel: $('#tutorials'),
                content: 'Start here!',
                position: 'e',
                delay: 0 + dt
            }
        ],
        terminology_trip: [
            {
                content: 'Games are built of <p class="b">Conversation</p> and <p class="b">Area</p> interactions<br/><br/> ' +
                    'A conversation interaction is between the player and a character you create<br/>' +
                    'An area interaction is between the player and an area you create<br/>' +
                    'Those, are made of three building blocks:',
                position: 'screen-center',
                delay: -1
            },
            {
                sel: $('#legend .entryLabel'),
                content: 'Entries<br/> ' +
                    'In a conversation, an entry is what the character you create tells the player<br/>' +
                    'In an area, an entry would describe the current area around the player' +
                    '<script>showHidePanels("legend", false);</script>',
                position: 'w',
                delay: -1
            },
            {
                sel: $('#legend .replyLabel'),
                content: 'Options<br/> ' +
                    'In a conversation, an option would be what the player can answer<br/>' +
                    'In an area, an option describes what the player can do here',
                position: 'w',
                delay: -1
            },
            {
                sel: $('#legend .actionLabel'),
                content: 'Actions<br/> ' +
                    'Enable you to make your games dynamic' +
                    '<script>$("#tut_1").show(); eureka("#tutorials", true); </script>',
                position: 'w',
                delay: -1
            }
        ],
        workspace_trip: [
            {
                sel: pathMaker('0,+') + '.entryLabel',
                content: 'The player starts here! (First Entry)',
                position: 'n',
                delay: 2000 + dt
            },
            {
                sel: pathMaker('0,+') + '.entryLabel',
                content: 'Each "Entry" has its options on its right',
                position: 's',
                delay: 1500 + dt
            },
            {
                sel: pathMaker('0,+,0') + '.replyLabel',
                content: 'Here, there\'s only one option, "Continue"',
                position: 'n',
                delay: 2500 + dt
            },
            {
                sel: pathMaker('0,+,0,+') + '.entryLabel',
                content: 'When the player clicks "Continue", he will arrive here!<br />This Entry has <p class="i">two</p> options',
                position: 'n',
                delay: 2500 + dt
            },
            {
                sel: pathMaker('0,+,0,+,0') + '.replyLabel',
                content: 'This one...',
                position: 'n',
                delay: 2500
            },
            {
                sel: pathMaker('0,+,0,+,1') + '.replyLabel',
                content: 'And this one!',
                position: 'n',
                delay: 2500
            },
            {
                content: 'This structure, in a way, is like a tree: The player begins at its root and climbes up making choices which affect where he\'ll get.<br />' +
                    'It is your job to layout the player\'s possible path(s), according to your preferred <p class="i">epic</p> destination<br />' +
                    '<script>$("#tut_2").show(); eureka("#tutorials", true); </script>',
                position: 'screen-center',
                delay: -1
            }
        ],
        entries_options_trip: [
            {
                sel: pathMaker('0,+') + '.entryLabel',
                content: 'Right click here to see this entry\'s content' +
                    '<script>tut_step_indication = "open_floater_first";</script>',
                position: 'n',
                delay: -1
            },
            {
                sel: '#floater .content',
                content: 'Here you can see what the player would see, when arriving to this Entry',
                position: 's',
                delay: 3500 + dt
            },
            {
                sel: '#floater .edit',
                content: 'Click here to Edit!' +
                    '<script>tut_step_indication = "edit_first_entry";</script>',
                position: 'e',
                delay: -1
            },
            {
                sel: $('#new_entry_labelI'),
                content: '<p class="">Label</p><br/>For your eyes only',
                position: 'e',
                delay: 1750 + dt
            },
            {
                sel: $('#new_entry_speechI'),
                content: '<p class="">Description</p><br/>What the player sees',
                position: 'e',
                delay: 1750 + dt
            },
            {
                sel: $('#action_box_id .ok'),
                content: 'Change something, and click here!' +
                    '<script>tut_step_indication = "edit_first_entry_done";</script>',
                position: 'e',
                delay: -1
            },
            {
                sel: '#konssl',
                content: 'Updated!',
                position: 'n',
                delay: 0 + dt
            },
            {
                sel: pathMaker('0,+,0') + '.replyLabel',
                content: 'Now let\'s edit an Option!' +
                    '<script>tut_step_indication = "edit_first_reply";</script>',
                position: 'e',
                delay: -1
            },
            {
                sel: $('#new_reply_labelI'),
                content: 'Options have no description, and the player sees the label' +
                    '<script>tut_step_indication = "edit_first_reply";</script>',
                position: 'e',
                delay: 2000 + dt
            },
            {
                sel: $('#new_reply_condI'),
                content: 'We\'ll get to this one later ;) Leave it blank' +
                    '<script>tut_step_indication = "done_edit_first_reply";</script>',
                position: 'e'
            },
            {
                sel: '#konssl',
                content: 'Updated!',
                position: 'n',
                delay: 0 + dt
            },
            {
                content: 'Now let\'s see how to add new ones!' +
                    '<script>$("#tut_3").show(); eureka("#tutorials", true); </script>',
                position: 'screen-center',
                delay: 3000 + dt
            }
        ],
        new_entries_options_trip: [
            {
                sel: pathMaker('0,+,0,+') + '.entryLabel',
                content: 'To add a new option to this entry, for example...',
                position: 'n',
                delay: 1500 + dt
            },
            {
                sel: pathMaker('0,+,0,+') + '.entryLabel',
                content: '<div id="tut_balloon_label">Click...</div>' +
                    '<script>tut_step_indication="add_first_reply"; setTimeout(slidelinetut, 600)</script>',
                position: 'n',
                delay: -1
            },
            {
                sel: $('#new_reply_labelI'),
                content: 'Hmm, I wonder what else could the player do in the room...' +
                    '<script>tut_step_indication="add_first_reply_done"; $(".trip-block").removeClass("no-events")</script>',
                position: 'e',
                delay: -1
            },
            {
                sel: pathMaker('0,+,0,+,2') + '.replyLabel',
                content: 'Nice! Here\'s the new Option',
                position: 'e',
                delay: 1000 + dt
            },
            {
                sel: pathMaker('0,+,0,+,2') + '.replyLabel .fa-plus',
                content: 'New Entry',
                position: 's',
                delay: 650 + dt
            },
            {
                sel: pathMaker('0,+,0,+,2') + '.replyLabel .fa-bolt',
                content: 'New Action',
                position: 's',
                delay: 650 + dt
            },
            {
                content: 'You already know too much! Go play!' +
                    '<script>$("#tut_4").show(); eureka("#tutorials", true); </script>',
                position: 'screen-center',
                delay: 1500 + dt
            }
        ]
    };

    this.start = function (selected_trip, params) {
        var which_trip = trips[selected_trip + '_trip'];
        toptions.showNavigation = (selected_trip != 'entries_options' && selected_trip != 'new_entries_options' && selected_trip != 'tutorials');
        if ((which_trip[0].sel && which_trip[0].sel.length) || !which_trip[0].sel) {
            trip = new Trip(which_trip, toptions);
            trip.start();
            started = true;
            return this;
        }
    }
    this.next = function (if_this_stage) {
        var go = isUn(if_this_stage) ? true : (step === if_this_stage);
        if (trip && started && go) {
            trip.next();
            step++;
            return this;
        }
    }
    this.prev = function (if_this_stage) {
        var go = isUn(if_this_stage) ? true : (step === if_this_stage);
        if (trip && started && go) {
            trip.prev();
            step--;
            return this;
        }
    }
    this.pp = function () {
        if (trip && started) {
            trip.pause();
            return this;
        }
    }

    this.getStep = function () {
        return step;
    }
    this.hide = function () {
        $('.trip-block').fadeOut(250);
    }
}


function showHidePanels(panel, hide) {
    if ((el = $('#' + panel)).length) {
        var check = $('#sh' + panel.substr(0, 3) + ' .fa-check');
        if (hide) {
            el.hide();
            check.hide();
            localStorage.setItem(panel, 'hidden');
        } else {
            el.show();
            check.show();
            localStorage.setItem(panel, '');
        }
    }
}

$(document).ready(function () {
    tc = new tripController();
    $(document).keyup(function (e) {
        if (e.which == 32 && !$(e.target).is('input') && !$(e.target).is('textarea')) tc.pp()
    });
    $(document).keydown(function (e) {
        if (e.which == 32 && !$(e.target).is('input') && !$(e.target).is('textarea')) {
            console.log(e.preventDefault())
        }
    })


    //$('body').click(function(){cl(parseInt(Math.random()*100))})


    if (localStorage.getItem('tutorials') != 'hidden')
        showHidePanels('tutorials', false); //Show
    if (localStorage.getItem('legend') != 'hidden')
        showHidePanels('legend', false);

    $('#shtut').click(function () {
        showHidePanels('tutorials', $('#tutorials').is(':visible'));
    });
    $('#shleg').click(function () {
        showHidePanels('legend', $('#legend').is(':visible'));
    });

    $('#flag_icon_selector').click(function () {
        $('#flag_icon_menu').fadeIn(200);
    });
    $('#flag_icon_menu a').click(function () {
        var new_class = $('i', this).attr('class').split(' ').map(function (_class) {
            return _class.substr(0, 3) == 'fa-' ? _class : ''
        }).filter(Boolean)[0];
        $('#flag_icon_selector i').attr('class', 'fa link ' + new_class);
        $('#new_action_flag_icon').val(new_class);
        $('#flag_icon_menu').fadeOut(200);
    })
    $('#new_entry_labelI').on('focus', function () {
        this.select();
    });
    $('.my_games_link').unbind().click(loadGameList);
    $('#konssl .x').click(function () {
        $('#konssl').fadeOut()
    })
    $('#fire_signup').click(function () {
        open_dialog('Sign Up', signUp)
    });
    $('#fire_login').click(tryLogin);
    $('#loginps').keyup(function (e) {
        if (e.which == 13) tryLogin()
    });
    $('#action_box_id .bottom-bar .cancel').click(close_dialog);
    $('#action_box_id form input').keydown(function (e) {
        if (e.which == 13) e.preventDefault();
    }); //Disable all form submissions
    $('#konssl .log-bar .text').hover(
        function () {
            $(this).addClass('open');
            (a = $('#konssl .text')[0]).scrollTop = a.scrollHeight;
        },
        function () {
            $(this).removeClass('open');
            (a = $('#konssl .text')[0]).scrollTop = a.scrollHeight;
        }
    );
});


var tryLogin = function () {
    var jthat = $('#fire_login');
    var settings = {
        username: $('#loginun').val(),
        password: $('#loginps').val(),
        rm: $('#loginrm:checked').length == 1
    }
    if (settings.username && settings.password) {
        jthat.html('<i class="fa fa-spinner fa-pulse"></i> Working...');
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: '/users/login',
            data: settings,
            success: function (result) {
                if (result.success) {
                    jthat.html('Success!');
                    //eureka(jthat);
                    setTimeout(function () {
                        window.location = '/'
                    }, 1000);
                } else {
                    jthat.html(result.error.replace(/-/g, ' '));
                    //eureka(jthat);
                }
            },
            error: function () {
                jthat.html('Failed')
            }
        });
    } else
        jthat.html('Fill both in...');
}

/* var indicator_manager = function(who, onoff){
 switch (who){
 case 'save_game':
 if(onoff && onoff.toLowerCase()!='off'){ // On
 $('body').addClass('waiter');
 $('#save_game_loader').fadeIn(200).css("display","inline-block");
 }
 else{
 $('body').removeClass('waiter');
 $('#save_game_loader').fadeOut(200);
 }
 break;
 }
 } */

var loadGameList = function () {
    if (!my_games_loaded) {
        $('#games_list').html('<li class="dropdown-header" style="font-size: 16px;"><i class="fa fa-spinner fa-pulse"></i> Loading...</li>');
        $.ajax({
            type: 'get',
            url: '/make/my-games',
            success: function (result) {
                $('#games_list').html(result);
                my_games_loaded = true;
                $('#new_game_btn').click(newGame);
            }
        });
    }
}

var signUp = function () {
    var settings = {
        username: $('#signup_username').val(),
        password: $('#signup_password').val(),
        email: $('#signup_email').val()
    }
    if (settings.username && settings.password) {
        if (/^[\w\.=-]+@[\w\.-]+\.[\w]{2,3}$/.test(settings.email)) {
            $('.signup-error-message').html('');
            var fail = function (msg) {
                alert(msg ? msg : 'Signup Failed, please report to Ben if trying again doesn\'t help (Maybe even a refresh?)')
            };
            show_msg('<i class="fa fa-spinner fa-pulse"></i> Working...', function () {
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/users/signup',
                    data: settings,
                    success: function (result) {
                        if (result.success) {
                            setActionBoxOk(close_dialog);
                            show_msg('Success!<br /><br />Go check your mail');
                        }
                        else {
                            if (result.error == 'username-taken') {
                                $('.signup-error-message').html('Username taken');
                            } else if (result.error == 'email-taken') {
                                $('.signup-error-message').html('Email taken');
                            }
                            $('#action_box_id .fw').hide();
                            $('#action_box_id .signup-form-wrapper').show();
                            $('#action_box_id .wrappers-wrapper').slideDown();
                            eureka('.signup-error-message');
                        }
                    },
                    error: fail
                });
            });
        } else {
            $('.signup-error-message').html('Email invalid');
        }
    } else {
        $('.signup-error-message').html('Fill in Username/Password');
    }
}

var newGame = function () {
    resetActionboxValues();
    open_dialog('New Game', function () {

        var settings = {
            title: $('#new_game_titleI').val(),
            teaser: $('#new_game_teaserI').val()
        }
        if (settings.title)
            show_msg('<i class="fa fa-spinner fa-pulse"></i> Working...', function () {
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/make/create_game',
                    data: settings,
                    success: function (result) {
                        if (result.success) {
                            my_games_loaded = false;
                            loadGameList();
                            setActionBoxOk(close_dialog);
                            show_msg('Success!');
                            eureka('.my_games_link');
                        } else
                            show_msg('Error!<br>' + result.error);
                    },
                    error: function () {
                        show_msg('Failed')
                    }
                });
            });
    })
}

function open_dialog(dialog, okFunction) {
    tc.hide();
    setActionBoxOk(okFunction);
    var dialogs = {
        'New Action': 'action-form-wrapper',
        'New Entry': 'entry-form-wrapper',
        'New Reply': 'reply-form-wrapper',
        'New Board': 'board-form-wrapper',
        'New Game': 'game-form-wrapper',
        'New Chapter': 'chapter-form-wrapper',
        'Edit Entry': 'entry-form-wrapper',
        'Edit Reply': 'reply-form-wrapper',
        'Edit Board': 'board-form-wrapper',
        'Sign Up': 'signup-form-wrapper',
        'msg': 'msg'
    };
    var box_div = $('#action_box_id');
    var form_wrapper_div = $('.' + dialogs[dialog], box_div);
    var bottom_bar_div = $('.bottom-bar', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    if (dialog != 'msg') {
        $('.msg', box_div).hide();
        $('.top-bar', box_div).html('<div>' + dialog + '</div>');
        $('.wrappers-wrapper').show();
        if (toShow = $('input:visible, textarea:visible', box_div)[0])
            toShow.focus();
    }
    else
        $('.wrappers-wrapper').hide();
    form_wrapper_div.hide();
    bottom_bar_div.show();
    cancel_div.show().css('opacity', 1);
    box_div.fadeIn(Tmed, function () {
        $('.wrappers-wrapper>div').fadeOut();
        form_wrapper_div.slideDown(600, function () {
            //bottom_bar_div.fadeIn(Tmed);
            if (toShow = $('input:visible, textarea:visible', box_div)[0])
                toShow.focus();
            switch (dialog) {
                case 'New Game':
                    break;
                case 'New Reply':
                    if (tut_step_indication == "add_first_reply" && !(tut_step_indication = ''))
                        tc.next();
                    break;
                case 'Edit Entry':
                    if (tut_step_indication == "edit_first_entry" && !(tut_step_indication = ''))
                        tc.next();
                    break;
                case 'Edit Reply':
                    if (tut_step_indication == 'edit_first_reply' && !(tut_step_indication = ''))
                        tc.next();
                    break;
            }
        });
    });
}

function show_msg(msg, cb) {
    var box_div = $('#action_box_id');
    var msg_div = $('.msg', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    var cont_div = $('.fw:visible', box_div);
    cancel_div.animate({opacity: 0}, 200, 'linear');
    if (cont_div.length)
        cont_div.slideUp(Tmed, function () {
            msg_div.html(msg);
            msg_div.slideDown(Tmed, function () {
                if (isFu(cb))
                    cb();
            });
        });
    else {
        msg_div.html(msg);
        msg_div.slideDown(Tmed, function () {
            if (isFu(cb))
                cb();
        });
    }
}

function close_dialog(msg, cb, cbparams) {
    //tc.hide();
    $('.arrow-holder').remove();
    var box_div = $('#action_box_id');
    var msg_div = $('.msg', box_div);
    var cont_div = $('.fw:visible', box_div);
    if (box_div.is(":visible")) {
        resetActionboxValues();
        if (msg && isSt(msg)) {
            show_msg(msg, function () {
                setTimeout(function () {
                    msg_div.slideUp(Tmed, function () {
                        box_div.fadeOut(Tmed);
                    });
                    if (isFu(cb))
                        cb(cbparams);
                }, 1500);
            });
        } else {
            cont_div.slideUp(Tmed, function () {
                box_div.fadeOut(Tmed);
            });
        }
        $('.drawing_board .entryLabel').removeClass('pickable');
    }
}


var resetActionboxValues = function (who) {
    if (who || !who) {
        $('#action_box_id input:not([type=radio]), #action_box_id textarea').val('');
        $('input[name=new_board_type][value=con]').prop('checked', true);
        $('input[name=new_action_effect][value=redirect]').prop('checked', true);
    }
}

function setActionBoxOk(func) {
    var ok = $('#action_box_id .ok').unbind();
    if (isFu(func))
        ok.click(func);
}


// Utils //

function isUn(o) {
    return typeof (o) == 'undefined';
}
function isSt(o) {
    return typeof (o) == 'string';
}
function isOb(o) {
    return typeof (o) == 'object';
}
function isFu(o) {
    return typeof (o) == 'function';
}
function mjs() {
    return JSON.stringify(chapters);
}
function cl(c) {
    eureka($('.text', $('#konssl').fadeIn())
        .append('<div><div class="cont">' + c + '</div><div class="time">' + getShortTime() + '</div><div class="clr"></div></div>')
    );
    (a = $('#konssl .text')[0]).scrollTop = a.scrollHeight;
}


var getShortTime = function () {
    function pad(x) {
        return !x ? '00' : (x < 10 ? ('0' + x) : x)
    }

    var now = new Date();
    return pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}

function eureka(jQuery_str, box) {
    var obj = $(jQuery_str);
    var boxtext = box ? 'Box' : 'Text';
    var withSh = 'yellow' + boxtext + 'Shadow';
    var withoSh = 'fadeOut' + boxtext + 'Shadow';
    obj.addClass(withSh);
    setTimeout(function () {
        obj.addClass(withoSh);
        setTimeout(function () {
            obj.removeClass(withoSh).removeClass(withSh);
        }, 5000);
    }, 1000);
}


// Override alert!
var oalert = alert;
alert = function (v, cb) {
    var box_div = $('#action_box_id');
    $('.top-bar', box_div).html('<div>Info</div>');
    $('.msg', box_div).html(v);
    open_dialog('msg', (isFu(cb) ? cb : close_dialog));
}

