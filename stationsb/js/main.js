var userInfo;

$(document).ready(function(){
	
	// get info if user is logged
	$.ajax({
		url: "http://forecast.maretec.org/stations/ajax/getUserInfo.php",
		async: false,
		success: function(data){
			userInfo = JSON.parse(data);
		},
		error: function(){
			window.location.replace(URL_HOST_DIR+"/error.php?type=getUserInfo");
			throw new Error('error getUserInfo');
		}		
	});
		
	$("input:radio,input:checkbox").uniform();

	
	signupProcess();
	resetPswProcess();
		
	// reset input form when close modal
	$('#modalSignup').on('hidden.bs.modal', function (e) {
    	$('#signupForm').trigger("reset");
		$(".alert").alert('close');
		$("input#signupTerms").prop('checked', false);
		$.uniform.update('input#signupTerms');
	});
	$("#reloadCaptcha").click(function(){
		$("#captcha").prop('src', 'incphp/get_captcha.php?'+ new Date().getTime());
	});
	$(".close").click(function(){
        $("#captchaAlert").alert();
    });
	
	$("#loginForm input").jqBootstrapValidation({
		 preventSubmit: true,
		 submitError: function($form, event, errors) {
		  // something to have when submit produces an error ?
		  // Not decided if I need it yet
		},
		submitSuccess: function($form, event) {
			event.preventDefault(); // prevent default submit behaviour
			// get values from FORM
			var usn = $("#username").val();  
			var psw = $("#password").val(); 
			$.ajax({
				url: "http://forecast.maretec.org/stations/ajax/login.php",
				type: "POST",
				data: {usn: usn, psw: psw},
				cache: false,
				success: function(data) {
					if(data > 0){
						// Success message
						$('body').fadeOut();
						window.location.replace(URL_HOST_DIR);
					}else if(data == -21){
						$('#success').html("<div class='alert alert-info'>");
						$('#success > .alert-info').html('<a class="close" data-dismiss="alert" href="">×').append( "</a>");
						$('#success > .alert-info').append("That username and password combination was not found.");
						$('#success > .alert-info').append('</div>');
					}else{
						$('#success').html("<div class='alert alert-danger'>");
						$('#success > .alert-danger').html('<a class="close" data-dismiss="alert" href="">×').append( "</a>");
						$('#success > .alert-danger').append("<strong>Login Temporarily Unavailable</strong>");
						$('#success > .alert-danger').append('</div>');
					}
					
					$("#username").val(''); 
					$("#password").val(''); 
					
				},
				error: function() {		
					// Fail message
					$('#success').html("<div class='alert alert-danger'>");
					$('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append( "</button>");
					$('#success > .alert-danger').append("<strong>Login Temporarily Unavailable</strong>");
					$('#success > .alert-danger').append('</div>');
					//clear all fields
					$('#loginForm').trigger("reset");
				},
			})
		},
		 filter: function() {
			return $(this).is(":visible");
		 },
	});
	
	$("#btn-logout").click(function(){
		$.ajax({
			url: "http://forecast.maretec.org/stations/ajax/logout.php",
			success: function(data){
				window.location.replace(URL_HOST_DIR);
			},
			error: function(){
				window.location.replace(URL_HOST_DIR+"/error.php?type=logout");
				throw new Error('error logout');
			}		
		});
	});
				
	// #### profile edit		
	if($("#profile-form").length > 0) {
		$('input[name="name"]').val(userInfo.name);
		$('input[name="email"]').val(userInfo.email);
		$('input[name="organization"]').val(userInfo.organization);
		$.uniform.update();
		
		renewPswProcess();
		
		removeUserProcess();
	}


	


	// ############### FUNCTIONS ###############
		
	function signupProcess(){		
		$("#signupForm input").jqBootstrapValidation("destroy");
		$('#signupForm').trigger("reset");
		$("#signupForm input").jqBootstrapValidation({
			preventSubmit: true,
			submitError: function(form, event, errors) {
				// something to have when submit produces an error ?
		  		// Not decided if I need it yet
			},
			submitSuccess: function(form, event) {
				event.preventDefault(); // prevent default submit behaviour
				// get values from FORM
				var name = $("input#signup-name").val();  
				var email = $("input#signup-email").val();
				var password = $("input#signup-password").val();
				var organization = $("input#signup-organization").val(); 				
				var code = $("input#code").val(); 
				// go to signup
				$.ajax({
					url: "http://forecast.maretec.org/stations/ajax/signup.php",
					type: "POST",
					data: {name: name, email: email, psw: password, organization:organization, code: code},
					beforeSend: function(){
						$('#preloadSignup').removeClass('fa fa-check');
						$('#preloadSignup').addClass('fa fa-spinner fa-spin');
					},
					success: function(data){
							if(data > 0){
								$('#signupResult').html("<div class='alert alert-success'>");
								$('#signupResult > .alert-success').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
								$('#signupResult > .alert-success').append("<strong>Success!</strong> See your mail to make confirmation");
								$('#signupResult > .alert-success').append('</div>');
								$("input#signup-name").val('');  
								$("input#signup-email").val('');
								$("input#signup-password").val('');
								$("input#signup-retyprPassword").val('');
								$("input#signup-organization").val('');
								$("input#signupTerms").prop('checked', false);								
								$("input#code").val('');								
								$("#reloadCaptcha").click();
								$.uniform.update('input');
								
							}
							else if(data == 0){
							 	$('#signupResult').html("<div class='alert alert-info'>");
								$('#signupResult > .alert-info').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
								$('#signupResult > .alert-info').append("<strong>Warning!</strong> code don't match");
								$('#signupResult > .alert-info').append('</div>');
								$("input#code").val('');
								$("#reloadCaptcha").click();
								$.uniform.update('input');
							 }
							 else if(data == -1){
							 	$('#signupResult').html("<div class='alert alert-info'>");
								$('#signupResult > .alert-info').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
								$('#signupResult > .alert-info').append("<strong>Warning!</strong> mail already used");
								$('#signupResult > .alert-info').append('</div>');
								$("input#code").val('');
								$("#reloadCaptcha").click();
								$.uniform.update('input');
							 }
							else{
								$('#signupResult').html("<div class='alert alert-danger'>");
								$('#signupResult > .alert-danger').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
								$('#signupResult > .alert-danger').append("<strong>Alert!</strong> Registration problems. Please try later");
								$('#signupResult > .alert-danger').append('</div>');
								$("input#signup-name").val('');  
								$("input#signup-email").val('');
								$("input#signup-password").val('');
								$("input#signup-retyprPassword").val('');
								$("input#signup-organization").val('');
								$("input#signupTerms").prop('checked', false)
								$("input#code").val('');
								$("#reloadCaptcha").click();
								$.uniform.update('input');
							}
						
					},
					complete: function(){
						$('#preloadSignup').removeClass('fa fa-spinner fa-spin');
						$('#preloadSignup').addClass('fa fa-check');	
					},
					error: function(){
						throw new Error('error signup');
					}		
				});
				
				//$('#btnCloseSignupModal').click();
				//$('#signupForm').trigger("reset");	
			},
			filter: function() {
				return $(this).is(":visible");
			},
		});
	}
	
	function resetPswProcess(){
		if($("#resetPswForm").length > 0) {
			$("#resetPswForm input").jqBootstrapValidation({
				preventSubmit: true,
				submitError: function(form, event, errors) {
					// something to have when submit produces an error ?
			  		// Not decided if I need it yet
					console.log(errors);
				},
				submitSuccess: function(form, event) {
					event.preventDefault(); // prevent default submit behaviour
					// get values from FORM
					var email = $("input#emailReset").val();
					// go to resetPsw
					$.ajax({
						url: "http://forecast.maretec.org/stations/ajax/resetPsw.php",
						type: "POST",
						data: {email: email},
						beforeSend: function(){
							$('#preloadResetPsw').removeClass('fa fa-check');
							$('#preloadResetPsw').addClass('fa fa-spinner fa-spin');
						},
						success: function(data){
								if(data > 0){
									$('#restPswResult').html("<div class='alert alert-success'>");
									$('#restPswResult > .alert-success').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
									$('#restPswResult > .alert-success').append("<strong>Success!</strong> See your mail to know your new password");
									$('#restPswResult > .alert-success').append('</div>');
									$("input#emailReset").val('');								
									$.uniform.update('input');
								}
								 else if(data == -1){
								 	$('#restPswResult').html("<div class='alert alert-info'>");
									$('#restPswResult > .alert-info').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
									$('#restPswResult > .alert-info').append("<strong>Warning!</strong> mail doesn't exist in our database");
									$('#restPswResult > .alert-info').append('</div>');
									$("input#emailReset").val('');	
									$.uniform.update('input');
								 }
								else{
									$('#restPswResult').html("<div class='alert alert-danger'>");
									$('#restPswResult > .alert-danger').html("<a href='#' class='close' data-dismiss='alert'>&times;").append( "</a>");
									$('#restPswResult > .alert-danger').append("<strong>Alert!</strong> Reset password problems");
									$('#restPswResult > .alert-danger').append('</div>');								
									$("input#emailReset").val('');								
									$.uniform.update('input');
								}
							
						},
						complete: function(){
							$('#preloadResetPsw').removeClass('fa fa-spinner fa-spin');
							$('#preloadResetPsw').addClass('fa fa-check');	
						},
						error: function(){
							throw new Error('error reset password');						
						}		
					});
		
				},
				filter: function() {
					return $(this).is(":visible");
				},
			});
		}
	
	}

	function renewPswProcess(){
		$("#renewPsw").click(function(){
			if($('#newPassword').val() != ''){
	        	$('#preloaderRenewPsw').addClass('fa-spinner fa-spin');
				 var dataURL = 'new_password='+$('input[name="password"]').val();
				$.ajax({
					url: "http://forecast.maretec.org/stations/ajax/renewPsw.php",
					data: dataURL,
					success: function(data){
						if(data > 0){
							console.log(data)
							$('input[name="password"]').val('');
							$.uniform.update();
							$('#errorRenewPsw').html("<div class='alert alert-success'>");
							$('#errorRenewPsw > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append( "</button>");
							$('#errorRenewPsw > .alert-success').append("<strong>Password updated successfuly</strong>");
							$('#errorRenewPsw > .alert-success').append('</div>');
							$('#preloaderRenewPsw').removeClass('fa-spinner fa-spin');
						}else{
							// Fail message
							$('#errorRenewPsw').html("<div class='alert alert-danger'>");
							$('#errorRenewPsw > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append( "</button>");
							$('#errorRenewPsw > .alert-danger').append("<strong>Edit Profile Temporarily Unavailable</strong>");
							$('#errorRenewPsw > .alert-danger').append('</div>');
							$('#preloaderRenewPsw').removeClass('fa-spinner fa-spin');
						}

					},
					error: function(){
						// Fail message
						$('#errorRenewPsw').html("<div class='alert alert-danger'>");
						$('#errorRenewPsw > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append( "</button>");
						$('#errorRenewPsw > .alert-danger').append("<strong>Edit Profile Temporarily Unavailable</strong>");
						$('#errorRenewPsw > .alert-danger').append('</div>');
						$('#preloaderRenewPsw').removeClass('fa-spinner fa-spin');
					}		
				});	
			}else{
				$('#errorRenewPsw').html("<div class='alert alert-info'>");
				$('#errorRenewPsw > .alert-info').html('<a class="close" data-dismiss="alert" href="">×').append( "</a>");
				$('#errorRenewPsw > .alert-info').append("New password must be entered to submit changes");
				$('#errorRenewPsw > .alert-info').append('</div>');
				$('#preloaderRenewPsw').removeClass('fa-spinner fa-spin');
			}		
    	});
		
	}

	function removeUserProcess(){
		$("#removeUser").click(function(){
        	$('#preloaderRemoveUser').addClass('fa-spinner fa-spin');
			$.ajax({
				url: "http://forecast.maretec.org/stations/ajax/removeUser.php",
				success: function(data){
					if(data > 0){
						window.location.replace(URL_HOST_DIR);
					}else{
						// Fail message
						$('#errorRemoveUser').html("<div class='alert alert-danger'>");
						$('#errorRemoveUser > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append( "</button>");
						$('#errorRemoveUser > .alert-danger').append("<strong>Delete User Temporarily Unavailable</strong>");
						$('#errorRemoveUser > .alert-danger').append('</div>');
						$('#preloaderRemoveUser').removeClass('fa-spinner fa-spin');
					}

				},
				error: function(){
					// Fail message
					$('#errorRemoveUser').html("<div class='alert alert-danger'>");
					$('#errorRemoveUser > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append( "</button>");
					$('#errorRemoveUser > .alert-danger').append("<strong>Delete User Temporarily Unavailable</strong>");
					$('#errorRemoveUser > .alert-danger').append('</div>');
					$('#preloaderRemoveUser').removeClass('fa-spinner fa-spin');
				}		
			});			
    	});		
	}

});

