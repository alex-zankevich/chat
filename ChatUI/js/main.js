$(document).ready(function () {
    var history = $('.chat-messages');
    var historyList = [];
    /*Restore from LS*/
    var showHistory = function(){
        var histStr = localStorage.getItem('chatHistory');
        var histObj = JSON.parse(histStr);
        if(histObj.length != 0){
            for(var i = 0; i < histObj.length; i++){
                $('<div></div>').addClass("msg-data").attr('msg-id',histObj[i].id).text(histObj[i].name + " : " + histObj[i].message).appendTo(history);
                historyList.push({
                    name:histObj[i].name,
                    message:histObj[i].message,
                    id:histObj[i].id
                });
            }
        }
    }
    showHistory();
    /************************/
    var uniqueId = function() {
        var date = Date.now();
        var random = Math.random() * Math.random();

        return Math.floor(date * random).toString();
    };  
    
    var createMsg = function(name_, msg_){
        return {
            name:name_,
            message:msg_,
            id:uniqueId()
        }
    }
    
    /*****************************/
    var addMessage = function () {
        var msg = $('textarea[name="msg-area"]').val();
        var name = $('.chat-name').val();
        if(msg == "" || name == ""){
            return;
        }
        $('textarea[name="msg-area"]').val('');
        
        
        
        var data = createMsg(name,msg);
        historyList.push(data);
        
        $('<div></div>').addClass("msg-data").attr('msg-id',data.id).text(name + " : " + msg).appendTo(history);
        
        /*Write to LS*/
        localStorage.setItem('chatHistory',JSON.stringify(historyList));
    } 
    /***********************/
    $('#submit').click(addMessage);
    $('textarea[name="msg-area"]').keypress(function(e){
        if(e.which == 13){
            e.preventDefault();
            addMessage();
        }
    });
    /********************************/
    $(document).on('click','.msg-data',function(){     
        $(this).toggleClass('selected');
    });
    $('#delete').click(function(){
        $('.selected').each(function(){
            for(var i = 0; i < historyList.length; i++){
                if(historyList[i].id == $(this).attr('msg-id')){
                    historyList.splice(i,1);
                    break;
                }                
            }
            $(this).remove();
        });
        localStorage.setItem('chatHistory',JSON.stringify(historyList));
    });
    
});