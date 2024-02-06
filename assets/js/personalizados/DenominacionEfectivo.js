function DenominacionEfectivo(config = {}) {
	this.__config = {};
	this.__config.efectivo = config.efectivo !== undefined ? config.efectivo : "";
	this.__config.tarjetas = config.tarjetas !== undefined ? config.tarjetas : "";
	this.__config.creditos = config.creditos !== undefined ? config.creditos : "";
	this.__config.contentDenominaciones =
		config.contentDenominaciones !== undefined
			? config.contentDenominaciones
			: "";

	//validaciones para saber si falta alguna libreria para que funcione bien el modulo
	try {
		if (
			!(
				typeof jQuery !== "undefined" &&
				typeof jQuery.fn.inputmask !== "undefined"
			)
		) {
			console.log("Librerias necesarias: ", "inputmask: ", jQuery.fn.inputmask);
		}
	} catch (error) {
		console.log(error);
	}

	return new Promise(function (resolve, reject) {
		// Variables
		var punto = false,
			click = false;

		var cantidadDenomi = "";
		(creditos = this.__config.creditos),
			(tarjetas = this.__config.tarjetas),
			(lastModal = null),
			(formulario = null),
			(cantidadDenominacion = "");
		const contentDenominaciones = {};

		if (
			this.__config.contentDenominaciones == undefined ||
			Object.keys(this.__config.contentDenominaciones).length == 0
		) {
			contentDenominaciones.monedas50 = { valor: 50, total: 0 };
			contentDenominaciones.monedas100 = { valor: 100, total: 0 };
			contentDenominaciones.monedas200 = { valor: 200, total: 0 };
			contentDenominaciones.monedas500 = { valor: 500, total: 0 };
			contentDenominaciones.monedas1000 = { valor: 1000, total: 0 };
			contentDenominaciones.billetes1000 = { valor: 1000, total: 0 };
			contentDenominaciones.billetes2000 = { valor: 2000, total: 0 };
			contentDenominaciones.billetes5000 = { valor: 5000, total: 0 };
			contentDenominaciones.billetes10000 = { valor: 10000, total: 0 };
			contentDenominaciones.billetes20000 = { valor: 20000, total: 0 };
			contentDenominaciones.billetes50000 = { valor: 50000, total: 0 };
			contentDenominaciones.billetes100000 = { valor: 100000, total: 0 };
		} else {
			Object.assign(contentDenominaciones, this.__config.contentDenominaciones);
		}

		$("#modalNominacionEfectivo").remove();

		$.ajax({
			url: `${base_url()}DenominacionEfectivo/cargarVista`,
			type: "POST",
			async: false,
			data: {
				config: JSON.stringify(this.__config.paneles),
			},
			success: function (data) {
				// 1. Crea el modal
				const html = `
				<div id="modalNominacionEfectivo" data-keyboard="false" class="modal fade" tabindex="-1" data-backdrop='static' role="dialog" aria-labelledby="modalCrearLabel" aria-hidden="true" style="overflow:auto;">
					<div class="modal-dialog modal-xl" role="document">
						<div class="modal-content" >
							<div class="modal-header headerWebClub">
								<h5 class="modal-title">
									<i class="fas fa-coins"></i>
									Capturar Valores Para
								</h5>
							</div>
							<div class="modal-body pb-0">
								<p style="text-align: center;padding-bottom: 10px;">Recuerde que en este proceso se debe digitar el número de monedas o el número de billetes que se cuenten al momento del cuadre</p>
								${data}
							</div>
						</div>
					</div>
				</div>
			`;
				//2. agrego la modal al cuerpo del codumento
				$("body").append(html);

				formulario = $("#modalNominacionEfectivo").find(
					".componentDenominacionEfectivo"
				);

				//3. le agregamos los datos de la vista a la modal
				$("#modalNominacionEfectivo").modal("show");
				recorrerDatosObjetos();
			},
		});

		$(document)
			.on("mousedown", ".teclado7", function (e) {
				e.preventDefault();
				// 103
				tecladoNumericoTouch("7");
			})
			.on("click", ".teclado8", function (e) {
				e.preventDefault();
				// 104
				tecladoNumericoTouch("8");
			})
			.on("click", ".teclado9", function (e) {
				e.preventDefault();
				// 105
				tecladoNumericoTouch("9");
			})
			.on("click", ".teclado4", function (e) {
				e.preventDefault();
				// 100
				tecladoNumericoTouch("4");
			})
			.on("click", ".teclado5", function (e) {
				e.preventDefault();
				// 101
				tecladoNumericoTouch("5");
			})
			.on("click", ".teclado6", function (e) {
				e.preventDefault();
				// 102
				tecladoNumericoTouch("6");
			})
			.on("click", ".teclado1", function (e) {
				e.preventDefault();
				// 97
				tecladoNumericoTouch("1");
			})
			.on("click", ".teclado2", function (e) {
				e.preventDefault();
				// 98
				tecladoNumericoTouch("2");
			})
			.on("click", ".teclado3", function (e) {
				e.preventDefault();
				// 99
				tecladoNumericoTouch("3");
			})
			.on("click", ".tecladoBorrar", function (e) {
				e.preventDefault();
				// 46
				var text = $(".alertify:not(.ajs-hidden)").find("input:eq(0)")[0];
				var t = text.value.substr(
					text.selectionStart,
					text.selectionEnd - text.selectionStart
				);
				var value = $(".alertify:not(.ajs-hidden)").find("input:eq(0)").val();
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
						value = value.substring(0, value.length - remover);
					}
				}
				setTimeout(function () {
					click = true;
					$(".alertify:not(.ajs-hidden)")
						.find("input:eq(0)")
						.val(value)
						.focus();
				}, 0);
				$(".alertify:not(.ajs-hidden)")
					.find("input:eq(0)")
					.attr("data-valor", value);
			})
			.on("click", ".teclado0", function (e) {
				e.preventDefault();
				// 96
				tecladoNumericoTouch("0");
			})
			.on("click", ".tecladoPunto", function (e) {
				e.preventDefault();
				// 110
				var text = $(".alertify:not(.ajs-hidden)").find("input:eq(0)")[0];
				var t = text.value.substr(
					text.selectionStart,
					text.selectionEnd - text.selectionStart
				);
				var value = $(".alertify:not(.ajs-hidden)").find("input:eq(0)").val();
				punto = true;
				if (t == value && value != "") {
					value = "0.";
				} else {
					value = value.replace(/,/g, "");
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
					$(".alertify:not(.ajs-hidden)")
						.find("input:eq(0)")
						.val(value)
						.focus();
				}, 0);
				$(".alertify:not(.ajs-hidden)")
					.find("input:eq(0)")
					.attr("data-valor", value);
			});

		// EVENT LISTENER

		formulario
			.on("click", ".teclado", function (e) {
				e.preventDefault();
				cantidadDenomi = $(this).attr("data-input");
				$("#modalNominacionEfectivo").modal("hide");

				alertify
					.denominacionAlert($("#propinaFrm")[0], function () {})
					.set("selector", 'input[id="cantidadDenominacion"]');
			})
			.on("click", ".btnCancelar", function (e) {
				e.preventDefault();
				$("#modalNominacionEfectivo").modal("hide");
				setTimeout(() => {
					$("#modalNominacionEfectivo").remove();
				}, 150);
				reject({
					data: 0,
				});
			})
			.on("click", ".btnGuardar", function (e) {
				e.preventDefault();
				$("#modalNominacionEfectivo").modal("hide");
				let nuevoObjeto = {};
				Object.keys(contentDenominaciones).forEach((clave) => {
					if (clave == "totalefectivo") {
						nuevoObjeto["efectivogeneral"] = contentDenominaciones[clave];
					} else {
						nuevoObjeto[clave] = contentDenominaciones[clave].total;
					}
				});
				resolve({
					dataFormulario: contentDenominaciones,
					dataFinal: nuevoObjeto,
				});
			});
		// FUNCIONES

		delete alertify.denominacionAlert;

		!alertify.denominacionAlert &&
			alertify.dialog("denominacionAlert", function factory() {
				return {
					main: function (content, callback) {
						this.set("callback", callback);
						this.setContent(content);
					},
					setup: function () {
						return {
							options: {
								maximizable: false,
								resizable: false,
								title: "Digite la cantidad de la denominación seleccionada",
								closable: false,
							},
							buttons: [
								{
									text: "Aceptar",
									key: 13,
									className: alertify.defaults.theme.ok,
								},
								{
									text: "Cancelar",
									key: 27,
									className: alertify.defaults.theme.cancel,
									cancel: true,
								},
							],
						};
					},
					settings: {
						selector: undefined,
						callback: undefined,
					},
					hooks: {
						onclose: function () {
							$("#modalNominacionEfectivo").modal("show");
						},
						onshow: function () {
							punto = false;

							var valueInput = contentDenominaciones[cantidadDenomi].total
								? contentDenominaciones[cantidadDenomi].total /
								  contentDenominaciones[cantidadDenomi].valor
								: 0;

							$(".inputCantidad:visible")
								.unbind()
								.inputmask({
									groupSeparator: ",",
									alias: "currency",
									placeholder: "0",
									autoGroup: 3,
									digits: 0,
									digitsOptional: !1,
									clearMaskOnLostFocus: !1,
									rightAlign: false,
									prefix: "",
									integerDigits: 5,
									allowPlus: false,
									allowMinus: false,
								})
								.val(valueInput);

							$(document).find(".ajs-content .tecladoNumerico").remove();
							$(".tecladoNumerico")
								.clone()
								.appendTo($($(document).find(".ajs-content")))
								.removeClass("d-none");
						},
					},
					callback: function (closeEvent) {
						$(document).find(".ajs-content .tecladoNumerico").remove();
						if (closeEvent.index == 0) {
							cantidadDenominacion = parseFloat(
								$(".inputCantidad:visible").val().replace(/,/g, "")
							);

							contentDenominaciones[cantidadDenomi].total =
								contentDenominaciones[cantidadDenomi].valor *
								cantidadDenominacion;

							recorrerDatosObjetos();
						}
					},
				};
			});

		function tecladoNumericoTouch(numero) {
			var text = $(".alertify:not(.ajs-hidden)").find("input:eq(0)")[0];
			var t = text.value.substr(
				text.selectionStart,
				text.selectionEnd - text.selectionStart
			);
			var value = $(".alertify:not(.ajs-hidden)").find("input:eq(0)").val();
			var decimales = 2;

			if (t == value && value != "") {
				value = "0";
				if (numero == 0) {
					punto = false;
					setTimeout(function () {
						click = true;
						$(".alertify:not(.ajs-hidden)")
							.find("input:eq(0)")
							.val(value)
							.focus();
					}, 0);
					$(".alertify:not(.ajs-hidden)")
						.find("input:eq(0)")
						.attr("data-valor", value);
					return false;
				}
			} else {
				value = value.replace(/,/g, "");
				value = parseFloat(value);
				value += "";
			}

			var valorAnterior = $(".alertify:not(.ajs-hidden)")
				.find("input:eq(0)")
				.attr("data-valor");
			if (isNaN(valorAnterior)) {
				valorAnterior = "0";
			}
			if (isNaN(value)) {
				value = "0";
			}

			if (valorAnterior.indexOf(".") == -1) {
				valorAnterior = parseFloat(value);
			}
			value = valorAnterior + "";
			if (value.substr(-1) == "0" && value.indexOf(".") > -1) {
				value += numero;
			}

			if (
				(valorAnterior == "0" && numero == "0") ||
				(typeof valorAnterior !== "number" &&
					valorAnterior != "" &&
					(valorAnterior + "").split(".")[1].length >= decimales)
			) {
				setTimeout(function () {
					click = true;
					$(".alertify:not(.ajs-hidden)").find("input:eq(0)").focus();
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
					value += numero;
				}
			}

			punto = false;
			setTimeout(function () {
				click = true;
				$(".alertify:not(.ajs-hidden)").find("input:eq(0)").val(value).focus();
			}, 0);
			$(".alertify:not(.ajs-hidden)")
				.find("input:eq(0)")
				.attr("data-valor", value);
		}

		function recorrerDatosObjetos() {
			let totalDenominacion = 0;
			$(".FormularioDenominacion")
				.find("[data-tipo]")
				.each(function () {
					const tipo = $(this).data("tipo");
					$(this)
						.val(addCommas(contentDenominaciones[tipo].total))
						.attr("disabled", true);
					totalDenominacion += contentDenominaciones[tipo].total
						? parseInt(contentDenominaciones[tipo].total)
						: 0;
				});

			contentDenominaciones["totalefectivo"] = totalDenominacion;

			$("#efectivos").val(addCommas(totalDenominacion));
			$("#modalNominacionEfectivo").modal("show");
		}

		function addCommas(nStr) {
			if (nStr != "null") {
				nStr += "";
				x = nStr.split(".");
				x1 = x[0];
				x2 = x.length > 1 ? "." + x[1] : "";
				var rgx = /(\d+)(\d{3})/;
				while (rgx.test(x1)) {
					x1 = x1.replace(rgx, "$1" + "," + "$2");
				}
				return x1 + x2;
			} else {
				return "0";
			}
		}

		// PROCEDIMIENTOS

		RastreoIngresoModulo("Formulario Denominación efectivo");

		if (creditos != "" || tarjetas != "") {
			$("#creditosdenominacion").val(creditos);
			$("#tarjetasdenominacion").val(tarjetas);
		}
	});
}
