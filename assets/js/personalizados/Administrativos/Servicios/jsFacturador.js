var rutaGeneral = base_url() + "Administrativos/Servicios/EstadoCuenta/";
$FACTURA = {};
$FACTURA.observacion = '';
$FACTURA.anotacion = '';
$FACTURA.FormaPago = {};
$FACTURA.dctoValor = 0;
$FACTURA.dctoPorcentaje = 0;
$FACTURA.MeseroId =
	typeof $ENCABEZADO.MeseroId !== "undefined"
		? $ENCABEZADO.MeseroId
		: $ENCABEZADO.VendedorId;
$FACTURA.Mesero =
	typeof $ENCABEZADO.MeseroId !== "undefined"
		? $ENCABEZADO.Mesero
		: $ENCABEZADO.VendedorId;

$FACTURA.FrmPagoValor = [];
$FACTURA.CortesiaId = null;
FrmPagoValorId = 0;

var DTtblFormaPago;
var entregado = 0;
var formaPago = '';
var observasao = {};
var contexto = this;
var resolucion = '';

var $RF = $PIEORIGINAL.ReteFuente;
var $RI = $PIEORIGINAL.RetencionIVA;
var $RC = $PIEORIGINAL.RetencionICA;
var $IM = 0;
var $IC = $PIEORIGINAL.ImpoConsumo;

// Teclado Numérico Touch
var punto = false,
	click = false;

$FACTURA.Propina = 0;
$FACTURA.PropinaAnticipo = 0;

var DTCuentaValor;
var selecciones = [];
var ultimoBoton = '';
var btnAutorizar = '';
var CambioPropina = false;
var CruzaAnticipo = false;
var accesoModulo = '';

let DTtblCRUD = $('#tblCRUD').DataTable({
	data: $ESTADOCUENTA,
	columns: [
		{
			defaultContent: '',
			className: "Cargar",
			width: '40px',
			render: function (row, type, data) {
				return `<div class="checksito"></div>
					<div class="custom-control text-center custom-checkbox">
						<input type="checkbox" class="custom-control-input">
						<label class="custom-control-label"></label>
					</div>`;
			}

		},
		{ data: "productoid" },
		{
			data: "nombre",
			className: "text-left",
			width: "30%"
		},
		{
			data: "TerceroConsume",
			className: "text-left",
			width: "30%",
			visible: ($Montaje.ConsolidarCuentaResponsablePago == 'S' ? true : false)
		},
		{
			data: "NombreVendedor",
			visible: $Montaje.FactConAbier != "S" ? false : true
		},
		{
			data: "Almacen",
			visible: $Montaje.FactConAbier != "S" ? false : true
		},
		{
			data: "Cantidad",
			className: "pCantidad",
			width: "10%",
			render: function (row, type, data) {
				let cantidad = parseInt(data.Cantidad);
				return `<input type="text" class="form-control form-control-sm text-right numeroInt" value="${cantidad}" data-max="${cantidad}" placeholder="Max: ${cantidad}" maxLength="3" readonly>`;
			}
		},
		{
			data: "PorceDescP",
			className: "text-right",
			render: function (row, type, data) {
				let PorceDescP = parseFloat(data.PorceDescP);
				return addCommas2(PorceDescP, 3);
			}
		},
		{
			data: "ValorUnitario",
			className: "text-right",
			render: function (row, type, data) {
				let ValorUnitario = parseFloat(data.ValorUnitario);
				return addCommas2(ValorUnitario, 2);
			}
		},
		{
			data: "ValorTotal",
			className: "text-right pTotal",
			render: function (row, type, data) {
				let ValorTotal = parseFloat(data.ValorTotal);
				return addCommas2(ValorTotal, 2);
			}
		},
		{
			data: "DescuProdu",
			className: "text-right descuProdu",
			render: function (row, type, data) {
				let DescuProdu = parseFloat(data.DescuProdu);
				return addCommas2(DescuProdu, 2);
			}
		},
		{
			data: "Observacio",
			className: "pObservacion",
			width: '50%',
			render: function (row, type, data) {
				return `<textarea class="form-control form-control-sm" maxlength="254">${data.Observacio}</textarea>`;
			}
		}
	],
	processing: true,
	draw: 10,
	language,
	fixedColumns: true,
	ordering: false,
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
		//Le agregamos un clase unica poder modificar los datos a mostrar en la tabla
		$(row).addClass(`p${data.Id}`);

		$(row).find('.pObservacion textarea').change(function () {
			observasao[data.Id] = $(this).val();
		});

		$(row).find('.Cargar').click(function () {
			$(this).find("input").click();
		});

		$(row).find('.pCantidad .numeroInt').inputmask('integer', {
			rightAlign: false,
			maxLength: 10,
			allowPlus: false,
			allowMinus: false
		}).on('click', function () {
			var selfie = this;
			if (!$(this).is('[readonly]')) {
				setTimeout(function () {
					$(selfie).select();
				}, 0);
			}
		}).on("change", function () {
			var value = parseInt($(this).val());
			var dataMax = parseInt($(this).data('max'));

			var totalisimo = data.ValorTotal;
			let itDcto = data.DescuProdu;
			if (value > 0) {
				if (value > dataMax) {
					value = dataMax;
					$(this).val(value);
				}

				itDcto = ((parseFloat(data.ValorUnitario.replace(/,/g, '')) * data.PorceDescP) / 100) * value;
				totalisimo = parseFloat(data.ValorUnitario.replace(/,/g, '')) * value;
				totalisimo = totalisimo - itDcto;

				var index = selecciones.map((e) => e.Id).indexOf(data.Id);
				if (index != -1 && selecciones.length > 0) {
					selecciones[index]["Cantidad"] = value;
					selecciones[index]["ValorTotal"] = totalisimo;
					selecciones[index]["DescuProdu"] = itDcto;
				}
			} else {
				value = dataMax;
				$(this).val(value);
				selecciones = selecciones.filter(function (e) {
					return e.Id !== data.Id;
				});
				$(row).find('.Cargar input').prop('checked', false);
				$(this).attr('readonly', true);
			}

			totalisimo = addCommas2(totalisimo, 2);
			itDcto = addCommas2(itDcto, 2);
			$(row).find('.descuProdu').text(itDcto);
			$(row).find('.pTotal').text(totalisimo);

			dcto();
		});

		$(row).find('.Cargar input').click(function (e) {
			e.stopPropagation();
			selecciones = selecciones.filter(function (e) {
				return e.Id !== data.Id;
			});

			if ($(this).is(':checked')) {
				selecciones.push({...data});

				setTimeout(function () {
					$(row).find('.pCantidad input').prop('readonly', false).select();
				}, 0);
			} 

			$(row).find('.pCantidad input').prop('readonly', true).val($(row).find('.pCantidad input').data('max')).change();
		});
	},
	rowCallback: function (row, data) {
		if (selecciones.some(code => code.Id == data.Id)) {
			$(row).find('.Cargar input').prop('checked', true);
		} else {
			$(row).find('.Cargar input').prop('checked', false);
		}
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
				buttons: [
					{
						text: 'OK',
						key: 13,
						className: alertify.defaults.theme.ok + ' btnGuardarDcto',
					},
					{
						text: 'Cancelar',
						key: 27,
						className: alertify.defaults.theme.cancel,
						cancel: true
					}
				]
			};
		},
		settings: {
			selector: undefined,
			callback: undefined
		},
		hooks: {
			onclose: function () {
				showTeclado = true;
			},
			onshow: function () {
				showTeclado = false;
				punto = false;
				$('#propinaInput')
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
						integerDigits: 9,
						allowPlus: false,
						allowMinus: false
					}).focus(function () {
						if (click == false) {
							var selfie = this;
							setTimeout(function () {
								$(selfie).select();
							}, 0);
						}
						click = false;
					}).val($FACTURA.Propina);

				$(document).find('.ajs-content .tecladoNumerico').remove();
				$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');

				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val('1').prop('disabled', false);
				setTimeout(function () {
					if (ultimoBoton == 'btnPendiente' || ((CambioPropina == false || CambioPropina == '_80') && ultimoBoton == 'btnFormasPago')) {
						$('#propinaFrm:eq(0)').find('#propinaInput').closest('div').removeClass('col-4').addClass('col-12');
						$('#propinaFrm:eq(0)').find('#propinaInput').closest('fieldset').find('div:eq(1)').addClass('d-none');
					} else {
						$('#propinaFrm:eq(0)').find('#propinaInput').closest('div').removeClass('col-12').addClass('col-4');
						$('#propinaFrm:eq(0)').find('#propinaInput').closest('fieldset').find('div:eq(1)').removeClass('d-none');
					}
				}, 300);
			}
		},
		callback: function (closeEvent) {
			$(document).find('.ajs-content .tecladoNumerico').remove();
			if (closeEvent.index == 0) {
				let selfieie = this;
				var value = $('#propinaInput').val();
				if (value != null && value != '') {
					value = value.replace(/,/g, '');
				}

				var propinaInfoVent = $('#propinaInfoVent').val(),
					propinaNombre = $('#propinaInfoVent option:selected').text();

				if (propinaInfoVent != null && propinaInfoVent != '') {
					propinaInfoVent.trim();
				}
				if (propinaNombre != null && propinaNombre != '') {
					propinaNombre.trim();
				}
				dataPropina = {
					value,
					selfieie,
					closeEvent,
					propinaInfoVent,
					propinaNombre
				}
				
				validarAnticipoParcial(true, dataPropina);

			} else {
				if (CambioPropina != false && CambioPropina != '_80') {
					actualizarFormasPago();
					$('#ModalFormasPago').modal('toggle');
				} else {
					$PIE.Anticipo = $PIEORIGINAL.Anticipo;
					$FACTURA.Propina = 0;
					$FACTURA.PropinaAnticipo = 0;
					dcto();
				}
			}
		}
	}
});

alertify.dialog('dctoValorAlert', function factory() {
	return {
		main: function (content) {
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
					title: 'Descuento Valor'
				},
				buttons: [
					{
						text: 'OK',
						key: 27,
						className: alertify.defaults.theme.ok + ' btnGuardarDcto',
					}
				]
			};
		},
		settings: {
			selector: undefined
		},
		hooks: {
			onclose: function () {
				var value = $('#dctoValorInput').val().replace(/,/g, '');
				$FACTURA.dctoValor = value;
				dcto(false, value);
				alertify.success('Descuento aplicado satisfactoriamente');
				$(document).find('.ajs-content .tecladoNumerico').remove();
			},
			onshow: function () {
				punto = false;
				$('#dctoValorInput')
					.unbind()
					.inputmask({
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
							var selfie = this;
							setTimeout(function () {
								$(selfie).select();
							}, 0);
						}
						click = false;
					});

				$(document).find('.ajs-content .tecladoNumerico').remove();
				$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
			}
		}
	}
});

alertify.dialog('dctoPorcentajeAlert', function factory() {
	return {
		main: function (content) {
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
					title: 'Descuento Porcentaje'
				},
				buttons: [
					{
						text: 'OK',
						key: 27,
						className: alertify.defaults.theme.ok + ' btnGuardarDcto',
					}
				]
			};
		},
		settings: {
			selector: undefined
		},
		hooks: {
			onclose: function () {
				var value = $('#dctoPorcentajeInput').val().replace(/,/g, '');
				$FACTURA.dctoPorcentaje = value;
				dcto(value, false);
				alertify.success('Descuento aplicado satisfactoriamente');
				$(document).find('.ajs-content .tecladoNumerico').remove();
			},
			onshow: function () {
				punto = false;
				$('#dctoPorcentajeInput')
					.unbind()
					.inputmask({
						groupSeparator: ",",
						alias: "currency",
						placeholder: "0",
						autoGroup: 3,
						digits: 4,
						digitsOptional: !1,
						clearMaskOnLostFocus: !1,
						rightAlign: false,
						prefix: "",
						integerDigits: 3
					}).focus(function () {
						var selfie = this;
						setTimeout(function () {
							if (!click) {
								$(selfie).select();
							}
							click = false;
						}, 0);
					});

				$(document).find('.ajs-content .tecladoNumerico').remove();
				$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
			}
		}
	}
});

alertify.dialog('ObservacionAlert', function factory() {
	return {
		main: function (content) {
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
					title: "Observación"
				},
				buttons: [
					{
						text: 'OK',
						key: 27,
						className: alertify.defaults.theme.ok + ' btnGuardarObservacion',
					}
				]
			};
		},
		settings: {
			selector: undefined
		},
		hooks: {
			onclose: function () {
				var value = $('#observacion').val();
				$FACTURA.observacion = value;
				alertify.success('Observación almacenada satisfactoriamente');
			},
			onshow: function () {
				setTimeout(function () { $('#observacion').focus() }, 0);
			}
		}
	}
});

alertify.prompt().set({
	onshow: function () {
		punto = false;
		$('#ModalFormasPago').modal('toggle');
		$('.alertify:not(.ajs-hidden)').find('input:eq(0)')
			.unbind()
			.inputmask({
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
					if (!click) {
						$(selfie).select();
					}
					click = false;
				}, 0);
			});

		$(document).find('.ajs-content .tecladoNumerico').remove();
		$('.ajs-content input.ajs-input').addClass('keyboardOFF');
		$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
	}
}).set({
	onclose: function () {
		$('#ModalFormasPago').modal('toggle');
		$(document).find('.ajs-content .tecladoNumerico').remove();
	}
});

alertify.dialog('anotacionAlert', function factory() {
	return {
		main: function (content) {
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
					title: "Anotación"
				},
				buttons: [
					{
						text: 'OK',
						key: 27,
						className: alertify.defaults.theme.ok + ' btnGuardarAnotacion',
					}
				]
			};
		},
		settings: {
			selector: undefined
		},
		hooks: {
			onclose: function () {
				var value = $('#anotacion').val();
				$FACTURA.anotacion = value;
				alertify.success('Anotación almacenada satisfactoriamente');
			},
			onshow: function () {
				setTimeout(function () { $('#anotacion').focus() }, 0);
			}
		}
	}
});

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

alertify.myAlert2 || alertify.dialog('myAlert2', function factory() {
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
					closable: true
				}
			};
		},
		hooks: {
			onclose: function () {
				setTimeout(function () {
					alertify.myAlert2().destroy();
				}, 500);
			},
			onshow: function () { }
		}
	};
});

alertify.myAlert3 || alertify.dialog('myAlert3', function factory() {
	return {
		main: function (content) {
			this.setContent(content);
		},
		setup: function () {
			return {
				options: {
					maximizable: false,
					resizable: false,
					title: 'Advertencia'
				},
				buttons: [{ text: 'OK', key: 27 }]
			};
		},
	};
});

alertify.cortesiaAlert || alertify.dialog('cortesiaAlert', function factory() {
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
					title: 'Tipos de Cortesía'
				}
			};
		},
		hooks: {
			onclose: function () {
				setTimeout(function () {
					alertify.cortesiaAlert().destroy();
				}, 500);
			},
			onshow: function () {
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

/* Validamos valores para generar la factura con datos validos */
function validarCamposBloqueoFactura($fieldsFac) {
	let estructura = '';
	if ($fieldsFac.alertBloqueo.length) {
		$fieldsFac.alertBloqueo.forEach(it => {
			estructura += `- ${it} <br>`;
		});
		alertify.alert2('Advertencia Bloqueo Generación de Factura', estructura, function () {
			$('#btnCancelar').click();
			setTimeout(() => {
				DTtblCRUD.columns.adjust().draw();
			}, 100);
		});
	} else {
		if ($fieldsFac.alertInformativa.length) {
			$fieldsFac.alertInformativa.forEach(it => {
				estructura += `- ${it} <br>`;
			});
			alertify.alert2('Advertencia', estructura, function () {
				setTimeout(() => {
					DTtblCRUD.columns.adjust().draw();
				}, 100);
			});
		}
	}
}

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

function copyObjectArray(obj) {
	let result;
	if (obj instanceof Array) {
		result = [...obj];
	} else if (typeof obj === 'object') {
		result = {...obj};
	} else {
		return obj;
	}
	for (let prop of Reflect.ownKeys (result)) {
		result[prop] = copyObjectArray(result[prop]);
	}
	return result;
}

function facturarFormasPago(efectivo = false, pendiente = false) {
	var TotalPagar = $PIE.TotalPagar;
	if (efectivo == true) {
		if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
			$FACTURA.FormaPago[$TerceroId] = {};
		}
		valueFormPago = entregado - $FACTURA.Propina - ($PIE.Anticipo);
		if (valueFormPago > 0) {
			if (formaPago == '1') {
				$FACTURA.FormaPago[$TerceroId]['1'] = {
					CodiPagoId: '1'
					, Nombre: 'EFECTIVO'
					, Valor: valueFormPago
				};
			} else {
				$FACTURA.FormaPago[$TerceroId]['22'] = {
					CodiPagoId: '22'
					, Nombre: 'CRÉDITO'
					, Valor: valueFormPago
				};
				if ($CodiCredito.length > 0 && $CodiCredito[0].nombre != '') {
					$FACTURA.FormaPago[$TerceroId]['22'].Nombre = $CodiCredito[0].nombre;
				}
			}
		}
	}

	//Copiamos el objecto original de facturar y eliminar los datos basura que no se necesitan en el backend
	$FACTURAENV = copyObjectArray($FACTURA);
	for (const propiedad in $FACTURAENV.FormaPago) {
		for (const pagos in $FACTURAENV.FormaPago[propiedad]) {
			if ($FACTURAENV.FormaPago[propiedad][pagos][0] != undefined) {
				$FACTURAENV.FormaPago[propiedad][pagos][0] = "";
				$FACTURAENV.FormaPago[propiedad][pagos][1] = "";
				$FACTURAENV.FormaPago[propiedad][pagos][2] = "";
				$FACTURAENV.FormaPago[propiedad][pagos][3] = "";
				$FACTURAENV.FormaPago[propiedad][pagos][4] = "";
				$FACTURAENV.FormaPago[propiedad][pagos][5] = "";
				$FACTURAENV.FormaPago[propiedad][pagos][6] = "";
			}
		}
	}

	$FACTURAENV.FrmPagoValor.forEach(it => {
		if (it[0] != undefined) {
			it[0] = "";
			it[1] = "";
			it[2] = "";
			it[3] = "";
			it[4] = "";
			it[5] = "";
			it[6] = "";
		}
	});

	let rastreoFormasPagoTercero = [];
	if (!pendiente) {
		let idsTercero = Object.keys($FACTURAENV.FormaPago);
		if (idsTercero.length) { 
			idsTercero.forEach(idTercero => {
				let formasPagoTercero = $FACTURAENV.FormaPago[idTercero];
				let strFormasPago = Object.keys(formasPagoTercero).map(
					formaPago => {
						if (formaPago.includes("_")) {
							return formaPago.replace('_', 'Propina ');
						}
						return formaPago;
					}
				).join(' - ');
	
				rastreoFormasPagoTercero.push({
					formasPago: `Confirmación Forma de Pago ${strFormasPago}`,
					complemento: `, Tercero ${idTercero}, Vendedor ${$VendedorId}, Mesero ${($FACTURA.MeseroId || '')}`
				})
			});
		}
	}

	$.ajax({
		url: base_url() + "Administrativos/Servicios/EstadoCuenta/FacturarEfectivo",
		type: 'POST',
		dataType: "json",
		data: {
			TerceroId: $TerceroId
			,BeneficiarioId: $BeneficiarioId
			, AlmacenId: $AlmacenId
			, VendedorId: $VendedorId
			, codiventid: $codiventid
			, entregado: entregado
			, TotalPagar: TotalPagar
			, RF: $RF
			, RI: $RI
			, RC: $RC
			, IM: $IM
			, TariReteId: $PIEORIGINAL.TariReteId
			, TarifaICA: $PIEORIGINAL.TarifaICA
			, TarifRetIv: $PIEORIGINAL.TarifRetIv
			, TariRete: $PIEORIGINAL.TariRete
			, BaseGravada: $PIE.BaseGravada
			, IVA: $PIE.IVA
			, ImpoConsumo: $PIE.ImpoConsumo

			, observasao: observasao
			, resolucion: resolucion

			, Factura: $FACTURAENV

			, MesaId: $MesaId

			, selecciones

			, pendiente

			, AccionPedido: $AccionPedido

			, reactivarConsumo: $reactivarConsumo

			, AlmacenNoFisico: $AlmacenNoFisico
			, consumos: $consumos
			, PIE: $PIE
			, Productos: JSON.stringify((selecciones.length ? selecciones : $ESTADOCUENTA))
			, extraRastreo: ($datosIngreso === null ? ('Vendedor ' + $VendedorId + ' Mesero ' + ($FACTURA.MeseroId || '') + ($datosEvento === null ? "" : " Evento Nro " + $datosEvento.NroEvento)) : "Factura Ingresos")

			, factElectronicaDirecta: $factElectronicaDirecta

			, RASTREO: RASTREO('Factura Cuenta Tercero ' + $TerceroId + ($MesaId ? " Mesa " + $MesaId : ""), 'Facturación')

			, rastreoFormasPagoTercero: JSON.stringify(rastreoFormasPagoTercero)

			, eventoId: ($datosEvento === null ? null : $datosEvento.EventoId)

			, datosIngreso: ($datosIngreso === null ? null : $datosIngreso)
		},
		success: function (res) {
			if (res.success) {
				var registro = res.msj;
				if (registro[0] == '1') {
					if ((pendiente == false) || (pendiente == true && $CodiVentIdHotel.ImprimirFacturaPagoPendiente == 'S')) {
						var strAlerta = 'Felicidades, ';
						if (pendiente == false) {
							strAlerta += 'la cuenta se ha facturado de manera satisfactoria';
						} else {
							strAlerta += 'la cuenta se ha dejado pendiente y la factura se ha generado de manera satisfactoria';
						}
						if ($CodiVentIdHotel.MostrarCambioCliente == "S" && registro[3] > 0) {
							strAlerta += `<br/><br/>
								Cambio:
								<input type="text" class="form-control form-control-lg text-right font-weight-bold text-primary" style="font-size: 5rem !important;height: 6rem;" value="$ `+ addCommas2(registro[3], 0) + `" readonly="">
								Total a Pagar:
								<input type="text" class="form-control form-control-lg text-right font-weight-lighter text-secondary" style="font-size: 2rem !important;height: 3rem;" value="$ `+ addCommas2(TotalPagar, 0) + `" readonly="">
								Entregado Cliente:
								<input type="text" class="form-control form-control-lg text-right font-weight-lighter text-secondary" style="font-size: 2rem !important;height: 3rem;" value="$ `+ addCommas2(entregado, 0) + `" readonly="">
							`;
						}

						if (res.ingreso === true) {
							strAlerta += `<br><br>Se realiza el ingreso: <br> ${res.sociosHTML}`;
						}

						alertify.alert('Factura: ' + registro[1], strAlerta, function () {
							if (typeof $CodiVentIdHotel.impresion == "undefined" || $CodiVentIdHotel.impresion == null) {
								$CodiVentIdHotel.impresion = 1;
							}
							let j = 0;
							let strReportes = '?';
							let funcionFactura = 'ImprimirFactura';

							if (registro[7] && registro[8] == 'S') {
								funcionFactura = 'ImprimirFacturaElectronica';
							}

							strReportes += `r${j}=${funcionFactura}/${registro[2]}/${$CodiVentIdHotel.impresion}`;

							if (registro[9].length > 1) {
								let i = 0;
								registro[9].forEach(it => {
									strReportes += '&';
									strReportes += `r${j}${i}=ImprimirComprobantePago/${registro[2]}/${it}/${i}/${$CodiVentIdHotel.impresion}`;
									i++;
								});
							} else if (Object.keys($FACTURA.FormaPago).length > 1) {
								let i = 0;
								for (x in $FACTURA.FormaPago) {
									strReportes += '&';
									strReportes += `r${j}${i}=ImprimirComprobantePago/${registro[2]}/${x}/${i}/${$CodiVentIdHotel.impresion}`;
									i++;
								}
							}

							if (registro[5] == 'S') {
								setTimeout(function () {
									alertify.alert('Solicitud Recogida:', 'Por Favor Solicite Recogida', function () {

										/* Validamos que si es FE, verificamos campo de comprobante */
										if (registro[7]) {
											if (registro[8] == 'N') {
												redireccionImprimir();
											} else {
												abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionImprimir');
											}
										} else {
											abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionImprimir');
										}
									});
								}, 50);
							} else {

								/* Validamos que si es FE, verificamos campo de comprobante */
								if (registro[7]) {
									if (registro[8] == 'N') {
										redireccionImprimir();
									} else {
										abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionImprimir');
									}
								} else {
									abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionImprimir');
								}

							}

						});
					} else {
						if (registro[5] == 'S') {
							alertify.alert('Solicitud Recogida:', 'Por Favor Solicite Recogida', function () {
								redireccionImprimir();
							});
						} else {
							redireccionImprimir();
						}
					}
				} else if (registro[0] == '2') {
					alertify.alert('Bloqueo Cartera', registro[1]);
				} else {
					alertify.alert('Error', 'Ocurrió un problema al momento de facturar', function () {
						this.destroy();
					});
					return false;
				}

				if (registro[6].alertInformativa) {
					validarCamposBloqueoFactura(registro[6]);
				}

			} else {
				if (res.camposFac) {
					validarCamposBloqueoFactura(res.camposFac);
				} else {
					if (res.alert) {
						alertify.alert('Advertencia', res.msj, function () {
							location.href = base_url() + 'Administrativos/Servicios/VistaGeneral/Mesas/' + $AlmacenId;
						});
					} else {
						alertify.error(res.msj);
					}
				}
			}
		}
	});
}

function dcto(porcentaje = false, valor = false) {
	var valorBaseGravada = 0;
	var valorBase = 0;
	var valorIVA = 0;
	var valorAnteIva = 0;
	var valorImpocConsumo = 0;
	var valorTotal = 0;
	var valorSN = 0;
	var TotalCantidad = 0;
	var IvaDescuen = 0;
	var OtrosImpuestos = 0;
	var Dcto = 0;
	var totalItems = (selecciones.length ? selecciones.length : $ESTADOCUENTA.length);
	var porcentPeso = 0;
	var valorProd = 0;
	var vTotal = 0;
	let Iva = 0;
	var totalPagar = 0;
	$RF = 0;
	$RI = 0;
	$RC = 0;
	$IM = 0;

	(selecciones.length ? selecciones : $ESTADOCUENTA).forEach(it => {
		valorTotal += parseFloat(it.ValorTotal);
		TotalCantidad += parseFloat(it.Cantidad);
		valorSN += parseFloat(it.ValorSN) * parseFloat(it.Cantidad);  
	});

	if (porcentaje == false && valor == false) {
		porcentaje = $FACTURA.dctoPorcentaje;
		valor = $FACTURA.dctoValor;

		if (isNaN(valor) || valor == '') {
			valor = 0;
		}
		if (isNaN(porcentaje)) {
			porcentaje = 0;
		}
	} else {
		valor = parseFloat(valor);

		if (isNaN(valor) || valor == '') {
			valor = 0;
		}
		if (isNaN(porcentaje)) {
			porcentaje = 0;
		}

		if (porcentaje != false) {
			porcentaje > 100 ? porcentaje = 100 : null;
			valor = valorSN * porcentaje / 100;
		} else {
			valor > valorTotal ? valor = valorTotal : null;
			if (valorTotal <= 0 || valorTotal == '' || valorTotal == null) {
				porcentaje = 0;
			} else {
				porcentaje = 100 * valor / valorSN;
			}
		}

		porcentaje = redondear(porcentaje);
	}

	(selecciones.length ? selecciones : $ESTADOCUENTA).forEach(it => {
		let ImpuestoProd = 0;

		it.DescuProdu = parseFloat(it.DescuProdu);
		vTotal = parseFloat(it.ValorTotal) + it.DescuProdu;
		porcentPeso = (vTotal * 100) / valorSN;
		it.IvaId = parseFloat(it.IvaId);
		it.IvaDescuen = parseFloat(it.IvaDescuen); 
		Iva = it.IvaId / 100;
		it.descupiefa = (valor * porcentPeso) / 100;
		it.Descuento = redondear((it.DescuProdu + it.descupiefa));
		
		it.PorceImpue = redondear(it.PorceImpue);
		it.Impuesto = redondear(it.Impuesto);
		valorProd = (redondear((vTotal - it.descupiefa)) - it.DescuProdu);
		it.PorceDescu = porcentaje;

		$(`.p${it.Id}`).find(`.pTotal`).text(addCommas2(valorProd, 2));
		$(`.p${it.Id}`).find(`.descuProdu`).text(addCommas2(it.DescuProdu, 2));
		
		if (it.PorceImpue > 0) {
			it.Impuesto = (valorProd / (1 + ((it.IvaId + it.PorceImpue) / 100)) * it.PorceImpue / 100);
			it.Iva = (valorProd / (1 + ((it.IvaId + it.PorceImpue) / 100)) * it.IvaId / 100);
			it.IvaDescuen = (it.Descuento / (1 + ((it.IvaId + it.PorceImpue) / 100)) * (it.IvaId + it.PorceImpue) / 100);
			ImpuestoProd = redondear(it.Impuesto);
		} else {
			it.Iva = ((valorProd - (it.Impuesto * it.Cantidad)) / (1 + (it.IvaId / 100)) * it.IvaId / 100);
			it.IvaDescuen = (it.Descuento / (1 + (it.IvaId / 100)) * it.IvaId / 100);
			ImpuestoProd = redondear(it.Impuesto * it.Cantidad);
		}
		
		OtrosImpuestos += ImpuestoProd;
		it.Impuesto = redondear(it.Impuesto);
		it.Iva = redondear(it.Iva);
		//it.IvaDescuen = redondear((it.Descuento / (Iva + 1) * Iva));
		it.Valor = redondear(valorProd + it.Descuento);
		it.descupiefa = redondear(it.descupiefa);
		valorAnteIva += (valorProd - it.Iva - ImpuestoProd);
		Dcto += it.DescuProdu;

		IvaDescuen += it.IvaDescuen;
		//Guardamos el Iva y el Impoconsumo
		if (it.IvaId != 8) {
			valorIVA += it.Iva;
		} else {
			valorImpocConsumo += it.Iva;
		}

		//Guardamos la base gravada y la base exenta 
		if (it.IvaId != 0) {
			valorBaseGravada += (valorProd - (valorProd != 0 ? (it.Iva + it.Impuesto * (it.PorceImpue > 0 ? 1 : it.Cantidad)) : 0));
		} else {
			valorBase += (valorProd - (valorProd != 0 ? (it.Impuesto * (it.PorceImpue > 0 ? 1 : it.Cantidad)) : 0));
		}
	});

	$PIE.OtrosImpuestos = redondear(OtrosImpuestos);
	$PIE.IVA = valorIVA;
	$PIE.ImpoConsumo = valorImpocConsumo;

	totalPagar = valorTotal - valor;
	$PIE.BaseGravada = valorBaseGravada;
	$PIE.Base = valorBase;

	$PIE.AntesIVA = valorAnteIva;
	$PIE.IvaDescuen = IvaDescuen;
	$PIE.SubTotal = valorSN - ($PIE.IVA + $PIE.ImpoConsumo + $PIE.IvaDescuen + $PIE.OtrosImpuestos);
	$PIE.DctoPie = parseFloat(valor);
	$PIE.DctoProds = Dcto;
	$PIE.TotalDescuento = $PIE.DctoPie + Dcto;
	$PIE.TotalFacturado = valorTotal - $PIE.DctoPie;

	////////////////////////////////////////
	let base = $PIE.BaseGravada + $PIE.Base;

	$PIE.ReteFuente = 0;
	if ($PIEORIGINAL.ReteFuente && ($PIEORIGINAL.SobreBase == "N" || ($PIEORIGINAL.SobreBase == "S" && base >= $PIEORIGINAL.baseReteFuente))) {
		$RF = base * $PIE.TariRete / 100;
		$RF = myRound($RF, 2);
		$RF = Math.round($RF);
		$PIE.ReteFuente = $RF;
	}

	$PIE.RetencionIVA = 0;
	if ($PIEORIGINAL.RETEIVA && ($PIEORIGINAL.SobreBase == "N" || ($PIEORIGINAL.SobreBase == "S" && base >= $PIEORIGINAL.baseReteFuente))) {
		$RI = $PIE.IVA * $PIEORIGINAL.TarifRetIv / 100;
		$RI = myRound($RI, 2);
		$RI = Math.round($RI);
		$PIE.RetencionIVA = $RI;
	}

	$PIE.RetencionICA = 0;
	if ($PIEORIGINAL.ReteICA) {
		$RC = base * $PIEORIGINAL.TarifaICA / 100;
		$RC = myRound($RC, 2);
		$RC = Math.round($RC);
		$PIE.RetencionICA = $RC;
	}

	totalPagar = $PIE.TotalFacturado - $RC - $RI - $RF + $IM;
	////////////////////////////////////////

	if (typeof $FACTURA.Propina === "undefined" || isNaN($FACTURA.Propina)) {
		$FACTURA.Propina = 0;
		$FACTURA.PropinaAnticipo = 0;
	}

	$PIE.TotalPagar = totalPagar;

	if ($PIE.TotalPagar < 0) {
		$PIE.TotalPagar = 0;
	}

	$PIE.TotalPagar += $FACTURA.Propina;

	let TotalPagarFPago = $PIE.TotalPagar;

	TotalPagarFPago -= $FACTURA.Propina;

	//$PIE.TotalPagar -= $PIE.Anticipo;

	if ($PIE.TotalPagar < 0) $PIE.TotalPagar = 0;

	//TotalPagarFPago -= $PIE.Anticipo;

	if (TotalPagarFPago < 0) TotalPagarFPago = 0;

	$PIE.AutoRetenciones = $PIEORIGINAL.AutoRetenciones;
	$PIE.TotalCantidad = TotalCantidad;
	$PIE.Peso = $PIEORIGINAL.Peso;
	$PIE.ValorSN = valorSN;
	$PIE.TotalItems = totalItems;

	$('#inputBaseGravada').val($PIE.BaseGravada);
	$('#inputBase').val($PIE.Base);
	$('#inputIVA').val($PIE.IVA);
	$('#inputOtrosImpuestos').val($PIE.OtrosImpuestos);
	$('#inputReteFuente').val($PIE.ReteFuente);
	$('#inputRetencionIVA').val($PIE.RetencionIVA);
	$('#inputRetencionICA').val($PIE.RetencionICA);
	$('#inputImpoConsumo').val($PIE.ImpoConsumo);
	$('#inputDctoPie').val($PIE.DctoPie);
	$('#inputDcto').val($PIE.DctoProds);
	$('#inputTotalDescuento').val($PIE.TotalDescuento);
	$('#inputTotalItems').val($PIE.TotalItems);
	$("#inputTotalCantidad").val($PIE.TotalCantidad);
	$('#inputAutoRetenciones').val($PIE.AutoRetenciones);
	$('#inputSubTotal').val($PIE.SubTotal);
	$('#inputAntesIVA').val($PIE.AntesIVA);
	$('#inputPeso').val($PIE.Peso);
	$('#inputTotalFacturado').val($PIE.TotalFacturado);

	if ($PIE.facturacionParcial) {
		$('#inputTotalPagar').val($PIE.TotalPagar);
	} else {
		$('#inputTotalPagar').val(($PIE.Anticipo > $PIE.TotalPagar) ? 0 : ($PIE.TotalPagar - $PIE.Anticipo));
	}

	$('#frmFormaPendiente, #frmValorPendiente').val(TotalPagarFPago);
	$('#frmTotalPagar, #frmValorfrmValor').val($PIE.TotalPagar);
	$('#frmValorfrmPropina').val($FACTURA.Propina);
	$('#frmFormaTotalFactura, #frmValorTotalFactura').val($PIE.TotalFacturado);
	$('#frmFormaIVAFactura').val($PIE.IVA + $PIE.ImpoConsumo);
	$('#frmValorIVAFactura').val($PIE.IVA);

	$('#dctoValorInput').val(valor);
	$('#dctoPorcentajeInput').val(porcentaje);
	$('#inputPropina').val($FACTURA.Propina);

	$FACTURA.dctoPorcentaje = porcentaje;
	$FACTURA.dctoValor = valor;

	//Validamos los temas UVT para cambiar la resolucion.
	alertasFacturacionElectronica();
}

function calcularPIE() {
	$.ajax({
		url: base_url() + "Administrativos/Servicios/EstadoCuenta/calcularPIE",
		type: 'POST',
		data: {
			HeadReservaId: $TerceroId
			, liquidaiva: $liquidaiva
			, ReteICA: $ReteICA
			, RETEIVA: $ReteIVA
			, ReteOtro: $ReteOtro
			, AplicaReteFuente: $ReteFuente
			, TarifaICA: $Montaje.TarifaICA
			, TariReteId: $ENCABEZADO.TariReteId
			, TariRete: $ENCABEZADO.TariRete
			, TarifRetIv: $ENCABEZADO.TarifRetIv
			, TerceroFacturaId: $ENCABEZADO.TerceroId
			, AlmacenId: $AlmacenId
			, MesaId: $MesaId
			, CortesiaId: $FACTURA.CortesiaId

			, selecciones: selecciones
			, AlmacenNoFisico: $AlmacenNoFisico
			, consumos: $consumos
		},
		async: false,
		dataType: "json",
		success: function (respuesta) {
			$PIEORIGINAL = respuesta;
			if ($PIEORIGINAL.DctoPie > 0) {
				$FACTURA.dctoValor = $PIEORIGINAL.Dcto;
			}

			dcto(false, $FACTURA.dctoValor);
		}
	});
}

function actualizarFormasPago() {
	DTtblFormaPago.clear();
	total = 0;

	for (var k in $FACTURA.FormaPago[$TerceroId]) {
		//Se valida si existe la primera propina para no mostrarla en la tabla
		if (k != "__") {
			DTtblFormaPago.row.add({
				'0': $FACTURA.FormaPago[$TerceroId][k].CodiPagoId
				, '1': $FACTURA.FormaPago[$TerceroId][k].Nombre
				, '2': $FACTURA.FormaPago[$TerceroId][k].Valor + ('Propina' in $FACTURA.FormaPago[$TerceroId][k] ? $FACTURA.FormaPago[$TerceroId][k].Propina : 0)
			});

			total = parseFloat(total) + parseFloat($FACTURA.FormaPago[$TerceroId][k].Valor) + ('Propina' in $FACTURA.FormaPago[$TerceroId][k] ? $FACTURA.FormaPago[$TerceroId][k].Propina : 0);
		}
	}

	DTtblFormaPago.columns.adjust().draw();

	$('#frmFormaBase').val(total);
	$('#frmValorBase').val(total);
	$('#frmFormaPendiente').val(parseFloat($PIE.TotalPagar) - parseFloat(total));
	$('#frmValorPendiente').val(parseFloat($PIE.TotalPagar) - parseFloat(total));
}

function validarCompartirCuentaValorPropina(terceros, registros, TotalPagar) {
	
	for (var k in $FACTURA.FormaPago) {
		let $rNormal = false;
		let $rPropina = false;
		for (var j in $FACTURA.FormaPago[k]) {
			if (j.indexOf('_') != -1) {
				$rPropina = true;
				if (Object.keys($FACTURA.FormaPago[k]).length > 1) {
					$rNormal = true;
				}
			}
		}
		if ($rPropina == false) {
			$rNormal = true;
		}

		// if($rNormal == true && $rPropina == false){
		// 	// Registro sin Propina

		// }else 
		if ($rPropina == true && $rNormal == false) {
			// Propina sin Registro

			let rPropina = {};
			// Guardo en rPropina el registro principal de la propina
			for (var z in $FACTURA.FrmPagoValor) {
				let data = $FACTURA.FrmPagoValor[z];
				if (data['TerceroId'] == k && typeof data['CodiPagoId'] !== 'undefined' && data['CodiPagoId'].indexOf('_') != -1) {
					rPropina = $FACTURA.FrmPagoValor[z];
					break;
				}
			}

			let registro = {
				'0': rPropina['0']
				, '1': rPropina['1']
				, '2': rPropina['2']
				, '3': rPropina['3']
				, '4': `<center>
						<div class="btn-group btn-group-sm m-2">
							<button type="button" class="eliminarTercero btn btn-danger" data-id="`+ FrmPagoValorId + `">
								<span class="far fa-trash-alt" title="Remover"></span>
							</button>
						</div>
					</center>`
				, '5': rPropina['5']
				, '6': rPropina['6']
				, Id: FrmPagoValorId
				, TerceroId: rPropina['TerceroId']
				, Valor: rPropina['Valor']
				, CodiPagoId: rPropina['CodiPagoId']
			}
			registro['CodiPagoId'] = registro['CodiPagoId'].replace('_', '');
			registro[3] = registro[3].replace(' (PROPINA)', '');

			if (typeof rPropina.bancoid !== "undefined") {
				registro.bancoid = rPropina.bancoid;
			}
			if (typeof rPropina.numerdocum !== "undefined") {
				registro.numerdocum = rPropina.numerdocum;
			}
			if (typeof rPropina.fechacheq !== "undefined") {
				registro.fechacheq = rPropina.fechacheq;
			}
			if (typeof rPropina.cuota !== "undefined") {
				registro.cuota = rPropina.cuota;
			}

			FrmPagoValorId++;
			$FACTURA.FrmPagoValor.push(registro);
			if (typeof $FACTURA.FormaPago[registro.TerceroId] == "undefined") {
				$FACTURA.FormaPago[registro.TerceroId] = {};
			}
			$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId] = registro;

			FaltantePago = TotalPagar;
			contRegistros = 0;

			for (var y in $FACTURA.FrmPagoValor) {
				let data = $FACTURA.FrmPagoValor[y];
				if (typeof data['CodiPagoId'] !== 'undefined') {
					var index = terceros.map(function (e) { return e['TerceroId'] }).indexOf(data.TerceroId);
					if (index == -1) {
						terceros.push({
							TerceroId: data['TerceroId']
							, nombre: data['1']
							, propinaNombre: data['3']
							, CodiPagoId: data['CodiPagoId']
							, codigo: data['0']
						});
					}
					if (!(data['CodiPagoId'].indexOf('_') != -1)) {
						$FACTURA.FrmPagoValor[y].Valor = myRound(TotalPagar / registros);
						if (contRegistros == (registros - 1)) {
							$FACTURA.FrmPagoValor[y].Valor = FaltantePago;
						}
						FaltantePago = myRound((FaltantePago - $FACTURA.FrmPagoValor[y].Valor).toFixed(2));
						$FACTURA.FrmPagoValor[y]['2'] = '<span class="w-100 d-block p-1">' + addCommas2($FACTURA.FrmPagoValor[y].Valor, 2) + '</span>';
						contRegistros++;
					}
				}
			}
		}
	}

	$FACTURA.FrmPagoValor = $FACTURA.FrmPagoValor.filter(function (data) {
		if (data['CodiPagoId'].indexOf('_') != -1) {
			return false;
		} else {
			return true;
		}
	});

	let value = Math.round($FACTURA['Propina'] / terceros.length);
	let faltantePropina = $FACTURA['Propina'];
	for (var i = 0; i < terceros.length; i++) {
		Object.keys($FACTURA.FormaPago[terceros[i]['TerceroId']]).filter(function (key) {
			if (key.indexOf('_') != -1) {
				delete $FACTURA.FormaPago[terceros[i]['TerceroId']][key];
			}
		});

		let rPropina = {};
		for (var k in $FACTURA.FrmPagoValor) {
			let data = $FACTURA.FrmPagoValor[k];
			if (typeof data['CodiPagoId'] !== 'undefined') {
				if (data['TerceroId'] == terceros[i].TerceroId) {
					rPropina = $FACTURA.FrmPagoValor[k];
					break;
				}
			}
		}
		if ((terceros.length - 1) == i) {
			value = faltantePropina;
		}
		faltantePropina = myRound((faltantePropina - value).toFixed(2));
		registro = {
			'0': terceros[i].codigo
			, '1': terceros[i].nombre
			, '2': '<span class="w-100 d-block p-1">' + addCommas2(value, 2) + '</span>'
			, '3': rPropina['3'].replace('</', ' (PROPINA)</')
			, '4': `<center>
				<div class="btn-group btn-group-sm m-2">
					<button type="button" class="editarFrmPago btn btn-info">
						<span class="fas fa-pen" title="Editar"></span>
					</button>
					<button type="button" class="guardarTercero btn btn-success d-none" disabled>
						<span class="fas fa-check" title="Guardar Tercero"></span>
					</button>
				</div>
			</center>`
			, '5': ''
			, '6': ''
			, Id: FrmPagoValorId
			, TerceroId: terceros[i].TerceroId
			, Valor: addCommas2(value, 2)
			, CodiPagoId: rPropina['CodiPagoId']
		}

		if (registro['CodiPagoId'].indexOf('_') == -1) {
			registro['CodiPagoId'] = '_' + registro['CodiPagoId'];
		}

		if (typeof rPropina.bancoid !== "undefined") {
			registro.bancoid = rPropina.bancoid;
		}
		if (typeof rPropina.numerdocum !== "undefined") {
			registro.numerdocum = rPropina.numerdocum;
		}
		if (typeof rPropina.fechacheq !== "undefined") {
			registro.fechacheq = rPropina.fechacheq;
		}
		if (typeof rPropina.cuota !== "undefined") {
			registro.cuota = rPropina.cuota;
		}

		FrmPagoValorId++;
		$FACTURA.FrmPagoValor.push(registro);
		if (typeof $FACTURA.FormaPago[registro.TerceroId] == "undefined") {
			$FACTURA.FormaPago[registro.TerceroId] = {};
		}
		$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId] = registro;
	}
	validarCompartirCuentaValor();
}

function validarCompartirCuentaValor() {
	$FACTURA.FrmPagoValor.sort(function (a, b) {
		if (a.TerceroId > b.TerceroId) {
			return 1;
		}
		if (a.TerceroId < b.TerceroId) {
			return -1;
		}
		if (a.CodiPagoId.indexOf('_')) {
			return -1;
		}
		return 0;
	});

	var total = 0;
	var totalPropina = 0;

	for (var k in $FACTURA.FrmPagoValor) {
		if ($FACTURA.FrmPagoValor[k].CodiPagoId.indexOf('_') == -1) {
			total = parseFloat(total) + parseFloat($FACTURA.FrmPagoValor[k].Valor);
		} else {
			if ($FACTURA.FrmPagoValor[k].Valor && typeof $FACTURA.FrmPagoValor[k].Valor == "string") {
				$FACTURA.FrmPagoValor[k].Valor = ($FACTURA.FrmPagoValor[k].Valor).replaceAll(",", "")
			}
			totalPropina = parseFloat(totalPropina) + parseFloat($FACTURA.FrmPagoValor[k].Valor);
		}
	}
	var faltante = parseFloat($PIE.TotalPagar) - parseFloat(total);
	DTCuentaValor.clear();
	total = 0;
	totalPropina = 0;

	$FACTURA.FormaPago = {};
	for (var k in $FACTURA.FrmPagoValor) {
		DTCuentaValor.row.add($FACTURA.FrmPagoValor[k]);

		if ($FACTURA.FrmPagoValor[k].CodiPagoId.indexOf('_') == -1) {
			total = parseFloat(total) + parseFloat($FACTURA.FrmPagoValor[k].Valor);
		} else {
			if ($FACTURA.FrmPagoValor[k].Valor && typeof $FACTURA.FrmPagoValor[k].Valor == "string") {
				$FACTURA.FrmPagoValor[k].Valor = ($FACTURA.FrmPagoValor[k].Valor).replaceAll(",", "")
			}
			totalPropina = parseFloat(totalPropina) + parseFloat($FACTURA.FrmPagoValor[k].Valor);
		}

		if (typeof $FACTURA.FormaPago[$FACTURA.FrmPagoValor[k].TerceroId] == "undefined") {
			$FACTURA.FormaPago[$FACTURA.FrmPagoValor[k].TerceroId] = {};
		}

		let FormaPagoTMP = {
			CodiPagoId: $FACTURA.FrmPagoValor[k].CodiPagoId
			, Nombre: $FACTURA.FrmPagoValor[k]['3']
			, Valor: $FACTURA.FrmPagoValor[k].Valor
		};

		if (typeof $FACTURA.FrmPagoValor[k].bancoid !== "undefined") {
			FormaPagoTMP.bancoid = $FACTURA.FrmPagoValor[k].bancoid;
		}
		if (typeof $FACTURA.FrmPagoValor[k].numerdocum !== "undefined") {
			FormaPagoTMP.numerdocum = $FACTURA.FrmPagoValor[k].numerdocum;
		}
		if (typeof $FACTURA.FrmPagoValor[k].fechacheq !== "undefined") {
			FormaPagoTMP.fechacheq = $FACTURA.FrmPagoValor[k].fechacheq;
		}
		if (typeof $FACTURA.FrmPagoValor[k].cuota !== "undefined") {
			FormaPagoTMP.cuota = $FACTURA.FrmPagoValor[k].cuota;
		}
		if (typeof $FACTURA.FrmPagoValor[k].Propina !== "undefined") {
			FormaPagoTMP.Propina = $FACTURA.FrmPagoValor[k].Propina;
		}

		$FACTURA.FormaPago[$FACTURA.FrmPagoValor[k].TerceroId][$FACTURA.FrmPagoValor[k].CodiPagoId] = FormaPagoTMP;
	}

	DTCuentaValor.draw();

	$('#frmValorBase').val(parseFloat(total) + parseFloat(totalPropina));
	var ValorPendiente = parseFloat($PIE.TotalPagar) - parseFloat($FACTURA.Propina) - parseFloat(total);
	var ValorPendientePropina = parseFloat($FACTURA.Propina) - parseFloat(totalPropina);
	$('#frmValorPendiente').val(ValorPendiente);
	$("#frmValorPropinaPendiente").val(ValorPendientePropina);

	if ($('.inputCuentaValor').length <= 0) {
		$('#btnAgregarTercero').attr('disabled', false);
	} else {
		$('#btnAgregarTercero').attr('disabled', true);
	}
	if (+(ValorPendiente.toFixed(2)) <= 0 && ValorPendientePropina == 0) {
		$('#btnAceptarValores').attr('disabled', false);
	} else {
		$('#btnAceptarValores').attr('disabled', true);
	}
	if ($FACTURA.FrmPagoValor.length > 0) {
		$('#btnValoresIguales').attr('disabled', false);
	} else {
		$('#btnValoresIguales').attr('disabled', true);
	}

	setTimeout(function () {
		DTCuentaValor.columns.adjust();
	}, 300);
}

//Recortar los números sin redondear
function myRound(num, dec) {
	var exp = Math.pow(10, dec || 2);
	return parseInt(num * exp, 10) / exp;
}

//Recortar los números sin redondear
function redondear(num) {
	return (Math.round(parseFloat(num) * 100)/100);
}

function redireccionImprimir(data) {
	sessionStorage.removeItem('PFD');
	sessionStorage.removeItem('dataPos');
	if ($datosEvento === null && ($datosIngreso === null || $datosIngreso === '')) {
		if ($AlmacenNoFisico == 'S') {
			if (accesoModulo == 'otras-ventas') {
				location.href = base_url() + 'Administrativos/Servicios/PanelPrincipal';
			} else {
				location.href = base_url() + 'Administrativos/Servicios/VistaGeneral/Mesas/' + $almacenOriginal;
			}
		} else {
			location.href = base_url() + 'Administrativos/Servicios/VistaGeneral/Mesas/' + $AlmacenId;
		}
	} else {
		if (($datosIngreso === null || $datosIngreso === '')) {
			location.href = base_url() + 'Administrativos/Servicios/PanelPrincipal';
		} else {
			location.href = base_url() + 'Administrativos/Recepcion/Ingreso';
		}
	}
}

function redireccionCortesia() {
	sessionStorage.removeItem('PFD');
	location.href = base_url() + 'Administrativos/Servicios/VistaGeneral/Mesas/' + $AlmacenId;
}

const cruceAnticipo = (propina = 0) => {
	let copiaPIE = copyObjectArray($PIE);
	if (copiaPIE.Anticipo > 0 && CruzaAnticipo == true) {
		if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
			$FACTURA.FormaPago[$TerceroId] = {};
		}

		valorCruce = (copiaPIE.Anticipo >= $PIE.TotalPagar ? $PIE.TotalPagar : copiaPIE.Anticipo);
		restanteCruce = (copiaPIE.Anticipo - valorCruce);

		$FACTURA.FormaPago[$TerceroId]['80'] = {
			CodiPagoId: '80'
			, Nombre: "Cruce Automático de Anticipos"
			, Valor: valorCruce
		};

		valuePropina = parseFloat(propina);
		if (isNaN(valuePropina)) {
			valuePropina = 0.00;
		}

		valorCrucePropina = 0;
		if (restanteCruce > 0 && valuePropina > 0) {
			valorCrucePropina = (restanteCruce >= valuePropina ? valuePropina : restanteCruce);

			propina = valuePropina - valorCrucePropina;

			$FACTURA.FormaPago[$TerceroId]['_80'] = {
				CodiPagoId: '_80'
				,Nombre: "Cruce Automático de Anticipos (PROPINA)"
				,Valor: valorCrucePropina
				,Automatico: true 
			};

			$FACTURA.PropinaAnticipo = valorCrucePropina;
		}

		$PIE.Anticipo = (valorCruce + valorCrucePropina);
	}
	CruzaAnticipo = false;

	return propina;
}

function validarAnticipoParcial(conPropina = false, dataPropina = null) {
	if (CruzaAnticipo == true) {
		if ($PIE.Anticipo > 0 && $PIE.facturacionParcial == true) {
			alertify.confirm(
				"Advertencia",
				`Actualemente tiene un valor de <b>$ ${addCommas2($PIE.Anticipo)}</b>. <br> Quiere realizar cruce de anticipo?`,
				() => {
					if (conPropina == true) {
						validacionAnticipoPropina(dataPropina.value, dataPropina.selfieie, dataPropina.closeEvent, dataPropina.propinaInfoVent, dataPropina.propinaNombre);
					} else {
						cruceAnticipo();
						window.scrollTo(0, document.body.scrollHeight);
						setTimeout(function () {
							$('#inputEntregado').removeAttr('readonly').val($PIE.TotalPagar).select();
						}, 0);
						if (formaPago == '22') {$('#inputEntregado').focusout();}
					}
				},
				() => {
					$PIE.Anticipo = 0;
					if (conPropina == true) {
						validacionAnticipoPropina(dataPropina.value, dataPropina.selfieie, dataPropina.closeEvent, dataPropina.propinaInfoVent, dataPropina.propinaNombre);
					} else {
						cruceAnticipo();
						window.scrollTo(0, document.body.scrollHeight);
						setTimeout(function () {
							$('#inputEntregado').removeAttr('readonly').val($PIE.TotalPagar).select();
						}, 0);
						if (formaPago == '22') {$('#inputEntregado').focusout();}
					}
				}
			).set('labels', {ok: 'Aceptar', cancel: 'Cancelar'});
		} else {
			if (conPropina == true) {
				validacionAnticipoPropina(dataPropina.value, dataPropina.selfieie, dataPropina.closeEvent, dataPropina.propinaInfoVent, dataPropina.propinaNombre);
			} else {
				cruceAnticipo();
				window.scrollTo(0, document.body.scrollHeight);
				setTimeout(function () {
					$('#inputEntregado').removeAttr('readonly').val($PIE.TotalPagar).select();
				}, 0);
				if (formaPago == '22') {$('#inputEntregado').focusout();}
			}
		}
	} else {
		if (conPropina == true) {
			validacionAnticipoPropina(dataPropina.value, dataPropina.selfieie, dataPropina.closeEvent, dataPropina.propinaInfoVent, dataPropina.propinaNombre);
		} else {
			cruceAnticipo();
		}
	}
} 

function validacionAnticipoPropina(value, selfieie, closeEvent, propinaInfoVent, propinaNombre){
	value = cruceAnticipo(value);

	if (value == '') {
		$FACTURA.Propina = 0;
		dcto();
		if (CambioPropina != false && CambioPropina != '_80') {
			delete $FACTURA.FormaPago[$TerceroId][CambioPropina];
		}

		var cb = selfieie.get('callback')
		CambioPropina = false;
		if (typeof cb === 'function') {
			var returnValue = cb.call(selfieie, closeEvent);
			if (typeof returnValue !== 'undefined') {
				closeEvent.cancel = !returnValue;
			}
		}

		return false;
	}

	value = parseFloat(value);
	if (isNaN(value)) {
		value = 0.00;
	}
	$FACTURA.Propina = value;

	if (value > 0) {
		if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
			$FACTURA.FormaPago[$TerceroId] = {};
		}
		$FACTURA.FormaPago[$TerceroId]['_' + propinaInfoVent] = {
			CodiPagoId: '_' + propinaInfoVent
			, Nombre: propinaNombre + ' (PROPINA)'
			, Valor: 0
			, Propina: value
		};

		let foto = '';

		$.ajax({
			url: base_url() + "Administrativos/Servicios/EstadoCuenta/CargarForanea",
			type: 'POST',
			data: {
				tabla: "Tercero",
				value: $TerceroId.trim(),
				nombre: "terceroid",
				tblNombre: "nombre"
			},
			async: false,
			dataType: "json",
			success: function (respuesta) {
				if (respuesta[0]['foto'] != null) {
					foto = `<img class="p-1 w-100" alt="" style="object-fit: scale-down;" src="data:image/jpeg;base64,` + respuesta[0]['foto'] + `" height="100px">`;
				}
			}
		});

		var registro = {
			'0': '<span class="w-100 d-block p-1 mb-0">' + $TerceroId.trim() + '</span>' + foto
			, '1': '<span class="w-100 d-block p-1">' + $ENCABEZADO.nombre + '</span>'
			, '2': '<span class="w-100 d-block p-1">' + addCommas2(value, 2) + '</span>'
			, '3': '<span class="w-100 d-block p-1">' + propinaNombre + ' (PROPINA)' + '</span>'
			, '4': `<center>
					<div class="btn-group btn-group-sm m-2">
						<button type="button" class="editarFrmPago btn btn-info">
							<span class="fas fa-pen" title="Editar"></span>
						</button>
						<button type="button" class="guardarTercero btn btn-success d-none" disabled>
							<span class="fas fa-check" title="Guardar Tercero"></span>
						</button>
					</div>
				</center>`
			, '5': ''
			, '6': ''
			, Id: FrmPagoValorId
			, TerceroId: $TerceroId.trim()
			, Valor: value
			, CodiPagoId: '_' + propinaInfoVent
			, Nombre: propinaNombre + ' (PROPINA)'
		}
		FrmPagoValorId++;

		let optionsita = $('#propinaInfoVent option:selected');

		var CodiPagoId = $(optionsita).val();
		var nombre = $(optionsita).text().trim();

		let validacionFormaPago = false;

		let manejcentr = $(optionsita).data('manejcentr');
		let manejnumer = $(optionsita).data('manejnumer');
		let fechadocum = $(optionsita).data('fechadocum');
		let manejcuotas = $(optionsita).data('manejcuotas');

		if (manejcentr == 'S' || manejnumer == 'S' || fechadocum == 'S' || manejcuotas == 'S') {
			validacionFormaPago = true;
		}

		if (validacionFormaPago) {
			alertify.alert(
				nombre,
				'',
				function () {
					let FormaPagoTMP = {
						CodiPagoId: '_' + propinaInfoVent
						, Nombre: propinaNombre + ' (PROPINA)'
						, Valor: 0
						, Propina: value
					};

					if (manejcentr == 'S') {
						if ($('.alertify:not(.ajs-hidden) .divBancos select').val() != null) {
							FormaPagoTMP.bancoid = $('.alertify:not(.ajs-hidden) .divBancos select').val().trim();
							registro.bancoid = FormaPagoTMP.bancoid;
						} else {
							return;
						}

					}
					if (manejnumer == 'S') {
						if ($('.alertify:not(.ajs-hidden) .divDocumento input').val() != null) {
							FormaPagoTMP.numerdocum = $('.alertify:not(.ajs-hidden) .divDocumento input').val().trim();
							registro.numerdocum = FormaPagoTMP.numerdocum;
						} else {
							return;
						}
					}
					if (fechadocum == 'S') {
						if ($('.alertify:not(.ajs-hidden) .divFechaDocum input').val() != null) {
							FormaPagoTMP.fechacheq = $('.alertify:not(.ajs-hidden) .divFechaDocum input').val().trim();
							registro.fechacheq = FormaPagoTMP.fechacheq;
						} else {
							return;
						}
					}
					if (manejcuotas == 'S') {
						if ($('.alertify:not(.ajs-hidden) .divManejcuotas input').val() != null) {
							FormaPagoTMP.cuota = $('.alertify:not(.ajs-hidden) .divManejcuotas input').val().trim();
							registro.cuota = FormaPagoTMP.cuota;
						} else {
							return;
						}
					}

					$FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] = FormaPagoTMP;
					$FACTURA.FrmPagoValor.push(registro);

					dcto();
					alertify.success('Propina aplicada satisfactoriamente');

					$('.alertify:not(.ajs-hidden) .ajs-content').html('');

					if (CambioPropina != false) {
						if (("_" + propinaInfoVent != CambioPropina)) {
							delete $FACTURA.FormaPago[$TerceroId][CambioPropina];
						}
					}

					var cb = selfieie.get('callback')
					CambioPropina = false;
					if (typeof cb === 'function') {
						var returnValue = cb.call(selfieie, closeEvent);
						if (typeof returnValue !== 'undefined') {
							closeEvent.cancel = !returnValue;
						}
					}
				}
			);

			$('.DivFormasPago').clone().appendTo('.alertify:not(.ajs-hidden) .ajs-content').removeClass('d-none').on('submit', function (e) {
				e.preventDefault();
				$('.alertify:not(.ajs-hidden) .ajs-footer button').click();
			})

			if (manejcentr != 'S') {
				$('.alertify:not(.ajs-hidden) .divBancos').addClass('d-none');
			} else {
				$('.alertify:not(.ajs-hidden) .divBancos select').prop('required', true).val(
					(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['bancoid'] !== 'undefined')
						? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['bancoid']
						: (
							(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['bancoid'] !== 'undefined')
								? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['bancoid']
								: ''
						)
				)
			}
			if (manejnumer != 'S') {
				$('.alertify:not(.ajs-hidden) .divDocumento').addClass('d-none');
			} else {
				$('.alertify:not(.ajs-hidden) .divDocumento input').prop('required', true).val(
					(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['numerdocum'] !== 'undefined')
						? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['numerdocum']
						: (
							(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['numerdocum'] !== 'undefined')
								? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['numerdocum']
								: ''
						)
				)
			}
			if (fechadocum != 'S') {
				$('.alertify:not(.ajs-hidden) .divFechaDocum').addClass('d-none');
			} else {
				$('.alertify:not(.ajs-hidden) .divFechaDocum input').prop('required', true)
					.datetimepicker({
						format: 'YYYY-MM-DD',
						locale: 'es'
					}).val(
						(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['fechacheq'] !== 'undefined')
							? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['fechacheq']
							: (
								(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['fechacheq'] !== 'undefined')
									? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['fechacheq']
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
					allowPlus: false,
					allowMinus: false
				}).focus(function () {
					var selfie = this;
					setTimeout(function () {
						$(selfie).select();
					}, 0);
				}).val(
					(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['cuota'] !== 'undefined')
						? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['cuota']
						: (
							(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['cuota'] !== 'undefined')
								? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['cuota']
								: '1'
						)
				)
					.on('change', function () {
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
			if (typeof $FACTURA.FormaPago[registro.TerceroId] == "undefined") {
				$FACTURA.FormaPago[registro.TerceroId] = {};
			}
			$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId] = registro;
			$FACTURA.FrmPagoValor.push(registro);
			dcto();

			if (CambioPropina != true && CambioPropina != "_80") {
				if (("_" + propinaInfoVent != CambioPropina)) {
					delete $FACTURA.FormaPago[$TerceroId][CambioPropina];
				}
			}

			alertify.success('Propina aplicada satisfactoriamente');
			CambioPropina = false;
			var cb = selfieie.get('callback')
			if (typeof cb === 'function') {
				var returnValue = cb.call(selfieie, closeEvent);
				if (typeof returnValue !== 'undefined') {
					closeEvent.cancel = !returnValue;
				}
			}
		}
	} else {
		$FACTURA.FrmPagoValor.push(registro);
		if (typeof $FACTURA.FormaPago[registro.TerceroId] == "undefined") {
			$FACTURA.FormaPago[registro.TerceroId] = {};
		}
		$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId] = registro;
		dcto();

		if (CambioPropina != true && CambioPropina != '_80') {
			if (("_" + propinaInfoVent != CambioPropina)) {
				delete $FACTURA.FormaPago[$TerceroId][CambioPropina];
			}
		}

		CambioPropina = false;
		var cb = selfieie.get('callback')
		if (typeof cb === 'function') {
			var returnValue = cb.call(selfieie, closeEvent);
			if (typeof returnValue !== 'undefined') {
				closeEvent.cancel = !returnValue;
			}
		}
	}
}


function alertasFacturacionElectronica($init = false) {
	if ($obligaElectronica == false && $Montaje.UVTsFE > 0 && $Montaje.ValorUVT > 0 && $TipoVentaSeleccionado.FacturaElectronica != 'S') {
		if (parseFloat($PIE.AntesIVA) >= parseFloat($Montaje.ValorTotalUVTs)) {
			if ($factElectronicaDirecta == false || $init == true) {
				if ($camposValidadosElect.show == undefined) {
					validarCamposBloqueoFactura($camposValidadosElect);
					$camposValidadosElect.show = true;
				}
				alertify.warning("Facturación electrónica")
			};
			$factElectronicaDirecta = true;
		} else {
			if ($factElectronicaDirecta == true || $init == true) {
				if ($camposValidados.show == undefined) {
					validarCamposBloqueoFactura($camposValidados);
					$camposValidados.show = true;
				}
				alertify.warning("Facturación POS")
			};
			$factElectronicaDirecta = false;
		}
	} else {
		if ($init == true) {
			validarCamposBloqueoFactura($factElectronicaDirecta == true ? $camposValidadosElect : $camposValidados);
		}
	}
}

$(function () {
	RastreoIngresoModulo('Facturador');
	$('#frmEncabezado').trigger("reset");
	$('#frmPie').trigger("reset");

	accesoModulo = sessionStorage.getItem('acceso-modulo');

	if (!$PIEORIGINAL.ReteOtro) {
		$('#inputOtrosImpuestos').attr('readonly', true);
	}

	if ($BeneficiarioId == $ENCABEZADO.TerceroId) {
		$('#tercero input').val($ENCABEZADO.TerceroId);
		$('#tercero span').text($ENCABEZADO.nombre);
	} else {
		$('#terceroBeneficiario input').val($BeneficiarioId);
		$('#terceroBeneficiario span').text($nombreBeneficiario);
		$('#tercero input').val($ENCABEZADO.TerceroId);
		$('#tercero span').text($ENCABEZADO.nombre);
	}

	$('#vendedor input').val($ENCABEZADO.VendedorId);
	$('#vendedor span').text($ENCABEZADO.Vendedor);

	$('#mesero input').val($FACTURA.MeseroId);
	$('#mesero span').text($FACTURA.Mesero);

	$('#inputDireccion').val($ENCABEZADO.Direccion);
	$('#inputReserva').val($ENCABEZADO.Reserva);

	$('#accion input').val($AccionPedido);

	DTCuentaValor = $('#tblCuentaValor').removeAttr('width').DataTable({
		columnDefs: [
			{ width: '1%', targets: [4, 5, 6], orderable: false }
			, { width: 100, targets: [0], orderable: false }
			, { width: 250, targets: [1], orderable: false }
			, { width: 100, targets: [2], orderable: false }
			, { width: 250, targets: [3], orderable: false }
			, { visible: false, targets: [5, 6], orderable: false }

			, { sClass: 'codigoValor', targets: [0] }
			, { sClass: 'nombreValor', targets: [1] }
			, { sClass: 'valorValor', targets: [2] }
			, { sClass: 'formaPagoValor', targets: [3] }
			, { sClass: 'accionValor', targets: [4] }
		],
		processing: true,
		order: [[0, 'DESC']],
		draw: 10,
		language,
		fixedColumns: true,
		pageLength: 10,
		deferRender: true,
		scrollY: 450,
		scrollX: true,
		scrollCollapse: true,
		scroller: {
			loadingIndicator: true
		},
		dom: domtri,
		rowsGroup: [
			0
			, 1
		],
		createdRow: function (row, data, dataIndex) {
			$(row).find('.eliminarTercero').on('click', function (e) {
				e.preventDefault();

				let id = $(this).data('id');
				var index = $FACTURA.FrmPagoValor.map(x => {
					return x.Id;
				}).indexOf(id);

				if (index > -1) {
					delete $FACTURA.FormaPago[$FACTURA.FrmPagoValor[index]['TerceroId']][$FACTURA.FrmPagoValor[index]['CodiPagoId']];
					$FACTURA.FrmPagoValor.splice(index, 1);
				}

				validarCompartirCuentaValor();

				alertify.success('Forma de Pago removida satisfactoriamente');
			});

			$(row).find('.editarFrmPago').on('click', function (e) {
				e.preventDefault();

				$(row).find('td.formaPagoValor').html(`<select class="inputCuentaValor form-control" style="min-width: 250px;">
					<option value="" selected>&nbsp;</option>
				</select>`);
				$(this).addClass('d-none');
				$(row).find('td.accionValor .guardarTercero').removeClass('d-none');
				$(row).find('td.valorValor').html(`
					<input type="text" class="form-control numero font-weight-bold">
				`).find('input').unbind().inputmask('tres', {
					rightAlign: false,
					maxLength: 10,
					digits: 2
				}).val(data.Valor).select().focus();

				$('#CodiPagos option').clone().appendTo($(row).find('td.formaPagoValor select'));

				$.ajax({
					url: base_url() + "Administrativos/Servicios/EstadoCuenta/CargarForanea",
					type: 'POST',
					data: {
						tabla: "Tercero",
						value: data.TerceroId,
						nombre: "terceroid",
						tblNombre: "nombre"
					},
					dataType: "json",
					success: function (respuesta) {
						$(row).find('select option').each(function () {
							// if(($(this).data('credito') == 'S' && respuesta[0]['Firma'] != 'S') || $(this).attr('value') == '22'){
							if (($(this).data('credito') == 'S' && respuesta[0]['Firma'] != 'S')) {
								$(this).addClass('d-none');
							}
						});
						$(row).find('select.inputCuentaValor option').each(function () {
							if (!($(this).data('activa') == 'S' && $(this).data('enpos') == '1')) {
								$(this).addClass('d-none');
							}
							else {
								// if($(this).val() == '22'){
								if (1 == 2) {
									$(this).addClass('d-none');
								} else {
									// Si es socio activo
									if ($(this).data('credito') == 'S') {
										if (respuesta[0]['Firma'] != 'S') {
											$(this).addClass('d-none');
										} else {
											if (respuesta[0]['SocioActivo'] != null && respuesta[0]['TarjetaActiva'] != null) {
												if ($(this).data('controlbbva') == 'S' && respuesta[0]['Firma'] != 'S') {
													$(this).addClass('d-none');
												} else if ($(this).data('controlbbva') != 'S' && respuesta[0]['Firma'] == 'S') {
													$(this).addClass('d-none');
												}
											} else {
												if ($(this).data('controlbbva') == 'S') {
													$(this).addClass('d-none');
												}
												if (respuesta[0]['Firma'] != 'S') {
													$(this).addClass('d-none');
												}
											}
										}
									}
								}
							}
						});
						DTCuentaValor.columns.adjust();
						let codiPago = data.CodiPagoId.replace('_', '');
						$(row).find('select.inputCuentaValor').val(codiPago).change();
					}
				});
			});

			$('#CodiPagos option').clone().appendTo($(row).find('td.formaPagoValor select'));

			$(row).find(".aplicaPropina").on("click", function(){
				let tercero = $(this).closest("tr").find("input[data-db='terceroid']").val();
				
				if ($FACTURA.FormaPago[tercero] != undefined) {
					for (const it in $FACTURA.FormaPago[tercero]) {
						if (it.includes('_') == false) {
							if ($(this).is(":checked")) {
								$(row).find(`select.inputCuentaValor option.d-none[value='${it}']`).removeClass("d-none");
							} else {
								$(row).find(`select.inputCuentaValor option:not(.d-none)[value='${it}']`).addClass("d-none");
							}
						}
					}
				}
			});

			$(row).find('input:eq(0)').on('change', function () {
				var value = $(this).val();
				var tabla = $(this).attr('data-foranea');
				var selfie = this;
				$(row).find('input:eq(1)').removeClass('d-none').closest('td').find('select').html('').addClass('d-none');
				$(row).find('td.codigoValor img').remove();

				if (value != '') {
					var nombre = $(selfie).attr('data-foranea-codigo');
					var tblNombre = 'nombre';

					$.ajax({
						url: base_url() + "Administrativos/Servicios/EstadoCuenta/CargarForanea",
						type: 'POST',
						data: {
							tabla: tabla,
							value: value,
							nombre: nombre,
							tblNombre: tblNombre
						},
						success: function (respuesta) {
							if (respuesta == 0) {
								$(selfie).val('').closest('.input-group').find('span').text('').attr('title', '');
								alertify.ajaxAlert = function (url) {
									$.ajax({
										url: url,
										async: false,
										success: function (data) {
											alertify.myAlert().set({
												onclose: function () {
													busqueda = false;
													alertify.myAlert().set({ onshow: null });
													$(".ajs-modal").unbind();
													delete alertify.ajaxAlert;
													$("#tblBusqueda").unbind().remove();
												}, onshow: function () {
													busqueda = true;
													alertify.myAlert().set('resizable', true).resizeTo('90%', '100%');
												}
											});

											alertify.myAlert(data);

											$("#tblBusqueda").DataTable({
												bAutoWidth: false,
												processing: true,
												serverSide: true,
												columnDefs: [
													{ targets: [0], width: '1%' },
												],
												ajax: {
													url: base_url() + "Administrativos/Servicios/EstadoCuenta/DTBuscarAccionTercero",
													type: 'POST'
												},
												order: [],
												ordering: false,
												draw: 10,
												language,
												pageLength: 10,
												oSearch: { sSearch: value },
												createdRow: function (row, data, dataIndex) {
													$(row).click(function () {
														$(selfie).val(data[0]).change();
														alertify.myAlert().close();
													});
												},
												initComplete: function () {
													setTimeout(function () {
														$('div.dataTables_filter input').focus();
													}, 500);
													$('div.dataTables_filter input').unbind().change(function (e) {
														e.preventDefault();
														table = $("body").find("#tblBusqueda").dataTable();
														table.fnFilter(this.value);
													});
												},
												deferRender: true,
												scrollY: screen.height - 400,
												scroller: {
													loadingIndicator: true
												},
												dom: domftri
											});
										}
									});
								}
								var campos = encodeURIComponent(JSON.stringify(['Código', 'Nombre', 'Barra', 'Tarjeta', 'Acción']));
								alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
							} else {
								respuesta = JSON.parse(respuesta);

								if (respuesta.length > 1) {
									let strTerceros = "";

									for (var i = 0; i < respuesta.length; i++) {
										strTerceros += `<option
											value="`+ respuesta[i]['terceroid'] + `"
											data-foto="`+ respuesta[i]['foto'] + `"
											data-firma="`+ respuesta[i]['Firma'] + `"
											data-socioactivo="`+ respuesta[i]['SocioActivo'] + `"
											data-tarjetaactiva="`+ respuesta[i]['TarjetaActiva'] + `"
										>`+ respuesta[i][tblNombre] + `</option>`
									}

									$(row).find('input:eq(1)').closest('td').find('select').html(strTerceros).change().removeClass('d-none').closest('td').find('input').addClass('d-none');

									$(row).find('select:eq(0)').on('change', function () {
										let selfie = this;

										$(row).find('select.inputCuentaValor option').each(function () {
											$(this).removeClass('d-none');
										}).closest('select').val('').prop('disabled', false)
											.closest(".input-group").find(".aplicaPropina").prop("checked", false).prop('disabled', false);

										$(row).find('select.inputCuentaValor option').each(function () {
											if (($(this).data('credito') == 'S' && $(selfie).find('option:selected').data("firma") != 'S')) {
												$(this).addClass('d-none');
											}
										});

										$(row).find('select.inputCuentaValor option').each(function () {
											Bandera = false;
											for (var i = 0; i < $FACTURA.FrmPagoValor.length; i++) {
												if ($FACTURA.FrmPagoValor[i]['CodiPagoId'] == $(this).val() && $FACTURA.FrmPagoValor[i]['TerceroId'] == $(selfie).val().trim()) {
													Bandera = true;
													break;
												}
											}
											if (Bandera) {
												$(this).addClass('d-none');
											} else if (!($(this).data('activa') == 'S' && $(this).data('enpos') == '1')) {
												$(this).addClass('d-none');
											} else {
												// if($(this).val() == '22'){
													if (1 == 2) {
													$(this).addClass('d-none');
												} else {
													// Si es socio activo
													if ($(this).data('credito') == 'S') {
														if ($(selfie).find('option:selected').data('firma') != 'S') {
															$(this).addClass('d-none');
														} else {
															if ($(selfie).find('option:selected').data('socioactivo') != null && $(selfie).find('option:selected').data('tarjetaactiva') != null) {
																if ($(this).data('controlbbva') == 'S' && $(selfie).find('option:selected').data('firma') != 'S') {
																	$(this).addClass('d-none');
																} else if ($(this).data('controlbbva') != 'S' && $(selfie).find('option:selected').data('firma') == 'S') {
																	$(this).addClass('d-none');
																}
															} else {
																if ($(this).data('controlbbva') == 'S') {
																	$(this).addClass('d-none');
																}
																if ($(selfie).find('option:selected').data('firma') != 'S') {
																	$(this).addClass('d-none');
																}
															}
														}
													}
												}
											}
										});

										if ($FACTURA.FormaPago[$(selfie).val()]) {
											if (Object.keys($FACTURA.FormaPago[$(selfie).val()]).findIndex(x => x.includes('_')) != -1) {
												$(row).find(".input-group-prepend").addClass("d-none");
											} else {
												$(row).find(".input-group-prepend").removeClass("d-none");
											}
										} else {
											$(row).find(".input-group-prepend").removeClass("d-none");
										}
									}).change();
								} else {
									$(row).find('select.inputCuentaValor option').each(function () {
										$(this).removeClass('d-none');
									}).closest('select').val('').prop('disabled', false)
										.closest(".input-group").find(".aplicaPropina").prop("checked", false).prop('disabled', false);

									if ($FACTURA.FormaPago[respuesta[0]['terceroid']]) {
										if (Object.keys($FACTURA.FormaPago[respuesta[0]['terceroid']]).findIndex(x => x.includes('_')) != -1) {
											$(row).find(".input-group-prepend").addClass("d-none");
										} else {
											$(row).find(".input-group-prepend").removeClass("d-none");
										}
									} else {
										$(row).find(".input-group-prepend").removeClass("d-none");
									}

									let foto = '';
									if (respuesta[0]['foto'] != null) {
										foto = `<img height="100px" class="p-1 w-100" alt="" style="object-fit: scale-down;" src="data:image/jpeg;base64,` + respuesta[0]['foto'] + `">`;
									}

									$(row).find('input:eq(0)').val(respuesta[0]['terceroid']).closest('td').append(foto);
									$(row).find('input:eq(1)').val(respuesta[0][tblNombre]).attr('title', respuesta[0][tblNombre]);

									$(row).find('select option').each(function () {
										if (($(this).data('credito') == 'S' && respuesta[0]['Firma'] != 'S')) {
											$(this).addClass('d-none');
										}
									});
									
									$(row).find('select.inputCuentaValor option').each(function () {
										Bandera = false;
										for (var i = 0; i < $FACTURA.FrmPagoValor.length; i++) {
											if ($FACTURA.FrmPagoValor[i]['CodiPagoId'] == $(this).val() && $FACTURA.FrmPagoValor[i]['TerceroId'] == $(selfie).val().trim()) {
												Bandera = true;
												break;
											}
										}
										if (Bandera) {
											$(this).addClass('d-none');
										} else if (!($(this).data('activa') == 'S' && $(this).data('enpos') == '1')) {
											$(this).addClass('d-none');
										} else {
											// if($(this).val() == '22'){
											if (1 == 2) {
												$(this).addClass('d-none');
											} else {
												// Si es socio activo
												if ($(this).data('credito') == 'S') {
													if (respuesta[0]['Firma'] != 'S') {
														$(this).addClass('d-none');
													} else {
														if (respuesta[0]['SocioActivo'] != null && respuesta[0]['TarjetaActiva'] != null) {
															if ($(this).data('controlbbva') == 'S' && respuesta[0]['Firma'] != 'S') {
																$(this).addClass('d-none');
															} else if ($(this).data('controlbbva') != 'S' && respuesta[0]['Firma'] == 'S') {
																$(this).addClass('d-none');
															}
														} else {
															if ($(this).data('controlbbva') == 'S') {
																$(this).addClass('d-none');
															}
															if (respuesta[0]['Firma'] != 'S') {
																$(this).addClass('d-none');
															}
														}
													}
												}
											}
										}
									});
								}

								DTCuentaValor.columns.adjust().draw();

								setTimeout(function () {
									$(row).find('td.valorValor input').select();
								}, 500);
							}
						}
					});
				} else {
					$(row).find('input:eq(1)').val('').attr('title', '');
				}
			});

			$(row).find('input:eq(1)').closest('td').find('select').on('change', function () {
				let foto = '';
				let fotico = $(this).find('option:selected').data('foto');
				if (fotico != null) {
					foto = `<img height="100px" class="p-1 w-100" alt="" style="object-fit: scale-down;" src="data:image/jpeg;base64,` + fotico + `">`;
				}
				$(row).find('td.codigoValor img').remove();
				$(row).find('input:eq(0)').val($(this).val()).closest('td').append(foto);
				DTCuentaValor.columns.adjust().draw();
			});

			$(row).find('.guardarTercero').on('click', function (e) {
				if ($(this).closest('tr').find('select.inputCuentaValor').val() == '') {
					alertify.error('Por favor seleccione una forma de pago');
					setTimeout(() => {
						$(this).closest('tr').find('select.inputCuentaValor').focus();
					}, 0);
					return false;
				}

				let editaPropina = $(this).closest('tr').hasClass("rowPropinilla");
				let propinaActiva = ($(this).closest('tr').find(".aplicaPropina").is(":checked") || editaPropina);
				let valorDigitado = $(this).closest('tr').find("td.valorValor input").val();
				let valorPendienteValid = propinaActiva == true ? $("#frmValorPropinaPendiente").val() : $("#frmValorPendiente").val();
				valorPendienteValid = valorPendienteValid <= 0 ? 0 : parseFloat(valorPendienteValid.replace(/,/g, ''));

				//Validamos que el valor pendiente tanto de propina como el valor normal ya no este completo en caso tal sacamos alerta de que no se permite agregar más
				if (editaPropina == false) {
					if (valorPendienteValid <= 0) {
						alertify.error(`Es valor pendiente ${(propinaActiva == true ? "de propina" : "")} es igual a 0 no se permite agregar más personas y/o formas de pagos`);
						validarCompartirCuentaValor();
						return false;
					}
					if (valorDigitado == "" || valorDigitado <= 0 || valorDigitado.length <= 0) {
						//alertify.error('Por favor digite un valor mayor a 0');
						/*setTimeout(() => {
							$(this).closest('tr').find("td.valorValor input").focus();
						}, 0);*/
						validarCompartirCuentaValor();
						return false;
					}
				}

				let tmpCodiPagoId = $(this).closest('tr').find('td.formaPagoValor select').val().trim();
				let selfie = $(this).closest('tr').find('td.formaPagoValor select option:selected');
				let validaAlertaFormaPago = false;

				if (data.hasOwnProperty('CodiPagoId')) {
					// Edición
					let valorPropina = parseFloat($(this).closest('tr').find('td.valorValor input').val().replace(/,/g, ''));
					let id = data['Id'];
					var index = $FACTURA.FrmPagoValor.map(x => {
						return x.Id;
					}).indexOf(id);

					//Validamos si la propina es 0 y la eliminamos
					if (valorPropina == 0 || isNaN(valorPropina)) {

						if (index > -1) {
							delete $FACTURA.FormaPago[$FACTURA.FrmPagoValor[index]['TerceroId']][$FACTURA.FrmPagoValor[index]['CodiPagoId']];
							$FACTURA.FrmPagoValor.splice(index, 1);
						}

						validarCompartirCuentaValor();

						return;
					} else {
						let propinaPendiente = 0;
						let propinaAnt = 0;
						if (index > -1) {
							propinaAnt = $FACTURA.FormaPago[$FACTURA.FrmPagoValor[index]['TerceroId']][$FACTURA.FrmPagoValor[index]['CodiPagoId']].Valor;
						}

						var registro = {
							'0': data['0']
							, '1': data['1']
							, '2': `<span class="w-100 d-block p-1">${$(this).closest('tr').find('td.valorValor input').val()}</span>`
							, '3': '<span class="w-100 d-block p-1">' + $(this).closest('tr').find('td.formaPagoValor select option:selected').text().trim() + ' (PROPINA)</span>'
							, '4': `<center>
									<div class="btn-group btn-group-sm m-2">
										<button type="button" class="editarFrmPago btn btn-info">
											<span class="fas fa-pen" title="Editar"></span>
										</button>
										<button type="button" class="guardarTercero btn btn-success d-none" disabled>
											<span class="fas fa-check" title="Guardar Tercero"></span>
										</button>
									</div>
								</center>`
							, '5': ''
							, '6': ''
							, Id: FrmPagoValorId
							, TerceroId: data['TerceroId']
							, Valor: valorPropina//data['Valor']
							, CodiPagoId: '_' + $(this).closest('tr').find('td.formaPagoValor select').val().trim()
						}
						FrmPagoValorId++;

						propinaPendiente = parseFloat(Number($("#frmValorPropinaPendiente").val().replace(/,/g, ''))) + parseFloat(propinaAnt) - parseFloat(valorPropina);

						if (propinaPendiente < 0) {
							alertify.warning("La propina es superior a la indicada.");
						} else if (propinaPendiente > 0) {
							alertify.warning("La propina es inferior a la indicada.");
						}

						if (typeof $FACTURA['FormaPago'][data['TerceroId']][data['CodiPagoId']] !== 'undefined') {
							delete $FACTURA['FormaPago'][data['TerceroId']][data['CodiPagoId']];
						}

						if (index > -1) {
							$FACTURA.FrmPagoValor.splice(index, 1);
						}
					}
				} else {
					// Crear
					let value = 0;
					let faltante = 0;

					if (propinaActiva) {
						value = parseFloat($(this).closest('tr').find('td.valorValor input').val().replace(/,/g, ''));

						if (value == '') {
							value = 0.00;
						}

						propinaPendiente = parseFloat(Number($("#frmValorPropinaPendiente").val().replace(/,/g, ''))) - parseFloat(value);

						if (propinaPendiente < 0) {
							alertify.warning("La propina es superior a la indicada.");
						} else if (propinaPendiente > 0) {
							alertify.warning("La propina es inferior a la indicada.");
						}
					} else {
						value = $(this).closest('tr').find('td.valorValor input').val().replace(/,/g, '');
						faltante = $(this).closest('tr').find('td.valorValor input').attr('value').trim();
						if (faltante == 'NaN' || faltante == null || faltante == '' || isNaN(faltante)) {
							faltante = 0;
						}

						if (value == '') {
							value = 0.00;
						}

						let valordigit = $(selfie).data('valordigit');
						if (tmpCodiPagoId != '1' && valordigit != 'S') {
							if (Number(value) > Number(faltante)) {
								validaAlertaFormaPago = true;

								value = Math.round(faltante);
							}
						}
					}

					let Tercero = '';
					if ($(this).closest('tr').find('td.nombreValor input').is(':visible')) {
						Tercero = $(this).closest('tr').find('td.nombreValor input').val().trim();
					} else {
						Tercero = $(this).closest('tr').find('td.nombreValor select option:selected').text().trim();
					}
					let foto = '';
					if ($(row).find('td.codigoValor img').length > 0) {
						foto = $(row).find('td.codigoValor img')[0].outerHTML;
					}
					var registro = {
						'0': '<span class="w-100 d-block p-1 mb-0">' + $(this).closest('tr').find('td.codigoValor input:visible, td.codigoValor select:visible').val().trim() + '</span>' + foto
						, '1': '<span class="w-100 d-block p-1">' + Tercero + '</span>'
						, '2': '<span class="w-100 d-block p-1">' + addCommas2(value, 2) + '</span>'
						, '3': '<span class="w-100 d-block p-1">' + $(this).closest('tr').find('td.formaPagoValor select option:selected').text().trim() + (propinaActiva ? ' (PROPINA)' : '') + '</span>'
						, '4': (propinaActiva ? `<center>
								<div class="btn-group btn-group-sm m-2">
									<button type="button" class="editarFrmPago btn btn-info">
										<span class="fas fa-pen" title="Editar"></span>
									</button>
									<button type="button" class="guardarTercero btn btn-success d-none" disabled>
										<span class="fas fa-check" title="Guardar Tercero"></span>
									</button>
								</div>
							</center>` : `<center>
								<div class="btn-group btn-group-sm m-2">
									<button type="button" class="eliminarTercero btn btn-danger" data-id="`+ FrmPagoValorId + `">
										<span class="far fa-trash-alt" title="Remover"></span>
									</button>
								</div>
							</center>`)
						, '5': ''
						, '6': ''
						, Id: FrmPagoValorId
						, TerceroId: $(this).closest('tr').find('td.codigoValor input').val().trim()
						, Valor: value
						, CodiPagoId: (propinaActiva ? '_' : '') + $(this).closest('tr').find('td.formaPagoValor select').val().trim()
					}
					FrmPagoValorId++;
				}

				let validacionFormaPago = false;
				let nombre = selfie.text();

				let manejcentr = $(selfie).data('manejcentr');
				let manejnumer = $(selfie).data('manejnumer');
				let fechadocum = $(selfie).data('fechadocum');
				let manejcuotas = $(selfie).data('manejcuotas');

				// validacionFormaPago = Valida si la forma de pago hace alguna validación de crédito, cartera, cuotas, etc.
				if (manejcentr == 'S' || manejnumer == 'S' || fechadocum == 'S' || manejcuotas == 'S') {
					validacionFormaPago = true;
				}

				if (validacionFormaPago) {
					$('#ModalCuentaValor').modal('toggle');
					alertify.alert(
						nombre,
						'',
						function () {
							$('#ModalCuentaValor').modal('toggle');
							let FormaPagoTMP = {
								CodiPagoId: registro.CodiPagoId
								, Nombre: registro['3']
								, Valor: registro.Valor
							};

							if (manejcentr == 'S') {
								if ($('.alertify:not(.ajs-hidden) .divBancos select').val() != null) {
									registro.bancoid = $('.alertify:not(.ajs-hidden) .divBancos select').val().trim();
									FormaPagoTMP.bancoid = registro.bancoid;
								} else {
									return;
								}

								if (data.hasOwnProperty('CodiPagoId')) {
									// Edición
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')].bancoid = registro.bancoid;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == registro.CodiPagoId.replace('_', '')) {
												$FACTURA.FrmPagoValor[kk].bancoid = registro.bancoid;
												break;
											}
										}
									}
								} else {
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId].bancoid = registro.bancoid;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == ('_' + registro.CodiPagoId)) {
												$FACTURA.FrmPagoValor[kk].bancoid = registro.bancoid;
												break;
											}
										}
									}
								}
							}
							if (manejnumer == 'S') {
								if ($('.alertify:not(.ajs-hidden) .divDocumento input').val() != null) {
									registro.numerdocum = $('.alertify:not(.ajs-hidden) .divDocumento input').val().trim();
									FormaPagoTMP.numerdocum = registro.numerdocum;
								} else {
									return;
								}

								if (data.hasOwnProperty('CodiPagoId')) {
									// Edición
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')].numerdocum = registro.numerdocum;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == registro.CodiPagoId.replace('_', '')) {
												$FACTURA.FrmPagoValor[kk].numerdocum = registro.numerdocum;
												break;
											}
										}
									}
								} else {
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId].numerdocum = registro.numerdocum;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == ('_' + registro.CodiPagoId)) {
												$FACTURA.FrmPagoValor[kk].numerdocum = registro.numerdocum;
												break;
											}
										}
									}
								}
							}
							if (fechadocum == 'S') {
								if ($('.alertify:not(.ajs-hidden) .divFechaDocum input').val() != null) {
									registro.fechacheq = $('.alertify:not(.ajs-hidden) .divFechaDocum input').val().trim();
									FormaPagoTMP.fechacheq = registro.fechacheq;
								} else {
									return;
								}

								if (data.hasOwnProperty('CodiPagoId')) {
									// Edición
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')].fechacheq = registro.fechacheq;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == registro.CodiPagoId.replace('_', '')) {
												$FACTURA.FrmPagoValor[kk].fechacheq = registro.fechacheq;
												break;
											}
										}
									}
								} else {
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId].fechacheq = registro.fechacheq;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == ('_' + registro.CodiPagoId)) {
												$FACTURA.FrmPagoValor[kk].fechacheq = registro.fechacheq;
												break;
											}
										}
									}
								}
							}
							if (manejcuotas == 'S') {
								if ($('.alertify:not(.ajs-hidden) .divManejcuotas input').val() != null) {
									registro.cuota = $('.alertify:not(.ajs-hidden) .divManejcuotas input').val().trim();
									FormaPagoTMP.cuota = registro.cuota;
								} else {
									return;
								}

								if (data.hasOwnProperty('CodiPagoId')) {
									// Edición
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId.replace('_', '')].cuota = registro.cuota;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == registro.CodiPagoId.replace('_', '')) {
												$FACTURA.FrmPagoValor[kk].cuota = registro.cuota;
												break;
											}
										}
									}
								} else {
									if (typeof $FACTURA.FormaPago[registro.TerceroId] !== "undefined" && typeof $FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId] !== "undefined") {
										$FACTURA.FormaPago[registro.TerceroId]['_' + registro.CodiPagoId].cuota = registro.cuota;

										for (var kk in $FACTURA.FrmPagoValor) {
											if ($FACTURA.FrmPagoValor[kk].TerceroId == registro.TerceroId && $FACTURA.FrmPagoValor[kk].CodiPagoId == ('_' + registro.CodiPagoId)) {
												$FACTURA.FrmPagoValor[kk].cuota = registro.cuota;
												break;
											}
										}
									}
								}
							}

							$FACTURA.FrmPagoValor.push(registro);

							if (typeof $FACTURA.FormaPago[registro.TerceroId] == "undefined") {
								$FACTURA.FormaPago[registro.TerceroId] = {};
							}

							$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId] = FormaPagoTMP;

							validarCompartirCuentaValor();

							alertify.success('Forma de Pago almacenada satisfactoriamente');
							if (validaAlertaFormaPago) {
								alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
							}
							setTimeout(function () {
								$('#btnAgregarTercero').focus();
							}, 0);
						}
					);

					$('.DivFormasPago').clone().appendTo('.alertify:not(.ajs-hidden) .ajs-content').removeClass('d-none').on('submit', function (e) {
						e.preventDefault();
						$('.alertify:not(.ajs-hidden) .ajs-footer button').click();
					})

					let tmpTerceroId = registro.TerceroId;
					if (typeof $FACTURA.FormaPago[tmpTerceroId] == "undefined") {
						$FACTURA.FormaPago[tmpTerceroId] = {};
					}

					if (manejcentr != 'S') {
						$('.alertify:not(.ajs-hidden) .divBancos').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divBancos select').prop('required', true).val(
							(typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['bancoid'] !== 'undefined')
								? $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['bancoid']
								: (
									(typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['bancoid'] !== 'undefined')
										? $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['bancoid']
										: ''
								)
						)
					}
					if (manejnumer != 'S') {
						$('.alertify:not(.ajs-hidden) .divDocumento').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divDocumento input').prop('required', true).val(
							(typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['numerdocum'] !== 'undefined')
								? $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['numerdocum']
								: (
									(typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['numerdocum'] !== 'undefined')
										? $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['numerdocum']
										: ''
								)
						)
					}
					if (fechadocum != 'S') {
						$('.alertify:not(.ajs-hidden) .divFechaDocum').addClass('d-none');
					} else {
						$('.alertify:not(.ajs-hidden) .divFechaDocum input').prop('required', true)
							.datetimepicker({
								format: 'YYYY-MM-DD',
								locale: 'es'
							}).val(
								(typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['fechacheq'] !== 'undefined')
									? $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['fechacheq']
									: (
										(typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['fechacheq'] !== 'undefined')
											? $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['fechacheq']
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
							allowPlus: false,
							allowMinus: false
						}).focus(function () {
							var selfie = this;
							setTimeout(function () {
								$(selfie).select();
							}, 0);
						}).val(
							(typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['cuota'] !== 'undefined')
								? $FACTURA.FormaPago[tmpTerceroId][tmpCodiPagoId]['cuota']
								: (
									(typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['cuota'] !== 'undefined')
										? $FACTURA.FormaPago[tmpTerceroId]['_' + tmpCodiPagoId]['cuota']
										: '1'
								)
						)
							.on('change', function () {
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
					if (typeof $FACTURA.FormaPago[registro.TerceroId] == "undefined") {
						$FACTURA.FormaPago[registro.TerceroId] = {};
					}

					$FACTURA.FormaPago[registro.TerceroId][registro.CodiPagoId] = registro;
					$FACTURA.FrmPagoValor.push(registro);

					validarCompartirCuentaValor();

					alertify.success('Forma de Pago almacenada satisfactoriamente');
					if (validaAlertaFormaPago) {
						alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
					}
					setTimeout(function () {
						$('#btnAgregarTercero').focus();
					}, 0);
				}
			});

			setTimeout(function () {
				$(row).find('td.codigoValor input').focus();
			}, 0);

			$(row).find('td.valorValor .numero').inputmask('tres', {
				rightAlign: false,
				maxLength: 10,
				digits: 2
			}).on('click', function () {
				var selfie = this;
				setTimeout(function () {
					$(selfie).select();
				}, 0);
			});

			if (typeof data['CodiPagoId'] !== 'undefined') {
				if (data['CodiPagoId'].indexOf('_') != -1) {
					$(row).addClass('rowPropinilla');
				}
			}
		}
	});

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

	$('#inputRetencion').val($PIE.TariRete).attr('readonly', false).inputmask('tres', {
		rightAlign: false,
		maxLength: 10,
		digits: 4,
		allowPlus: false,
		allowMinus: false
	});

	$('#inputBaseGravada').val($PIE.BaseGravada);
	$('#inputBase').val($PIE.Base);
	$('#inputIVA').val($PIE.IVA);
	$('#inputOtrosImpuestos').val($PIE.OtrosImpuestos);
	$('#inputReteFuente').val($PIE.ReteFuente);
	$('#inputRetencionIVA').val($PIE.RetencionIVA);
	$('#inputRetencionICA').val($PIE.RetencionICA);
	$('#inputImpoConsumo').val($PIE.ImpoConsumo);
	$('#inputDctoPie').val($PIE.DctoPie);
	$('#inputDcto').val($PIE.DctoProds);
	$('#inputTotalDescuento').val($PIE.TotalDescuento);
	$('#inputTotalItems').val($PIE.TotalItems);
	$('#inputAutoRetenciones').val($PIE.AutoRetenciones);
	$('#inputSubTotal').val($PIE.SubTotal);
	$('#inputAntesIVA').val($PIE.AntesIVA);
	$('#inputTotalCantidad').val($PIE.TotalCantidad);
	$('#inputPeso').val($PIE.Peso);
	$('#inputTotalFacturado').val($PIE.TotalFacturado);
	$('#inputTotalPagar').val($PIE.TotalPagar);
	$('#inputEntregado').val($PIE.Entregado);

	$('#frmFormaPendiente').val($PIE.TotalPagar);
	$('#frmValorPendiente').val($PIE.TotalPagar);
	$('#frmTotalPagar').val($PIE.TotalPagar);
	$('#frmValorfrmValor').val($PIE.TotalPagar);
	$('#frmFormaTotalFactura').val($PIE.TotalFacturado);
	$('#frmValorTotalFactura').val($PIE.TotalFacturado);
	$('#frmFormaIVAFactura').val($PIE.IVA);
	$('#frmValorIVAFactura').val($PIE.IVA);
	$('#frmFormaBase').val(0);
	$('#frmValorBase').val(0);
	$('#frmFormaIVA').val(0);

	$('#dctoValorInput').val(0);
	$('#dctoPorcentajeInput').val(0);
	$('#observacion').val('');

	$('#inputPropina').val($FACTURA.Propina);

	$('#inputAnticipo').val($PIE.Anticipo);

	$('.numero').inputmask('tres', {
		rightAlign: false,
		maxLength: 10,
		digits: 2
	});

	$('#dctoPorcentajeInput').val($FACTURA.Propina);

	//Boton de cambio propina
	$(".btnCambioPropina").on("click", function (e) {
		e.preventDefault();
		var PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
		if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
			$('#ModalFormasPago').modal('toggle');

			for (var idTerceros in $FACTURA.FormaPago) {
				for (var key in $FACTURA.FormaPago[idTerceros]) {
					if (key.includes('_')) {
						CambioPropina = key;
					}
				}
			}

			alertify.propinaAlert($('#propinaFrm')[0], function () {
				setTimeout(() => {
					actualizarFormasPago();
				}, 0);

				alertify.success('Propina actualizada satisfactoriamente');
				dcto();
				$('#ModalFormasPago').modal('toggle');
			}).set('selector', 'input[id="propinaInput"]');

			if (CambioPropina == '__' || CambioPropina == false || CambioPropina == '_80') {
				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val($('#propinaFrm:eq(0)').find('#propinaInfoVent option:not(.d-none):eq(0)').val());
			} else {
				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val(CambioPropina.replace("_", ""));
			}
		}
	});

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
		if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
			$FACTURA.FormaPago[$TerceroId] = {};
		}

		for (var k in $FACTURA.FormaPago[$TerceroId]) {
			total = parseFloat(total) + parseFloat($FACTURA.FormaPago[$TerceroId][k].Valor) + ('Propina' in $FACTURA.FormaPago[$TerceroId][k] ? $FACTURA.FormaPago[$TerceroId][k].Propina : 0);
		}

		var faltante = parseFloat($PIE.TotalPagar) - parseFloat(total);

		alertify.prompt(nombre, 'Especifique Valor a Cancelar:', (typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' ? $FACTURA.FormaPago[$TerceroId][CodiPagoId].Valor : faltante)
			, function (evt, value) {
				value = value.replace(/,/g, '');
				value = parseFloat(value);
				if (isNaN(value)) {
					value = 0.00;
				}

				if (CodiPagoId != '1' && valordigit != 'S') {

					if ($FACTURA.FormaPago[$TerceroId][CodiPagoId]) {
						total -= $FACTURA.FormaPago[$TerceroId][CodiPagoId].Valor;
						faltante += $FACTURA.FormaPago[$TerceroId][CodiPagoId].Valor;
					}

					if ((total + value) > parseFloat($PIE.TotalPagar)) {
						if (value > 0) {
							validaAlertaFormaPago = true;
						}

						value = Math.round(faltante);
					}
				}

				if (value != 0) {
					if (validacionFormaPago) {
						$('#ModalFormasPago').modal('toggle');
						alertify.alert(
							nombre,
							'',
							function () {
								$('#ModalFormasPago').modal('toggle');

								let FormaPagoTMP = {
									CodiPagoId: CodiPagoId
									, Nombre: nombre
									, Valor: value
								};

								if (manejcentr == 'S') {
									if ($('.alertify:not(.ajs-hidden) .divBancos select').val() != null) {
										FormaPagoTMP.bancoid = $('.alertify:not(.ajs-hidden) .divBancos select').val().trim();
									} else {
										return;
									}
								}
								if (manejnumer == 'S') {
									if ($('.alertify:not(.ajs-hidden) .divDocumento input').val() != null) {
										FormaPagoTMP.numerdocum = $('.alertify:not(.ajs-hidden) .divDocumento input').val().trim();
									} else {
										return;
									}
								}
								if (fechadocum == 'S') {
									if ($('.alertify:not(.ajs-hidden) .divFechaDocum input').val() != null) {
										FormaPagoTMP.fechacheq = $('.alertify:not(.ajs-hidden) .divFechaDocum input').val().trim();
									} else {
										return;
									}
								}
								if (manejcuotas == 'S') {
									if ($('.alertify:not(.ajs-hidden) .divManejcuotas input').val() != null) {
										FormaPagoTMP.cuota = $('.alertify:not(.ajs-hidden) .divManejcuotas input').val().trim();
									} else {
										return;
									}
								}

								$FACTURA.FormaPago[$TerceroId][CodiPagoId] = FormaPagoTMP;

								if ($FACTURA.FormaPago[$TerceroId]['__']) {
									$FACTURA.FormaPago[$TerceroId]['__'].CodiPagoId = '_' + CodiPagoId;
									$FACTURA.FormaPago[$TerceroId]['__'].Nombre = nombre + ' (PROPINA)';
									$FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] = $FACTURA.FormaPago[$TerceroId]['__'];
									delete $FACTURA.FormaPago[$TerceroId]['__'];
								}

								actualizarFormasPago();
								alertify.success('Forma de Pago almacenada satisfactoriamente');
								if (validaAlertaFormaPago) {
									alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
								}
							}
						);

						$('.DivFormasPago').clone().appendTo('.alertify:not(.ajs-hidden) .ajs-content').removeClass('d-none').on('submit', function (e) {
							e.preventDefault();
							$('.alertify:not(.ajs-hidden) .ajs-footer button').click();
						})

						if (manejcentr != 'S') {
							$('.alertify:not(.ajs-hidden) .divBancos').addClass('d-none');
						} else {
							$('.alertify:not(.ajs-hidden) .divBancos select').prop('required', true).val(
								(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['bancoid'] !== 'undefined')
									? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['bancoid']
									: (
										(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['bancoid'] !== 'undefined')
											? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['bancoid']
											: ''
									)
							)
						}
						if (manejnumer != 'S') {
							$('.alertify:not(.ajs-hidden) .divDocumento').addClass('d-none');
						} else {
							$('.alertify:not(.ajs-hidden) .divDocumento input').prop('required', true).val(
								(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['numerdocum'] !== 'undefined')
									? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['numerdocum']
									: (
										(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['numerdocum'] !== 'undefined')
											? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['numerdocum']
											: ''
									)
							)
						}
						if (fechadocum != 'S') {
							$('.alertify:not(.ajs-hidden) .divFechaDocum').addClass('d-none');
						} else {
							$('.alertify:not(.ajs-hidden) .divFechaDocum input').prop('required', true)
								.datetimepicker({
									format: 'YYYY-MM-DD',
									locale: 'es'
								}).val(
									(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['fechacheq'] !== 'undefined')
										? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['fechacheq']
										: (
											(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['fechacheq'] !== 'undefined')
												? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['fechacheq']
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
								(typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId][CodiPagoId]['cuota'] !== 'undefined')
									? $FACTURA.FormaPago[$TerceroId][CodiPagoId]['cuota']
									: (
										(typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] !== 'undefined' && typeof $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['cuota'] !== 'undefined')
											? $FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId]['cuota']
											: '1'
									)
							)
								.on('change', function () {
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
						if ($FACTURA.FormaPago[$TerceroId]['__']) {
							$FACTURA.FormaPago[$TerceroId]['__'].CodiPagoId = '_' + CodiPagoId;
							$FACTURA.FormaPago[$TerceroId]['__'].Nombre = nombre + ' (PROPINA)';
							$FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] = $FACTURA.FormaPago[$TerceroId]['__'];
							delete $FACTURA.FormaPago[$TerceroId]['__'];
						}

						$FACTURA.FormaPago[$TerceroId][CodiPagoId] = {
							CodiPagoId: CodiPagoId
							, Nombre: nombre
							, Valor: value
						};

						actualizarFormasPago();
						alertify.success('Forma de Pago almacenada satisfactoriamente');
						if (validaAlertaFormaPago) {
							alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
						}
					}
				} else {
					delete $FACTURA.FormaPago[$TerceroId][CodiPagoId];

					actualizarFormasPago();
					alertify.success('Forma de Pago eliminada satisfactoriamente');
					if (validaAlertaFormaPago) {
						alertify.myAlert3('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
					}
				}
			}, function () {

			});
	});

	$('#btnObservacion').click(function (e) {
		e.preventDefault();
		alertify.ObservacionAlert($('#loginForm')[0]).set('selector', 'input[id="observacion"]');
	});

	$('#btnAnotacion').click(function (e) {
		e.preventDefault();
		alertify.anotacionAlert($('#anotacionForm')[0]).set('selector', 'input[id="anotacion"]');
	});

	$('#btnEfectivo').click(function (e) {
		e.preventDefault();
		if ($PIE.TotalPagar > 0) {
			$PIE.TotalPagar = $PIE.TotalPagar - $FACTURA.Propina;
			$FACTURA.FormaPago = {};
			$FACTURA.FrmPagoValor = [];
			$FACTURA.PropinaAnticipo = 0;
			$PIE.Anticipo = $PIEORIGINAL.Anticipo;
			var PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
			CruzaAnticipo = true;
			if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
				$FACTURA.Propina = ($PIE.AntesIVA * PropinaTarifa) / 100;
				//$FACTURA.Propina = (($PIE.TotalFacturado / (1 + PropinaTarifa) * PropinaTarifa)) / 10 //((PropinaTarifa / 100) + 1)) / 10);
				/* Validamos parametro si se aproxima Propina */
				$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
				if ($Montaje.RedondearPropina == 'S') {
					//Aproximamos a los proximos 50 pesos
					$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
				}
	
				alertify.propinaAlert($('#propinaFrm')[0], function () {
					window.scrollTo(0, document.body.scrollHeight);
					$('#inputEntregado').removeAttr('readonly').val($PIE.TotalPagar);
					formaPago = '1';
					setTimeout(function () {
						$('#inputEntregado').select();
					}, 500);
				}).set('selector', 'input[id="propinaInput"]');
	
				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val('1').prop('disabled', true);
			} else {
				formaPago = '1';
				validarAnticipoParcial();
			}
		} else {
			alertify.alert("Advertencia", "El valor total de la factura debe ser superior a cero.");
		}
	});

	$('#btnPendiente').click(function (e) {
		e.preventDefault();
		if ($PIE.TotalPagar > 0) { 
			$FACTURA.FormaPago = {};
			$FACTURA.FrmPagoValor = [];
			var PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
			$FACTURA.PropinaAnticipo = 0;
			$PIE.Anticipo = $PIEORIGINAL.Anticipo;
			CruzaAnticipo = true;
			if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa > 0) {
				$FACTURA.Propina = ($PIE.AntesIVA * PropinaTarifa) / 100;
				//$FACTURA.Propina = (($PIE.TotalFacturado / (1 + PropinaTarifa) * PropinaTarifa)) / 10 //((PropinaTarifa / 100) + 1)) / 10);
				
				/* Validamos parametro si se aproxima Propina */
				$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
				if ($Montaje.RedondearPropina == 'S') {
					//Aproximamos a los proximos 50 pesos
					$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
				}
	
				let propinaInfoVent = '1'
					, propinaNombre = 'EFECTIVO';
	
				if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
					$FACTURA.FormaPago[$TerceroId] = {};
				}
	
				$FACTURA.FormaPago[$TerceroId]['_' + propinaInfoVent] = {
					CodiPagoId: '_' + propinaInfoVent
					, Nombre: propinaNombre + ' (PROPINA)'
					, Valor: 0
					, Propina: $FACTURA.Propina
				};
	
				dcto();
			}
	
			entregado = $PIE.TotalPagar;
			formaPago = '1';
	
			facturarFormasPago(true, true);
		} else {
			alertify.alert("Advertencia", "El valor total de la factura debe ser superior a cero.");
		}
	});

	$('#inputOtrosImpuestos').focus(function () {
		var selfie = this;
		setTimeout(function () {
			$(selfie).select();
		}, 0);
	}).change(function () {
		$IM = $(this).val();
		if ($IM == '') {
			$IM = 0;
		} else {
			$IM = parseFloat($IM.replace(/,/g, ''));
		}

		$PIE.TotalPagar = $PIEORIGINAL.TotalFacturado - $PIE.TotalDescuento - $RC - $RI - $RF + $IM;

		if ($PIE.TotalPagar < 0) {
			$PIE.TotalPagar = 0;
		}

		$('#inputTotalPagar').val($PIE.TotalPagar);
		$('#frmFormaPendiente').val($PIE.TotalPagar);
		$('#frmValorPendiente').val($PIE.TotalPagar);
		$('#frmTotalPagar').val($PIE.TotalPagar);
		$('#frmValorfrmValor').val($PIE.TotalPagar);
	});

	$('#btnCredito').click(function (e) {
		e.preventDefault();
		if ($PIE.TotalPagar > 0) { 
			$PIE.TotalPagar = $PIE.TotalPagar - $FACTURA.Propina;
			$FACTURA.FormaPago = {};
			$FACTURA.FrmPagoValor = [];
			$FACTURA.PropinaAnticipo = 0;
			$PIE.Anticipo = $PIEORIGINAL.Anticipo;
			var PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
			CruzaAnticipo = true;
			if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
				$FACTURA.Propina = ($PIE.AntesIVA * PropinaTarifa) / 100;
				//$FACTURA.Propina = (($PIE.TotalFacturado / (1 + PropinaTarifa) * PropinaTarifa)) / 10 //((PropinaTarifa / 100) + 1)) / 10);
				
				$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
				/* Validamos parametro si se aproxima Propina */
				if ($Montaje.RedondearPropina == 'S') {
					//Aproximamos a los proximos 50 pesos
					$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
				}
	
				alertify.propinaAlert($('#propinaFrm')[0], function () {
					window.scrollTo(0, document.body.scrollHeight);
					$('#inputEntregado').removeAttr('readonly').val($PIE.TotalPagar);
					formaPago = '22';
					setTimeout(function () {
						$('#inputEntregado').select().focusout();
					}, 500);
				}).set('selector', 'input[id="propinaInput"]');
				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val('22').prop('disabled', true);
			} else {
				formaPago = '22';
				validarAnticipoParcial();	
			}
		} else {
			alertify.alert("Advertencia", "El valor total de la factura debe ser superior a cero.");
		}
	});

	$('#btnFormasPago').click(function (e) {
		e.preventDefault();
		if ($PIE.TotalPagar > 0) { 
			$PIE.TotalPagar = $PIE.TotalPagar - $FACTURA.Propina; 
			$FACTURA.FormaPago = {};
			$FACTURA.FrmPagoValor = [];
			$FACTURA.PropinaAnticipo = 0;
			$PIE.Anticipo = $PIEORIGINAL.Anticipo;
			var PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
			CruzaAnticipo = true;
			if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
				CambioPropina = false;
				$FACTURA.Propina = ($PIE.AntesIVA * PropinaTarifa) / 100;
				//$FACTURA.Propina = (($PIE.TotalFacturado / (1 + PropinaTarifa) * PropinaTarifa)) / 10 //((PropinaTarifa / 100) + 1)) / 10);
				$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
				/* Validamos parametro si se aproxima Propina */
				if ($Montaje.RedondearPropina == 'S') {
					//Aproximamos a los proximos 50 pesos
					$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
				}
	
				alertify.propinaAlert($('#propinaFrm')[0], function () {
					if ($PIE.Anticipo >= $PIE.TotalPagar) {
						$('#inputTotalPagar').val($PIE.TotalPagar);
						$('#inputEntregado').removeAttr('readonly').val($PIE.TotalPagar);
						$('#inputEntregado').select().change();
					} else {
						setTimeout(() => {
							actualizarFormasPago();
						}, 0);
		
						alertify.success('Forma de Pago almacenada satisfactoriamente');
						dcto();
		
						$('#ModalFormasPago').modal('toggle');
					}
				}).set('selector', 'input[id="propinaInput"]');
	
				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val("_").removeClass("d-none");
			} else {
				cruceAnticipo();
				actualizarFormasPago();
				$('#ModalFormasPago').modal('toggle');
			}
		} else {
			alertify.alert("Advertencia", "El valor total de la factura debe ser superior a cero.");
		}
	});

	$('#submitFormaPago').click(function (e) {
		e.preventDefault();
		var total = 0;

		for (var j in $FACTURA.FormaPago) {
			for (var k in $FACTURA.FormaPago[j]) {
				if (typeof $FACTURA.FormaPago[j][k].Propina !== "undefined") {
					total += $FACTURA.FormaPago[j][k].Propina;
				} else {
					total = parseFloat(total) + parseFloat($FACTURA.FormaPago[j][k].Valor);
				}
			}
		}

		if (total == '' || total == null || isNaN(total)) {
			total = 0;
		}

		total = total.toFixed(2);

		entregado = total;

		$PIE.TotalPagar = parseFloat($PIE.TotalPagar).toFixed(2);

		if ($PIE.TotalPagar == '' || $PIE.TotalPagar == null || isNaN($PIE.TotalPagar) || $PIE.TotalPagar < 0) {
			$PIE.TotalPagar = 0;
		}

		total = parseFloat(total);
		$PIE.TotalPagar = parseFloat($PIE.TotalPagar);

		if (total < $PIE.TotalPagar) {
			alertify.alert('Advertencia', 'Debe regresar y cancelar según el total', function () { });
		} else if (total > $PIE.TotalPagar) {
			let msg = 'El valor cancelado es mayor al de la factura';

			if ($CodiVentIdHotel.MostrarCambioCliente == "S") {
				msg += ', ¿Desea registrar cambio para el cliente?';
				alertify.confirm('Advertencia', msg, function () {
					facturarFormasPago();
				}, function () { });
			} else {
				alertify.alert('Advertencia', msg, function () { });
			}
		} else {
			facturarFormasPago();
		}
	});

	$('#inputEntregado').focusout(function () {
		if (!$(this).attr('readonly')) {
			entregado = $('#inputEntregado').val();
			if (typeof entregado !== 'number') {
				entregado = parseFloat(entregado.replace(/,/g, ''));
			}

			var TotalPagar = $PIE.TotalPagar;
			if (typeof TotalPagar !== 'number') {
				TotalPagar = parseFloat($PIE.TotalPagar.replace(/,/g, ''));
			}

			if (entregado == '' || entregado == null || isNaN(entregado)) {
				entregado = 0;
			}
			if (TotalPagar == '' || TotalPagar == null || isNaN(TotalPagar)) {
				TotalPagar = 0;
			}

			entregado = parseFloat(entregado.toFixed(2));
			TotalPagar = parseFloat(TotalPagar.toFixed(2));

			if (entregado < TotalPagar) {
				alertify.alert('Advertencia', 'Debe ser un valor igual o superior al cancelado', function () {
					$('#inputEntregado').val(0).attr('readonly', true);
				});
			} else if (entregado == TotalPagar) {
				alertify.confirm('Advertencia', '¿Está seguro de completar la facturación?', function () {
					$('#inputEntregado').val(0).attr('readonly', true);
					facturarFormasPago(true);
				}, function () {
					$('#inputEntregado').val(0).attr('readonly', true);
					$PIE.TotalPagar = $PIE.TotalPagar - $FACTURA.Propina;
					$PIE.Anticipo = $PIEORIGINAL.Anticipo;
					$FACTURA.Propina = 0;
					$FACTURA.PropinaAnticipo = 0;
					$FACTURA.FormaPago = {};
					$FACTURA.CortesiaId = null;
					CruzaAnticipo = false;
					dcto();
				});
			} else {
				let msg = 'El valor cancelado es mayor al de la factura'

				if ($CodiVentIdHotel.MostrarCambioCliente == "S") {
					msg += ', ¿Desea registrar cambio para el cliente?';
					alertify.confirm('Advertencia', msg, function () {
						facturarFormasPago(true);
					}, function () {
						$('#inputEntregado').val(0).attr('readonly', true);
						$FACTURA.Propina = 0;
						dcto();
					});
				} else {
					alertify.alert('Advertencia', msg, function () {
						$('#inputEntregado').val(0).attr('readonly', true);
						$FACTURA.Propina = 0;
						dcto();
					});
				}
			}
		}
	}).on('keydown', function (e) {
		if (e.keyCode === 13 || e.which === 13) {
			setTimeout(function () { $('#inputBaseGravada').focus() }, 0);
		}
	});

	$('#btnDctoValor').click(function (e) {
		e.preventDefault();
		btnAutorizar = 'dctoValor';
		setTimeout(function () { $('#inputBaseGravada').focus() }, 0);
		$('#modal-solicitar-usuario').modal('toggle');
	});

	$('#btnDctoPorcentaje').click(function (e) {
		e.preventDefault();
		btnAutorizar = 'dctoPorcen';
		setTimeout(function () { $('#inputBaseGravada').focus() }, 0);
		$('#modal-solicitar-usuario').modal('toggle');
	});

	$('#inputRetencion').on('focus', function () {
		var selfie = this;
		setTimeout(function () {
			selfie.select();
		}, 0);
	}).on('change', function () {
		var ReteFuente = $(this).val();
		if (ReteFuente == null || ReteFuente == '' || isNaN(ReteFuente)) {
			ReteFuente = 0;
		}
		$.ajax({
			url: base_url() + "Administrativos/Servicios/EstadoCuenta/ReteFuente",
			type: 'POST',
			data: {
				ReteFuente: ReteFuente
			},
			dataType: "json",
			success: function (res) {
				if (res === '0') {
					alertify.alert('Advertencia', 'No se encontraron Tarifas de Retención en la Fuente coincidentes', function () {
						$('#inputRetencion').val($PIE.TariRete);
					});
				} else {
					$('#inputRetencion').val(res);
					$PIE.TariRete = res;

					var valorTotal = parseFloat($PIEORIGINAL.TotalFacturado);
					var BaseGravada = parseFloat($PIEORIGINAL.BaseGravada);
					var Base = parseFloat($PIEORIGINAL.Base);

					var valorBaseGravada = 0;
					var valorBase = 0;

					var porcentaje = $FACTURA.dctoPorcentaje
					var valor = $FACTURA.dctoValor

					valorBaseGravada = BaseGravada * porcentaje / 100;
					valorBase = Base * porcentaje / 100;
					$PIE.IVA = $PIEORIGINAL.IVA * porcentaje / 100;

					var totalPagar = $PIEORIGINAL.TotalFacturado - valor;
					$PIE.BaseGravada = $PIEORIGINAL.BaseGravada - valorBaseGravada;
					$PIE.Base = $PIEORIGINAL.Base - valorBase;

					////////////////////////////////////////
					$RF = 0;
					if ($PIEORIGINAL.ReteFuente) {
						$RF = totalPagar * $PIE.TariRete / 100;
						$PIE.ReteFuente = $RF;

						totalPagar = totalPagar - $RC - $RI - $RF + $IM;
					}
					////////////////////////////////////////

					$PIE.SubTotal = totalPagar;
					$PIE.AntesIVA = totalPagar;
					$PIE.TotalFacturado = totalPagar;
					$PIE.TotalPagar = totalPagar;
					if ($PIE.TotalPagar < 0) {
						$PIE.TotalPagar = 0;
					}

					$('#inputIVA').val($PIE.IVA);
					$('#inputReteFuente').val($PIE.ReteFuente);
					$('#inputImpoConsumo').val($PIE.ImpoConsumo);
					$('#inputDctoPie').val($PIE.DctoPie);
					$('#inputTotalDescuento').val($PIE.TotalDescuento);
					$('#inputTotalPagar').val($PIE.TotalPagar);

					$('#frmFormaPendiente').val($PIE.TotalPagar);
					$('#frmValorPendiente').val($PIE.TotalPagar);
					$('#frmTotalPagar').val($PIE.TotalPagar);
					$('#frmValorfrmValor').val($PIE.TotalPagar);
					$('#frmFormaIVAFactura').val($PIE.IVA);
					$('#frmValorIVAFactura').val($PIE.IVA);

					$('#dctoValorInput').val(valor);
					$('#dctoPorcentajeInput').val(porcentaje);

					$FACTURA.dctoPorcentaje = porcentaje;
					$FACTURA.dctoValor = valor;
				}
			}
		});
	});

	$('#btnCancelar').click(function (e) {
		e.preventDefault();

		$arrayProductosPedido = $arrayProductosPedido.map(it => {
			delete it.ObservacioDevol;
			delete it.tipodevol;
			return it;
		});

		let pendientes = sessionStorage.getItem("PFD");
		if (pendientes) {
			pendientes = JSON.parse($.Desencriptar(JSON.parse(pendientes)));
		} else {
			pendientes = [];
		}

		if ($consumos == null) {
			let datos = {
				AlmacenId: $AlmacenId
				, TerceroId: $TerceroId
				, tipoVentaSeleccionado: JSON.stringify($TipoVentaSeleccionado)
				, accionPos: $accionPos
				, VendedorId: $VendedorId
				, arrayProductosPedido: JSON.stringify($arrayProductosPedido)
				, ConAccion: $ConAccion
				, MesaId: $MesaId
				, reservaHotel: $reservaHotel
				, AccionPedido: $AccionPedido
				, reactivarConsumo: $reactivarConsumo
				, terceroDatos: JSON.stringify($datosTerceroReactivar)
				, numPersonas: $numeroPersonasReactivar
				, codBarraTercero: $codBarraTercero
				, habitacionHotel: $habitacionHotel
				, terceroPedidoEmpresa: JSON.stringify($terceroPedidoEmpresa)
				, dataTerceroPendiente: JSON.stringify($dataTerceroPendiente)
				, facturaPuntoNoFisico: $ventanaCambioPedido
				, dataFechasHotel: $dataFechasHotel
				, HeadReservaIdHotel :$HeadReservaIdHotel
				, TerceroIdConsumo: $TerceroIdConsumo
				, consumosOcultos: $consumosOcultos
			};
			sessionStorage.setItem('dataPos', $.Encriptar(datos));
			location.href = $PaginaAnterior;
		} else {
			let cambio = `Cancela Factura Cuenta Tercero ${$TerceroId}`;
			if ($datosEvento !== null) {
				cambio += ` del Evento Nro ${$datosEvento.NroEvento}`;
			}

			$.ajax({
				url: base_url() + "Administrativos/Servicios/EstadoCuenta/CancelarFactura",
				type: 'POST',
				data: {
					consumos: $consumos
					, consumoPendientes: pendientes
					, RASTREO: RASTREO(cambio, 'Facturación')
					, eventoId: ($datosEvento === null ? null : $datosEvento.EventoId)
				},
				dataType: "json",
				success: function (res) {
					if (res.success) {
						if ($datosEvento === null) {
							let datos = {
								AlmacenId: $AlmacenId
								, TerceroId: $TerceroId
								, tipoVentaSeleccionado: JSON.stringify($TipoVentaSeleccionado)
								, accionPos: $accionPos
								, VendedorId: $VendedorId
								, arrayProductosPedido: JSON.stringify($arrayProductosPedido)
								, ConAccion: $ConAccion
								, MesaId: $MesaId
								, reservaHotel: $reservaHotel
								, AccionPedido: $AccionPedido
								, reactivarConsumo: $reactivarConsumo
								, terceroDatos: JSON.stringify($datosTerceroReactivar)
								, numPersonas: $numeroPersonasReactivar
								, codBarraTercero: $codBarraTercero
								, habitacionHotel: $habitacionHotel
								, terceroPedidoEmpresa: JSON.stringify($terceroPedidoEmpresa)
								, dataTerceroPendiente: JSON.stringify($dataTerceroPendiente)
								, facturaPuntoNoFisico: $ventanaCambioPedido
								, dataFechasHotel: $dataFechasHotel
								, HeadReservaIdHotel :$HeadReservaIdHotel
								, TerceroIdConsumo: $TerceroIdConsumo
								, consumosOcultos: $consumosOcultos
								, eventoId: ($datosEvento === null ? null : $datosEvento.EventoId)
							};
							sessionStorage.setItem('dataPos', $.Encriptar(datos));
						}
						location.href = $PaginaAnterior;
					} else {
						alertify.alert('Advertencia', res.msj);
					}
				}
			});
		};
	});

	$('#btnCompartirCuentaValor').click(function (e) {
		e.preventDefault();
		if ($PIE.TotalPagar > 0) { 
			$FACTURA.FormaPago = {};
			$FACTURA.FrmPagoValor = [];
	
			var PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
			if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
				$FACTURA.Propina = ($PIE.AntesIVA * PropinaTarifa) / 100;
				//$FACTURA.Propina = (($PIE.TotalFacturado / (1 + PropinaTarifa) * PropinaTarifa)) / 10 //((PropinaTarifa / 100) + 1)) / 10);
				
				$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
				/* Validamos parametro si se aproxima Propina */
				if ($Montaje.RedondearPropina == 'S') {
					//Aproximamos a los proximos 50 pesos
					$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
				}
	
				alertify.propinaAlert($('#propinaFrm')[0], function () {
					$('#ModalCuentaValor').modal('toggle');
					validarCompartirCuentaValor();
				}).set('selector', 'input[id="propinaInput"]');
				$('#propinaFrm:eq(0)').find('#propinaInfoVent').val($('#propinaFrm:eq(0)').find('#propinaInfoVent option:not(.d-none):eq(0)').val());
			} else {
				$('#ModalCuentaValor').modal('toggle');
				validarCompartirCuentaValor();
			}
		} else {
			alertify.alert("Advertencia", "El valor total de la factura debe ser superior a cero.");
		}
	});

	$('#btnCompartirCuentaProductos').click(function (e) {
		e.preventDefault();

		$(this).toggleClass('btn-light btn-outline-secondary btn-warning');

		if ($(this).hasClass('btn-warning')) {
			DTtblCRUD.column(0).visible(true).draw();
		} else {
			DTtblCRUD.column(0).visible(false);
			$('[data-max]').each(function () {
				var dataMax = parseInt($(this).data('max'));
				$(this).val(dataMax);
			});
			
		}

		DTtblCRUD.columns.adjust().draw();

		selecciones = [];
		dcto();
	});

	$('#btnCortesia').click(function (e) {
		e.preventDefault();
		btnAutorizar = 'cortesia';
		alertify.confirm('Advertencia', '¿Está seguro de generar la cortesía?', function () {
			$FACTURA.Propina = 0;
			calcularPIE();
			$('#modal-solicitar-usuario').modal('toggle');
		}, function () { });
	});

	$('#modal-solicitar-usuario').on('hidden.bs.modal', function () {
		$('#formDataAdmin').trigger('reset');
	}).on('shown.bs.modal', function () {
		alertify.warning('Digite el Código y Contraseña del Usuario Autorizador');
		setTimeout(function () {
			$('#formDataAdmin').find('[id=usuarioid]').focus();
		}, 0);
	});

	$('#formDataAdmin').on('submit', function (e) {
		e.preventDefault();
		let selfie = this;
		let usuarioid = $(this).find('[id=usuarioid]').val().trim(),
			clave = $(this).find('[id=clave]').val().trim();

		$FACTURA.CortesiaId = null;

		$.ajax({
			url: base_url() + "Administrativos/Servicios/EstadoCuenta/ValidarAdminCortesia",
			type: 'POST',
			dataType: "json",
			data: {
				usuarioid: usuarioid
				, clave: clave
				, boton: btnAutorizar
			},
			success: function (res) {
				switch (res.codigo.toString()) {
					case '0':
						alertify.error(res.msj)
						$(selfie).find('[id=clave]').val('');
						setTimeout(function () {
							$(selfie).find('[id=clave]').focus();
						}, 300);
						break;
					case '1':
						alertify.error(res.msj);
						$('#formDataAdmin').trigger('reset');
						setTimeout(function () {
							$(selfie).find('[id=usuarioid]').focus();
						}, 300);
						break;
					case '2':
						alertify.success(res.msj);
						$('#modal-solicitar-usuario').modal('toggle');

						switch (btnAutorizar) {
							case 'dctoValor':
								alertify.dctoValorAlert($('#dctoValorFrm')[0]).set('selector', 'input[id="dctoValorInput"]');
								break;

							case 'dctoPorcen':
								alertify.dctoPorcentajeAlert($('#dctoPorcentajeFrm')[0]).set('selector', 'input[id="dctoPorcentajeInput"]');
								break;

							case 'cortesia':
								alertify.ajaxAlert = function (url) {
									$.ajax({
										url: url,
										async: false,
										success: function (data) {
											alertify.cortesiaAlert().set({
												onclose: function () {
													busqueda = false;
													alertify.cortesiaAlert().set({ onshow: null });
													$(".ajs-modal").unbind();
													delete alertify.ajaxAlert;
													$("#tblBusqueda").unbind().remove();
												}, onshow: function () {
													busqueda = true;
												}
											});

											alertify.cortesiaAlert(data);

											var $tblID = '#tblBusqueda';
											$($tblID).DataTable({
												bAutoWidth: false,
												processing: true,
												serverSide: true,
												ajax: {
													url: base_url() + "Administrativos/Servicios/EstadoCuenta/DTTipoCartera",
													type: 'POST'
												},
												columnDefs: [
													{ targets: [0], width: '1%' },
												],
												order: [],
												ordering: false,
												draw: 10,
												language,
												pageLength: 10,
												initComplete: function () {
													setTimeout(function () {
														$('div.dataTables_filter input').focus();
													}, 500);
													$('div.dataTables_filter input').unbind().change(function (e) {
														e.preventDefault();
														table = $("body").find($tblID).dataTable();
														table.fnFilter(this.value);
													});
												},
												oSearch: { sSearch: '' },
												createdRow: function (row, data, dataIndex) {
													$(row).click(function () {
														$FACTURA.CortesiaId = data[0].trim();
														alertify.cortesiaAlert().close();
														if ($FacturarCortesia == false) {
															$.ajax({
																url: base_url() + "Administrativos/Servicios/EstadoCuenta/FacturarCortesia",
																type: 'POST',
																data: {
																	TerceroId: $TerceroId
																	,BeneficiarioId: $BeneficiarioId
																	, AlmacenId: $AlmacenId
																	, VendedorId: $VendedorId
																	, codiventid: $codiventid

																	, entregado: 0
																	, TotalPagar: $PIE.TotalPagar

																	, RF: $RF
																	, RI: $RI
																	, RC: $RC
																	, IM: $IM
																	, TariReteId: $PIEORIGINAL.TariReteId
																	, TarifaICA: $PIEORIGINAL.TarifaICA
																	, TarifRetIv: $PIEORIGINAL.TarifRetIv
																	, TariRete: $PIEORIGINAL.TariRete
																	, BaseGravada: $PIE.BaseGravada
																	, IVA: $PIE.IVA

																	, observasao: observasao

																	, Factura: $FACTURA

																	, MesaId: $MesaId

																	, selecciones: selecciones

																	, AlmacenNoFisico: $AlmacenNoFisico
																	, consumos: $consumos

																	, UsuarioAutoriza: usuarioid

																	, RASTREO: RASTREO('Factura Cuenta Tercero ' + $TerceroId + ($MesaId == null ? '' : ' Mesa ' + $MesaId) + ' como Cortesía ', 'Facturación')
																},
																dataType: "json",
																success: function (res) {
																	switch (res.codigo.toString()) {
																		case '7':
																		case '0':
																		case '2':
																			alertify.error(res.msj);
																			break;
																		default:
																			registro = res.msj;
																			if (registro[0] == '1') {
																				var strAlerta = 'Felicidades, la cuenta se ha facturado como cortesía de manera satisfactoria';

																				alertify.alert('Cortesía: ' + registro[1], strAlerta, function () {
																					if (typeof $CodiVentIdHotel.impresion == "undefined" || $CodiVentIdHotel.impresion == null) {
																						$CodiVentIdHotel.impresion = 1;
																					}

																					abrirReporte(base_url() + 'Reportes/ImprimirCortesia/' + registro[2] + '/' + $CodiVentIdHotel.impresion, contexto, 'redireccionCortesia');
																				});
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
														} else {
															calcularPIE();
															$('#ModalFormasPago').modal('toggle');
														}
													});
												},
												deferRender: true,
												scrollY: screen.height - 400,
												scroller: {
													loadingIndicator: true
												},
												dom: domftri
											});
										}
									});
								}
								alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
								break;
						}
						break;
					case '3':
						alertify.alert('Advertencia', res.msj, function () {
							$('#formDataAdmin').trigger('reset');
							setTimeout(function () {
								$(selfie).find('[id=usuarioid]').focus();
							}, 300);
						});
						break;
					default:
						alertify.alert('Advertencia', res.msj);
						break;
				}
			}
		});
	});

	$("#meseroid").on("change", function () {
		if ($(this).val() == '') {
			$(this).val($FACTURA.MeseroId);
		} else {
			var value = $(this).val();
			if (value != $FACTURA.MeseroId) {
				var selfie = this;
				if (value != '') {
					var antes = $FACTURA.MeseroId;
					$.ajax({
						url: base_url() + "Administrativos/Servicios/EstadoCuenta/CargarMesero",
						type: 'POST',
						dataType: "json",
						data: {
							value: value,
							almacen: $AlmacenId,
						},
						success: function (respuesta) {
							if (respuesta == 0) {
								alertify.ajaxAlert = function (url) {
									$.ajax({
										url: url,
										async: false,
										success: function (data) {
											alertify.myAlert2().set({
												onclose: function () {
													busqueda = false;
													alertify.myAlert2().set({ onshow: null });
													$(".ajs-modal").unbind();
													delete alertify.ajaxAlert;
													$("#tblBusqueda").unbind().remove();
													$("#meseroid").val($FACTURA.MeseroId);
												}, onshow: function () {
													lastFocus = antes;
													busqueda = true;
												}
											});

											alertify.myAlert2(data);

											var $tblID = '#tblBusqueda';
											$($tblID).DataTable({
												bAutoWidth: false,
												processing: true,
												serverSide: true,
												columnDefs: [
													{ targets: [0], width: '1%' },
												],
												order: [],
												ordering: false,
												draw: 10,
												language,
												pageLength: 10,
												ajax: {
													url: base_url() + "Administrativos/Servicios/EstadoCuenta/DTMesero",
													type: 'POST',
													data: function (d) {
														return $.extend(d, { almacen: $AlmacenId });
													},
												},
												initComplete: function () {
													setTimeout(function () {
														$('div.dataTables_filter input').focus();
														$('.alertify').animate({
															scrollTop: $('div.dataTables_filter input').offset().top
														}, 2000);
													}, 500);
													$('div.dataTables_filter input').unbind().change(function (e) {
														e.preventDefault();
														table = $("body").find($tblID).dataTable();
														table.fnFilter(this.value);
													});
												},
												oSearch: { sSearch: value },
												createdRow: function (row, data, dataIndex) {
													$(row).click(function () {
														$(selfie).val(antes).focusin().val(data[0]).change();
														alertify.myAlert2().destroy();
													});
												},
												deferRender: true,
												scrollY: screen.height - 400,
												scroller: {
													loadingIndicator: true
												},
												dom: domftri
											});
										}
									});
								}
								alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
							} else {
								console.log('xd');
								$FACTURA.MeseroId = antes;
								$(selfie).val(respuesta.vendedorid);
								$(selfie).closest('.input-group').find('span').text(respuesta.nombre).attr('title', respuesta.nombre);
								$FACTURA.MeseroId = respuesta.vendedorid;
							}
						}
					});
				} else {
					$(this).val($FACTURA.MeseroId);
				}
			}
		}
	}).on('click', function () {
		let selfie = this;
		setTimeout(function () {
			$(selfie).select();
		}, 0);
	});

	if (!alertify.alert2) {
		alertify.dialog('alert2', function factory() {
			return {
				build: function () {
					this.setHeader('Advertencia')
				}
			}
		}, true, 'alert');
	}

	if ($TIPOCOMERC == 'CLUB' && $ENCABEZADO.Firma != 'S') {
		alertify.alert2('Advertencia', 'El socio no está autorizado para firmar, sólo puede facturar de contado');
	}
	alertasFacturacionElectronica(true);

	dcto();

	$('[data-disabled]').each(function () {
		$(this).addClass('disabled').find('button').prop('disabled', true);
	});

	//validarCamposBloqueoFactura($camposValidados);

	setTimeout(function () {
		DTtblCRUD.columns.adjust().draw();
	}, 1000);

	DTtblCRUD.column(0).visible(false);

});

$(document).on('shown.bs.modal', function () {
	DTtblFormaPago.columns.adjust().draw();
	$('#divTblCuentaValor').find('.dataTables_scrollBody').css('height', 400);
	DTCuentaValor.columns.adjust().draw();
});

$(document)
	.on('mousedown', '.teclado7', function (e) {
		e.preventDefault();
		// 103
		tecladoNumericoTouch('7');
	})
	.on('click', '.teclado8', function (e) {
		e.preventDefault();
		// 104
		tecladoNumericoTouch('8');
	})
	.on('click', '.teclado9', function (e) {
		e.preventDefault();
		// 105
		tecladoNumericoTouch('9');
	})
	.on('click', '.teclado4', function (e) {
		e.preventDefault();
		// 100
		tecladoNumericoTouch('4');
	})
	.on('click', '.teclado5', function (e) {
		e.preventDefault();
		// 101
		tecladoNumericoTouch('5');
	})
	.on('click', '.teclado6', function (e) {
		e.preventDefault();
		// 102
		tecladoNumericoTouch('6');
	})
	.on('click', '.teclado1', function (e) {
		e.preventDefault();
		// 97
		tecladoNumericoTouch('1');
	})
	.on('click', '.teclado2', function (e) {
		e.preventDefault();
		// 98
		tecladoNumericoTouch('2');
	})
	.on('click', '.teclado3', function (e) {
		e.preventDefault();
		// 99
		tecladoNumericoTouch('3');
	})
	.on('click', '.tecladoBorrar', function (e) {
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
	})
	.on('click', '.teclado0', function (e) {
		e.preventDefault();
		// 96
		tecladoNumericoTouch('0');
	})
	.on('click', '.tecladoPunto', function (e) {
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
	}
	);

$(document).on('click', '#btnCancelarFrmPago', function () {
	$PIE.TotalPagar = $PIE.TotalPagar - $FACTURA.Propina;
	$PIE.Anticipo = $PIEORIGINAL.Anticipo;
	$FACTURA.Propina = 0;
	$FACTURA.PropinaAnticipo = 0;
	$FACTURA.FormaPago = {};
	$FACTURA.CortesiaId = null;
	CruzaAnticipo = false;
	DTtblFormaPago.clear().columns.adjust().draw();
	$('#frmFormaBase').val(0);
	$('#frmValorBase').val(0);
	$('#frmFormaPendiente').val(parseFloat($PIE.TotalPagar));
	$('#frmValorPendiente').val(parseFloat($PIE.TotalPagar));
	calcularPIE();
});

$(document).on('click', '#btnAgregarTercero', function (e) {
	e.preventDefault();
	DTCuentaValor.row.add({
		'0': `<input type="text" class="inputCuentaValor form-control" style="min-width: 100px;" data-db="terceroid" maxlength="30" data-foranea="Tercero" data-foranea-codigo="terceroid">`
		, '1': `<input type="text" class="inputCuentaValor form-control" style="min-width: 250px;" readonly>
		<select class="form-control d-none w-100">
		</select>`
		, '2': `<input type="text" class="inputCuentaValor form-control numero" style="min-width: 100px;" text-right value="` + parseFloat(($('#frmValorPendiente').val()).replace(/,/g, '')) + `">`
		, '3': `<div class="input-group mb-3">
				<div class="input-group-prepend">
					<div class="input-group-text">
						<input class="aplicaPropina" type="checkbox" disabled data-toggle="tooltip" title="Aplica propina" aria-label="Aplica propina">
					</div>
				</div>
				<select class="inputCuentaValor form-control" style="min-width: 250px;" disabled>
					<option value="" selected>&nbsp;</option>
				</select>
			</div>`
		, '4': `<center>
				<div class="btn-group btn-group-sm m-2">
					<button type="button" class="guardarTercero btn btn-success" disabled>
						<span class="fas fa-check" title="Guardar Tercero"></span>
					</button>
				</div>
			</center>`
		, '5': "&nbsp;"
		, '6': "&nbsp;"
	}).columns.adjust().draw();
	$('[data-toggle="tooltip"]').tooltip();

	$(this).attr('disabled', true);
}).on('click', '#btnCancelarCuentaValor', function (e) {
	e.preventDefault();
	$FACTURA.FrmPagoValor = [];
}).on('click', '#btnValoresIguales', function (e) {
	e.preventDefault();
	// Revisa el total de registros en las formas de pago compartidas
	let registros = 0;
	let TotalPagar = $PIE.TotalPagar - $FACTURA.Propina;
	//Se deja el faltante para la ultima persona agregarle el adicional faltante
	let FaltantePago = TotalPagar;
	let terceros = [];

	// Resta del total toda forma de pago que sea una propina
	for (var k in $FACTURA.FormaPago) {
		let cont = 0;
		for (var j in $FACTURA.FormaPago[k]) {
			if (j.indexOf('_') == -1) cont++;
		}
		registros += (cont <= 1 ? 1 : cont);
	}

	let contRegistros = 0;
	for (var k in $FACTURA.FrmPagoValor) {
		let data = $FACTURA.FrmPagoValor[k];
		if (typeof data['CodiPagoId'] !== 'undefined') {
			var index = terceros.map(function (e) { return e['TerceroId'] }).indexOf(data.TerceroId);
			if (index == -1) {
				terceros.push({
					TerceroId: data['TerceroId']
					, nombre: data['1']
					, propinaNombre: data['3']
					, CodiPagoId: data['CodiPagoId']
					, codigo: data['0']
				});
			}
			if (!(data['CodiPagoId'].indexOf('_') != -1)) {
				$FACTURA.FrmPagoValor[k].Valor = myRound(TotalPagar / registros);
				if (contRegistros == (registros - 1)) {
					$FACTURA.FrmPagoValor[k].Valor = FaltantePago;
				}
				FaltantePago = myRound((FaltantePago - $FACTURA.FrmPagoValor[k].Valor).toFixed(2));
				$FACTURA.FrmPagoValor[k]['2'] = '<span class="w-100 d-block p-1">' + addCommas2($FACTURA.FrmPagoValor[k].Valor, 2) + '</span>';
				contRegistros++;
			}
		}
	}

	if ($FACTURA['Propina'] > 0) {
		if ($Montaje.DivisionAutomaticaPropina == "S") {
			validarCompartirCuentaValorPropina(terceros, registros, TotalPagar);
		} else {
			alertify.confirm('Advertencia', '¿Desea compartir la propina?', function () {
				validarCompartirCuentaValorPropina(terceros, registros, TotalPagar);
			}, function () {
				let si = false;
				$FACTURA.FrmPagoValor = $FACTURA.FrmPagoValor.filter(function (data) {
					if (data['CodiPagoId'].indexOf('_') != -1) {
						if (!si) {
							si = true;
							let value = $FACTURA.Propina;
							data['Valor'] = value;
							data['2'] = '<span class="w-100 d-block p-1">' + addCommas2(value, 2) + '</span>';
							return true;
						} else {
							return false;
						}
					} else {
						return true;
					}
				});
				validarCompartirCuentaValor();
			});
		}
	} else {
		validarCompartirCuentaValor();
	}

}).on('click', '#btnAceptarValores', function (e) {
	e.preventDefault();

	var total = 0;

	for (var j in $FACTURA.FormaPago) {
		for (var k in $FACTURA.FormaPago[j]) {
			if (typeof $FACTURA.FormaPago[j][k].Propina !== "undefined") {
				total += $FACTURA.FormaPago[j][k].Propina;
			} else {
				total = parseFloat(total) + parseFloat($FACTURA.FormaPago[j][k].Valor);
			}
		}
	}

	if (total == '' || total == null || isNaN(total)) {
		total = 0;
	}

	total = total.toFixed(2);

	entregado = total;

	$PIE.TotalPagar = parseFloat($PIE.TotalPagar).toFixed(2);

	if ($PIE.TotalPagar == '' || $PIE.TotalPagar == null || isNaN($PIE.TotalPagar) || $PIE.TotalPagar < 0) {
		$PIE.TotalPagar = 0;
	}

	total = parseFloat(total);
	$PIE.TotalPagar = parseFloat($PIE.TotalPagar);

	if (total < $PIE.TotalPagar) {
		alertify.alert('Advertencia', 'Debe regresar y cancelar según el total', function () { });
	} else if (total > $PIE.TotalPagar) {
		let msg = 'El valor cancelado es mayor al de la factura'

		if ($CodiVentIdHotel.MostrarCambioCliente == "S") {
			msg += ', ¿Desea registrar cambio para el cliente?';
			alertify.confirm('Advertencia', msg, function () {
				facturarFormasPago();
			}, function () { });
		} else {
			alertify.alert('Advertencia', msg, function () { });
		}
	} else {
		facturarFormasPago();
	}
});

$(document).on('change', '.inputCuentaValor', function () {
	var datos = [];
	datos[0] = $(this).closest('tr').find('input:eq(0)').val();
	datos[1] = $(this).closest('tr').find('input:eq(1)').val();
	datos[2] = $(this).closest('tr').find('input:eq(2)').val();
	datos[3] = $(this).closest('tr').find('select:eq(0)').val();

	if (datos[0] != '' && datos[3] != '') {
		$(this).closest('tr').find('.guardarTercero').attr('disabled', false);
	} else {
		$(this).closest('tr').find('.guardarTercero').attr('disabled', true);
	}
});

$(window).on('resize', function () {
	DTtblCRUD.columns.adjust().draw();
});

$(document).on('click', 'button', function () {
	ultimoBoton = $(this).attr('id');
});