/**
 * Created by Skeksify on 12/13/14.
 */

// Globals //

var playgrounds = [];
var key = 'breadcrumbs';
// Entities: //

function Playground(settings){
    var defaults = {
        playgroundTitle: '',
        playgroundBoards: []
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { playgroundBoards: [] });
    this.addBoard = function(new_board){
        return this.playgroundBoards.push(new_board);
    }
    this.updateBoard = function(i, board){
        this.playgroundBoards[i] = board;
    }
    this.getBoards = function(){return this.playgroundBoards }
    this.getBoard = function(i){return this.playgroundBoards[i] }
}

function Board(settings){
    var defaults = {
        interactionTree: null,
        boardTitle: 'Default Title',
        boardType: '',
        boardDesc: ''
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { interactionTree: null });
    this.setFirstEntry = function(new_entry){
        return this.interactionTree = new_entry;
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
    var board_id = $(that).closest('.drawing_panel').attr(key);
    var entityType = paramObject.data.type;
    /*
     ToDo: Father Entity Indication (Onboard)
     Todo: Support Father Entity Change (while box open), not sure
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
                if(settings.actionLabel){
                    updatedEntity = entityToUpdate.setLeadsTo(new Action(settings));
                    if(actionType=='redirect')
                        updatedEntity.setPath(path);
                    close_dialog();
                    cl('"'+updatedEntity.actionLabel+'" added successfully');
                    redraw(board_id);
                }
                break;
            case 'New Reply':
                var settings = {
                    replyLabel: $('#new_reply_labelI').val(),
                    replySpeech: $('#new_reply_speechI').val(),
                    replyCondition: $('#new_reply_condI').val()
                };
                if(settings.replyLabel){
                    updatedEntity = entityToUpdate.addReply(new Reply(settings));
                    close_dialog();
                    cl('"'+updatedEntity.replyLabel+'" added successfully');
                    redraw(board_id);
                }
                break;
            case 'New Entry':
                var settings = {
                    entryLabel: $('#new_entry_labelI').val(),
                    entrySpeech: $('#new_entry_speechI').val()
                };
                if(settings.entryLabel){
                    updatedEntity = entityToUpdate.setLeadsTo(new Entry(settings));
                    close_dialog();
                    cl('"'+updatedEntity.entryLabel+'" added successfully');
                    redraw(board_id);
                }
                break;
        }
    });
}

function makeSimplePath(button){
    if(!(button instanceof jQuery))
        button = $(button);
    var parent_replies = button.parents('['+(key)+']');
    var parent_replies_numbers = [];
    parent_replies.each(function(){
        var reply_number = $(this).attr(key);
        parent_replies_numbers.push(reply_number);
    });
    //parent_replies_numbers.push($(button).closest('.drawing_panel['+key+']').attr('boardid')); //No need? ////......./////?
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
                        if(!entry.leadsTo && entry.actionType!='redirect')
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
    var firsTwo = path.splice(0,2);
    var board = playgrounds[firsTwo[0]].getBoard(firsTwo[1]);
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
    var firsTwo = path.splice(0,2);
    var result = $('.drawing_panel['+key+'="'+firsTwo[1]+'"]>.drawing_board', $('.playground['+key+'='+firsTwo[0]+']'));
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

    resetTabs();
    makeTabs();
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

    $('.playgrounds .add-entry').click({type: 'New Entry'}, engageNewEntity);
    $('.playgrounds .add-reply').click({type: 'New Reply'}, engageNewEntity);
    $('.playgrounds .add-action').click({type: 'New Action'}, engageNewEntity);

    $('.newboard').unbind().click(function(){
        var playground_id = $(this).parent().attr(key);
        open_dialog('New Board', function(){
            var settings = {
                boardTitle: $('#new_board_titleI').val(),
                boardType: $('input[name=new_board_type]:checked').val(),
                boardDesc: $('#new_board_descI').val()
            };
            if(settings.boardTitle){
                var tmpNewBoard = new Board(settings);
                tmpNewBoard.setFirstEntry(new Entry({entryLabel: 'First Entry! (Right click to edit)'}));
                playgrounds[playground_id].addBoard(tmpNewBoard);
                close_dialog();
                cl('New Board Added!');
                redraw();
            }
        });
    });

    var all_labels = $('.playgrounds .actionLabel, .playgrounds .replyLabel:not(.add-reply), .playgrounds .entryLabel');
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
                //window_markup.push(entity.actionEffect.toString());
                window_markup.push('Type:<br/>'+entity.actionType);
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
                if(speech)
                    window_markup.push('Speech:<br/>'+speech);
                else
                    window_markup.push('Empty');
                var input_label = $('#new_entry_labelI');
                var ta_speech = $('#new_entry_speechI');
                input_label.val(label);
                ta_speech.val(speech);
                editF = function(){
                    entity.setLabel(input_label.val());
                    entity.setSpeech(ta_speech.val());
                    close_dialog();
                    cl('"'+entity.entryLabel+'" updated successfully');
                    redraw(simple_path[0]);
                }
                break;
            case "Reply":
                dialog_title = 'Edit Reply';
                label = entity.replyLabel;
                speech = htmlEscape(entity.replySpeech);
                cond = entity.replyCondition;
                if(cond)
                    window_markup.push('Condition:<br/><div class="code">'+cond+'</div><br/>');
                if(speech)
                    window_markup.push('Speech:<br/>'+speech);
                else
                    window_markup.push('Empty');
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
                    close_dialog();
                    cl('"'+entity.replyLabel+'" updated successfully');
                    redraw(simple_path[0]);
                };
                break;
        }
        //floater.hide().css('top', triggerer_pos.top+height-5).css('left', triggerer_pos.left+width-5).fadeIn(100);
        floater.hide().css('top', ev.pageY+10).css('left', ev.pageX+10).fadeIn(100);
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

function recompilePlaygrounds(PlaygroundsJSON){
    var pseuPlaygrounds;
    if(isSt(PlaygroundsJSON))
        pseuPlaygrounds = JSON.parse(PlaygroundsJSON);
    else if (isOb(PlaygroundsJSON))
        pseuPlaygrounds = PlaygroundsJSON;
    playgrounds = [];
    var tmpPlayground, tmpBoard;
    for(var i in pseuPlaygrounds){
        tmpPlayground = new Playground(pseuPlaygrounds[i]);
        for(var b in boards = pseuPlaygrounds[i].playgroundBoards){
            tmpBoard = new Board(boards[b]);
            tmpBoard.setFirstEntry(recurMakeEntry(boards[b].interactionTree)); //Init Recursion
            tmpPlayground.addBoard(tmpBoard);
        }
        playgrounds.push(tmpPlayground);
    }
}

function redraw(who){
    $('#floater').hide();
    if(1 || isUn(who)){ // All //For now
        var game = $('.playgrounds').html('');
        var navBar = $('.loaded-boards-nav-list').html('');
        var tabs_element = $('#tabs').html('');
        var markup = [];
        var tabs = [];
        var dd;
        var navBarMarkup = [];;
        for(var i in playgrounds){
            tabs.push('<li><a href="#playground_'+i+'" tab_number="'+i+'">'+playgrounds[i].playgroundTitle+'</a></li>');
            markup.push('<div class="playground" '+key+'="'+i+'">');
                markup.push('<div class="boards">');
                    for(var b in boards = playgrounds[i].getBoards()){
                        markup.push('<div class="panel drawing_panel" '+key+'="'+b+'">');
                            markup.push('<div class="board-title">');
                                markup.push(boards[b].boardTitle);
                            markup.push('</div>');
                            markup.push('<div class="panel-body drawing_board">');
                                dd = recur_draw_entry(boards[b].interactionTree);
                                markup.push(dd);
                            markup.push('</div>');
                        markup.push('</div>');
                        navBarMarkup.push('<li><a href="#">'+boards[b].title+'</a></li>');
                    }
                markup.push('</div>');
                markup.push('<a class="newboard" href="#">New Board</a>');
            markup.push('</div>');
        }
        tabs.push('<li><a href="#" onclick="new_playground()">+</a></li>');
        tabs_element.html(tabs.join(''))
        game.append(markup.join(''));
        navBar.append(navBarMarkup.join(''));
        setPlaygroundBindings();
    } else { // One board
        var dr_p = $('.drawing_panel['+key+'='+who+']');
        var dr_b = $('.drawing_board', dr_p); //lol dr. p
        dr_p.fadeOut(Tmed, function(){
            dr_b.html(recur_draw_entry(boards[who].interactionTree));
            setPlaygroundBindings();
            dr_p.fadeIn(Tmed);
            //goPlumb();
        });
    }
}

function save_game(){
    var playgrounds_json = mjs();
    var my_tmp_boards = { game_id: game_id, playgrounds: playgrounds_json};
    $.ajax({
        type: 'post',
        dataType: 'json',
        url: '/make/save_game',
        data: my_tmp_boards,
        success: function(result){
            if(result.success)
                cl('Saved');
            else
                alert(result.error);
        }
    });
}
/*
function load_playground(){
    if(1 || confirm('Are you sure you want to load?')){
        var loadedPlayground = localStorage.getItem('playground');
        var playgroundObj = JSON.parse(loadedPlayground);
        if(isOb(playgroundObj)){
            recompilePlaygrounds(playgroundObj);
            redraw();
        }
    }
}
*/

// Interactions //




// Prototype Utils //
//Object.prototype.isAction = function(){ return this instanceof Action }
//Object.prototype.isEntry = function(){ return this instanceof Entry }
//Object.prototype.isReply = function(){ return this instanceof Reply}


function new_playground(){
    open_dialog('New Playground', function(){
        var settings = {
            playgroundTitle: $('#new_playground_titleI').val()
        };
        if(settings.playgroundTitle){
            var tmpNewPlayground = new Playground(settings);
            var new_playground_id = playgrounds.push(tmpNewPlayground);
            close_dialog();
            cl('New Playground Added!');
            window.location = ('#playground_'+(new_playground_id-1));
            redraw();
        }
    });
}

// Document Ready
$(document).ready(function(){
    resetTabs();
    makeTabs();

    // don't - load_playground(); //Try

    $('#save_game').click(function(){
        save_game();
    });

    $('body').click(function(event){
        if(!$('#floater').find(event.target).length)
            blur_context();
    });
});










function resetTabs(){
    $(".playground").hide(); //Hide all content
    $("#tabs a").removeClass('atab'); //Reset id's
}

var myUrl, myUrlTab, myUrlTabName;

function makeTabs(){
    myUrl = window.location.href; //get URL
    myUrlTab = myUrl.substring(myUrl.indexOf("#")); // For mywebsite.com/tabs.html#tab2, myUrlTab = #tab2
    myUrlTabName = myUrlTab.substring(0,12); // For the above example, myUrlTabName = #tab
    $(".playground").hide(); // Initially hide all content

    $("#tabs a[tab_number]").on("click",function(e) {
        //e.preventDefault();
        if ($(this).hasClass('atab')){ //detection for current tab
            return
        }
        else{
            resetTabs();
            $(this).addClass('atab'); // Activate this
            var tn = $(this).attr('tab_number');
            $('.playground['+key+'='+tn+']').fadeIn(); // Show content for current tab
        }
    });

    if(myUrlTab.substr(0,12)=='#playground_'){
        resetTabs();
        var i = myUrlTab.substr(12);
        $("a[tab_number='"+i+"']").addClass('atab'); // Activate url tab
        $('.playground['+key+'='+i+']').fadeIn(); // Show url tab content
    } else {
        $("#tabs li:first a").addClass('atab'); // Activate first tab
        $(".playground:first").fadeIn(); // Show first tab content
    }
}



























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