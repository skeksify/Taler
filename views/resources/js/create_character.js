//Global Instances
var my_new_character, my_steps_tracker, my_hex;

var total_steps = 0;

function character(settings) {
    var gender = '';
    var stats = {};
    var alignment = '';
    var portrait = 0;
    this.setStats = function (new_val_stats) {
        return stats = new_val_stats;
    }
    this.getStats = function () { return stats };
    this.setGender = function (new_val_gender) {
        return gender = new_val_gender;
    }
    this.getGender = function () { return gender };
    this.setAlignment = function (new_val_alignment) {
        return alignment = new_val_alignment;
    }
    this.getAlignment = function () { return alignment };
    this.setPortrait = function (new_val_portrait) {
        return portrait = new_val_portrait;
    }
    this.getPortrait = function () { return portrait };
}

function steps_tracker() {
    var current_step = 0;
    var step_validated = [];
    var ability_score_bank = 20;

    this.chooseGender = function (new_val_gender, new_character) {
        new_character.setGender(new_val_gender);
        this.setStepValidated(1); // No condition on Gender
    }

    this.spendAbilityPoints = function (ability, modifier, hexagon, target_character) {
        var mod = parseInt(modifier);
        var old = $('#' + ability + '_id');
        var old_val = old.val() ? parseInt(old.val()) : 0;
        var new_bank_subtraction = mod == 1 ? old_val + 1 : -old_val;
        if (ability_score_bank - new_bank_subtraction >= 0) {
            ability_score_bank -= new_bank_subtraction;
            old.val(old_val + mod);
            this.updateBankLabel();
            target_character.setStats(hexagon.drawFromCreateCharBoard());
            if (!ability_score_bank)
                this.setStepValidated(2);
        }
    }

    this.chooseAlignment = function (new_val_alignmnet, new_character){
        new_character.setAlignment(new_val_alignmnet);
        this.setStepValidated(3); // No condition on Alignment
    }

    this.choosePortrait = function (new_val_portrait, new_character){
        new_character.setPortrait(new_val_portrait);
        this.setStepValidated(4); // No condition on Alignment
    }

    this.updateBankLabel = function () {
        $('#bank_label').html('Points left: ' + ability_score_bank);
    }
    this.setStepValidated = function (index, untrue) {
        step_validated[index] = typeof(untrue) != 'undefined' ? untrue : true;
    };
    this.isStepValidated = function (index) {
        return step_validated[index]
    };
    this.getValidated = function (index) {
        console.log(step_validated[index])
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

    this.updateBankLabel();
}

$(document).ready(function () {
    my_new_character = new character({});
    my_steps_tracker = new steps_tracker();
    my_hex = new draw_hexagon();

    my_hex.init({width: 420, height: 400});
    my_hex.drawFromCreateCharBoard();

    my_steps_tracker.setStep(1);
    $(".gender a").click(function () {
        var jthis = $(this);
        var gender_value = jthis.attr('fvalue');
        my_steps_tracker.chooseGender(gender_value, my_new_character);
        $(".gender a").removeClass('active');
        jthis.addClass('active');
        $('.portraits-wrapper .groups div').removeClass('active');
        $('.portraits-wrapper .groups div.'+(gender_value=='female'?'fe':'')+'males').addClass('active');
    });

    $(".alignment a").click(function () {
        var jthis = $(this);
        my_steps_tracker.chooseAlignment(jthis.attr('fvalue'), my_new_character);
        $(".alignment a").removeClass('active');
        jthis.addClass('active');
    });
    $('.step').each(function () {
        total_steps++
    });
    $('.next').click(function () {
        var myStep = $(this).parent().attr('step');
        if($(this).hasClass('back'))
            my_steps_tracker.nextStep('previous');
        else if (my_steps_tracker.isStepValidated(myStep))
            my_steps_tracker.nextStep();
    });

    $('.portraits-wrapper img').click(function(){
        var jthis = $(this);
        my_steps_tracker.choosePortrait(jthis.attr('portrait_id'), my_new_character);
        $('img',jthis.parent()).removeClass('active');
        jthis.addClass('active');
    });

    //$('.draw_hex').click(function () { my_hex.drawFromCreateCharBoard() });

    $(".plusminus a").each(function () {
        var jthis = $(this);
        jthis.click(function () {
            my_steps_tracker.spendAbilityPoints(jthis.attr('ability'), jthis.attr('modifier'), my_hex, my_new_character);
        });
    });
    // Jump to third phase:
    if (1) {
        $('[fvalue=female]').click();
        $('[step=' + 1 + '] .next:not(.back)').click();
        setTimeout(function(){
            var r = $('[ability=str]')[0];
            r.click();r.click();r.click();r.click();
            var r = $('[ability=dex]')[0];
            r.click();r.click();r.click();r.click();
            $('[step=' + 2 + '] .next:not(.back)').click();
            setTimeout(function(){
                $('[fvalue=evil]').click();
                $('[step=' + 3 + '] .next:not(.back)').click();
            }, 100);
        }, 100);


    }
});