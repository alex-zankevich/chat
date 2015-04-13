$(document).ready(function () {
	var history = $('.chat-messages');
	var historyList = [];
	/*Restore from LS*/
	var showHistory = function(){
		var histStr = localStorage.getItem('chatHistory');
		var histObj = JSON.parse(histStr);
		if(histObj != null){
			for(var i = 0; i < histObj.length; i++){
				$('<div></div>').addClass("msg-data").attr('msg-id',histObj[i].id).text(histObj[i].name + " : " + histObj[i].message).prependTo(history);
				historyList.push({
					name:histObj[i].name,
					message:histObj[i].message,
					id:histObj[i].id
				});
				$.ajax({
					type:"POST",
					url:"http://localhost:999/chat",
					contentType: 'application/json',
					data: JSON.stringify({
						name:histObj[i].name,
						message:histObj[i].message,
						id:histObj[i].id
					})
				});
			}
		}
	}
	showHistory();
	loop();
	function loop(){
		/*Connecting and refreshing*/
		var updateHistory = function(listString){
			var list = JSON.parse(listString).messages;
			for(var i = 0; i < list.length; i++){
				$('.msg-data').first().remove();
				historyList.pop();
			}
			for(var i = 0; i < list.length; i++){
				$('<div></div>').addClass("msg-data").attr('msg-id',list[i].id).text(list[i].name + " : " + list[i].message).prependTo(history);
				historyList.push(list[i]);
			}
		}
		/*Generate ID*/
		var uniqueId = function() {
			var date = Date.now();
			var random = Math.random() * Math.random();

			return Math.floor(date * random).toString();
		};  
		/*Create msgObject*/
		var createMsg = function(name_, msg_){
			return {
				name:name_,
				message:msg_,
				id:uniqueId()
			}
		}
		/*Adding message*/
		var addMessage = function () {
			var msg = $('textarea[name="msg-area"]').val();
			var name = $('.chat-name').val();
			if(msg == "" || name == ""){
				return;
			}
			$('textarea[name="msg-area"]').val('');
			
			var data = createMsg(name,msg);
			historyList.push(data);
			/*Posting message*/
			$.ajax({
				type:"POST",
				url:"http://localhost:999/chat",
				contentType: 'application/json',
				data: JSON.stringify(data)
			});
			$('<div></div>').addClass("msg-data").attr('msg-id',data.id).text(name + " : " + msg).prependTo(history);
			
			/*Write to LS*/
			localStorage.setItem('chatHistory',JSON.stringify(historyList));
		} 
		/*Add events**/
		$('#submit').click(addMessage);
		$('textarea[name="msg-area"]').keypress(function(e){
			if(e.which == 13){
				e.preventDefault();
				addMessage();
			}
		});
		/*Deleting*/
		$(document).on('click','.msg-data',function(){     
			$(this).toggleClass('selected');        
		});
		$('#delete').click(function(){
			$('.selected').each(function(){
				for(var i = 0; i < historyList.length; i++){
					if(historyList[i].id == $(this).attr('msg-id')){
						$.ajax({
							type:"DELETE",
							url:"http://localhost:999/chat",
							contentType: 'text/plain',
							data: historyList[i].id
						});
						historyList.splice(i,1);
						break;
					}                
				}
				$(this).remove();
			});
			localStorage.setItem('chatHistory',JSON.stringify(historyList));
		});
		/*Editing*/
		function msgDblClicked() {
			var msgID = $(this).attr('msg-id');
			var pos = 0;
			for(pos = 0; pos < historyList.length; pos++){
				if(historyList[pos].id == msgID)
					break;
			}
			var editableText = $("<textarea />");
			editableText.val(historyList[pos].message);
			$(this).replaceWith(editableText);
			editableText.focus();
			
			editableText.blur(function(){
				var str = $(this).val();
				historyList[pos].message = str;
				var viewableText = $("<div class='msg-data' msg-id='" + msgID + "'></div>");
				viewableText.html(historyList[pos].name + " : " + str);
				$(this).replaceWith(viewableText);
				localStorage.setItem('chatHistory',JSON.stringify(historyList));
				$(document).on('dblclick',viewableText,msgDblClicked);
				$.ajax({
					type:"PUT",
					url:"http://localhost:999/chat",
					contentType: "application/json",
					data: JSON.stringify({
						"id":msgID,
						"newMessage":str
					})
				});
			});
			
		}
		$(document).on('dblclick','.msg-data',msgDblClicked);
		$.get("http://localhost:999/chat",function(data){
			updateHistory(data);
			loop();
		});
	}
});