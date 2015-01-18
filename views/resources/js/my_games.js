/**
 * Created by Skeksify on 1/14/15.
 */

$(document).ready(function(){
    $('#new_game_btn').click(function(){
        open_dialog('New Game', function(){
            var settings = {
                title: $('#new_game_titleI').val(),
                teaser: $('#new_game_teaserI').val()
            }
            show_msg('Working...', function(){
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/make/create_game',
                    data: settings,
                    success: function(result){
                        if(result.success) {
                            show_msg('Success!', function(){
                                setTimeout(function(){ window.location = '/make/my-games'}, 1000)
                            });
                        } else
                            show_msg('Error!'+result.error);
                    },
                    error: function(){ show_msg('Failed') }
                });
            });
        })
    })
})