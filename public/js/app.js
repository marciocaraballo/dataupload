(function ($){

	var retrieveData = function (data) {

		var source   = $("#data-template").html(),
			template = Handlebars.compile(source),
			generated = template(data);

		$('.table').html(' ').append(generated);
	}

	$('#sendData').click(function (){

		$('.success').fadeOut();

		var dataToSend = {
			mail : $('#mail').val() || "Anonymous",
			username : $('#username').val() || "Anonymous",
			filename : $('#filename').val()
		};

		if (!dataToSend.filename) {
			$('.no-file-name').fadeIn();
		}
		else {
			$('.no-file-name').fadeOut();
			$.ajax({
				type : 'POST',
				url : '/save/',
				contentType : 'application/json',
				data : JSON.stringify(dataToSend),
				success : function (){

					$.ajax({
						type : 'GET',
						contentType : 'application/json',
						url : '/data/',
						success : function (data) {

							if (data.length) {
								retrieveData(data);
								$('.success').fadeIn();
								$('.emtpy-response').fadeOut();	
							}
							else {
								$('.emtpy-response').fadeIn();
							}

						},
						error : function () {
							console.log('fetching data error');
						}
					});
				},
				error : function () {
					console.log('all your error are belong to us');
				}
			});
		}	
	});

	$('.refresh-button').click(function (){

		$.ajax({
			type : 'GET',
			contentType : 'application/json',
			url : '/data/',
			success : function (data) {
				retrieveData(data);
			},
			error : function () {
				console.log('fetching data error');
			}
		});
	});

	$('.table').click('.filename', function (e){
		var $this = $(this),
			target = e.target,
			filename = $(target).parent().parent().children('.filename').text();
	
		$.ajax({
			type : 'DELETE',
			url : '/delete/',
			contentType : 'application/json',
			data : JSON.stringify(
				{
					id : filename
				}),
			success : function (){
				$(target).parent().parent().fadeOut().remove();
			},
			error : function (){
				console.log('delete error');
			}
		});
	});

})($);