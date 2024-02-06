UltimaTecla = "";
// Teclado Numérico Touch
var punto = false,
	click = false;
validasuma = 0;
validaresta = 0;
validaigual = 0;
resulcadena = "";
var contexto = this;
$(function () {
	showTeclado = false;
	$(".decimal").inputmask("decimal", {
		// digits: 2,
		rightAlign: false,
	});

	$(".numero").inputmask({
		groupSeparator: ",",
		alias: "currency",
		placeholder: "",
		autoGroup: 3,
		digits: 0,
		digitsOptional: !1,
		clearMaskOnLostFocus: !1,
		rightAlign: false,
		prefix: "",
		integerDigits: 10,
		allowPlus: false,
		allowMinus: false,
	});
});
$(document).on("keyup", "#valor", function (e) {
	if ($(this).val() == "") {
		$(this).val("");
	}
});

$(document)
	.on("click", "#btnSumar", function (e) {
		e.preventDefault();
		if (validaresta == 1) {
			$(".tecladoIgual").click();
		}
		$(".operador").html("+");

		if (UltimaTecla != "Sumar") {
			let valor = parseFloat($("[data-valor").val().replace(/,/g, ""));
			valor = valor ? valor : "";
			resultado = resulcadena + valor;
			let data = resultadoCadena(resultado);
			$("[data-resultado]").attr("data-resultado", data);
			resulcadena = data ? resulcadena + valor + " + " : "";
			$("#valorOperacion").val(resulcadena);
			$("#valor").val(data ? data : 0);
		}
		validasuma = 1;
		validaigual = 1;
		UltimaTecla = "Sumar";
	})
	.on("click", "#btnRestar", function (e) {
		e.preventDefault();
		if (validasuma == 1) {
			$(".tecladoIgual").click();
		}
		$(".operador").html("-");
		let valor = parseFloat($("[data-valor").val().replace(/,/g, ""));
		if (
			UltimaTecla != "Restar" &&
			parseFloat($("[data-resultado]").attr("data-resultado")) > 0 &&
			validasuma == 0
		) {
			valor = valor ? valor : "";
			resultado = resulcadena + valor;
			let data = resultadoCadena(resultado);
			$("[data-resultado]").attr("data-resultado", data > 0 ? data : 0);
			resulcadena = resulcadena ? resulcadena + (valor + " - ") : valor + " - ";
			$("#valorOperacion").val(resulcadena);
			if (data > 0) {
				$("#valor").val(data);
			} else {
				$("#valor").val(0);
				$("[data-resultado]").val("");
				resulcadena = "";
				$(".tecladoIgual").click();
			}
		} else if (validaresta != 1) {
			valor = valor ? valor : "";
			resultado = resulcadena + valor;
			let data = resultadoCadena(resultado);
			$("[data-resultado]").attr("data-resultado", data);
			resulcadena = data ? resulcadena + valor + " - " : "";
			$("#valorOperacion").val(resulcadena);
			if (data > 0) {
				$("#valor").val(data);
			} else {
				$("#valor").val(0);
				$("[data-resultado]").val("0");
				resulcadena = "";
				$(".tecladoIgual").click();
			}
			validasuma = 0;
		} else {
			resulcadena = valor + " - ";
			$("[data-resultado]").attr("data-resultado", valor);
			$("#valorOperacion").val(resulcadena);
		}
		validaresta = 1;
		validaigual = 1;
		UltimaTecla = "Restar";
	})
	.on("click", ".tecladoIgual", function (e) {
		e.preventDefault();
		$(".operador").html("=");
		validaigual = 1;
		valor = $("[data-valor").val().replace(/,/g, "");
		operacion = parseFloat($("[data-resultado]").attr("data-resultado"));
		if (UltimaTecla != "Igual") {
			if (UltimaTecla == "Sumar" || UltimaTecla == "Restar") {
				$("[data-valor").val(
					parseFloat($("[data-resultado]").attr("data-resultado"))
				);
				$("#valorOperacion").val("");
				$("[data-resultado]").attr("data-resultado", 0);
				resulcadena = "";
			} else if (validasuma == 1) {
				if ($("[data-operacion]").attr("data-operacion") == "0") {
					$("[data-valor").val(
						parseFloat($("[data-resultado]").attr("data-resultado")) +
							parseFloat(valor)
					);
				} else {
					$("[data-valor").val(
						operacion > valor ? parseFloat(operacion) + parseFloat(valor) : 0
					);
				}
				$("[data-resultado]").attr("data-resultado", 0);
				resulcadena = "";
			} else if (validaresta == 1) {
				$("[data-valor").val(
					operacion > valor ? parseFloat(operacion) - parseFloat(valor) : 0
				);
				resulcadena = "";
				$("[data-resultado]").attr("data-resultado", 0);
			} else {
				if (
					$("[data-resultado]").attr("data-resultado") != "0" &&
					operacion != 0
				) {
					$("[data-valor").val(parseFloat(operacion));
				}
			}

			$("#valorOperacion").val("");
			validasuma = 0;
			validaresta = 0;
		}
		UltimaTecla = "Igual";
		validasuma = 0;
		validaresta = 0;
	})
	.on("click", "#btnLimpiar", function (e) {
		e.preventDefault();
		$(".operador").html("");
		$("[data-valor").val(0);
		$("#valorOperacion").val("");
		$("[data-resultado]").attr("data-resultado", 0);
		resulcadena = "";
		validasuma = 0;
		validaresta = 0;
	})
	.on("click", ".teclado", function (e) {
		e.preventDefault();
		inpunt = $(this).attr("data-input");
		if ($(".operador").html() == "=") {
			$(".operador").html("");
		} else {
			if ($(this).attr("entero") == "true") {
				$("[data-valor").val(0);
			}
		}

		tecladoNumericoTouch(inpunt);
		UltimaTecla = "teclado";
	})
	.on("click", ".tecladoBorrar", function (e) {
		e.preventDefault();
		var text = $("[data-valor")[0];
		var t = text.value.substr(
			text.selectionStart,
			text.selectionEnd - text.selectionStart
		);
		var value = $("[data-valor").val().replace(/,/g, "");
		if (value != "") {
			if (t == value && value != "") {
				value = "0";
			} else {
				value = value.replace(/,/g, "");
				value = parseFloat(value);
			}

			if (value != "") {
				value = parseFloat(value);
				var remover = 1;

				if (
					value - Math.floor(value) > 0 &&
					(value + "").split(".")[1].length == 1
				) {
					remover = 2;
				}

				value += "";
				value =
					value.length > 1 ? value.substring(0, value.length - remover) : "0";
			}
		}
		setTimeout(function () {
			click = true;
			$("[data-valor").val(value).focus();
		}, 0);
		$("[data-valor").attr("data-valor", value);
		UltimaTecla = "Borrar";
	})
	.on("click", ".tecladoPunto", function (e) {
		e.preventDefault();
		if (validaigual == 1) {
			$("[data-valor").val("0");
		}
		var text = $("[data-valor")[0];
		var t = text.value.substr(
			text.selectionStart,
			text.selectionEnd - text.selectionStart
		);
		var value = $("[data-valor").val();

		punto = true;

		if (t == value && value != "") {
			value = "0.";
		} else {
			value = parseFloat(value);
			if (isNaN(value)) {
				value = "0.";
			}
			punto = true;

			if (value != "" && value - Math.floor(value) > 0) {
				value = Math.trunc(value);
			}
		}
		setTimeout(function () {
			click = true;
			$("[data-valor").val(value).focus();
		}, 0);
		$("[data-valor").attr("data-valor", value);
		UltimaTecla = "Punto";
	});

function tecladoNumericoTouch(numero) {
	if (validaigual == 1) {
		$("[data-valor").val("0");
	}
	validaigual = 0;
	var text = $("[data-valor")[0];
	var t = text.value.substr(
		text.selectionStart,
		text.selectionEnd - text.selectionStart
	);
	var value = $("[data-valor").val();
	var decimales = 2;
	if (t == value && value != "") {
		value = "0";
		if (numero == 0) {
			punto = false;
			setTimeout(function () {
				click = true;
				$("[data-valor").val(value).focus();
			}, 0);
			$("[data-valor").val(value);
			return false;
		}
	} else {
		value = value.replace(/,/g, "");
		value = parseFloat(value);
		value += "";
	}

	var valorAnterior = $("[data-valor").val();
	if (isNaN(valorAnterior)) {
		valorAnterior = "";
	}
	if (isNaN(value)) {
		value = "";
	}
	if (!value) {
		value = "0";
	}

	if (valorAnterior.indexOf(".") == -1) {
		valorAnterior = parseFloat(value);
	}
	value = valorAnterior + "";

	if (value.substr(-1) == "0" && value.indexOf(".") > -1) {
		value += numero;
	}

	// Valida que no hayan más de dos decimales
	if ($("[data-valor").attr("id") == "valor") {
		decimales = 4;
	}

	if (
		(valorAnterior == "0" && numero == "0") ||
		(typeof valorAnterior !== "number" &&
			valorAnterior != "" &&
			(valorAnterior + "").split(".")[1].length >= decimales)
	) {
		setTimeout(function () {
			click = true;
			$("[data-valor").focus();
		}, 0);
		return;
	}

	if (punto && isNaN(value)) {
		value = "0.";
	}

	if (punto && value.indexOf(".") == -1) {
		value += ".";
	}
	if (typeof value !== "string" && isNaN(value)) {
		value = numero;
	} else {
		if (
			typeof valorAnterior !== "number" &&
			valorAnterior.substr(-1) == "0" &&
			valorAnterior.indexOf(".") > -1
		) {
			value = valorAnterior;
			value += numero;
		} else {
			if (value == "0") {
				value = numero;
			} else {
				value += numero;
			}
		}
	}
	punto = false;
	setTimeout(function () {
		click = true;
		$("[data-valor").val(value).focus();
	}, 0);
	$("[data-valor").attr("data-valor", value);
}

function obtenerInformacion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: "POST",
		dataType: "json",
		data: {
			encriptado: data,
		},
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
			}
		},
	});
}

function redireccionRecogida() {
	location.href = base_url() + "Administrativos/Servicios/PanelPrincipal";
}

function resultadoCadena(cadena) {
	if (cadena) {
		cadena = cadena.split(" ");
		result = 0;
		operador = "";

		for (let i = 0; i < cadena.length; i++) {
			number = 0;
			if (cadena[i] == "+" || cadena[i] == "-") {
				operador = cadena[i];
			} else {
				number = parseInt(cadena[i]);
				result = operador == "-" ? result - number : result + number;
				operador = 0;
			}
		}
		cadena = result;
	}
	return cadena;
}
