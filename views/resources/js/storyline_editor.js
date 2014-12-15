/**
 * Created by Skeksify on 12/13/14.
 */

var Tmed = 500;
var board_references = [];
var board_ref_indexer = 0;
var board = new storylineBoard();
var cl = function(c,f, cond){ if((f || 0) && (typeof(cond)=='undefined' || (typeof(cond)!='undefined' && cond))) console.log(c) };

$(document).ready(function(){
    $('.btn-add').click(function(){
        open_dialog();
    });
    //make(); redraw();
});

/*HAHA
 MuLTIPLLL BORDZZZZ
 */
function setBoardBindings(){

    $('#new_entry_box .bottom-bar .cancel').click(function(){
        close_dialog();
    });

    $('#drawing_board .add-entry').click({type: 0}, engageNewEntity);
    $('#drawing_board .add-reply').click({type: 1}, engageNewEntity);
}

function engageNewEntity(paramObject){
    var that = this; // Keeping the invoking element
    var entityType = paramObject.data.type;
    //Color and selectize
    $('#new_entry_box .title').html('Add New '+(entityType?'Reply':'Entry'));
    open_dialog();

    $('#new_entry_box .ok').unbind().click(function(){
        var updatedEntity = null;
        var entityToUpdate = getEntity.call(that, !entityType);
        if(entityType){ //Reply
            var replyLabel = $('#new_entry_labelI').val();
            var speech = $('#new_entry_speechI').val();
            updatedEntity = entityToUpdate.addReply(new Reply({replyLabel: replyLabel, speech: speech}));
            close_dialog('"'+updatedEntity.replyLabel+'" added successfully!', redraw);
        } else { //Entry
            var replyLabel = $('#new_entry_labelI').val();
            var speech = $('#new_entry_speechI').val();
            updatedEntity = entityToUpdate.setLeadsTo(new Entry({entryLabel: replyLabel, speech: speech}));
            close_dialog('"'+updatedEntity.entryLabel+'" added successfully!', redraw);
        }
    });
    // Propagate /this/
}
/*
 MuLTIPLLL BORDZZZZ
 */
function getEntity(entityType){
    var add_button = $(this);
    var parent_replies = add_button.parents('[replynumber]');
    var parent_replies_numbers = [];
    parent_replies.each(function(){
        var reply_number = $(this).attr('replynumber');
        parent_replies_numbers.push(reply_number);
    });
    parent_replies_numbers.reverse(); // Was running in out, need path from root
    return getEntityByPath(parent_replies_numbers, entityType);
}

function getEntityByPath(path, entityType){ cl(path,1);
    var nextEntry, thisReply;
    var resultEntry = board.interactionTree;
    if(typeof(path)=='object' && path.length && resultEntry instanceof Entry){
        for(var i in path){
            if((parseInt(i)+1)!=path.length || !entityType)
                if((thisReply = resultEntry.replies[path[i]]) instanceof Reply && (nextEntry = thisReply.leadsTo) instanceof Entry)
                    resultEntry = nextEntry;
                else
                    return console.error('Path error');
        }
    }

    return entityType ? resultEntry.replies[path[path.length-1]] : resultEntry;
}

function storylineBoard(settings){
    this.interactionTree = null;
    this.initialized = false;
    this.add = function(newEntry){
        if(!this.initialized){
            this.initialized = true;
            return this.interactionTree = newEntry;
        }
    }
    this.isInit = function(){ return this.initialized; }
}

function Entry(settings){
    this.entryLabel = settings.entryLabel;
    this.speech = settings.speech;
    this.replies = [];
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
    this.replyLabel = settings.replyLabel;
    this.speech = settings.speech;
    this.replyType = settings.replyType;
    this.leadsTo = null;
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
    this.leadsTo = settings.leadsTo;
    this.action = settings.action;
    this.onUpdate = function(){ cl('Action Updated'); };

    this.setLeadsTo = function(leadsTo){
        this.leadsTo = leadsTo;
        this.onUpdate();
    }
}

function addNewEntry(leading_option){
    //ToDo Validation and balloon notif
    var label_value = $('#new_enty_labelI').val();
    var speech_value = $('#new_enty_speechI').val();
    if(!leading_option || !board.isInit()){ // First Entry
        board.add(new Entry({entryLabel: label_value, speech: speech_value}));

    } else {
        // Has a father!
        cl('Has a father!');
    }
    redraw();
    close_dialog('DONE!');
}

function redraw(){
    if(board.isInit()){
        var dr_p = $('#drawing_panel');
        var dr_b = $("#drawing_board");
        dr_p.fadeOut(Tmed, function(){
            dr_b.html(recur_draw_entry(board.interactionTree, 0));
            setBoardBindings();
            dr_p.fadeIn(Tmed);
            //goPlumb();
        });
    }
}
/*
 MuLTIPLLL BORDZZZZ
 */
/*
 MuLTIPLLL BORDZZZZ
 */
/*
 MuLTIPLLL BORDZZZZ
 */
function recompileBoard(boardJSON){
    var pseuBoard;
    if(typeof(boardJSON)=='string')
        pseuBoard = JSON.parse(boardJSON);
    else if (typeof(boardJSON)=='object')
        pseuBoard = boardJSON;

    if(pseuBoard.initialized){
        var tmpBoard = new storylineBoard();
        tmpBoard.add(recurMakeEntry(pseuBoard.interactionTree)); //Init Recursion
        board = tmpBoard;
    }
    else
        return 'you got shit';
}

function recurMakeEntry(pseuEntry){
    var resultEntry = new Entry({entryLabel: pseuEntry.entryLabel, speech: pseuEntry.speech});
    for(var index in pseuEntry.replies){
        var iter_pseuReply = pseuEntry.replies[index];
        var iter_reply = new Reply({replyLabel: iter_pseuReply.replyLabel, speech: iter_pseuReply.speech});
        if(iter_pseuReply.leadsTo) // Continue Condition, means you haven't reached a leaf (Reply that ends the dialog)
            iter_reply.setLeadsTo(recurMakeEntry(iter_pseuReply.leadsTo));
        resultEntry.addReply(iter_reply);
    }
    return resultEntry;
}

function recur_draw_entry(entry, idEnumerator){
    if(entry instanceof Entry){
        var resultString = [];
        resultString.push('<div class="entry">');// id="'+idEnumerator+' MAYBE NO ENUMERATOR?!
            resultString.push('<div class="replyHolder">');
                resultString.push('<div class="entryLabel">' + entry.entryLabel + '</div>');
            resultString.push('</div>');
            resultString.push('<div class="replyHolder">');
            for(var index in entry.replies){
                cl(index+'-'+entry.replies.length, 0);
                var iter_reply = entry.replies[index];
                //debugger;
                if(iter_reply instanceof Reply){
                    resultString.push('<div class="reply'+(iter_reply.leadsTo?' notLeaf':'')+'" replynumber="'+index+'">');
                        resultString.push('<div class="replyHolder">');
                            resultString.push('<div class="replyLabel'+(iter_reply.leadsTo?' notLeaf':'')+'">');
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

function open_dialog(){
    var box_div = $('#new_entry_box');
    var cont_div = $('.cont', box_div);
    var bottom_bar_div = $('.bottom-bar', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    if(!box_div.is(":visible")){
        cont_div.hide(); bottom_bar_div.show(); cancel_div.show().css('opacity',1);
        box_div.fadeIn(Tmed, function(){
            cont_div.slideDown(600, function(){
                //bottom_bar_div.fadeIn(Tmed);
            });
        });
    }
}

function close_dialog(msg, callback){
    var box_div = $('#new_entry_box');
    var cont_div = $('.cont', box_div);
    var msg_div = $('.msg', box_div);
    var cancel_div = $('.bottom-bar .cancel', box_div);
    if(box_div.is(":visible")){
        $('#new_enty_speechI').val('');
        $('#new_enty_labelI').val('');
        if(msg){
            msg_div.hide();
            cancel_div.animate({opacity: 0}, 200, 'linear');
            cont_div.slideUp(Tmed, function(){
                msg_div.html(msg);
                msg_div.slideDown(Tmed, function(){
                    setTimeout(function(){
                        msg_div.slideUp(Tmed, function(){
                            box_div.fadeOut(Tmed);
                        })
                    }, 1500);
                    if(typeof(callback)=='function')
                        callback();
                });
            });
        } else {
            cont_div.slideUp(Tmed, function(){
                box_div.fadeOut(Tmed);
            });
        }
    }
}

function make(){
    var tmpObj = {"interactionTree":{"entryLabel":"First Entry","speech":"Hello there","replies":[{"replyLabel":"Sup","speech":"Hi, I'm Ben, what's your name?","leadsTo":{"entryLabel":"Second Entry!","speech":"I'm Greg bitch, you lookin' for work?","replies":[{"replyLabel":"Yes","speech":"Yeah man, gimmy whacha got","leadsTo":null},{"replyLabel":"No","speech":"Gotta go! BYE","leadsTo":null},{"replyLabel":"New Reply","speech":"Hmm","leadsTo":null},{"replyLabel":"Another Reply","speech":"Hmm2","leadsTo":null}]}},{"replyLabel":"No talk","speech":"Gotta go! BYE","leadsTo":{"entryLabel":"Why not?!","speech":"wyyyy","replies":[{"replyLabel":"What do you mean?","speech":"Hmm2","leadsTo":null},{"replyLabel":"Because Fuck you!","speech":"Hmm2","leadsTo":null}]}},{"replyLabel":"Fight","speech":"Hey man, you just fucked with the wrong guy","leadsTo":null}]},"initialized":true};
    tmpObj = {"interactionTree":{"entryLabel":"Hi there, what can I do for you?","replies":[{"replyLabel":"Hi, I need some beans","leadsTo":{"entryLabel":"Beans? Sure, five cent a kilo, coo?","replies":[{"replyLabel":"Five cent? Sure, give me 3","leadsTo":null},{"replyLabel":"What?! Too bloody expensive man","leadsTo":null}]}},{"replyLabel":"Hi, I need some peas","leadsTo":{"entryLabel":"Peas? Sorry lad, none here","replies":[{"replyLabel":"Ah, too bad. Thanks","leadsTo":null}]}},{"replyLabel":"Nothing much yo","leadsTo":null}]},"initialized":true};
    tmpObj = {"interactionTree":{"entryLabel":"Hi there, what can I do for you?","replies":[{"replyLabel":"Hi, I need some beans","leadsTo":{"entryLabel":"Beans? Sure, five cent a kilo, coo?","replies":[{"replyLabel":"Five cent? Sure, give me 3","leadsTo":{"entryLabel":"Three it is!","replies":[{"replyLabel":"Thanks sir!","leadsTo":null},{"replyLabel":"*Nod*","leadsTo":null},{"replyLabel":"Thanks for nothing","leadsTo":null}]}},{"replyLabel":"What?! Too bloody expensive man","leadsTo":{"entryLabel":"Alright alright, 3 cent","replies":[{"replyLabel":"Great!","leadsTo":null},{"replyLabel":"You know what, here's 4","leadsTo":null}]}}]}},{"replyLabel":"Hi, I need some peas","leadsTo":{"entryLabel":"Peas? Sorry lad, none here","replies":[{"replyLabel":"Ah, too bad. Thanks","leadsTo":null},{"replyLabel":"Come on, go check in the back","leadsTo":null},{"replyLabel":"LIER!","leadsTo":{"entryLabel":"HEYO! CHILL!","replies":[{"replyLabel":"Time to die!","leadsTo":null},{"replyLabel":"Ok ok, sorry","leadsTo":null}]}}]}},{"replyLabel":"Nothing much yo","leadsTo":null}]},"initialized":true};
    recompileBoard(tmpObj);
}

function mj(){
    return JSON.stringify(board);
}

function goPlumb(){
    jsPlumb.ready(function() {

        var color = "gray";

        var instance = jsPlumb.getInstance({
            // notice the 'curviness' argument to this Bezier curve.  the curves on this page are far smoother
            // than the curves on the first demo, which use the default curviness value.
            Connector : [ "Bezier", { curviness:50 } ],
            DragOptions : { cursor: "pointer", zIndex:2000 },
            PaintStyle : { strokeStyle:color, lineWidth:2 },
            EndpointStyle : { radius:9, fillStyle:color },
            HoverPaintStyle : {strokeStyle:"#ec9f2e" },
            EndpointHoverStyle : {fillStyle:"#ec9f2e" },
            Container:"chart-demo"
        });

        // suspend drawing and initialise.
        instance.doWhileSuspended(function() {
            // declare some common values:
            var arrowCommon = { foldback:0.7, fillStyle:color, width:14 },
            // use three-arg spec to create two different arrows with the common values:
                overlays = [
                    [ "Arrow", { location:0.7 }, arrowCommon ],
                    [ "Arrow", { location:0.3, direction:-1 }, arrowCommon ]
                ];

            // add endpoints, giving them a UUID.
            // you DO NOT NEED to use this method. You can use your library's selector method.
            // the jsPlumb demos use it so that the code can be shared between all three libraries.
            var windows = $("#drawing_board .entry");
            for (var i = 0; i < windows.length; i++) {
                instance.addEndpoint(windows[i], {
                    uuid:windows[i].getAttribute("id") + "-bottom",
                    anchor:"Bottom",
                    maxConnections:-1
                });
                instance.addEndpoint(windows[i], {
                    uuid:windows[i].getAttribute("id") + "-top",
                    anchor:"Top",
                    maxConnections:-1
                });
            }

            instance.connect({uuids:["chartWindow3-bottom", "chartWindow6-top" ], overlays:overlays, detachable:true, reattach:true});
            instance.connect({uuids:["chartWindow1-bottom", "chartWindow2-top" ], overlays:overlays});
            instance.connect({uuids:["chartWindow1-bottom", "chartWindow3-top" ], overlays:overlays});
            instance.connect({uuids:["chartWindow2-bottom", "chartWindow4-top" ], overlays:overlays});
            instance.connect({uuids:["chartWindow2-bottom", "chartWindow5-top" ], overlays:overlays});

            instance.draggable(windows);
        });

        jsPlumb.fire("jsPlumbDemoLoaded", instance);
    });

}


function save_board(){
    localStorage.setItem('board_1', mj());
    alert('Saved!\r\n\r\n\r\n\r\n'+localStorage.getItem('board_1'));
}

function load_board(){
    if(1 || confirm('Are you sure you want to load?')){
        var loadedBoard = localStorage.getItem('board_1');
        recompileBoard(JSON.parse(loadedBoard));
        redraw();
    }
}
















