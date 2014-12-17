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
    this.onUpdate = function(){ cl('Entry Updated'); };
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
}

function Reply(settings){
    var defaults = {
        replyLabel: '',
        replySpeech: '',
        replyType: '',
        leadsTo: null
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { leadsTo: null });
    this.onUpdate = function(){ cl('Reply Updated'); };
    this.setLeadsTo = function(leadsTo){
        switch (Object.getPrototypeOf(leadsTo)){
            case Entry.prototype:
                this.leadsTo = leadsTo;
                this.onUpdate();
                break;
        }
        return this.leadsTo;
    }
    this.follow = function(){
        return this.leadsTo;
    }
}

function Action(settings){
    /*
    Action will be leadTo from Reply (Reply's label should describe the action)
    Action will leadTo Entry
    When playing, if arriving to Action, should run actionEffect and direct to leadsTo
     */
    var defaults = {
        leadsTo: null,
        actionEffect: function(){}
    };
    loadSettings(this, settings, defaults);
    this.onUpdate = function(){ cl('Action Updated'); };

    this.setLeadsTo = function(leadsTo){
        this.leadsTo = leadsTo;
        this.onUpdate();
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
    var entityTypeText = (entityType?'New Reply':'New Entry');
    /*
     ToDo: Father Entity Indication
     Todo: Support Father Entity Change (while box open)
     */

    open_dialog(entityTypeText, function(){
        var updatedEntity = null;
        var entityToUpdate = getEntityByTriggeringElement.call(that, !entityType, board_id);
        if(entityType){ //Reply
            var settings = {
                replyLabel: $('#new_reply_labelI').val(),
                replySpeech: $('#new_reply_speechI').val()
            };
            updatedEntity = entityToUpdate.addReply(new Reply(settings));
            close_dialog('"'+updatedEntity.replyLabel+'" added successfully!', redraw, board_id);
        } else { //Entry
            var settings = {
                entryLabel: $('#new_entry_labelI').val(),
                entrySpeech: $('#new_entry_speechI').val()
            };
            updatedEntity = entityToUpdate.setLeadsTo(new Entry(settings));
            close_dialog('"'+updatedEntity.entryLabel+'" added successfully!', redraw, board_id);
        }
    });
}

function getEntityByTriggeringElement(entityType, board_id){
    var add_button = $(this);
    var parent_replies = add_button.parents('[replynumber]');
    var parent_replies_numbers = [];
    parent_replies.each(function(){
        var reply_number = $(this).attr('replynumber');
        parent_replies_numbers.push(reply_number);
    });
    parent_replies_numbers.reverse(); // Was running in out, need path from root
    return getEntityByPath(parent_replies_numbers, entityType, board_id);
}

function getEntityByPath(path, entityType, board_id){
    var nextEntry, thisReply;
    var resultEntry = boards[board_id].interactionTree;
    if(isOb(path) && path.length && resultEntry instanceof Entry)
        for(var i in path)
            if((parseInt(i)+1)!=path.length || !entityType)
                if((thisReply = resultEntry.replies[path[i]]) instanceof Reply && (nextEntry = thisReply.leadsTo) instanceof Entry)
                    resultEntry = nextEntry;
                else
                    return console.error('Path error');
    return entityType ? resultEntry.replies[path[path.length-1]] : resultEntry;
}


// Recursion Steppers //

function recurMakeEntry(pseuEntry){
    var resultEntry = new Entry(pseuEntry);
    for(var index in pseuEntry.replies){
        var iter_pseuReply = pseuEntry.replies[index];
        var iter_reply = new Reply(iter_pseuReply);
        if(iter_pseuReply.leadsTo) // Continue Condition, means you haven't reached a leaf (Reply that ends the dialog)
            iter_reply.setLeadsTo(recurMakeEntry(iter_pseuReply.leadsTo));
        resultEntry.addReply(iter_reply);
    }
    return resultEntry;
}

function recur_draw_entry(entry){
    if(entry instanceof Entry){
        var resultString = [];
        resultString.push('<div class="entry">');
            resultString.push('<div class="replyHolder">');
                resultString.push('<div class="entryLabel" title="'+entry.entrySpeech+'">' + entry.entryLabel + '</div>');
            resultString.push('</div>');
            resultString.push('<div class="replyHolder">');
            for(var index in entry.replies){
                var iter_reply = entry.replies[index];
                if(iter_reply instanceof Reply){
                    resultString.push('<div class="reply'+(iter_reply.leadsTo?' notLeaf':'')+'" replynumber="'+index+'">');
                        resultString.push('<div class="replyHolder">');
                            resultString.push('<div class="replyLabel'+(iter_reply.leadsTo?' notLeaf':'')+'" title="'+iter_reply.replySpeech+'">');
                            resultString.push(iter_reply.replyLabel);
                            if(!iter_reply.leadsTo)
                                resultString.push('<div class="add-entry" toreplynumber="'+index+'" style="float: right">+</div>');
                            resultString.push('</div>');
                        resultString.push('</div>');
                        resultString.push('<div class="replyHolder">');// Transition between answer to new Entry
                        if(iter_reply.leadsTo) // Continue Condition
                            resultString.push('<div class="tableBox">'+recur_draw_entry(iter_reply.leadsTo)+'</div>');
                        resultString.push('</div>');
                    resultString.push('</div>');
                }
            }
            /* New reply */
            resultString.push('<div class="reply">');
                resultString.push('<div class="replyHolder">');
                    resultString.push('<div class="replyLabel add-reply">+</div>');
                    resultString.push('</div>');
                resultString.push('</div>');
            resultString.push('</div>');
            resultString.push('<div class="clr"></div>');
        resultString.push('</div>');
        return resultString.join('\r\n');
    }
}


// Playground Functions //

function setPlaygroundBindings(){
    $('#action_box_id .bottom-bar .cancel').click(close_dialog);

    $('#playground .add-entry').click({type: 0}, engageNewEntity);
    $('#playground .add-reply').click({type: 1}, engageNewEntity);
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
    if(isUn(who)){ // All
        var playground = $('#playground .boards').html('');
        var navBar = $('.loaded-boards-nav-list').html('');
        var markup = [];
        var navBarMarkup = [];
        for(var i in boards){
            markup.push('<div class="panel drawing_panel" boardid="'+i+'">');
                markup.push('<div class="board-title">');
                    markup.push(boards[i].boardTitle);
                markup.push('</div>');
            markup.push('<div class="panel-body drawing_board">');
            markup.push(recur_draw_entry(boards[i].interactionTree));
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
    localStorage.setItem('playground', mj());
    alert('Saved!\r\n\r\n\r\n\r\n'+localStorage.getItem('playground'));
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
        'New Entry': 'entry-form-wrapper',
        'New Reply': 'reply-form-wrapper',
        'New Board': 'board-form-wrapper'
    };
    var box_div = $('#action_box_id');
    var form_wrapper_div = $('.'+dialogs[dialog], box_div);
    var bottom_bar_div = $('.bottom-bar', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    $('#action_box_id .title').html('Add '+dialog);
    if(1 || !box_div.is(":visible")){
        form_wrapper_div.hide(); bottom_bar_div.show(); cancel_div.show().css('opacity',1);
        box_div.fadeIn(Tmed, function(){
            form_wrapper_div.slideDown(600, function(){
                //bottom_bar_div.fadeIn(Tmed);
            });
        });
    }
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
function mj(){ return JSON.stringify(boards); }
function cl(c){ console.log(c) };


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
            close_dialog('New Board Added!', redraw());
        });

    });
    load_playground(); //Try
});
