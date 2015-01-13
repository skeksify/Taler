/**
 * Created by Skeksify on 1/13/15.
 */

$(document).ready(function(){
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
});