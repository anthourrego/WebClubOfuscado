alertify.defaults.theme.ok = "btn btn-primary";
alertify.defaults.theme.cancel = "btn btn-danger";
alertify.defaults.theme.input = "form-control";

(function ($) {
	"use strict";
	$("#overlay").addClass('hidden');
	$(document).on({
		ajaxStart: function() {
			$("#overlay").removeClass('hidden');
		},
		ajaxStop: function() {
			$("#overlay").addClass('hidden');
		},
		ajaxError: function(funcion, request, settings){
			if(request.responseText != '' && request.responseText != undefined){
				$("#overlay").removeClass('hidden');
				alertify.alert('Error', request.responseText, function(){
					this.destroy();
				});
				console.error(funcion);
				console.error(request);
				console.error(settings);
			}
		}
	});
	
	jQuery.validator.setDefaults({
		debug: false,
		ignore: ":hidden:not(.ignore)",
		errorElement: "em",
		errorPlacement: function (error, element) {
			error.addClass("invalid-feedback");
			element.closest(".form-valid").append(error);
		},
		highlight: function (element, errorClass, validClass) {
			$(element).closest(".validate-input").addClass("alert-validate");
		},
		unhighlight: function (element, errorClass, validClass) {
			$(element).closest(".validate-input").removeClass("alert-validate");
		},
		invalidHandler: function(form, validator){
			var errors = validator.numberOfInvalids();
			if(errors){
				var element = validator.errorList[0].element; 
				if($(element).is("select.chosen-select")) {
					$(element).closest(".form-valid").find(".chosen-container").trigger('mousedown');
				}
			}
		}
	});

	// validation of chosen on change
	if ($("select.chosen-select").length > 0) {
		$("select.chosen-select").each(function() {
			if ($(this).attr('required') !== undefined) {
				$(this).on("change", function() {
					if($(this).closest(".wrap-input100").is(".alert-validate")) {
						$(this).valid();
					}
				});
			}
		});
	}
  
	$("form").validate();

	/*==================================================================
	[ Focus input ]*/
	$('.input100').each(function(){
		$(this).on('blur', function(){
			if($(this).val().trim() != "") {
				$(this).addClass('has-val');
			}
			else {
				$(this).removeClass('has-val');
			}
		})    
	})
})(jQuery);
