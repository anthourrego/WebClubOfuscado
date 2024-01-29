DTtblFormaPago = $('#tblFormaPago').DataTable({
	columnDefs: [
		{ visible: false, targets: [0] }
		, { sClass: 'text-right', targets: [2] }
		, { width: '75%', targets: [1] }
	],
	processing: true,
	order: [[0, 'DESC']],
	draw: 10,
	language,
	fixedColumns: true,
	pageLength: 10,
	deferRender: true,
	scrollX: '100%',
	scrollY: "300",
	scroller: {
		loadingIndicator: true
	},
	scrollCollapse: false,
	dom: domtri,
	createdRow: function (row, data, dataIndex) {
		$(row).find('td:eq(1)').html(addCommas2(data[2], 2));
		if (data[0].indexOf('_') != -1) {
			$(row).addClass('rowPropinilla');
		}
	}
});

$(function () {
	// Botones formas de pago
	$('.btnCodiPago').click(function (e) {
		e.preventDefault();
		var CodiPagoId = $(this).attr('CodiPagoId');
		var nombre = $(this).text().trim();

		let validaAlertaFormaPago = false;
		let validacionFormaPago = false;

		let manejcentr = $(this).data('manejcentr');
		let manejnumer = $(this).data('manejnumer');
		let fechadocum = $(this).data('fechadocum');
		let manejcuotas = $(this).data('manejcuotas');
		let valordigit = $(this).data('valordigit');

		if (manejcentr == 'S' || manejnumer == 'S' || fechadocum == 'S' || manejcuotas == 'S') {
			validacionFormaPago = true;
		}

		var total = 0;
		if (typeof FormasPago[TerceroId] == "undefined") {
			FormasPago[TerceroId] = {};
		}

		for (var k in FormasPago[TerceroId]) {
			total = parseFloat(total) + parseFloat(FormasPago[TerceroId][k].Valor) + ('Propina' in FormasPago[TerceroId][k] ? FormasPago[TerceroId][k].Propina : 0);
		}
		var faltante = parseFloat(TotalPagar) - parseFloat(total);

		let valorAlerta = (typeof FormasPago[TerceroId][CodiPagoId] !== 'undefined' ? FormasPago[TerceroId][CodiPagoId].Valor : faltante);

		alertify.prompt(nombre, 'Especifique Valor a Cancelar:', valorAlerta, function (evt, value) {
			value = value.replace(/,/g, '');
			value = parseFloat(value);
			if (isNaN(value)) {
				value = 0.00;
			}

			if (CodiPagoId != '1' && valordigit != 'S') {

				if (FormasPago[TerceroId][CodiPagoId]) {
					total -= FormasPago[TerceroId][CodiPagoId].Valor;
					faltante += FormasPago[TerceroId][CodiPagoId].Valor;
				}

				if ((total + value) > parseFloat(TotalPagar)) {
					if (value > 0) {
						validaAlertaFormaPago = true;
					}
					value = Math.round(faltante);
				}
			}

			if (value != 0) {
				if (validacionFormaPago) {
					// $('#ModalFormasPago').modal('toggle');
					alertify.alert(nombre, '', function () {
						$('#ModalFormasPago').modal('toggle');

						let FormaPagoTMP = {
							CodiPagoId: CodiPagoId
							, Nombre: nombre
							, Valor: value
						};

						if (manejcentr == 'S') {
							FormaPagoTMP.bancoid = $('.alertify:not(.ajs-hidden) .divBancos select').val().trim();
						}
						if (manejnumer == 'S') {
							FormaPagoTMP.numerdocum = $('.alertify:not(.ajs-hidden) .divDocumento input').val().trim();
						}
						if (fechadocum == 'S') {
							FormaPagoTMP.fechacheq = $('.alertify:not(.ajs-hidden) .divFechaDocum input').val().trim();
						}
						if (manejcuotas == 'S') {
							FormaPagoTMP.cuota = $('.alertify:not(.ajs-hidden) .divManejcuotas input').val().trim();
						}

						FormasPago[TerceroId][CodiPagoId] = FormaPagoTMP;

						if (FormasPago[TerceroId]['__']) {
							FormasPago[TerceroId]['__'].CodiPagoId = '_' + CodiPagoId;
							FormasPago[TerceroId]['__'].Nombre = nombre + ' (PROPINA)';
							FormasPago[TerceroId]['_' + CodiPagoId] = FormasPago[TerceroId]['__'];
							delete FormasPago[TerceroId]['__'];
						}

						actualizarFormasPago();
						alertify.success('Forma de Pago almacenada satisfactoriamente');
						if (validaAlertaFormaPago) {
							alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
						}
					});

					$('.DivFormasPago').clone().appendTo('.alertify:not(.ajs-hidden) .ajs-content').removeClass('d-none').on('submit', function (e) {
						e.preventDefault();
						$('.alertify:not(.ajs-hidden) .ajs-footer button').click();
					})

					if (manejcentr != 'S') {
						$('.alertify:not(.ajs-hidden) .divBancos').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divBancos select').prop('required', true).val(
							(typeof FormasPago[TerceroId][CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId][CodiPagoId]['bancoid'] !== 'undefined')
								? FormasPago[TerceroId][CodiPagoId]['bancoid']
								: (
									(typeof FormasPago[TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId]['_' + CodiPagoId]['bancoid'] !== 'undefined')
										? FormasPago[TerceroId]['_' + CodiPagoId]['bancoid']
										: ''
								)
						)
					}
					if (manejnumer != 'S') {
						$('.alertify:not(.ajs-hidden) .divDocumento').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divDocumento input').prop('required', true).val(
							(typeof FormasPago[TerceroId][CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId][CodiPagoId]['numerdocum'] !== 'undefined')
								? FormasPago[TerceroId][CodiPagoId]['numerdocum']
								: (
									(typeof FormasPago[TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId]['_' + CodiPagoId]['numerdocum'] !== 'undefined')
										? FormasPago[TerceroId]['_' + CodiPagoId]['numerdocum']
										: ''
								)
						)
					}
					if (fechadocum != 'S') {
						$('.alertify:not(.ajs-hidden) .divFechaDocum').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divFechaDocum input').prop('required', true).datetimepicker({
							format: 'YYYY-MM-DD',
							locale: 'es'
						}).val(
							(typeof FormasPago[TerceroId][CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId][CodiPagoId]['fechacheq'] !== 'undefined')
								? FormasPago[TerceroId][CodiPagoId]['fechacheq']
								: (
									(typeof FormasPago[TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId]['_' + CodiPagoId]['fechacheq'] !== 'undefined')
										? FormasPago[TerceroId]['_' + CodiPagoId]['fechacheq']
										: ''
								)
						);
					}
					if (manejcuotas != 'S') {
						$('.alertify:not(.ajs-hidden) .divManejcuotas').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divManejcuotas input').prop('required', true).inputmask('integer', {
							rightAlign: false,
							maxLength: 10,
							min: 1,
							allowPlus: false,
							allowMinus: false
						}).focus(function () {
							var selfie = this;
							setTimeout(function () {
								$(selfie).select();
							}, 0);
						}).val(
							(typeof FormasPago[TerceroId][CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId][CodiPagoId]['cuota'] !== 'undefined')
								? FormasPago[TerceroId][CodiPagoId]['cuota']
								: (
									(typeof FormasPago[TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof FormasPago[TerceroId]['_' + CodiPagoId]['cuota'] !== 'undefined')
										? FormasPago[TerceroId]['_' + CodiPagoId]['cuota']
										: '1'
								)
						).on('change', function () {
							let cuotas = parseFloat($(this).val());
							if (cuotas < 1) {
								$(this).val(1);
								alertify.warning('Número mínimo de cuotas: 1');
							}
						}).on("keyup", function () {
							let cuotas = parseFloat($(this).val());
							if (cuotas < 1) {
								$(this).val(1);
							}
						});
					}
					$('.alertify:not(.ajs-hidden) .ajs-footer').addClass('d-none');
				} else {
					if (FormasPago[TerceroId]['__']) {
						FormasPago[TerceroId]['__'].CodiPagoId = '_' + CodiPagoId;
						FormasPago[TerceroId]['__'].Nombre = nombre + ' (PROPINA)';
						FormasPago[TerceroId]['_' + CodiPagoId] = FormasPago[TerceroId]['__'];
						delete FormasPago[TerceroId]['__'];
					}

					FormasPago[TerceroId][CodiPagoId] = {
						CodiPagoId: CodiPagoId
						, Nombre: nombre
						, Valor: value
					};

					actualizarFormasPago();
					alertify.success('Forma de Pago almacenada satisfactoriamente');
					$('#ModalFormasPago').modal('toggle');
					if (validaAlertaFormaPago) {
						alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
					}
				}
			} else {
				delete FormasPago[TerceroId][CodiPagoId];

				actualizarFormasPago();
				alertify.success('Forma de Pago eliminada satisfactoriamente');
				$('#ModalFormasPago').modal('toggle');
				if (validaAlertaFormaPago) {
					alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
				}
			}
		}, function () {
			$('#ModalFormasPago').modal('toggle');
		});
	});

	setTimeout(() => {
		DTtblFormaPago.columns.adjust().draw();
	}, 0);

	$('#submitFormaPago').click(function (e) {
		e.preventDefault();

		var total = 0;

		for (var j in FormasPago) {
			for (var k in FormasPago[j]) {
				if (typeof FormasPago[j][k].Propina !== "undefined") {
					total += FormasPago[j][k].Propina;
				} else {
					total = parseFloat(total) + parseFloat(FormasPago[j][k].Valor);
				}
			}
		}

		if (total == '' || total == null || isNaN(total)) total = 0;

		total = total.toFixed(2);

		entregado = total;

		TotalPagar = parseFloat(TotalPagar).toFixed(2);

		if (TotalPagar == '' || TotalPagar == null || isNaN(TotalPagar) || TotalPagar < 0) TotalPagar = 0;

		total = parseFloat(total);
		TotalPagar = parseFloat(TotalPagar);

		if (total < TotalPagar) {
			alertify.alert('Advertencia', 'Debe regresar y cancelar según el total', function () { });
		} else if (total > TotalPagar) {
			let msg = 'El valor cancelado es mayor al de la factura'

			if ($CodiVentId.MostrarCambioCliente == "S") {
				msg += ', ¿Desea registrar cambio para el cliente?';
			}

			alertify.confirm('Advertencia', msg, function () {
				let datos = {
					FormasPago: FormasPago[TerceroId],
					entregado: entregado
				}
				DTtblFormaPago.clear().columns.adjust().draw();
				window[FuncionRetorno](datos);
			}, function () { });
		} else {
			let datos = {
				FormasPago: FormasPago[TerceroId],
				entregado: entregado
			}
			DTtblFormaPago.clear().columns.adjust().draw();
			window[FuncionRetorno](datos);
		}
	});

	$('#btnCancelarFrmPago').click(function (e) {
		e.preventDefault();
		DTtblFormaPago.clear().columns.adjust().draw();
		window[FuncionRetorno](null, true);
	});

	actualizarFormasPago();
});

function actualizarFormasPago() {
	DTtblFormaPago.clear();
	total = 0;

	for (var k in FormasPago[TerceroId]) {
		//Se valida si existe la primera propina para no mostrarla en la tabla
		if (k != "__") {
			DTtblFormaPago.row.add({
				'0': FormasPago[TerceroId][k].CodiPagoId
				, '1': FormasPago[TerceroId][k].Nombre
				, '2': FormasPago[TerceroId][k].Valor + ('Propina' in FormasPago[TerceroId][k] ? FormasPago[TerceroId][k].Propina : 0)
			});

			total = parseFloat(total) + parseFloat(FormasPago[TerceroId][k].Valor) + ('Propina' in FormasPago[TerceroId][k] ? FormasPago[TerceroId][k].Propina : 0);
		}
	}
	let totalS = addCommas2(total, 2);
	$('#frmFormaBase').val(totalS);
	$('#frmValorBase').val(totalS);
	let valTotal = addCommas2(parseFloat(TotalPagar) - parseFloat(total), 2);
	$('#frmFormaPendiente').val(valTotal);
	$('#frmValorPendiente').val(valTotal);

	setTimeout(() => {
		DTtblFormaPago.columns.adjust().draw();
	}, 100);
}

alertify.prompt().set({
	onshow: function () {
		punto = false;
		$('#ModalFormasPago').modal('toggle');
		$('.alertify:not(.ajs-hidden)').find('input:eq(0)').unbind().inputmask({
			groupSeparator: ",",
			alias: "currency",
			placeholder: "0",
			autoGroup: 3,
			digits: 2,
			digitsOptional: !1,
			clearMaskOnLostFocus: !1,
			rightAlign: false,
			prefix: "",
			integerDigits: 12
		}).focus(function () {
			var selfie = this;
			setTimeout(function () {
				// $(selfie).select();
			}, 0);
		});

		$(document).find('.ajs-content #tecladoNumerico').remove();
		$('.ajs-content input.ajs-input').addClass('keyboardOFF');
		$('#tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
	}
}).set({
	onclose: function () {
		// $('#ModalFormasPago').modal('toggle');
		$(document).find('.ajs-content #tecladoNumerico').remove();
	}
});

$(document).on('mousedown', '#teclado7', function (e) {
	e.preventDefault();
	// 103
	tecladoNumericoTouch('7');
}).on('click', '#teclado8', function (e) {
	e.preventDefault();
	// 104
	tecladoNumericoTouch('8');
}).on('click', '#teclado9', function (e) {
	e.preventDefault();
	// 105
	tecladoNumericoTouch('9');
}).on('click', '#teclado4', function (e) {
	e.preventDefault();
	// 100
	tecladoNumericoTouch('4');
}).on('click', '#teclado5', function (e) {
	e.preventDefault();
	// 101
	tecladoNumericoTouch('5');
}).on('click', '#teclado6', function (e) {
	e.preventDefault();
	// 102
	tecladoNumericoTouch('6');
}).on('click', '#teclado1', function (e) {
	e.preventDefault();
	// 97
	tecladoNumericoTouch('1');
}).on('click', '#teclado2', function (e) {
	e.preventDefault();
	// 98
	tecladoNumericoTouch('2');
}).on('click', '#teclado3', function (e) {
	e.preventDefault();
	// 99
	tecladoNumericoTouch('3');
}).on('click', '#tecladoBorrar', function (e) {
	e.preventDefault();
	// 46
	var text = $('.alertify:not(.ajs-hidden)').find('input:eq(0)')[0];
	var t = text.value.substr(text.selectionStart, text.selectionEnd - text.selectionStart);
	var value = $('.alertify:not(.ajs-hidden)').find('input:eq(0)').val();
	if (value != '') {
		if (t == value && value != '') {
			value = '0';
		} else {
			value = value.replace(/,/g, '');
			value = parseFloat(value);
		}

		if (value != '') {
			value = parseFloat(value);
			var remover = 1;

			if ((value - Math.floor(value) > 0) && (value + '').split('.')[1].length == 1) {
				remover = 2;
			}
			value += '';
			value = value.substring(0, value.length - remover);
		}
	}

	setTimeout(function () {
		click = true;
		$('.alertify:not(.ajs-hidden)').find('input:eq(0)').val(value).focus();
	}, 0);
	$('.alertify:not(.ajs-hidden)').find('input:eq(0)').attr('data-valor', value);
}).on('click', '#teclado0', function (e) {
	e.preventDefault();
	// 96
	tecladoNumericoTouch('0');
}).on('click', '#tecladoPunto', function (e) {
	e.preventDefault();
	// 110
	var text = $('.alertify:not(.ajs-hidden)').find('input:eq(0)')[0];
	var t = text.value.substr(text.selectionStart, text.selectionEnd - text.selectionStart);
	var value = $('.alertify:not(.ajs-hidden)').find('input:eq(0)').val();

	punto = true;

	if (t == value && value != '') {
		value = '0.';
	} else {
		value = value.replace(/,/g, '');
		value = parseFloat(value);
		if (isNaN(value)) {
			value = '0.';
		}
		punto = true;

		if ((value != '') && (value - Math.floor(value) > 0)) {
			value = Math.trunc(value);
		}
	}
	setTimeout(function () {
		click = true;
		$('.alertify:not(.ajs-hidden)').find('input:eq(0)').val(value).focus();
	}, 0);
	$('.alertify:not(.ajs-hidden)').find('input:eq(0)').attr('data-valor', value);
});

function tecladoNumericoTouch(numero) {
	var text = $('.alertify:not(.ajs-hidden)').find('input:eq(0)')[0];
	var t = text.value.substr(text.selectionStart, text.selectionEnd - text.selectionStart);
	var value = $('.alertify:not(.ajs-hidden)').find('input:eq(0)').val();
	var decimales = 2;

	if (t == value && value != '') {
		value = '0';
		if (numero == 0) {
			punto = false;
			setTimeout(function () {
				click = true;
				$('.alertify:not(.ajs-hidden)').find('input:eq(0)').val(value).focus();
			}, 0);
			$('.alertify:not(.ajs-hidden)').find('input:eq(0)').attr('data-valor', value);
			return false;
		}
	} else {
		value = value.replace(/,/g, '');
		value = parseFloat(value);
		value += '';
	}

	var valorAnterior = $('.alertify:not(.ajs-hidden)').find('input:eq(0)').attr('data-valor');
	if (isNaN(valorAnterior)) {
		valorAnterior = '0';
	}
	if (isNaN(value)) {
		value = '0';
	}

	if (valorAnterior.indexOf('.') == -1) {
		valorAnterior = parseFloat(value);
	}
	value = valorAnterior + '';
	if (value.substr(-1) == '0' && value.indexOf('.') > -1) {
		value += numero;
	}

	// Valida que no hayan más de dos decimales
	if ($('.alertify:not(.ajs-hidden)').find('input:eq(0)').attr('id') == 'dctoPorcentajeInput') {
		decimales = 4;
	}

	if ((valorAnterior == '0' && numero == '0') || ((typeof valorAnterior !== "number") && (valorAnterior != '') && ((valorAnterior + '').split('.')[1].length >= decimales))) {
		setTimeout(function () {
			click = true;
			$('.alertify:not(.ajs-hidden)').find('input:eq(0)').focus();
		}, 0);
		return;
	}

	if (punto && isNaN(value)) {
		value = '0.';
	}

	// if(punto && ( (typeof value !== "string") && ! isNaN(value))){

	if (punto && value.indexOf('.') == -1) {
		value += '.';
	}
	if ((typeof value !== "string") && isNaN(value)) {
		value = numero;
	} else {
		if ((typeof valorAnterior !== "number") && valorAnterior.substr(-1) == '0' && valorAnterior.indexOf('.') > -1) {
			value = valorAnterior;
			value += numero;
		} else {
			value += numero;
		}
	}

	punto = false;
	setTimeout(function () {
		click = true;
		$('.alertify:not(.ajs-hidden)').find('input:eq(0)').val(value).focus();
	}, 0);
	$('.alertify:not(.ajs-hidden)').find('input:eq(0)').attr('data-valor', value);
}

function addCommas2(nStr, decimales) {
	if (nStr != 'null') {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '.';
		for (var i = 0; i < decimales; i++) {
			x2 += '0';
		}
		x2 = x2.substr(0, (1 + decimales));

		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		if (decimales == 0) {
			return x1;
		} else {
			return x1 + x2;
		}
	} else {
		return '0';
	}
}

alertify.myAlert || alertify.dialog('myAlert', function factory() {
	return {
		main: function (content) {
			this.setContent(content);
		},
		setup: function () {
			return {
				options: {
					maximizable: false,
					resizable: false,
					padding: false,
					title: 'Búsqueda',
					closable: false
				}
			};
		},
		hooks: {
			onclose: function () {
				$('#ModalCuentaValor').modal('toggle');
				setTimeout(function () {
					alertify.myAlert().destroy();
				}, 500);
			},
			onshow: function () {
				$('#ModalCuentaValor').modal('toggle');
			}
		}
	};
});

alertify.alert().set({
	onclose: function () {
		$(document).find('.ajs-content .DivFormasPago').remove();
		$(document).find('.ajs-footer').removeClass('d-none');
	},
	closable: false
});