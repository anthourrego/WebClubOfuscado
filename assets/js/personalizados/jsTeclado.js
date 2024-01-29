let selectedInput = null;
let Keyboard = window.SimpleKeyboard.default;

let commonKeyboardOptions = {
	onChange: input => onChange(input),
	onKeyPress: button => onKeyPress(button),
	theme: "simple-keyboard hg-theme-default hg-layout-default",
	physicalKeyboardHighlight: true,
	syncInstanceInputs: true,
	mergeDisplay: true,
	debug: true
};

let keyboard = new Keyboard(".simple-keyboard-main", {
	...commonKeyboardOptions,
	layout: {
		default: [
			"\u007c 1 2 3 4 5 6 7 8 9 0 ' \u00bf {bksp}",
			"{tab} q w e r t y u i o p \u0301 +",
			"{lock} a s d f g h j k l \u00f1 \u007b \u007d {enter}",
			"{shift} < z x c v b n m , . - {shift}",
			".com @ {space}",
		],
		shift: [
			'\u00b0 ! " # $ % & / ( ) = ? \u00a1 {bksp}',
			"{tab} Q W E R T Y U I O P \u0308 *",
			"{lock} A S D F G H J K L \u00d1 \u005b \u005d {enter}",
			"{shift} > Z X C V B N M ; : _ {shift}",
			".com @ {space}",
		],
	},
});

let keyboardNumPad = new Keyboard(".simple-keyboard-numpad", {
	...commonKeyboardOptions,
	layout: {
		default: [
			"{numlock} {numpaddivide} {numpadmultiply}",
			"{numpad7} {numpad8} {numpad9}",
			"{numpad4} {numpad5} {numpad6}",
			"{numpad1} {numpad2} {numpad3}",
			"{numpad0} {numpaddecimal}"
		]
	}
});

let keyboardNumPadEnd = new Keyboard(".simple-keyboard-numpadEnd", {
	...commonKeyboardOptions,
	layout: {
		default: ["{numpadsubtract}", "{numpadadd}", "{numpadenter}"]
	}
});

/**
 * Physical Keyboard support
 * Whenever the input is changed with the keyboard, updating SimpleKeyboard's internal input
 */
/*document.addEventListener("keydown", event => {
  // Disabling keyboard input, as some keys (like F5) make the browser lose focus.
  // If you're like to re-enable it, comment the next line and uncomment the following ones
  event.preventDefault();
});*/

// document.querySelector(".input").addEventListener("input", event => {
// 	let input = document.querySelector(".input").value;
// 	keyboard.setInput(input);
// });

function onChange(input) {
	if (selectedInput != null) {
		if (document.querySelector(selectedInput)) {
			let inputElement = document.querySelector(selectedInput);
			inputElement.selectionStart = keyboard.getCaretPosition();
			inputElement.selectionEnd = keyboard.getCaretPositionEnd();
			$(selectedInput).keydown();
			document.querySelector(selectedInput).value = input;
			$(selectedInput).keypress();
			$(selectedInput).keyup();
		}
	}
}

function onKeyPress(button) {
	// console.log("Button pressed", button);
	/**
	* If you want to handle the shift and caps lock buttons
	*/
	if (
		button === "{shift}" ||
		button === "{shiftleft}" ||
		button === "{shiftright}" ||
		button === "{capslock}" ||
		button === "{lock}"
	) {
		handleShift();
	} else if (
		button === "{enter}" ||
		button === "{numpadenter}"
	) {
		$(selectedInput).change();
		$(selectedInput).focusout();
		$('.keyboardContainer').fadeOut();
	} else if (button === "{bksp}") {
		// onChange($(selectedInput).val().substring(0, $(selectedInput).val().length -1));
		// $(selectedInput).val($(selectedInput).val().substring(0, $(selectedInput).val().length -1));
		// keyboard.onChange();
		keyboard.input[selectedInput] = $(selectedInput).val().substring(0, $(selectedInput).val().length - 1);
		$(selectedInput).val($(selectedInput).val().substring(0, $(selectedInput).val().length - 1));
		setTimeout(() => {
			$(selectedInput).focus();
		}, 0);
	} else {
		setTimeout(() => {
			$(selectedInput).focus();
		}, 0);
	}
}

function handleShift() {
	let currentLayout = keyboard.options.layoutName;
	let shiftToggle = currentLayout === "default" ? "shift" : "default";

	keyboard.setOptions({
		layoutName: shiftToggle
	});
}

document.addEventListener("keydown", event => {
	const val = document.querySelector(selectedInput).value;
	keyboard.setInput(val);
	if(event.key == 'Tab' || event.key == 'tab'){
		keyboard.setInput('');
	}
});

// Drag & Drop / Resize

(function () {
	document.addEventListener('DOMContentLoaded', function (e) {
		$('.keyboardContainer').draggable();

		// Espera un momento para evitar que hayan elementos que no han cargado
		setTimeout(function () {
			$(document).on('focus', 'input, textarea', function (e) {
				if(e.target.id != ''){
					selectedInput = '#' + e.target.id;
				}
				if ($(selectedInput).hasClass('alertify') && showTeclado != false) {
					setTimeout(() => {
						$(selectedInput).focus();
					}, 0);
				}

				selectedClass = generateQuerySelector(this);
				if(selectedClass.includes('chosen') || selectedClass.includes('datepicker') || selectedClass.includes('datetimepicker') || selectedClass.includes('font-weight-bold') || selectedInput == '#valor'){
					setTimeout(() => {
						$('.keyboardContainer').fadeOut();
					}, 100);
				}else{
					$('.keyboardContainer').fadeIn();
				}
				// keyboard.setOptions({
				// 	inputName: selectedInput
				// });
				// keyboardNumPad.setOptions({
				// 	inputName: selectedInput
				// });
				// keyboardNumPadEnd.setOptions({
				// 	inputName: selectedInput
				// });

				// if( ! $('.keyboardContainer').is(':visible')){
				// 	if( (! $(this).hasClass('keyboardOFF')) && (! $(this).is('[readonly]')) && (! $(this).is('[type="checkbox"]')) && (! $(this).is('[type="radio"]')) ){
				// 		$('.keyboardContainer').fadeIn();
				// 	}
				// }
			}).on('change', 'input, textarea', function () {
				selectedInput = generateQuerySelector(this);
				if(selectedClass.includes('chosen') || selectedClass.includes('datepicker') || selectedClass.includes('datetimepicker') || selectedInput == '#valor'){
					setTimeout(() => {
						$('.keyboardContainer').fadeOut();	
					}, 100);
				}
				keyboard.setInput($(this).val(), selectedInput);
				keyboardNumPad.setInput($(this).val(), selectedInput);
				keyboardNumPadEnd.setInput($(this).val(), selectedInput);
			}).on('mousedown', function (e) {
				if($(e.target).is('label')){
					e.target = e.target.control;
				}
				if(e.target.className.includes('chosen') || e.target.className.includes('datepicker') || e.target.className.includes('datetimepicker') || e.target.className.includes('font-weight-bold') || selectedInput == '#valor'){
					setTimeout(() => {
						$('.keyboardContainer').fadeOut();	
					}, 100);
				}
				if ($(e.target).is('input') || $(e.target).is('textarea') || $(e.target).is('.keyboardContainer') || $(e.target).parents('.keyboardContainer').length > 0 || (typeof $(e.target).attr('data-skbtn') !== 'undefined' && $(e.target).attr('data-skbtn') !== false)) {
					if (!$('.keyboardContainer').is(':visible')) {
						if ((!$(e.target).hasClass('keyboardOFF')) && (!$(e.target).is('[readonly]')) && (!$(e.target).is('[type="checkbox"]')) && (!$(e.target).is('[type="radio"]'))) {

							selectedInput = generateQuerySelector(e.target);

							keyboard.setOptions({
								inputName: selectedInput
							});
							keyboardNumPad.setOptions({
								inputName: selectedInput
							});
							keyboardNumPadEnd.setOptions({
								inputName: selectedInput
							});
							keyboard.input[selectedInput] = $(selectedInput).val();
							keyboardNumPad.input[selectedInput] = $(selectedInput).val();
							keyboardNumPadEnd.input[selectedInput] = $(selectedInput).val();

							$('.keyboardContainer').fadeIn({
								complete: function () {
									let posInput = $(e.target).offset();
									posInput = posInput.top;
									let posTecladoIni = $('.keyboardContainer').position();
									posTecladoIni = posTecladoIni.top;
									let posTecladoFin = posTecladoIni + 300;

									if ($('.modal').is(':visible')) {
										posInput -= $('.modal:visible').offset().top;
									}

									// Si el input en cuestión queda por debajo del teclado

									if (posInput > posTecladoIni && posInput < posTecladoFin) {
										let posTeclado = 0;

										posTeclado = posInput - 320;

										if (posTeclado < 0) {
											posTeclado = posInput + 320;
										}
										$('.keyboardContainer').draggable("destroy");
										$('.keyboardContainer ').animate({
											top: posTeclado
										});
										$('.keyboardContainer').draggable();
									}
								}
							});
						}
					} else {
						// Por acá se mete al clickear otro input mientras el teclado es visible
						if ($(e.target).hasClass('keyboardOFF') || $(e.target).is('[readonly]') || $(e.target).is('[type="checkbox"]') || $(e.target).is('[type="radio"]')) {
							$(selectedInput).change();
							$('.keyboardContainer').fadeOut({
								complete: function () {
									$('.keyboardContainer').draggable("destroy");
									$('.keyboardContainer ')
										.css('top', '')
										.css('bottom', 10)
										.css('left', 'calc(-50vw + 50%)')
										.css('right', 'calc(-50vw + 50%)');
									$('.keyboardContainer').draggable();
								}
							});
							$('.keyboardContainer').fadeIn();
						} else if (!($(e.target).is('.keyboardContainer') || $(e.target).parents('.keyboardContainer').length > 0 || (typeof $(e.target).attr('data-skbtn') !== 'undefined' && $(e.target).attr('data-skbtn') !== false))) {
							selectedInput = generateQuerySelector(e.target);

							keyboard.setOptions({
								inputName: selectedInput
							});
							keyboardNumPad.setOptions({
								inputName: selectedInput
							});
							keyboardNumPadEnd.setOptions({
								inputName: selectedInput
							});
							keyboard.input[selectedInput] = $(selectedInput).val();
							keyboardNumPad.input[selectedInput] = $(selectedInput).val();
							keyboardNumPadEnd.input[selectedInput] = $(selectedInput).val();
						}
					}
				} else {
					// Si doy click en cualquier parte del sistema y el teclado es visible, se oculta
					if ($('.keyboardContainer').is(':visible')) {
						$(selectedInput).change();
						keyboard.setInput('');
						$('.keyboardContainer').fadeOut({
							complete: function () {
								$('.keyboardContainer').draggable("destroy");
								$('.keyboardContainer ')
									.css('top', '')
									.css('bottom', 10)
									.css('left', 'calc(-50vw + 50%)')
									.css('right', 'calc(-50vw + 50%)');
								$('.keyboardContainer').draggable();
							}
						});
					}
				}
			});
		}, 1000)
	});
})();

var generateQuerySelector = function (el) {
	if (el.tagName.toLowerCase() == "html")
		return "HTML";
	var str = el.tagName;
	str += (el.id != "") ? "#" + el.id : "";
	if (el.className) {
		var classes = el.className.split(/\s/);
		for (var i = 0; i < classes.length; i++) {
			if (classes[i].trim() != '') {
				str += "." + classes[i].trim()
			}
		}
	}
	if (el.attributes) {
		var datas = Object.assign([], el.attributes);
		for (key in datas) {
			if (datas[key].nodeName.substring(0, 4) == 'data') {
				str += "[" + datas[key].nodeName.trim() + "='" + datas[key].nodeValue.trim() + "']"
			}
		}
	}
	return generateQuerySelector(el.parentNode) + " > " + str;
}