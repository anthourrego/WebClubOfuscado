let rutaGeneral = base_url() + 'Administrativos/Servicios/ActualizarFormaPago/';
let tblFormaPago;
let cabecera = ['CodiPagoId', 'Nombre', 'Valor'];
let $DATOSFACTURA = {
	FormaPago: {}
	, TotalPagar: 0
	, entregado: 0
	, FacturaId: null
	, TerceroId: null
	, Propina: 0
	, FrmPagoValor: []
};
let $PIE = {
	TotalPagar: 0
};
let $TerceroId = null;
let DTtblFormaPago;
let click = false;
let $CodiVentIdHotel = {};

$(function () {
	RastreoIngresoModulo('Actualizar Forma Pago');
	DTtblFormaPago = $('#tabla').DataTable({
		data: {
			tblID: "#tabla",
			select: [
				"IV.codipagoid AS CodiPagoId",
				"CP.nombre AS Nombre",
				"IV.valor AS Valor",
			],
			table: [
				'InfoVent IV',
				[
					[`CodiPago CP`, "IV.codipagoid = CP.codipagoid", "LEFT"]
				], [
					[`IV.facturaid = '${$FACTURA.facturaid}'`]
				]
			],
			column_order: ["Valor", "Nombre", "CodiPagoId"],
			column_search: ['Nombre'],
			columnas: cabecera,
			orden: {
				'CodiPagoId': 'ASC'
				, 'Valor': 'ASC'
				, 'Nombre': 'ASC'
			},
		},
		columnDefs: [
			{ visible: false, targets: [0] }
			, { sClass: 'text-right', targets: [2] }
		],
		processing: true,
		order: [[0, 'DESC']],
		draw: 10,
		language: {
			lengthMenu: "Mostrar _MENU_ registros por página.",
			zeroRecords: "No se ha encontrado ningún registro.",
			info: "Mostrando _START_ a _END_ de _TOTAL_ entradas.",
			infoEmpty: "Registros no disponibles.",
			search: "",
			searchPlaceholder: "Buscar",
			loadingRecords: "Cargando...",
			processing: "Procesando...",
			paginate: {
				first: "Primero",
				last: "Último",
				next: "Siguiente",
				previous: "Anterior"
			},
			infoFiltered: "(_MAX_ Registros filtrados en total)"
		},
		fixedColumns: true,
		pageLength: 10,
		deferRender: true,
		scrollX: '100%',
		scrollY: "300",
		scroller: {
			loadingIndicator: true
		},
		scrollCollapse: false,
		dom: 'tri',
		createdRow: function (row, data, dataIndex) {
			$(row).find('td:eq(1)').html(addCommas(data[2]));
		}
	});

	obtenerInfoVenta();

	$DATOSFACTURA.FacturaId = $FACTURA.facturaid;
	$DATOSFACTURA.TerceroId = $FACTURA.TerceroId;
	$TerceroId = $FACTURA.TerceroId;
	$DATOSFACTURA.TotalPagar = parseFloat($FACTURA.Valor);
	$PIE.TotalPagar = parseFloat($FACTURA.Valor);
	$PIE.IVA = parseFloat($FACTURA.IVA);
	$DATOSFACTURA.Propina = parseFloat($FACTURA.Propina_Factura);
	FormasPago = ($FACTURA.Tipospago == 'S');

	$('#frmTotalPagar').val($PIE.TotalPagar);
	$('#frmFormaTotalFactura').val($PIE.TotalPagar);
	$('#frmFormaIVAFactura').val($PIE.IVA);
	$('#frmFormaPendiente').val($PIE.TotalPagar);

	$('#frmValorfrmValor').val($PIE.TotalPagar);
	$('#frmValorTotalFactura').val($PIE.TotalPagar);
	$('#frmValorIVAFactura').val($PIE.IVA);
	$('#frmValorBase').val(0);
	$('#frmValorPendiente').val($PIE.TotalPagar);

	$CodiVentIdHotel.PropinaTarifa = parseFloat($FACTURA['Propina_Tarifa']);
	$CodiVentIdHotel.Propina = $FACTURA['Propina'];

	$(".card-tipo-pago").click(function (e) {
		let data = $(this).data('tipopago');
		$(".card-tipo-pago").removeClass("forma-pago-seleccionada");
		$(this).addClass("forma-pago-seleccionada");
		e.preventDefault();
		var CodiPagoId = $(this).data('tipopago');
		var nombre = $(this).text().trim();

		var total = 0;
		if (typeof $DATOSFACTURA.FormaPago[$TerceroId] == "undefined") {
			$DATOSFACTURA.FormaPago[$TerceroId] = {};
		}
		for (var k in $DATOSFACTURA.FormaPago[$TerceroId]) {
			total = parseFloat(total) + parseFloat($DATOSFACTURA.FormaPago[$TerceroId][k].Valor);
		}
		var faltante = parseFloat($PIE.TotalPagar) - parseFloat(total);

		alertify.prompt(nombre, 'Especifique Valor a Cancelar:', (typeof $DATOSFACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' ? $DATOSFACTURA.FormaPago[$TerceroId][CodiPagoId].Valor : faltante)
			, function (evt, value) {
				value = value.replace(/,/g, '');
				if (value != 0) {
					$DATOSFACTURA.FormaPago[$TerceroId][CodiPagoId] = {
						CodiPagoId: CodiPagoId
						, Nombre: nombre
						, Valor: value
					};
				} else {
					delete $DATOSFACTURA.FormaPago[$TerceroId][CodiPagoId];
				}

				DTtblFormaPago.clear();
				total = 0;
				for (var k in $DATOSFACTURA.FormaPago[$TerceroId]) {
					DTtblFormaPago.row.add({
						'0': $DATOSFACTURA.FormaPago[$TerceroId][k].CodiPagoId
						, '1': $DATOSFACTURA.FormaPago[$TerceroId][k].Nombre
						, '2': $DATOSFACTURA.FormaPago[$TerceroId][k].Valor
					});

					total = parseFloat(total) + parseFloat($DATOSFACTURA.FormaPago[$TerceroId][k].Valor);
				}

				DTtblFormaPago.draw();

				$('#frmFormaBase').val(total);
				$('#frmValorBase').val(total);
				$('#frmFormaPendiente').val(parseFloat($PIE.TotalPagar) - parseFloat(total));
				$('#frmValorPendiente').val(parseFloat($PIE.TotalPagar) - parseFloat(total));

				alertify.success('Forma de Pago almacenada satisfactoriamente');
			}, function () { });
	});

	$('#submitFormaPago').click(function (e) {
		e.preventDefault();
		var total = 0;

		if (typeof $DATOSFACTURA.FormaPago[$TerceroId] == "undefined") {
			$DATOSFACTURA.FormaPago[$TerceroId] = {};
		}
		for (var k in $DATOSFACTURA.FormaPago[$TerceroId]) {
			DTtblFormaPago.row.add({
				'0': $DATOSFACTURA.FormaPago[$TerceroId][k].CodiPagoId
				, '1': $DATOSFACTURA.FormaPago[$TerceroId][k].Nombre
				, '2': $DATOSFACTURA.FormaPago[$TerceroId][k].Valor
			});

			total = parseFloat(total) + parseFloat($DATOSFACTURA.FormaPago[$TerceroId][k].Valor);
		}

		if (total == '' || total == null || isNaN(total)) {
			total = 0;
		}

		total = total.toFixed(2);

		$DATOSFACTURA.entregado = total;

		$PIE.TotalPagar = parseFloat($PIE.TotalPagar).toFixed(2);

		if ($PIE.TotalPagar == '' || $PIE.TotalPagar == null || isNaN($PIE.TotalPagar) || $PIE.TotalPagar < 0) {
			$PIE.TotalPagar = 0;
		}
		if (+total < +$PIE.TotalPagar) {
			alertify.alert('Advertencia', 'Debe regresar y cancelar según el total', function () { });
		} else if (+total > +$PIE.TotalPagar) {
			alertify.confirm('Advertencia', 'El valor cancelado es mayor al de la factura, ¿Desea registrar cambio para el cliente?', function () {
				facturarFormasPago();
			}, function () { });
		} else {
			facturarFormasPago();
		}
	});

	$(".card-vendedor").click(function () {
		if ($FACTURA['vendedorid'] != $(this).data('vendedor')) {
			let vendedor = $(this).data('vendedor');
			alertify.confirm('Advertencia', '¿Esta seguro de modificar el vendedor de la factura?', function () {
				let encriptado = $.Encriptar({ vendedor, factura: $FACTURA.FacturaId });
				$.ajax({
					url: rutaGeneral + "ActualizarVendedor",
					type: 'POST',
					dataType: 'json',
					data: { encriptado },
					success: function (resp) {
						resp = JSON.parse($.Desencriptar(resp));
						if (resp.valido) {
							alertify.success(resp.mensaje);
							$("#ElegirVendedor").modal('hide');
							$(".card-vendedor").removeClass('card-vendedor-seleccionado');
							$(`[data-vendedor=${vendedor}]`).addClass('card-vendedor-seleccionado');
							$FACTURA['vendedorid'] = vendedor;
						} else {
							alertify.error(resp.mensaje);
						}
					}
				});
			}, function () { });
		} else {
			alertify.success("Vendedor no puede ser igual al de la factura.");
		}
	});

	$('.numero').inputmask('tres', {
		rightAlign: false,
		maxLength: 10,
		digits: 2
	});

	let PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
	if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa > 0) {
		if ($DATOSFACTURA.Propina <= 0) {
			$DATOSFACTURA.Propina = PropinaTarifa / 100 * $DATOSFACTURA.TotalPagar;
		}
		/* alertify.propinaAlert($('#propinaFrm')[0], function () {
			if ($FACTURA.pendiente == 'S') {
				$("#ElegirVendedor").modal('show');
			}
		}).set('selector', 'input[id="propinaInput"]'); */
	} else {
		if ($FACTURA.pendiente == 'S') {
			$("#ElegirVendedor").modal('show');
		}
	}
});

$(document).on('mousedown', '.teclado7', function (e) {
	e.preventDefault();
	// 103
	tecladoNumericoTouch('7');
}).on('click', '.teclado8', function (e) {
	e.preventDefault();
	// 104
	tecladoNumericoTouch('8');
}).on('click', '.teclado9', function (e) {
	e.preventDefault();
	// 105
	tecladoNumericoTouch('9');
}).on('click', '.teclado4', function (e) {
	e.preventDefault();
	// 100
	tecladoNumericoTouch('4');
}).on('click', '.teclado5', function (e) {
	e.preventDefault();
	// 101
	tecladoNumericoTouch('5');
}).on('click', '.teclado6', function (e) {
	e.preventDefault();
	// 102
	tecladoNumericoTouch('6');
}).on('click', '.teclado1', function (e) {
	e.preventDefault();
	// 97
	tecladoNumericoTouch('1');
}).on('click', '.teclado2', function (e) {
	e.preventDefault();
	// 98
	tecladoNumericoTouch('2');
}).on('click', '.teclado3', function (e) {
	e.preventDefault();
	// 99
	tecladoNumericoTouch('3');
}).on('click', '.tecladoBorrar', function (e) {
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
}).on('click', '.teclado0', function (e) {
	e.preventDefault();
	// 96
	tecladoNumericoTouch('0');
}).on('click', '.tecladoPunto', function (e) {
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

function facturarFormasPago() {
	let $TerceroId = $DATOSFACTURA.TerceroId;
	$.ajax({
		url: rutaGeneral + "actualizarFormasPago",
		type: 'POST',
		data: {
			Factura: $DATOSFACTURA
			, RASTREO: RASTREO('Factura Cuenta Tercero ' + $TerceroId, 'Facturas Pendientes de Pago')
		},
		success: function (res) {
			try {
				var registro = JSON.parse(res);
			} catch (e) {
				alertify.alert('Error', res, function () {
					this.destroy();
				});
				return false;
			}
			switch (res) {
				case '0':
					alertify.error('Ocurrió un problema al momento de facturar');
					break;
				default:
					if (registro[0] == '1') {
						let $CodiVentIdHotel = JSON.parse(registro[4]);
						alertify.success(registro[1]);
						obtenerInfoVenta();
						let strAlerta = 'Felicidades, la cuenta se ha facturado de manera satisfactoria';
						if ($CodiVentIdHotel.MostrarCambioCliente == "S" && registro[3] > 0) {
							strAlerta += '<br/><br/>Cambio: <input type="text" class="form-control form-control-lg text-right numero font-weight-bold" value="$ ' + addCommas2(registro[3], 2) + '" readonly="">';
						}
						alertify.alert('Factura: ' + registro[1], strAlerta, function () {
							if (typeof $CodiVentIdHotel.impresion == "undefined" || $CodiVentIdHotel.impresion == null) {
								$CodiVentIdHotel.impresion = 1;
							}
							/* var winPrint = window.open(base_url() + 'Reportes/ImprimirFactura/' + registro[2] + '/' + $CodiVentIdHotel.impresion); */

							abrirReporte(base_url() + 'Reportes/ImprimirFactura/' + registro[2] + '/' + $CodiVentIdHotel.impresion);
						});
					} else if (registro[0] == '2') {
						alertify.alert('Bloqueo Cartera', registro[1]);
					} else {
						alertify.alert('Error', 'Ocurrió un problema al momento de facturar', function () {
							this.destroy();
						});
						return false;
					}
					break;
			}
		}
	});
}

function obtenerInfoVenta() {
	$.ajax({
		url: rutaGeneral + 'obtenerInfoVenta',
		type: 'POST',
		data: { factura: $FACTURA.facturaid },
		dataType: 'json',
		cache: false,
		success: (resp) => {
			DTtblFormaPago.clear().draw();
			let filas = [];
			$.each(resp, function (pos, op) {
				let valores = {
					'0': op.CodiPagoId
					, '1': op.Nombre
					, '2': op.Valor
				};
				filas.push(valores);
				if (!$DATOSFACTURA.FormaPago[$TerceroId]) {
					$DATOSFACTURA.FormaPago[$TerceroId] = {};
				}
				$DATOSFACTURA.FormaPago[$TerceroId][op.CodiPagoId] = {
					CodiPagoId: op.CodiPagoId,
					Nombre: op.Nombre,
					Valor: op.Valor
				}
			});
			DTtblFormaPago.rows.add(filas).draw();
		},
		error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
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
			var self = this;
			setTimeout(function () {
				if (!click) {
					$(self).select();
				}
				click = false;
			}, 0);
		});

		$(document).find('.ajs-content .tecladoNumerico').remove();
		$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
	}
}).set({
	onclose: function () {
		$(document).find('.ajs-content .tecladoNumerico').remove();
	}
});

!alertify.propinaAlert && alertify.dialog('propinaAlert', function factory() {
	return {
		main: function (content, callback) {
			this.set('callback', callback);
			this.setContent(content);
		},
		setup: function () {
			return {
				focus: {
					element: function () {
						return this.elements.body.querySelector(this.get('selector'));
					},
					select: true
				},
				options: {
					maximizable: false,
					resizable: false,
					title: 'Propina',
					closable: false
				},
				buttons: [{
					text: 'OK',
					key: 27,
					className: alertify.defaults.theme.ok,
				}]
			};
		},
		settings: {
			selector: undefined,
			callback: undefined
		},
		hooks: {
			onclose: function () {
			},
			onshow: function () {
				punto = false;
				$('#propinaInput').unbind().inputmask({
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
					if (click == false) {
						var self = this;
						setTimeout(function () {
							$(self).select();
						}, 0);
					}
					click = false;
				}).val($DATOSFACTURA.Propina);

				$(document).find('.ajs-content .tecladoNumerico').remove();
				$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
			}
		},
		callback: function (closeEvent) {
			var value = $('#propinaInput').val().replace(/,/g, '');
			value = parseFloat(value);
			if (isNaN(value)) {
				value = 0;
			}
			$DATOSFACTURA.Propina = value;
			$DATOSFACTURA.TotalPagar += value;
			$PIE.TotalPagar += value;
			$('#frmTotalPagar').val($PIE.TotalPagar);
			$('#frmFormaTotalFactura').val($PIE.TotalPagar);
			$('#frmFormaPendiente').val($PIE.TotalPagar);
			$('#frmValorfrmValor').val($PIE.TotalPagar);
			$('#frmValorTotalFactura').val($PIE.TotalPagar);
			$('#frmValorPendiente').val($PIE.TotalPagar);
			alertify.success('Propina aplicada satisfactoriamente');
			$(document).find('.ajs-content .tecladoNumerico').remove();
			var cb = this.get('callback')
			if (typeof cb === 'function') {
				var returnValue = cb.call(this, closeEvent);
				if (typeof returnValue !== 'undefined') {
					closeEvent.cancel = !returnValue;
				}
			}
			var total = 0;
			for (var k in $DATOSFACTURA.FormaPago[$TerceroId]) {
				total = parseFloat(total) + parseFloat($DATOSFACTURA.FormaPago[$TerceroId][k].Valor);
			}
			$('#frmFormaBase').val(total);
			// $('#frmValorBase').val(total);
			/* $('#frmFormaPendiente').val(parseFloat($PIE.TotalPagar) - parseFloat(total));
			$('#frmValorPendiente').val(parseFloat($PIE.TotalPagar) - parseFloat(total)); */
		}
	}
});

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
		return x1 + x2;
	} else {
		return '0';
	}
}