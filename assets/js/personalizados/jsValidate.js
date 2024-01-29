$(function(){
	jQuery.validator.setDefaults({
	  	debug: false,
	  	ignore: ":hidden:not(.ignore)",
	  	errorElement: "em",
	  	errorPlacement: function (error, element) {
			error.addClass("invalid-feedback");
			element.closest(".form-valid").append(error);
	  	},
	  	highlight: function (element, errorClass, validClass) {
			if ($(element).is("select.chosen-select")) {
				$(element).closest(".form-valid").find(".chosen-container").removeClass("chosen-container-valid");
				$(element).closest(".form-valid").find(".chosen-container").addClass("chosen-container-invalid");
			} else {
				$(element).addClass("input-invalid");
				$(element).removeClass("input-valid");
			}
	  	},
	  	unhighlight: function (element, errorClass, validClass) {
			if ($(element).is("select.chosen-select")) {
				$(element).closest(".form-valid").find(".chosen-container").removeClass("chosen-container-invalid");
				//$(element).closest(".form-valid").find(".chosen-container").addClass("chosen-container-valid");
			} else if ($(element).prop("required")){
				$(element).removeClass("input-invalid");
				//$(element).addClass("is-valid");
			}
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
					if($(this).closest(".form-valid").find(".chosen-container").is(".chosen-container-invalid") || $(this).closest(".form-valid").find(".chosen-container").is(".chosen-container-valid")) {
						$(this).valid();
					}
				});
			}
		});
	}

	$("input.custom-file-input").on("change", function(){
		$(this).valid();	
	});

	$("form").each((it, element) => $(element).validate());
});