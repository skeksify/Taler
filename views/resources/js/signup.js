/**
 * Created by Skeksify on 1/13/15.
 */

$(document).ready(function(){
    $('#btn-signup').click(function(){
        var settings = {
            username: $('#user-tf').val(),
            password: $('#pass-tf').val(),
            email: $('#mail-tf').val()
        }
        if(settings.username && settings.password){
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: '/users/signup',
                data: settings,
                success: function(result){
                    alert(JSON.stringify(result));
                },
                error: function(){alert('ASASASASAS')}
            });
        }
    });
});