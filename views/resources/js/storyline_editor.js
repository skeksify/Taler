/**
 * Created by Skeksify on 12/13/14.
 */

// Globals //

var chapters = [];
var log_console = 0;
var run_flashes = false;
var onof = true;
var my_clipboard = new clipboardTool();
var unsaved_changes = '';


// Entities: //

function Chapter(settings){
    var defaults = {
        chapterTitle: '',
        chapterBoards: []
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { chapterBoards: [] });
    this.onUpdate = function(){ if(log_console) cl('"'+this.chapterTitle+'" (Chapter) Updated'); };
    this.addBoard = function(new_board){
        return this.chapterBoards.push(new_board);
    }
    this.updateBoard = function(i, board){
        this.chapterBoards[i] = board;
    }
    this.getBoards = function(){return this.chapterBoards }
    this.getBoard = function(i){return this.chapterBoards[i] }
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
    this.onUpdate = function(){ if(log_console) cl('"'+this.boardTitle+'" (Board) Updated'); };
    this.setFirstEntry = function(new_entry){
        return this.interactionTree = new_entry;
    }
    this.setTitle = function(new_title){ this.boardTitle = new_title; this.onUpdate(); return this; }
    this.setType = function(new_type){ this.boardType = new_type; this.onUpdate(); return this; }
    this.setDesc = function(new_desc){ this.boardDesc = new_desc; this.onUpdate(); return this; }
}

function Entry(settings){
    var defaults =  {
        entryLabel: '',
        entrySpeech: '',
        replies: []
    };
    loadSettings(this, settings, defaults);
    forceSettings(this, { replies: [] });
    this.onUpdate = function(){ if(log_console) cl('"'+this.entryLabel+'" (Entry) Updated'); };
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
    this.onUpdate = function(){ if(log_console) cl('"'+this.replyLabel+'" (Reply) Updated'); };
    this.setLeadsTo = function(leadsTo){
        if(!leadsTo){
            this.leadsTo = null;
            this.onUpdate();
        } else
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
    Action will leadTo Entry or another Action
     */
    var defaults = {
        leadsTo: null,
        actionLabel: '',
        actionType: '',
        actionEffect: function(){}
    };

    loadSettings(this, settings, defaults);
    this.onUpdate = function(){ if(log_console) cl('"'+this.actionLabel+'" (Action) Updated'); };

    this.setEffect = function(new_val_actionEffect){
        if(isFu(new_val_actionEffect)){
            actionEffect = new_val_actionEffect;
            this.onUpdate();
        }
    }

    this.setPath = function(new_val_path){ this.redirectPath = new_val_path; }
    this.getPath = function(){ return this.redirectPath; }

    this.setFlagName = function(new_val_flag){ this.flag_name = new_val_flag; }
    this.getFlagName = function(){ return this.flag_name; }
    this.setFlagIcon = function(new_val_flag_icon){ this.flag_icon = new_val_flag_icon; }
    this.getFlagIcon = function(){ return this.flag_icon; }

    this.setLeadsTo = function(leadsTo){
        this.leadsTo = leadsTo;
        this.onUpdate();
        return this.leadsTo;
    }
}

// ARROUZ

function loc(e1, e2){
    var e1p = e1.offset(),
        e2p = e2.offset(),
        e1w = parseInt(e1.css('width')),
        e2w = parseInt(e2.css('width')),
        e1h = parseInt(e1.css('height')),
        e2h = parseInt(e2.css('height'));

    var top = (e1p.top<e2p.top)?e1p.top:e2p.top;
    var left = (e1p.left<e2p.left)?e1p.left:e2p.left;

    var l_el_width = (e1p.left<e2p.left)?e1w:e2w;
    var t_el_height = (e1p.top<e2p.top)?e1h:e2h;

    left += l_el_width/2;
    top += t_el_height/2;

    var width = Math.abs(e1p.left-e2p.left);
    var height = Math.abs(e1p.top-e2p.top);

    var r_el_width = (e1p.left>e2p.left)?e1w:e2w;
    var b_el_height = (e1p.top>e2p.top)?e1h:e2h;

    width -= l_el_width/2;
    width += r_el_width/2;
    height -= t_el_height/2;
    height += b_el_height/2;

    var lol = (e1p.top<e2p.top);
    var flip = (e1p.left<e2p.left)?lol:!lol;


    return {top: top, left: left, width: width, height: height, flip: flip};

    /*if(e1p.left<e2p.left){ left = e1; right = e2; } else { left = e2; right = e1; }
    if(e1p.top<e2p.top){ }
    this.p1x = p1.top;
    this.p1y = p1.left;
    this.p2x = p2.top;
    this.p2y = p2.left;
    this.xh = p1.top>p2.top?p2.top:p1.top; //Higher x
    this.yh = p1.left>p2.left?p1.left:p2.left; //Lefter y*/
}

(new Image()).src = "../ri/arrowu.png"

function drawArrow(f,s){
    var location = loc(s, f);
    $('.arrow-holder').remove();
    $('body').prepend('<div class="arrow-holder"></div>');
    $('.arrow-holder').css({
        'top': location.top,
        'left': location.left,
        'width': location.width,
        'height': location.height,
        'transform': 'rotateY('+(location.flip?'18':'')+'0deg)'
    }).fadeIn(500);
}


// Game Preview //

function game_preview(start_from){
    var current_entry;
    var panel = $('#overlay, #game_preview');
    var gpe = $('#game_preview .wrapper .entry');
    var gpo = $('#game_preview .wrapper .options');
    var character = {
        flags: {}
    };
    this.a = function(){return character;}
    var draw_entry = function(){
        var ent = '', opts = '';
        ent += htmlEscape(current_entry.entrySpeech).trim() || 'Entry has no Description';
        var count = 1;
        var clear = false;
        for(var i in current_entry.replies){
            if(cond = current_entry.replies[i].replyCondition)
                clear = (cond[0]=='!') ? !character.flags[cond.substr(1)] : character.flags[cond];
            else
                clear = true;
            if(clear)
                opts += ('<a next_step="'+i+'">'+count+++'. '+current_entry.replies[i].replyLabel+'</a><br/>');
        }
        if(count==1)
            opts = 'This Entry leads to nothing';
        gpe.html(ent);
        gpo.html(opts);
        $('a', gpo).each(function(){
            $(this).click(function(){
                if(result = current_entry.replies[$(this).attr('next_step')].leadsTo){
                    while(result instanceof Action){
                        var flag_name, icon_class;
                        switch (result.actionType){
                            case 'redirect':
                                result = getEntityBySimplePath(result.getPath().split(','));
                                break;
                            case 'flag_on':
                                flag_name = result.getFlagName();
                                character.flags[flag_name] = true;
                                icon_class = result.getFlagIcon();
                                if($('.flag_indication [for_flag="'+flag_name+'"]').length)
                                    $('.flag_indication [for_flag="'+flag_name+'"]').addClass('on');
                                else
                                    $('.flag_indication').append('<i for_flag="'+flag_name+'" class="fa '+icon_class+' on"></li>')
                                result = result.leadsTo;
                                break;
                            case 'flag_off':
                                flag_name = result.getFlagName();
                                character.flags[flag_name] = false;
                                icon_class = result.getFlagIcon();
                                if($('.flag_indication [for_flag="'+flag_name+'"]').length)
                                    $('.flag_indication [for_flag="'+flag_name+'"]').removeClass('on');
                                else
                                    $('.flag_indication').append('<i for_flag="'+flag_name+'" class="fa '+icon_class+' on"></li>')
                                result = result.leadsTo;
                                break;
                            case 'kill':
                                break;
                        }
                    }
                    current_entry = result;
                    draw_entry();
                } else $(this).html(' <span style="font-size:12px; vertical-align: middle;" class="reg">(Leads nowhere) </span>');
            });
        })
    }
    if(chapters.length){
        current_entry = start_from || chapters[0].chapterBoards[0].interactionTree;
        gpe.html('');
        gpo.html('');
        $('.flag_indication i').remove();
        panel.fadeIn(200, function(){
            draw_entry();
            $('.closer', panel).click(function(){
                panel.fadeOut(200);
                if(first_time){
                    first_time = false;
                    tc.start('tutorials');
                }
            });
        });
    } else {} //Empty game
}
var first_time = 1;


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

function clipboardTool() {
    var value;
    var modes = {
        cncmode: false,
        pastemode: false
    }
    var showHideControls = function(on){
        ((controls = $('#cnppaste, #cnpclear')) && on)?controls.show():controls.hide();
    }
    this.clear = function(){ value = null; cl('Clipboard cleared'); showHideControls(false); };
    this.set = function(val){ value = val; cl((value.replyLabel?('"'+value.replyLabel+'" s'):'S')+'aved to clipboard!'); showHideControls(!!value); };
    this.get = function(){ return value; }
    this.getMode = function(mode){ return modes[mode]; }
    this.setMode = function(mode, onoff){ modes[mode] = onoff; showHideControls(!!value); }
}

// Storyline Editing //

function engageNewEntity(paramObject){
    var that = this; // Keeping the invoking element
    var board_id = $(that).closest('.drawing_panel').attr(key);
    var entityType = paramObject.data.type;
    /*
     ToDo: Father Entity Indication (Onboard)

     */
    if(my_clipboard.getMode('pastemode')){
        var pseudoReply = JSON.parse(JSON.stringify(my_clipboard.get()))
        var option_to_paste = new Reply(pseudoReply); //Make the first manually (Cause recursion starts from Entry)
        if(pseudoReply.leadsTo)
            option_to_paste.setLeadsTo(recurMakeEntry(pseudoReply.leadsTo));
        getEntityBySimplePath(makeSimplePath(that)).addReply(option_to_paste);
        $('.add-reply').removeClass('active_pastable');
        redraw();
        cl('"'+option_to_paste.replyLabel+'" pasted from clipboard!');
    }
    else{
        resetActionboxValues();
        setTimeout(function(){
            drawArrow($(that), $('#action_box_id .top-bar'));
        }, 500);
        open_dialog(entityType, function(){
            var updatedEntity = null;
            var entityToUpdate = getEntityBySimplePath(makeSimplePath(that));
            switch (entityType){ //Reply
                case 'New Action':
                    var path, flag_name, flag_icon, actionType = $('input[name=new_action_effect]:checked').val();
                    switch (actionType){
                        case 'redirect':
                            path = $('#target_entry_path').val();
                            break;
                        case 'flag_on':
                            flag_name = $('#new_action_flag_nameI').val();
                            flag_icon = $('#new_action_flag_icon').val();
                            break;
                        case 'flag_off':
                            flag_name = $('#new_action_flag_nameII').val();
                            break;
                        case 'kill':
                            break;
                    }
                    var settings = {
                        actionType: actionType,
                        actionLabel: $('#new_action_labelI').val()
                    }
                    if(settings.actionLabel){
                        updatedEntity = entityToUpdate.setLeadsTo(new Action(settings));
                        switch (actionType){
                            case 'redirect':
                                updatedEntity.setPath(path);
                                break;
                            case 'flag_on':
                            case 'flag_off':
                                updatedEntity.setFlagName(flag_name);
                                updatedEntity.setFlagIcon(flag_icon);
                                break;
                        }
                        close_dialog();
                        cl('"'+updatedEntity.actionLabel+'" (Action) added successfully');
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
                        cl('"'+updatedEntity.replyLabel+'" (Reply) added successfully');
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
                        cl('"'+updatedEntity.entryLabel+'" (Entry) added successfully');
                        redraw(board_id);
                    }
                    break;
            }
        });
    }
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
    } else { // Action
        resultEntry = new Action(pseuEntry);
        if(pseuEntry.redirectPath)
            resultEntry.setPath(pseuEntry.redirectPath);
        if(pseuEntry.flag_name){
            resultEntry.setFlagName(pseuEntry.flag_name);
            resultEntry.setFlagIcon(pseuEntry.flag_icon);
        }
        if(resultEntry.leadsTo)
            resultEntry.setLeadsTo(recurMakeEntry(resultEntry.leadsTo))
    }
    return resultEntry;
}
var ppp=0;
function recur_draw_entry(entry){
    if(entry instanceof Entry || entry instanceof Action){
        var resultString = [];
        resultString.push('<div class="entry" breadcrumbs="'+((entry instanceof Action)?'$':'+')+'">');
            if(entry instanceof Action){
                resultString.push('<div class="replyHolder">');
                    resultString.push('<div class="actionLabel'+(entry.actionType=='redirect'?' redirect':'')+''+(entry.leadsTo?' notLeaf':'')+'">');
                        resultString.push('<div>' + entry.actionLabel + '</div>');
                        if(icon = entry.getFlagIcon())
                            resultString.push('<i class="fa '+icon+'"></i>');
                        if(!entry.leadsTo && entry.actionType!='redirect')
                            resultString.push(
                                '<div class="add-entry"><a><i class="fa fa-plus link"></i></a></div>' +
                                '<div class="add-action"><a><i class="fa fa-bolt link"></i></a></div>');
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
                    resultString.push(1?'<div class="curled">{</div>':'');
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
                                            '<div class="add-entry"><a><i class="fa fa-plus link"></i></a></div>' +
                                            '<div class="add-action"><a><i class="fa fa-bolt link"></i></a></div>');
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
                            resultString.push('<div class="replyLabel add-reply"><i class="fa fa-plus-square"></i> </div>');
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

function getEntityBySimplePath(oldPath){
    var path = oldPath.slice(); // Make copy, don't ruin oldPath
    var firsTwo = path.splice(0,2);
    if(oldPath.length==1) // Chapter
        return chapters[firsTwo[0]];
    var board = chapters[firsTwo[0]].getBoard(firsTwo[1]);
    if(!path.length) // Board
        return board;
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
    var result = $('.drawing_panel['+key+'="'+firsTwo[1]+'"]>.board-scroller>.drawing_board', $('.chapter['+key+'='+firsTwo[0]+']'));
    for(var i in path)
        result = result.closestDescendant('[breadcrumbs="'+path[i]+'"]');
    return result;
}
// Chapter Functions //

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
        element.animate({boxShadow: '0 0 0 #000'}, 500, function(){ $(element)[0].removeAttribute("style") });
}

function setChapterBindings(){
    resetTabs();
    makeTabs();

    $('.curled').each(function(){
        /*
        Lato:
         var fixedTop = -(curl_height-parent_height)/1.5;
         var fixedLeft = ((parent_width-10)-(curl_width*0.17));
         */
        var curl = $(this);
        var parent_height = parseInt(curl.parent().css('height'));
        var parent_width = parseInt(curl.parent().css('width'));
        curl.css('font-size', (parent_height)+'px');
        var curl_height = parseInt(curl.css('height'));
        var curl_width = parseInt(curl.css('width'));
        var fixedTop = -(curl_height-parent_height)*0.522;
        var fixedLeft = ((parent_width-10)-(curl_width*0.37));
        curl.css('top', fixedTop).css('left', fixedLeft).fadeIn(500);
    });

    $('.board-scroller').scroll(function(){ blur_context(); $('.arrow-holder').remove();});
    $(document).scroll(function(){ $('.arrow-holder').remove();});

    var cnpables = $('.drawing_board .reply');
    var cncmode, pastemode;

    $('#cutncopy').unbind().click(function(){
        cncmode = my_clipboard.getMode('cncmode');
        pastemode = my_clipboard.getMode('pastemode');
        if(!cncmode){
            $('.cnp_tools').remove();
            $('.cnpsel').removeClass('cnpsel');
            my_clipboard.setMode('pastemode', false);
            my_clipboard.setMode('cncmode', true);
            cl('Entered Cut/Copy mode');
        }
    });
    $('#cnppaste').unbind().click(function(){
        cncmode = my_clipboard.getMode('cncmode');
        pastemode = my_clipboard.getMode('pastemode');
        if(my_clipboard.get()){
            $('.add-reply').addClass('active_pastable');
            $('.cnp_tools').remove();
            $('.cnpsel').removeClass('cnpsel');
            my_clipboard.setMode('cncmode', false);
            my_clipboard.setMode('pastemode', true);
            cl('Entered Paste mode');
        }
    });
    $('#cnpclear').unbind().click(function(){
        my_clipboard.clear();
        my_clipboard.setMode('cncmode', false);
        my_clipboard.setMode('pastemode', false);
    });
    cnpables.hover(
        function(){
            cncmode = my_clipboard.getMode('cncmode');
            pastemode = my_clipboard.getMode('pastemode');
            if(cncmode){
                cnpables.removeClass('cnp');
                $(this).addClass('cnp');
                $(this).click(function(){
                    cncmode = my_clipboard.getMode('cncmode');
                    pastemode = my_clipboard.getMode('pastemode');
                    if(cncmode){
                        cnpables.removeClass('cnp');
                        $(this).addClass('cnpsel');
                        $(this).prepend('<div class="cnp_tools"><a class="cut"><i class="fa fa-cut link"></i></a> <a class="copy"><i class="fa fa-copy link"></i></a> <a class="close"><i class="fa fa-close link"></i></a> </div>')
                        $('.cnp_tools a:not(.close)', this).unbind().click(function(){
                            var simplePathToWhom = makeSimplePath(this);
                            my_clipboard.set(getEntityBySimplePath(simplePathToWhom));
                            if($(this).hasClass('cut')){
                                delete_entity(simplePathToWhom)
                                redraw();
                            }
                            $('.cnp_tools').remove();
                            $('.cnpsel').removeClass('cnpsel');
                        });
                        $('.cnp_tools a.close', this).unbind().click(function(){ $('.cnp_tools').remove(); $('.cnpsel').removeClass('cnpsel'); });
                        my_clipboard.setMode('cncmode', false);
                        my_clipboard.setMode('pastemode', false);
                    }
                });
            }
        },
        function(){
            cncmode = my_clipboard.getMode('cncmode');
            pastemode = my_clipboard.getMode('pastemode');
            if(cncmode)
                $(this).removeClass('cnp');
        }
    );

    //Board Tools (Edit, Delete)
    $('.edit_board').click(function(){
        var parents = $(this).parents('['+key+']');
        blur_context();
        var board = getEntityBySimplePath([$(parents[1]).attr(key), $(parents[0]).attr(key)]);
        if(board.boardType)
            $('input[name=new_board_type][value='+board.boardType+']').prop('checked', true);
        var input_title = $('#new_board_titleI').val(board.boardTitle);
        var ta_desc = $('#new_board_descI').val(board.boardDesc);
        open_dialog('Edit Board', function(){
            board.setTitle(input_title.val());
            board.setDesc(ta_desc.val());
            board.setType($('input[name=new_board_type]:checked').val());
            cl('"'+board.boardTitle+'" (Board) updated');
            close_dialog(); redraw();
        });
    });
    $('.delete_board').click(function(){
        var parents = $(this).parents('['+key+']');
        var chapter_id = $(parents[1]).attr(key);
        var board_id = $(parents[0]).attr(key);
        alert('Are you sure?', function(){ //On OK
            var deleted_board = chapters[chapter_id].chapterBoards.splice(board_id, 1)[0];
            cl('"'+deleted_board.boardTitle+'" (Board) deleted');
            close_dialog(); redraw();
        })
    })
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

    $('.chapters .add-entry').click({type: 'New Entry'}, engageNewEntity);
    $('.chapters .add-reply').click({type: 'New Reply'}, engageNewEntity);
    $('.chapters .add-action').click({type: 'New Action'}, engageNewEntity);

    $('.newboard').unbind().click(function(){
        var chapter_id = $(this).parent().attr(key);
        resetActionboxValues();
        open_dialog('New Board', function(){newBoard(chapter_id)});
    });

    var all_labels = $('.chapters .actionLabel, .chapters .replyLabel:not(.add-reply), .chapters .entryLabel');
    all_labels.on('contextmenu', function(ev){
        if(tut_step_indication == "edit_first_reply")
            tc.hide();
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
        var dialog_title, label, speech, cond, window_markup = [], editF, delete_msg;
        switch (entity_type){
            case "Action":
                delete_msg = '"'+entity.actionLabel+'" (Action) deleted';
                editF = null;
                label = entity.actionLabel;
                //window_markup.push(entity.actionEffect.toString());
                window_markup.push('Type: '+entity.actionType);
                switch (entity.actionType){
                    case 'redirect':
                        window_markup.push('');
                        break;
                    case 'flag_on':
                        window_markup.push('<br/>Flag: <div class="code">'+entity.getFlagName()+'</div>');
                        break;
                    case 'flag_off':
                        window_markup.push('<br/>Flag: <div class="code">'+entity.getFlagName()+'</div>');
                        break;
                    case 'kill':
                        window_markup.push('');
                        break;
                }
                if(path = entity.getPath()){
                    var element = getElementBySimplePath(path.split(','));
                    var playable = element.children().first().find('.entryLabel');//.addClass('pickable');
                    drawArrow(triggerer, playable);
                    run_flashes = true;
                    toggleLight(playable);
                }
                break;
            case "Entry":
                delete_msg = '"'+entity.entryLabel+'" (Entry) deleted';
                dialog_title = 'Edit Entry';
                label = entity.entryLabel;
                speech = entity.entrySpeech;
                if(speech)
                    window_markup.push(htmlEscape(speech));
                else
                    window_markup.push('Empty');
                var input_label = $('#new_entry_labelI').val(label);
                var ta_speech = $('#new_entry_speechI').val(speech);
                editF = function(){
                    entity.setLabel(input_label.val());
                    entity.setSpeech(ta_speech.val());
                    close_dialog();
                    cl('"'+entity.entryLabel+'" updated successfully');
                    redraw(simple_path[0]);
                    if(tut_step_indication=='edit_first_entry_done' && !(tut_step_indication=''))
                        tc.next();
                }
                break;
            case "Reply":
                delete_msg = '"'+entity.replyLabel+'" (Reply) deleted';
                dialog_title = 'Edit Reply';
                label = entity.replyLabel;
                speech = htmlEscape(entity.replySpeech);
                cond = entity.replyCondition;
                if(cond)
                    window_markup.push('Condition:<br/><div class="code">'+cond+'</div>');
//                if(speech)
//                    window_markup.push('Speech:<br/>'+speech);
//                else
//                    window_markup.push('Empty');
                var input_label = $('#new_reply_labelI').val(label);
                var ta_speech = $('#new_reply_speechI').val(speech);
                var ta_cond = $('#new_reply_condI').val(cond);
                ///////////if(cond)
                    ///////////////////////////////ta_cond.val(cond);
                editF = function(){
                    entity.setLabel(input_label.val());
                    entity.setSpeech(ta_speech.val());
                    entity.setCondition(ta_cond.val());
                    close_dialog();
                    cl('"'+entity.replyLabel+'" updated successfully');
                    redraw(simple_path[0]);
                    if(tut_step_indication=='done_edit_first_reply' && !(tut_step_indication=''))
                        tc.next();
                };
                break;
        }
        //floater.hide().css('top', triggerer_pos.top+height-5).css('left', triggerer_pos.left+width-5).fadeIn(100);
        floater.hide().css('top', ev.pageY+10).css('left', ev.pageX+10).fadeIn(100);
        var play_from_here_icon = floater.find('.play_from_here').unbind();
        if(entity_type=='Entry')
            play_from_here_icon.show().click(function(){
                blur_context();
                new game_preview(entity);
            });
        else
            play_from_here_icon.hide();
        var edit_icon = floater.find('.edit').unbind();
        if(isFu(editF))
            edit_icon.show().click(function(){
                blur_context();
                open_dialog(dialog_title, editF);
                setTimeout(function(){
                    drawArrow(triggerer, $('#action_box_id .top-bar'));
                }, 500);
            });
        else
            edit_icon.hide();
        if(simple_path.length!=3) // Not Board's first Entry
            floater.find('.delete').show().unbind().click(function(){
                blur_context();
                alert('Are you sure? <br/><div class="warning reg">Will delete all child nodes as well!</div>', function(){ //On OK
                    delete_entity(simple_path);
                    cl(delete_msg);
                    close_dialog(); redraw();
                });
            });
        else // First Entry, don't show delete tool
            floater.find('.delete').hide();
        var content_element = floater.find('.content');
        content_element.html(window_markup.join(''));
        floater.find('.title').html(entity_type);
        if((tut_step_indication=='open_floater_first' || tut_step_indication=='done_edit_first_reply') && !(tut_step_indication=''))
            tc.next();

        if(entity_type=='Reply')
            content_element.hide();
        else
            content_element.show();
        ev.preventDefault();
    });

    if(tut_step_indication=='add_first_reply_done' && !(tut_step_indication=''))
        tc.next()
}

function delete_entity(simplePathToWhom){
    var toDeletePathMark = parseInt(simplePathToWhom.splice(simplePathToWhom.length-1, 1));
    var leadingTo = getEntityBySimplePath(simplePathToWhom);
    switch (leadingTo.constructor.name){
        case "Reply":
            leadingTo.setLeadsTo(null);
            break;
        case "Action":
            leadingTo.setLeadsTo(null);
            break;
        case "Entry": // Father is Entry, meaning deleting reply
            leadingTo.replies.splice(toDeletePathMark, 1);
            break;
    }
}

function blur_context(){
    if($('.active_label').length){
        $('.arrow-holder').remove();
        $('.pickable').removeClass('pickable');
        $('#floater').fadeOut(50);
        $('.active_label').removeClass('active_label');
        run_flashes = false;
    }
}

function recompileChapters(ChaptersJSON){
    var pseuChapters;
    if(isSt(ChaptersJSON))
        pseuChapters = JSON.parse(ChaptersJSON);
    else if (isOb(ChaptersJSON))
        pseuChapters = ChaptersJSON;
    chapters = [];
    var tmpChapter, tmpBoard;
    for(var i in pseuChapters){
        tmpChapter = new Chapter(pseuChapters[i]);
        for(var b in boards = pseuChapters[i].chapterBoards){
            tmpBoard = new Board(boards[b]);
            tmpBoard.setFirstEntry(recurMakeEntry(boards[b].interactionTree)); //Init Recursion
            tmpChapter.addBoard(tmpBoard);
        }
        chapters.push(tmpChapter);
    }
}
var saved_data, local_data;

function loadThis(served_data){
    saved_data = JSON.stringify(served_data);
    local_data = localStorage.getItem(game_id);
    recompileChapters((local_data && saved_data!=local_data)?local_data:saved_data);
}
var refresh_usdata_indication = function(){
    if(local_data && saved_data!=local_data){
        $('#unsaved_changes_list').show();
        $('#menunc').hide();
        localStorage.setItem(game_id, local_data);
    } else {
        $('#unsaved_changes_list').hide();
        $('#menunc').show();
    }
}
function redraw(who){
    local_data = mjs();
    refresh_usdata_indication();

    $('#floater').hide();
    if(1 || isUn(who)){ // All //For now
        var game = $('.chapters').html('');
        var tabs_element = $('#tabs').html('');
        var markup = [];
        var tabs = [];
        var dd;
        for(var i in chapters){
            tabs.push('<li><a href="#chapter_'+i+'" tab_number="'+i+'">'+chapters[i].chapterTitle+'</a></li>');
            markup.push('<div class="chapter" '+key+'="'+i+'">');
                markup.push('<div class="boards">');
                    for(var b in boards = chapters[i].getBoards()){
                        markup.push('<div class="panel drawing_panel" '+key+'="'+b+'">');
                            markup.push('<div class="board-header">');
                                markup.push('<div class="board-tools">');
                                    markup.push('<a class="edit_board"><i class="fa fa-pencil link"></i></a>');
                                    markup.push('<a class="delete_board"><i class="fa fa-trash-o link"></i></a>');
                                markup.push('</div>');
                                markup.push('<div class="board-title">');
                                    if(boards[b].boardType=='area')
                                        markup.push('<i class="fa fa-tree" title="Area Board"></i> ');
                                    else
                                        markup.push('<i class="fa fa-comments" title="Conversation Board"></i> ');
                                    markup.push(boards[b].boardTitle);
                                markup.push('</div> ');
                            markup.push('</div>');
                            markup.push('<div class="board-scroller">');
                                markup.push('<div class="panel-body drawing_board">');
                                    dd = recur_draw_entry(boards[b].interactionTree);
                                    markup.push(dd);
                                markup.push('</div>');
                            markup.push('</div>');
                        markup.push('</div>');
                    }
                markup.push('</div>');
                markup.push('<a class="newboard">New Interaction</a>');
            markup.push('</div>');
        }
        tabs.push('<li><a onclick="new_chapter()" class="new_chapter_tab">+</a></li>');
        tabs_element.html(tabs.join(''))
        game.append(markup.join(''));
        setChapterBindings();
    } else { // One board
        var dr_p = $('.drawing_panel['+key+'='+who+']');
        var dr_b = $('.drawing_board', dr_p); //lol dr. p
        dr_p.fadeOut(Tmed, function(){
            dr_b.html(recur_draw_entry(boards[who].interactionTree));
            setChapterBindings();
            dr_p.fadeIn(Tmed);
            //goPlumb();
        });
    }
    //tc.next();
}


function load_game(){
    alert('Discard unsaved changes?', function(){
        local_data = localStorage.setItem(game_id, ''); // Returns Undefined
        window.location = '';
    });
}

function save_game(){
    alert('Overwrite old save?', function(){
        show_msg('<i class="fa fa-spinner fa-pulse"></i> Saving...', function(){
            var chapters_json = mjs();
            var my_tmp_boards = { game_id: game_id, chapters: chapters_json};
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: '/make/save_game',
                data: my_tmp_boards,
                success: function(result){
                    if(result.success){
                        close_dialog();
                        cl('Saved');
                        saved_data = local_data;
                        local_data = localStorage.setItem(game_id, ''); // Returns Undefined
                        refresh_usdata_indication();
                    }
                    else
                        alert(result.error);
                }
            });
        });
    });
}
/*
function load_chapter(){
    if(1 || confirm('Are you sure you want to load?')){
        var loadedChapter = localStorage.getItem('chapter');
        var chapterObj = JSON.parse(loadedChapter);
        if(isOb(chapterObj)){
            recompileChapters(chapterObj);
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



function new_chapter(){
    resetActionboxValues();
    open_dialog('New Chapter', function(){
        var settings = {
            chapterTitle: $('#new_chapter_titleI').val()
        };
        if(settings.chapterTitle){
            var tmpNewChapter = new Chapter(settings);
            var new_chapter_id = chapters.push(tmpNewChapter);
            close_dialog();
            cl('New Chapter Added!');
            window.location = ('#chapter_'+(new_chapter_id-1));
            redraw();
        }
    });
}

function newBoard(chapter_id){
    var settings = {
        boardTitle: $('#new_board_titleI').val(),
        boardType: $('input[name=new_board_type]:checked').val(),
        boardDesc: $('#new_board_descI').val()
    };
    if(settings.boardTitle){
        var tmpNewBoard = new Board(settings);
        tmpNewBoard.setFirstEntry(new Entry({entryLabel: 'First Entry'}));
        chapters[chapter_id].addBoard(tmpNewBoard);
        close_dialog();
        cl('New Board Added!');
        redraw();
    }
}

$(document).keyup(function(e) {
    switch(e.which){
        case 27: // Escape
            blur_context();
            close_dialog();
            break;
    }
});

// Document Ready
$(document).ready(function(){
    resetTabs();
    makeTabs();

    $('.preview_game').click(function(){
        new game_preview();
    });
    $('#save_game').click(function(){
        save_game();
    });
    $('#load_game').click(function(){
        load_game();
    });

    $(document).click(function(event){
        if(!$('#floater').find(event.target).length && !$(event.target).hasClass('dont_blur'))
            blur_context();
    });
});










function resetTabs(){
    $(".chapter").hide(); //Hide all content
    $("#tabs a").removeClass('atab'); //Reset id's
}

var myUrl, myUrlTab;

function makeTabs(){
    myUrl = window.location.href; //get URL
    myUrlTab = myUrl.substring(myUrl.indexOf("#")); // For mywebsite.com/tabs.html#tab2, myUrlTab = #tab2
    $(".chapter").hide(); // Initially hide all content

    $("#tabs a[tab_number]").on("click",function(e) {
        //e.preventDefault();
        if ($(this).hasClass('atab')){ //detection for current tab
            return
        }
        else{
            resetTabs();
            $(this).addClass('atab'); // Activate this
            var tn = $(this).attr('tab_number');
            $('.chapter['+key+'='+tn+']').fadeIn(); // Show content for current tab
        }
    });

    if((chapnum = myUrlTab.split('#chapter_')).length==2){
        resetTabs();
        $("a[tab_number='"+chapnum[1]+"']").addClass('atab'); // Activate url tab
        $('.chapter['+key+'='+chapnum[1]+']').fadeIn(); // Show url tab content
    } else {
        $("#tabs li:first a").addClass('atab'); // Activate first tab
        $(".chapter:first").fadeIn(); // Show first tab content
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
    return str ? String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br />') : '';
}


/*

 Key	Code
 backspace	8
 tab	9
 enter	13
 shift	16
 ctrl	17
 alt	18
 pause/break	19
 caps lock	20
 escape	27
 page up	33
 page down	34
 end	35
 home	36
 left arrow	37
 up arrow	38
 right arrow	39
 down arrow	40
 insert	45
 delete	46
 0	48
 1	49
 2	50
 3	51

 */