var my_new_character, my_steps_tracker;
var total_steps = 0;
function character(settings) {
    var gender = 'male';
    this.setGender = function (gender) {
        this.gender = gender;
        my_steps_tracker.setStepValidated(1);
    }
    this.getGender = function () {
        return this.gender
    };
}

function steps_tracker() {
    var current_step = 0;
    var step_validated = [];
    var ability_score_bank = 30;

    this.updateBankLabel = function () {
        $('#bank_label').html('Points left: ' + ability_score_bank);
    }

    this.increaseAbility = function(ability, modifier){
        var mod = parseInt(modifier);
        var old = $('#'+ability+'_id');
        var old_val = old.val() ? parseInt(old.val()) : 0;
        if(ability_score_bank-old_val>0){
            ability_score_bank -= old_val*mod;
            old.val(old_val+mod);
            this.updateBankLabel();
            my_hex.drawFromCreateCharBoard();
        }
    }

    this.setStepValidated = function (index, untrue) {
        step_validated[index] = typeof(untrue) != 'undefined' ? untrue : true;
    };
    this.isStepValidated = function (index) {
        return step_validated[index]
    };
    this.getValidated = function () {
        console.log(step_validated)
    };
    this.setStep = function (step) {
        current_step = step
    }
    this.nextStep = function (prev) {
        var modifier = prev == 'previous' ? -1 : 1;
        if (current_step + modifier > 0 && current_step + modifier <= total_steps) {
            var curr = $('[step=' + current_step + ']');
            var next = $('[step=' + (current_step + modifier) + ']');
            curr.animate({width: 0}, function () {
                curr.removeClass('active')
                next.css('width', 0).addClass('active').animate({ width: 830 });
            });
            this.setStep(current_step + modifier);
        }
    }
}

$(document).ready(function () {
    my_new_character = new character({});
    my_steps_tracker = new steps_tracker();
    my_steps_tracker.setStep(1);
    $(".gender a").click(function () {
        var jthis = $(this);
        my_new_character.setGender(jthis.attr('fvalue'));
        $(".gender a").removeClass('active');
        jthis.addClass('active');
    });

    $('.step').each(function () { total_steps++ });
    $('.next').click(function () {
        var myStep = $(this).parent().attr('step');
        if (my_steps_tracker.isStepValidated(myStep))
            my_steps_tracker.nextStep();
    });

    $('.draw_hex').click(function () { my_hex.drawFromCreateCharBoard() });

    $(".plusminus a").each(function(){
        var jthis = $(this);
        jthis.click(function(){
            my_steps_tracker.increaseAbility(jthis.attr('ability'), jthis.attr('modifier'));
        });
    });
    // Jump to second phase:
    if (0) {
        $('[fvalue=male]').click();
        $('[step=' + 1 + '] .next').click();
    }
});