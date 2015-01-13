/**
 * Created by Skeksify on 12/13/14.
 */

// Globals //

var Tmed = 500;
var boards = [];

// Entities: //

function Board(settings){
    var defaults = {
        interactionTree: null,
        boardTitle: 'Default Title',
        boardType: '',
        boardDesc: ''
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { interactionTree: null });
    this.setFirstEntry = function(newEntry){
        return this.interactionTree = newEntry;
    }
}

function Entry(settings){
    var defaults =  {
        entryLabel: '',
        entrySpeech: '',
        replies: []
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { replies: [] });
    this.onUpdate = function(){ if(0) cl('Entry Updated'); };
    this.addReply = function(reply){
        if(reply instanceof Reply){
            this.replies.push(reply);
            this.onUpdate();
            return reply;
        }
    }
    this.deleteReply = function(reply_index){
        if(parseInt(reply_index)<this.replies.length) {
            this.replies.splice(reply_index, 1);
            this.onUpdate();
        }
    }
    this.setLabel = function(new_label){ this.entryLabel = new_label; this.onUpdate(); return this; }
    this.setSpeech = function(new_speech){ this.entrySpeech = new_speech; this.onUpdate(); return this; }
}

function Reply(settings){
    var defaults = {
        replyLabel: '',
        replySpeech: '',
        replyType: '',
        replyCondition: '',
        leadsTo: null
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { leadsTo: null });
    this.onUpdate = function(){ if(0) cl('Reply Updated'); };
    this.setLeadsTo = function(leadsTo){
        switch (Object.getPrototypeOf(leadsTo)){
            case Entry.prototype:
                this.leadsTo = leadsTo;
                this.onUpdate();
                break;
            case Action.prototype:
                this.leadsTo = leadsTo;
                this.onUpdate();
                break;
        }
        return this.leadsTo;
    }
    this.follow = function(){
        return this.leadsTo;
    }
    this.setLabel = function(new_label){ this.replyLabel = new_label; this.onUpdate(); return this; }
    this.setSpeech = function(new_speech){ this.replySpeech = new_speech; this.onUpdate(); return this; }
    this.setCondition = function(new_condition){ this.replyCondition = new_condition; this.onUpdate(); return this; }
}

function Action(settings){
    /*
    Action will be leadTo from Reply (Reply's label/body should describe the action)
    Action will leadTo Entry
    When playing, if arriving to Action, should run actionEffect and direct to leadsTo
     */
    var defaults = {
        leadsTo: null,
        actionLabel: '',
        actionType: '',
        actionEffect: function(){}
    };

    loadSettings(this, settings, defaults);
    this.onUpdate = function(){ if(0) cl('Action Updated'); };

    this.setEffect = function(new_val_actionEffect){
        if(isFu(new_val_actionEffect)){
            actionEffect = new_val_actionEffect;
            this.onUpdate();
        }
    }

    this.setPath = function(new_val_path){
        this.redirectPath = new_val_path;
    }

    this.getPath = function(){ return this.redirectPath; }

    this.setLeadsTo = function(leadsTo){
        this.leadsTo = leadsTo;
        this.onUpdate();
        return this.leadsTo;
    }
}


// Entity Helper Functions //

function loadSettings(instance, settings, defaults){
    pSettings = settings?settings:{};
    for(var property in defaults)
        instance[property] = !isUn(pSettings[property]) ? pSettings[property] : defaults[property];
}

function forceSettings(instance, settings){
    for(var property in settings)
        instance[property] = settings[property];
}


// Storyline Editing //

function engageNewEntity(paramObject){
    var that = this; // Keeping the invoking element
    var board_id = $(that).closest('.drawing_panel').attr('boardid');
    var entityType = paramObject.data.type;
    /*
     ToDo: Father Entity Indication (Onboard)
     Todo: Support Father Entity Change (while box open)
     */

    open_dialog(entityType, function(){
        var updatedEntity = null;
        var entityToUpdate = getEntityBySimplePath(makeSimplePath(that));
        switch (entityType){ //Reply
            case 'New Action':
                var actionEffect, actionType, path;
                switch ($('input[name=new_action_effect]:checked').val()){
                    case 'redirect':
                        actionType = 'redirect';
                        path = $('#target_entry_path').val();
                        actionEffect = function(character){
                            character.redirect(path);
                        }
                        break;
                    case 'turnOnFlag':
                        actionType = 'charmod';
                        var flag_name = $('#new_action_flag_nameI').val();
                        actionEffect = function(character){
                            character[flag_name] = true;
                        }
                        break;
                    case 'turnOffFlag':
                        actionType = 'charmod';
                        var flag_name = $('#new_action_flag_nameII').val();
                        actionEffect = function(character){
                            character[flag_name] = false;
                        }
                        break;
                    case 'kill':
                        actionType = 'charmod';
                        actionEffect = function(character){
                            character.dead = true;
                        }
                        break;
                }
                var settings = {
                    actionLabel: $('#new_action_labelI').val(),
                    actionEffect: actionEffect,
                    actionType: actionType
                };
                updatedEntity = entityToUpdate.setLeadsTo(new Action(settings));
                if(actionType=='redirect')
                    updatedEntity.setPath(path);
                close_dialog('"'+updatedEntity.actionLabel+'" added successfully!', redraw, board_id);
                break;
            case 'New Reply':
                var settings = {
                    replyLabel: $('#new_reply_labelI').val(),
                    replySpeech: $('#new_reply_speechI').val(),
                    replyCondition: $('#new_reply_condI').val()
                };
                updatedEntity = entityToUpdate.addReply(new Reply(settings));
                close_dialog('"'+updatedEntity.replyLabel+'" added successfully!', redraw, board_id);
                break;
            case 'New Entry':
                var settings = {
                    entryLabel: $('#new_entry_labelI').val(),
                    entrySpeech: $('#new_entry_speechI').val()
                };
                updatedEntity = entityToUpdate.setLeadsTo(new Entry(settings));
                close_dialog('"'+updatedEntity.entryLabel+'" added successfully!', redraw, board_id);
                break;
        }
    });
}

function makeSimplePath(button){
    var key = 'breadcrumbs';
    if(!(button instanceof jQuery))
        button = $(button);
    var parent_replies = button.parents('['+(key)+']');
    var parent_replies_numbers = [];
    parent_replies.each(function(){
        var reply_number = $(this).attr(key);
        parent_replies_numbers.push(reply_number);
    });
    parent_replies_numbers.push($(button).closest('[boardid]').attr('boardid'));
    return parent_replies_numbers.reverse(); // Was running in out, need path from root
}


// Recursion Steppers //

function recurMakeEntry(pseuEntry){
    var resultEntry;
    if(typeof(pseuEntry.entryLabel)!='undefined'){
        resultEntry = new Entry(pseuEntry)
        for(var index in pseuEntry.replies){
            var iter_pseuReply = pseuEntry.replies[index];
            var iter_reply = new Reply(iter_pseuReply);
            if(iter_pseuReply.leadsTo) // Continue Condition, means you haven't reached a leaf (Reply that ends the dialog)
                iter_reply.setLeadsTo(recurMakeEntry(iter_pseuReply.leadsTo));
            resultEntry.addReply(iter_reply);
        }
    } else { //action
        resultEntry = new Action(pseuEntry);
        if(pseuEntry.redirectPath)
            resultEntry.setPath(pseuEntry.redirectPath);
        if(resultEntry.leadsTo)
            resultEntry.setLeadsTo(recurMakeEntry(resultEntry.leadsTo))
    }
    return resultEntry;
}

function recur_draw_entry(entry){
    if(entry instanceof Entry || entry instanceof Action){
        var resultString = [];
        resultString.push('<div class="entry" breadcrumbs="'+((entry instanceof Action)?'$':'+')+'">');
            if(entry instanceof Action){
                resultString.push('<div class="replyHolder">');
                    resultString.push('<div class="actionLabel'+(entry.actionType=='redirect'?' redirect':'')+'">');
                        resultString.push('<div style="float: left;">' + entry.actionLabel + '</div>');
                        if(!entry.leadsTo)
                            resultString.push(
                                '<div class="add-entry" style="float: right">+</div>' +
                                '<div class="add-action" style="float: right">$</div>');
                    resultString.push('</div>');
                resultString.push('</div>');
                    if(entry.leadsTo){
                        resultString.push('<div class="replyHolder">');
                            resultString.push('<div class="tableBox">'+recur_draw_entry(entry.leadsTo)+'</div>');
                        resultString.push('</div>');
                    }
            }
            else{
                resultString.push('<div class="replyHolder">');
                    resultString.push('<div class="entryLabel">' + entry.entryLabel + '</div>');
                resultString.push('</div>');//Inner Reply Holder
                resultString.push('<div class="replyHolder">');
                    for(var index in entry.replies){
                        var iter_reply = entry.replies[index];
                        if(iter_reply instanceof Reply){
                            resultString.push('<div class="reply'+(iter_reply.leadsTo?' notLeaf':'')+'" breadcrumbs="'+index+'">');
                                resultString.push('<div class="replyHolder">');
                                    resultString.push('<div class="replyLabel'+(iter_reply.leadsTo?' notLeaf':'')+(iter_reply.replyCondition?' conditional':'')+'">');
                                    resultString.push(iter_reply.replyLabel);
                                    if(!iter_reply.leadsTo)
                                        resultString.push(
                                            '<div class="add-entry" style="float: right">+</div>' +
                                            '<div class="add-action" style="float: right">$</div>');
                                    resultString.push('</div>');
                                resultString.push('</div>');
                                resultString.push('<div class="replyHolder">');// Transition between answer to new Entry
                                if(iter_reply.leadsTo) // Continue Condition
                                    resultString.push('<div class="tableBox">'+recur_draw_entry(iter_reply.leadsTo)+'</div>');
                                resultString.push('</div>');
                            resultString.push('</div>');
                        } else console.log('Data Structure Invalid');
                    }
                    /* New reply, only on Entries */
                    resultString.push('<div class="reply">');
                        resultString.push('<div class="replyHolder">');
                            resultString.push('<div class="replyLabel add-reply">+</div>');
                        resultString.push('</div>');
                    resultString.push('</div>');
                    /* -New reply, only on Entries */
                resultString.push('</div>');//Outer Reply Holder
                resultString.push('<div class="clr"></div>');
            }
        resultString.push('</div>');
        return resultString.join('');
    }
}

function getEntityBySimplePath(path){
    var board = boards[path.splice(0,1)[0]];
    var resultEntity = board.interactionTree;
    if(path.splice(0,1)[0]=='+') //If begins with entry (And take it out)
        for(var key in path)
            if(isNaN(path[key])) //Entry/Action
                resultEntity = resultEntity.leadsTo;
            else //Reply
                resultEntity = resultEntity.replies[path[key]];
    return resultEntity;
}
function getElementBySimplePath(path){
    var result = $("[boardid="+(path.splice(0,1)[0])+"]>.drawing_board");
    for(var i in path)
        result = result.closestDescendant('[breadcrumbs="'+path[i]+'"]');
    return result;
}
// Playground Functions //

var run_flashes = false;
var onof = true;

function toggleLight(element){
    console.log('runnin');
    var settings;
    if(onof){
        onof = false;
        settings = {boxShadow: '0 0 16px #ff3'};
    } else {
        onof = true;
        settings = {boxShadow: '0 0 2px #ff3'};
    }
    if(run_flashes)
        element.animate(settings, 500, function(){
            toggleLight(element);
        });
    else
        element.animate({boxShadow: '0 0 0 #000'}, 500, function(){/*run_flashes=false*/});
}

function setPlaygroundBindings(){
    $('#action_box_id .bottom-bar .cancel').click(close_dialog);

    $('#TargetEntryButton').click(function(){
        var pather = $('#target_entry_path');
        var that = this;
        if(pather.val()){
            pather.val('');
            $(that).html('Target Entry');
        } else {
            $(that).html('Select Target');
            $('.drawing_board .entryLabel').addClass('pickable').unbind().click(function(){
                pather.val(makeSimplePath(this).toString());
                $(that).html('Path Selected');
                $('.drawing_board .entryLabel').removeClass('pickable').unbind();
                $(this).addClass('pickable');
            });
        }
    });
    $('#playground .add-entry').click({type: 'New Entry'}, engageNewEntity);
    $('#playground .add-reply').click({type: 'New Reply'}, engageNewEntity);
    $('#playground .add-action').click({type: 'New Action'}, engageNewEntity);

    var all_labels = $('#playground .actionLabel, #playground .replyLabel:not(.add-reply), #playground .entryLabel');
    all_labels.on('contextmenu', function(ev){
        close_dialog();
        blur_context();
        var triggerer = $(ev.target).closest('.actionLabel, .replyLabel, .entryLabel');
        var floater = $('#floater');
        var simple_path = makeSimplePath(triggerer);
        var entity = getEntityBySimplePath(simple_path);
        var entity_type = entity.constructor.name;
        var triggerer_pos = triggerer.position();
        var height = parseInt(triggerer.css('height'));
        var width = parseInt(triggerer.css('width'));//ev.clientX
        all_labels.removeClass('active_label');
        triggerer.addClass('active_label');
        var dialog_title, label, speech, cond, window_markup = [], editF, deleteF;
        switch (entity_type){
            case "Action":
                editF = null;
                label = entity.actionLabel;
                window_markup.push(entity.actionEffect.toString());
                if(path = entity.getPath()){
                    var element = getElementBySimplePath(path.split(','));
                    var playable = element.children().first().find('.entryLabel');//.addClass('pickable');
                    run_flashes = true;
                    toggleLight(playable);
                }
                break;
            case "Entry":
                dialog_title = 'Edit Entry';
                label = entity.entryLabel;
                speech = htmlEscape(entity.entrySpeech);
                window_markup.push('Speech:<br/>'+speech);
                var input_label = $('#new_entry_labelI');
                var ta_speech = $('#new_entry_speechI');
                input_label.val(label);
                ta_speech.val(speech);
                editF = function(){
                    entity.setLabel(input_label.val());
                    entity.setSpeech(ta_speech.val())
                    close_dialog('"'+entity.entryLabel+'" updated successfully!', redraw, simple_path[0]);
                }
                break;
            case "Reply":
                dialog_title = 'Edit Reply';
                label = entity.replyLabel;
                speech = htmlEscape(entity.replySpeech);
                cond = entity.replyCondition;
                window_markup.push((cond?('Condition:<br/><div class="code">'+cond+'</div><br/>'):'')+'Speech:<br/>'+speech);
                var input_label = $('#new_reply_labelI');
                var ta_speech = $('#new_reply_speechI');
                var ta_cond = $('#new_reply_condI');
                input_label.val(label);
                ta_speech.val(speech);
                if(cond)
                    ta_cond.val(cond);
                editF = function(){
                    entity.setLabel(input_label.val());
                    entity.setSpeech(ta_speech.val());
                    entity.setCondition(ta_cond.val());
                    close_dialog('"'+entity.replyLabel+'" updated successfully!', redraw, simple_path[0]);
                };
                break;
        }
        floater.hide().css('top', triggerer_pos.top+height-5).css('left', triggerer_pos.left+width-5).fadeIn(100);
        floater.find('.edit').unbind();
        if(isFu(editF))
            floater.find('.edit').click(function(){
                open_dialog(dialog_title, editF);
                blur_context();
            });
        floater.find('.content').html(window_markup.join(''));
        floater.find('.title').html(entity_type);
        ev.preventDefault()
    });
}

function blur_context(){
    if($('.active_label').length){
        $('.pickable').removeClass('pickable');
        $('#floater').fadeOut(50);
        $('.active_label').removeClass('active_label');
        run_flashes = false;
    }
}

function recompilePlayground(PlaygroundJSON){
    var pseuPlayground;
    if(isSt(PlaygroundJSON))
        pseuPlayground = JSON.parse(PlaygroundJSON);
    else if (isOb(PlaygroundJSON))
        pseuPlayground = PlaygroundJSON;
    boards = [];
    for(var i in pseuPlayground){
        var tmpBoard = new Board(pseuPlayground[i]);
        tmpBoard.setFirstEntry(recurMakeEntry(pseuPlayground[i].interactionTree)); //Init Recursion
        boards.push(tmpBoard);
    }
}

function redraw(who){
    $('#floater').hide();
    if(isUn(who)){ // All
        var playground = $('#playground .boards').html('');
        var navBar = $('.loaded-boards-nav-list').html('');
        var markup = [];
        var dd;
        var navBarMarkup = [];
        for(var i in boards){
            markup.push('<div class="panel drawing_panel" boardid="'+i+'">');
                markup.push('<div class="board-title">');
                    markup.push(boards[i].boardTitle);
                markup.push('</div>');
                markup.push('<div class="panel-body drawing_board">');
                    dd = (recur_draw_entry(boards[i].interactionTree));
                    markup.push(dd);
                markup.push('</div>');
            markup.push('</div>');
            navBarMarkup.push('<li><a href="#">'+boards[i].title+'</a></li>');
        }
        playground.append(markup.join(''));
        navBar.append(navBarMarkup.join(''));
        setPlaygroundBindings();
    } else { // One board
        var dr_p = $('.drawing_panel[boardid='+who+']');
        var dr_b = $('.drawing_board', dr_p); //lol dr. p
        dr_p.fadeOut(Tmed, function(){
            dr_b.html(recur_draw_entry(boards[who].interactionTree));
            setPlaygroundBindings();
            dr_p.fadeIn(Tmed);
            //goPlumb();
        });
    }
}

function save_playground(){
    var playground_json = mj();
    localStorage.setItem('playground', playground_json);
    //alert('Saved!\r\n\r\n\r\n\r\n'+localStorage.getItem('playground'));

    var my_tmp_boards = {'playground': playground_json};
    //debugger;

    $.ajax({
        type: 'post',
        dataType: 'json',
        url: '/json/game/save_playground',
        data: my_tmp_boards,
        success: function(result){
            console.log(result)
        }
    });
}

function load_playground(){
    if(1 || confirm('Are you sure you want to load?')){
        var loadedPlayground = localStorage.getItem('playground');
        var playgroundObj = JSON.parse(loadedPlayground);
        if(isOb(playgroundObj)){
            recompilePlayground(playgroundObj);
            redraw();
        }
    }
}


// Interactions //

function open_dialog(dialog, okFunction){
    set_action_box_ok(okFunction);
    var dialogs = {
        'New Action': 'action-form-wrapper',
        'New Entry': 'entry-form-wrapper',
        'New Reply': 'reply-form-wrapper',
        'New Board': 'board-form-wrapper',
        'Edit Entry': 'entry-form-wrapper',
        'Edit Reply': 'reply-form-wrapper'
    };
    var box_div = $('#action_box_id');
    var form_wrapper_div = $('.'+dialogs[dialog], box_div);
    var bottom_bar_div = $('.bottom-bar', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    $('#action_box_id .title').html(dialog);
    $('.action-box .top-bar').html('<div>'+dialog+'</div>');
    form_wrapper_div.hide(); bottom_bar_div.show(); cancel_div.show().css('opacity',1);
    box_div.fadeIn(Tmed, function(){
        $('.wrappers-wrapper>div').fadeOut();
        form_wrapper_div.slideDown(600, function(){
            //bottom_bar_div.fadeIn(Tmed);
        });
    });
}

function close_dialog(msg, cb, cbparams){
    var box_div = $('#action_box_id');
    var cont_div = $('.fw:visible', box_div);
    var msg_div = $('.msg', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    if(box_div.is(":visible")){
        $('#action_box_id input, #action_box_id textarea').val('');
        if(msg && isSt(msg)){
            msg_div.hide();
            cancel_div.animate({opacity: 0}, 200, 'linear');
            cont_div.slideUp(Tmed, function(){
                msg_div.html(msg);
                msg_div.slideDown(Tmed, function(){
                    setTimeout(function(){
                        msg_div.slideUp(Tmed, function(){
                            box_div.fadeOut(Tmed);
                        });
                        if(typeof(cb)=='function')
                            cb(cbparams);
                    }, 1500);
                });
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
function cl(c){ console.log(c) };

// Prototype Utils //
//Object.prototype.isAction = function(){ return this instanceof Action }
//Object.prototype.isEntry = function(){ return this instanceof Entry }
//Object.prototype.isReply = function(){ return this instanceof Reply}



// Document Ready
$(document).ready(function(){
    $('.btn-add-board').click(function(){
        open_dialog('New Board', function(){
            var settings = {
                boardTitle: $('#new_board_titleI').val(),
                boardType: $('input[name=new_board_type]:checked').val(),
                boardDesc: $('#new_board_descI').val()
            };
            var tmpNewBoard = new Board(settings);
            tmpNewBoard.setFirstEntry(new Entry({entryLabel: 'First Entry!'}));
            var new_board_id = boards.push(tmpNewBoard);
            close_dialog('New Board Added!', redraw);
        });

    });
    load_playground(); //Try

    $('body').click(function(event){
        if(!$('#floater').find(event.target).length)
            blur_context();
    });
});


/*!
 * BFS!
 * .closestDescendant( selector [, findAll ] )
 * https://github.com/tlindig/jquery-closest-descendant
 *
 * v0.1.2 - 2014-02-17
 *
 * Copyright (c) 2014 Tobias Lindig
 * http://tlindig.de/
 *
 * License: MIT
 *
 * Author: Tobias Lindig <dev@tlindig.de>
 */
!function(a){a.fn.closestDescendant=function(b,c){if(!b||""===b)return a();c=c?!0:!1;var d=a();return this.each(function(){var e=a(this),f=[];for(f.push(e);f.length>0;)for(var g=f.shift(),h=g.children(),i=0;i<h.length;++i){var j=a(h[i]);if(j.is(b)){if(d.push(j[0]),!c)return!1}else f.push(j)}}),d}}(jQuery);

function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}