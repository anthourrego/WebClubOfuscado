let rutaGeneral = base_url() + 'Administrativos/Servicios/FacturasPendientes/';
let tablaSocios;
let numeroFacturaActual = "";
let $FACTURA = {
	FormaPago: {}
	, TotalPagar: 0
	, entregado: 0
	, FacturaId: null
	, TerceroId: null
	, Propina: 0
	, FrmPagoValor: []
	, nombre: ''
};
let contexto = this;
let DTtblFormaPago
	, DTCuentaValor;

// Teclado Numérico Touch
let punto = false,
	click = false;

let $TerceroId = null;

let $PIE = {
	TotalPagar: 0
};
let FormasPago = true;
let FrmPagoValorId = 0;
let firmaTercero = null;
let $CodiVentIdHotel = {};
var formaPago = '';
var CambioPropina = false;
let resolucionElectronicaFac = 0;
let currentFact = '';

alertify.alert().set({
	onclose: function () {
		$(document).find('.ajs-content .DivFormasPago').remove();
		$(document).find('.ajs-footer').removeClass('d-none');
	},
	closable: false
});

alertify.confirm().set({
	closable: false
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
				// $('#ModalCuentaValor').modal('toggle');
				setTimeout(function () {
					alertify.myAlert().destroy();
				}, 500);
			},
			onshow: function () {
				// $('#ModalCuentaValor').modal('toggle');
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
					title: 'Advertencia'
				},
				buttons: [{ text: 'OK', key: 27 }]
			};
		}
	};
});

!alertify.dineroAlert && alertify.dialog('dineroAlert', function factory() {
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
					title: 'Especifique valor entregado por el cliente',
					closable: false
				},
				buttons: [
					{
						text: 'Aceptar',
						key: 27,
						className: alertify.defaults.theme.ok,
					}
				]
			};
		},
		settings: {
			selector: undefined,
			callback: undefined,
		},
		hooks: {
			onclose: function () {
			},
			onshow: function () {
				punto = false;
				$('#dineroInput')
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
					}).val($FACTURA.TotalPagar);

				$(document).find('.ajs-content .tecladoNumerico').remove();
				$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
				setTimeout(function () {
					$('#dineroInput').select();
				}, 300);
			}
		},
		callback: function (closeEvent) {
			var value = $('#dineroInput').val().replace(/,/g, '');
			value = parseFloat(value || 0);

			$FACTURA.entregado = value;
			$(document).find('.ajs-content .tecladoNumerico').remove();

			var cb = this.get('callback')
			if (typeof cb === 'function') {
				var returnValue = cb.call(this, closeEvent);
				if (typeof returnValue !== 'undefined') {
					closeEvent.cancel = !returnValue;
				}
			}
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
						text: 'Aceptar',
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
			},
			onshow: function () {
				$('#propinaFrm:eq(0)').find('#propinaInput').closest('div').removeClass('col-12').addClass('col-4');
				$('#propinaFrm:eq(0)').find('#propinaInput').closest('fieldset').find('div:eq(1)').removeClass('d-none');

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

				$('#propinaFrm:eq(0)').find('#propinaInfoVent').prop('disabled', false).find('option').each(function () {
					$(this).removeClass('d-none');
				}).each(function () {

					let $_activa = $(this).data('activa');
					let $_enventas = $(this).data('enventas');
					let $_enpos = $(this).data('enpos');
					let $_credito = $(this).data('credito');
					let $_controlbbva = $(this).data('controlbbva');
					let $_value = $(this).val().trim();

					if (!($_activa == 'S' && $_enpos == '1')) {
						$(this).addClass('d-none');
					} else {
						// if($_value == '22'){
						if (1 == 2) {
							$(this).addClass('d-none');
						} else {
							// Si es socio activo
							if ($_credito == 'S') {
								if (!firmaTercero) {
									$(this).addClass('d-none');
								} else {
									if ($FACTURA.SocioActivo != null && $FACTURA.TarjetaActiva != null) {
										if ($_controlbbva == 'S' && !firmaTercero) {
											$(this).addClass('d-none');
										} else if ($(this).data('controlbbva') != 'S' && firmaTercero) {
											$(this).addClass('d-none');
										}
									} else {
										if ($_controlbbva == 'S') {
											$(this).addClass('d-none');
										}
										if (!firmaTercero) {
											$(this).addClass('d-none');
										}
									}
								}
							}
						}
					}
				});
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
				value = parseFloat(value);
				if (isNaN(value)) {
					value = 0.00;
				}
				$PIE.TotalPagar -= $FACTURA.Propina;
				$FACTURA.TotalPagar -= $FACTURA.Propina;
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
						dataType: "json",
						data: {
							tabla: "Tercero",
							value: $TerceroId.trim(),
							nombre: "terceroid",
							tblNombre: "nombre"
						},
						async: false,
						success: function (respuesta) {
							if (respuesta[0]['foto'] != null) {
								foto = `<img class="p-1 w-100" alt="" style="object-fit: scale-down;" src="data:image/jpeg;base64,` + respuesta[0]['foto'] + `" height="100px">`;
							}
						}
					});

					var registro = {
						'0': '<span class="w-100 d-block p-1 mb-0">' + $TerceroId.trim() + '</span>' + foto
						, '1': '<span class="w-100 d-block p-1">' + $FACTURA.nombre + '</span>'
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
									FormaPagoTMP.bancoid = $('.alertify:not(.ajs-hidden) .divBancos select').val().trim();
									registro.bancoid = FormaPagoTMP.bancoid;
								}
								if (manejnumer == 'S') {
									FormaPagoTMP.numerdocum = $('.alertify:not(.ajs-hidden) .divDocumento input').val().trim();
									registro.numerdocum = FormaPagoTMP.numerdocum;
								}
								if (fechadocum == 'S') {
									FormaPagoTMP.fechacheq = $('.alertify:not(.ajs-hidden) .divFechaDocum input').val().trim();
									registro.fechacheq = FormaPagoTMP.fechacheq;
								}
								if (manejcuotas == 'S') {
									FormaPagoTMP.cuota = $('.alertify:not(.ajs-hidden) .divManejcuotas input').val().trim();
									registro.cuota = FormaPagoTMP.cuota;
								}

								$FACTURA.FormaPago[$TerceroId]['_' + CodiPagoId] = FormaPagoTMP;
								$FACTURA.FrmPagoValor.push(registro);

								$FACTURA.TotalPagar += value;
								$PIE.TotalPagar += value;

								$('#frmTotalPagar').val($PIE.TotalPagar);
								$('#frmFormaTotalFactura').val($PIE.TotalPagar);
								$('#frmFormaPendiente').val($PIE.TotalPagar);

								$('#frmValorfrmPropina').val($FACTURA.Propina);
								$('#frmValorfrmValor').val($PIE.TotalPagar);
								$('#frmValorTotalFactura').val($PIE.TotalPagar);
								$('#frmValorPendiente').val($PIE.TotalPagar);

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

						$FACTURA.TotalPagar += value;
						$PIE.TotalPagar += value;

						$('#frmTotalPagar').val($PIE.TotalPagar);
						$('#frmFormaTotalFactura').val($PIE.TotalPagar);
						$('#frmFormaPendiente').val($PIE.TotalPagar);

						$("#frmValorfrmPropina").val($FACTURA.Propina);
						$('#frmValorfrmValor').val($PIE.TotalPagar);
						$('#frmValorTotalFactura').val($PIE.TotalPagar);
						$('#frmValorPendiente').val($PIE.TotalPagar);

						if (CambioPropina != true) {
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
					$FACTURA.TotalPagar += value;
					$PIE.TotalPagar += value;

					$('#frmTotalPagar').val($PIE.TotalPagar);
					$('#frmFormaTotalFactura').val($PIE.TotalPagar);
					$('#frmFormaPendiente').val($PIE.TotalPagar);

					$('#frmValorfrmPropina').val($FACTURA.Propina);
					$('#frmValorfrmValor').val($PIE.TotalPagar);
					$('#frmValorTotalFactura').val($PIE.TotalPagar);
					$('#frmValorPendiente').val($PIE.TotalPagar);

					if (CambioPropina != false) {
						delete $FACTURA.FormaPago[$TerceroId][CambioPropina];
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
			} else {
				facturaNoConfirmada($FACTURA.FacturaId, $FACTURA.NroFactura);
				if (CambioPropina != false) {
					actualizarFormasPago();
					$('#ModalFormasPago').modal('toggle');
				}
			}
		}
	}
});

alertify.alert().set({
	onclose: function () {
		$(document).find('.ajs-content .DivFormasPago').remove();
		$(document).find('.ajs-footer').removeClass('d-none');
	},
	closable: false
});

alertify.dialog('myConfirm', function () {
	return {
		setup: function () {
			var settings = alertify.confirm().settings;
			for (var prop in settings)
				this.settings[prop] = settings[prop];
			var setup = alertify.confirm().setup();
			let nombreCredito = 'Crédito';
			if ($CodiCredito.length > 0 && $CodiCredito[0].nombre != '') {
				nombreCredito = $CodiCredito[0].nombre;
			}
			setup.buttons = [
				alertify.confirm().setup().buttons[1]
				, {
					text: 'Efectivo',
					scope: 'auxiliary',
					className: 'btn btn-outline-secondary'
				}
				, {
					text: 'Formas de Pago',
					scope: 'auxiliary',
					className: 'btn btn-outline-secondary btnFormasPago'
				}
				, {
					text: nombreCredito,
					scope: 'auxiliary',
					className: 'btn btn-outline-secondary btnCredito'
				}
				, {
					text: 'Compartir Cuenta Valor',
					scope: 'auxiliary',
					className: 'btn btn-outline-secondary btnCompartirCuentaValor'
				}
			];

			if (
				(!$CodiEfectivo)
				|| ($CodiVentIdHotel.cartera == 'S')
			) {
				let $msg = '';
				if (!$CodiEfectivo) {
					$msg += 'No está definido el Tipo de Pago Efectivo';
				}
				if ($CodiVentIdHotel.cartera == 'S') {
					if ($msg != '') $msg += '<br/><br/>';
					$msg += 'El Tipo de Venta genera datos para Cartera';
				}

				setup.buttons[1].attrs = {
					"data-disabled": true
					, title: $msg
					, "data-html": "true"
					, "data-toggle": "tooltip"
				};
				setup.buttons[1].className = "ajs-button btn btn-outline-secondary btnTooltip tooltip-wrapper disabled"
			}

			if (
				(!FormasPago)
				|| ($CodiVentIdHotel.cartera == 'S')
			) {
				let $msg = '';
				if (!FormasPago) {
					$msg += "El Tipo de Venta no está habilitado para pago por Formas de Pago";
				}
				if ($CodiVentIdHotel.cartera == 'S') {
					if ($msg != '') $msg += '<br/><br/>';
					$msg += 'El Tipo de Venta genera datos para Cartera';
				}

				setup.buttons[2].attrs = {
					"data-disabled": true
					, title: $msg
					, "data-html": "true"
					, "data-toggle": "tooltip"
				};
				setup.buttons[2].className = "ajs-button btn btn-outline-secondary btnTooltip tooltip-wrapper disabled"
			}

			if (
				(!($CodiVentIdHotel.cartera == 'S' || $CodiVentIdHotel.PermiteCredito == 'S'))
				|| (firmaTercero != null && !firmaTercero)
				|| ($CodiCredito.length <= 0)

				|| ($FACTURA.SocioActivo != null && $FACTURA.TarjetaActiva != null && firmaTercero)
			) {
				let $msg = '';
				if ($TIPOCOMERC == 'CLUB' && firmaTercero != null && !firmaTercero) {
					$msg += 'El socio no está autorizado para firmar, sólo puede facturar de contado';
					setTimeout(function () {
						alertify.alert('Advertencia', 'El socio no está autorizado para firmar, sólo puede facturar de contado', function () {
						});
					}, 300);
				}
				if ($CodiCredito.length <= 0) {
					if ($msg != '') $msg += '<br/><br/>';
					$msg += 'No está definido el Tipo de Pago Crédito';
				}
				if ($CodiVentIdHotel.cartera != 'S' && $CodiVentIdHotel.PermiteCredito != 'S') {
					if ($msg != '') $msg += '<br/><br/>';
					$msg += 'El Tipo de Venta no está habilitado para Venta a Crédito';
				}
				if ($FACTURA.SocioActivo != null && $FACTURA.TarjetaActiva != null && firmaTercero) {
					if ($msg != '') $msg += '<br/><br/>';
					$msg += 'Validación BBVA';
				}

				setup.buttons[3].attrs = {
					"data-disabled": true
					, title: $msg
					, "data-html": "true"
					, "data-toggle": "tooltip"
				};
				setup.buttons[3].className = "ajs-button btn btn-outline-secondary btnTooltip tooltip-wrapper disabled"
			}

			if (
				(!FormasPago)
				|| ($CodiVentIdHotel.cartera == 'S')
			) {
				let $msg = '';
				if (
					(!FormasPago)
				) {
					$msg += "El Tipo de Venta no está habilitado para pago por Formas de Pago";
				}
				if ($CodiVentIdHotel.cartera == 'S') {
					if ($msg != '') $msg += '<br/><br/>';
					$msg += 'El Tipo de Venta genera datos para Cartera';
				}

				setup.buttons[4].attrs = {
					"data-disabled": true
					, title: $msg
					, "data-html": "true"
					, "data-toggle": "tooltip"
				};
				setup.buttons[4].className = "ajs-button btn btn-outline-secondary btnTooltip tooltip-wrapper disabled"
			}

			setup.options.title = 'Facturar factura pendiente';
			setup.options.closable = false;
			return setup;
		},
		settings: {
			onefectivo: null
			, onfpago: null
			, oncredito: null
			, oncompartircuenta: null
		},
		main: function (message, efectivo, fpago, credito, compartircuenta) {
			this.message = message;
			this.set("onefectivo", efectivo);
			this.set("onfpago", fpago);
			this.set("oncredito", credito);
			this.set("oncompartircuenta", compartircuenta);
		},
		prepare: function () {
			this.setContent(this.message);
		},
		callback: function (closeEvent) {
			switch (closeEvent.index) {
				case 1:
					if (typeof this.get('onefectivo') === 'function') {
						selfie = this;
						let PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
						if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
							if ($FACTURA.Propina <= 0) {
								$FACTURA.Propina = ($FACTURA.AntesIva * PropinaTarifa) / 100; //((PropinaTarifa / 100) + 1)) / 10);

								$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
								if ($MONTAJE.RedondearPropina == 'S') {
									//Aproximamos a los proximos 50 pesos
									$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
								}

								$PIE.TotalPagar += $FACTURA.Propina;
								$FACTURA.TotalPagar += $FACTURA.Propina;
							}

							alertify
								.propinaAlert($('#propinaFrm')[0], function () {
									returnValue = selfie.get('onefectivo').call(selfie, closeEvent);
									if (typeof returnValue !== 'undefined') {
										closeEvent.cancel = !returnValue;
									}
								})
								.set('selector', 'input[id="propinaInput"]');

							$('#propinaFrm:eq(0)').find('#propinaInfoVent').val('1').prop('disabled', true);
						} else {
							returnValue = selfie.get('onefectivo').call(selfie, closeEvent);
							if (typeof returnValue !== 'undefined') {
								closeEvent.cancel = !returnValue;
							}
						}
					}
					break;
				case 2:
					if (typeof this.get('onfpago') === 'function') {
						selfie = this;
						let PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
						if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
							CambioPropina = false;
							if ($FACTURA.Propina <= 0) {
								$FACTURA.Propina = ($FACTURA.AntesIva * PropinaTarifa) / 100 //((PropinaTarifa / 100) + 1)) / 10);

								$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
								if ($MONTAJE.RedondearPropina == 'S') {
									//Aproximamos a los proximos 50 pesos
									$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
								}

								$PIE.TotalPagar += $FACTURA.Propina;
								$FACTURA.TotalPagar += $FACTURA.Propina;
							}

							alertify.propinaAlert($('#propinaFrm')[0], function () {
								setTimeout(() => {
									actualizarFormasPago();
								}, 0);

								returnValue = selfie.get('onfpago').call(selfie, closeEvent);
								if (typeof returnValue !== 'undefined') {
									closeEvent.cancel = !returnValue;
								}
							}).set('selector', 'input[id="propinaInput"]');
							$('#propinaFrm:eq(0)').find('#propinaInput').closest('div').removeClass('col-4').addClass('col-12');
							$('#propinaFrm:eq(0)').find('#propinaInput').closest('fieldset').find('div:eq(1)').addClass('d-none');
							$('#propinaFrm:eq(0)').find('#propinaInfoVent').val("_").removeClass("d-none");
							//$('#propinaFrm:eq(0)').find('#propinaInfoVent').val($('#propinaFrm:eq(0)').find('#propinaInfoVent option:not(.d-none):eq(0)').val());
						} else {
							returnValue = selfie.get('onfpago').call(selfie, closeEvent);
							if (typeof returnValue !== 'undefined') {
								closeEvent.cancel = !returnValue;
							}
						}
					}
					break;
				case 3:
					if (typeof this.get('oncredito') === 'function') {
						selfie = this;
						let PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
						if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
							if ($FACTURA.Propina <= 0) {
								$FACTURA.Propina = ($FACTURA.AntesIva * PropinaTarifa) / 100; //((PropinaTarifa / 100) + 1)) / 10);

								$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
								if ($MONTAJE.RedondearPropina == 'S') {
									//Aproximamos a los proximos 50 pesos
									$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
								}

								$PIE.TotalPagar += $FACTURA.Propina;
								$FACTURA.TotalPagar += $FACTURA.Propina;
							}

							alertify.propinaAlert($('#propinaFrm')[0], function () {
								returnValue = selfie.get('oncredito').call(selfie, closeEvent);
								if (typeof returnValue !== 'undefined') {
									closeEvent.cancel = !returnValue;
								}
							}).set('selector', 'input[id="propinaInput"]');

							$('#propinaFrm:eq(0)').find('#propinaInfoVent').val('22').prop('disabled', true);
						} else {
							returnValue = selfie.get('oncredito').call(selfie, closeEvent);
							if (typeof returnValue !== 'undefined') {
								closeEvent.cancel = !returnValue;
							}
						}
					}
					break;
				case 4:
					if (typeof this.get('oncompartircuenta') === 'function') {
						selfie = this;
						let PropinaTarifa = parseFloat($CodiVentIdHotel.PropinaTarifa);
						if ($CodiVentIdHotel.Propina == 'S' && PropinaTarifa >= 0) {
							if ($FACTURA.Propina <= 0) {
								$FACTURA.Propina = ($FACTURA.AntesIva * PropinaTarifa) / 100; //((PropinaTarifa / 100) + 1)) / 10);

								$FACTURA.Propina = Math.round(myRound($FACTURA.Propina));
								if ($MONTAJE.RedondearPropina == 'S') {
									//Aproximamos a los proximos 50 pesos
									$FACTURA.Propina = Math.ceil($FACTURA.Propina / 50) * 50;
								}

								$PIE.TotalPagar += $FACTURA.Propina;
								$FACTURA.TotalPagar += $FACTURA.Propina;
							}

							alertify
								.propinaAlert($('#propinaFrm')[0], function () {
									returnValue = selfie.get('oncompartircuenta').call(selfie, closeEvent);
									if (typeof returnValue !== 'undefined') {
										closeEvent.cancel = !returnValue;
									}
								})
								.set('selector', 'input[id="propinaInput"]');

							$('#propinaFrm:eq(0)').find('#propinaInfoVent').val($('#propinaFrm:eq(0)').find('#propinaInfoVent option:not(.d-none):eq(0)').val());
						} else {
							returnValue = selfie.get('oncompartircuenta').call(selfie, closeEvent);
							if (typeof returnValue !== 'undefined') {
								closeEvent.cancel = !returnValue;
							}
						}
					}
					break;
				default:
					facturaNoConfirmada($FACTURA.FacturaId, $FACTURA.NroFactura);
					alertify.confirm().callback.call(this, closeEvent);
					break;
			}
		},
		hooks: {
			onshow: function () {
				$('.btnTooltip').tooltip();
				$('.btnTooltip').each(function () {
					$(this).on('click', function (e) {
						e.stopPropagation();
					});
				});
			}
		}
	}
}, false, 'confirm');

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
		$('.tecladoNumerico').clone().appendTo($($(document).find('.ajs-content'))).removeClass('d-none');
	}
}).set({
	onclose: function () {
		$('#ModalFormasPago').modal('toggle');
		$(document).find('.ajs-content .tecladoNumerico').remove();
	}
});

function abrirCerrarModal(elemento, metodo, elementoAbrir, metodoAbrir) {
	$(elemento).modal(metodo);
	if (elementoAbrir && metodoAbrir) {
		$(elementoAbrir).modal(metodoAbrir);
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

function facturarFactura(row, data, dataIndex) {
	alertify.myConfirm('¿Por cuál método de pago desea facturar la factura seleccionada?'
		, function () {
			// Efectivo
			alertify
				.dineroAlert($('#dineroFrm')[0], function () {

					$FACTURA.entregado = parseFloat($FACTURA.entregado);
					$FACTURA.TotalPagar = parseFloat($FACTURA.TotalPagar);

					if ($FACTURA.entregado < $FACTURA.TotalPagar) {
						alertify.error('Debe ser un valor mayor o igual a ' + addCommas2($FACTURA.TotalPagar, 2));
					} else if ($FACTURA.entregado == $FACTURA.TotalPagar) {
						alertify.confirm('Advertencia', '¿Está seguro de completar la facturación?', function () {
							if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
								$FACTURA.FormaPago[$TerceroId] = {};
							}
							$FACTURA.FormaPago[$TerceroId]['1'] = {
								CodiPagoId: '1'
								, Nombre: 'EFECTIVO'
								, Valor: $FACTURA.entregado
							};
							formaPago = '1';
							facturarFormasPago(true);
						}, function () {
							facturaNoConfirmada($FACTURA.FacturaId, $FACTURA.NroFactura);
						});
					} else {
						let msg = 'El valor cancelado es mayor al de la factura'

						if ($CodiVentIdHotel.MostrarCambioCliente == "S") {
							msg += ', ¿Desea registrar cambio para el cliente?';
						}

						alertify.confirm('Advertencia', msg, function () {
							if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
								$FACTURA.FormaPago[$TerceroId] = {};
							}
							$FACTURA.FormaPago[$TerceroId]['1'] = {
								CodiPagoId: '1'
								, Nombre: 'EFECTIVO'
								, Valor: $FACTURA.entregado
							};
							formaPago = '1';
							facturarFormasPago(true);
						}, function () {
							facturaNoConfirmada($FACTURA.FacturaId, $FACTURA.NroFactura);
						});
					}
				})
				.set('selector', 'input[id="propinaInput"]');

		}
		, function () {
			// Formas de pago
			$('#ModalFormasPago').find('.divCodiPago').each(function () {
				$(this).removeClass('d-none');
			}).each(function () {

				let $_activa = $(this).data('activa');
				let $_enventas = $(this).data('enventas');
				let $_enpos = $(this).data('enpos');
				let $_credito = $(this).data('credito');
				let $_controlbbva = $(this).data('controlbbva');
				let $_value = $(this).find('button').attr('codipagoid').trim();

				if (!($_activa == 'S' && $_enpos == '1')) {
					$(this).addClass('d-none');
				} else {
					// if($_value == '22'){
					if (1 == 2) {
						$(this).addClass('d-none');
					} else {
						// Si es socio activo
						if ($_credito == 'S') {
							if (!firmaTercero) {
								$(this).addClass('d-none');
							} else {
								if ($FACTURA.SocioActivo != null && $FACTURA.TarjetaActiva != null) {
									if ($_controlbbva == 'S' && !firmaTercero) {
										$(this).addClass('d-none');
									} else if ($_controlbbva != 'S' && firmaTercero) {
										$(this).addClass('d-none');
									}
								} else {
									if ($_controlbbva == 'S') {
										$(this).addClass('d-none');
									}
									if (!firmaTercero) {
										$(this).addClass('d-none');
									}
								}
							}
						}
					}
				}
			});
			$('#ModalFormasPago').modal('toggle');
			formaPago = '';
		}
		, function () {
			// Crédito bebé
			let boton = false;
			alertify.confirm('Advertencia', '¿Está seguro de cancelar la factura ' + data['Factura'] + ' a Crédito?', function () {
				boton = true;
			}, function () { }).set('onclose', function () {
				$FACTURA.entregado = $FACTURA.TotalPagar;
				if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
					$FACTURA.FormaPago[$TerceroId] = {};
				}
				$FACTURA.FormaPago[$TerceroId]['22'] = {
					CodiPagoId: '22'
					, Nombre: 'CRÉDITO'
					, Valor: $FACTURA.entregado
				};
				if ($CodiCredito.length > 0 && $CodiCredito[0].nombre != '') {
					$FACTURA.FormaPago[$TerceroId]['22'].Nombre = $CodiCredito[0].nombre;
				}
				formaPago = '22';
				facturarFormasPago(true);
			});
		}
		, function () {
			// Compartir cuenta valor
			$('#ModalCuentaValor').modal('toggle');
			validarCompartirCuentaValor();
			formaPago = '';
		}
	);
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

function facturarFormasPago(efectivo = false) {
	let $TerceroId = $FACTURA.TerceroId;
	if (efectivo == true) {
		if (typeof $FACTURA.FormaPago[$TerceroId] == "undefined") {
			$FACTURA.FormaPago[$TerceroId] = {};
		}
		if (formaPago == '1') {
			$FACTURA.FormaPago[$TerceroId]['1'] = {
				CodiPagoId: '1'
				, Nombre: 'EFECTIVO'
				, Valor: $FACTURA.entregado - $FACTURA.Propina
			};
		} else {
			$FACTURA.FormaPago[$TerceroId]['22'] = {
				CodiPagoId: '22'
				, Nombre: 'CRÉDITO'
				, Valor: $FACTURA.entregado - $FACTURA.Propina
			};
			if ($CodiCredito.length > 0 && $CodiCredito[0].nombre != '') {
				$FACTURA.FormaPago[$TerceroId]['22'].Nombre = $CodiCredito[0].nombre;
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

			rastreoFormasPagoTercero.push(`Confirmación Forma de Pago ${strFormasPago}, Factura ${currentFact}, Tercero ${idTercero}, Vendedor ${$VENDEDOR}, Mesero ${$VENDEDOR}`)
		});
	}

	$.ajax({
		url: base_url() + "Administrativos/Servicios/FacturasPendientes/FacturarEfectivo",
		type: 'POST',
		dataType: "json",
		data: {
			Factura: $FACTURAENV
			, RASTREO: RASTREO('Factura Cuenta Tercero ' + $TerceroId + " FacturaId " + $FACTURA.FacturaId + " Factura " + numeroFacturaActual, 'Facturas Pendientes de Pago')
			, rastreoFormasPagoTercero: JSON.stringify(rastreoFormasPagoTercero)
		},
		success: function (res) {
			if (res.success) {
				var registro = res.msj;
				if (registro[0] == '1') {
					let $CodiVentIdHotel = JSON.parse(registro[4]);

					var strAlerta = 'Felicidades, la cuenta se ha facturado de manera satisfactoria';

					if ($CodiVentIdHotel.MostrarCambioCliente == "S" && registro[3] > 0) {
						strAlerta += `<br/><br/>
								Cambio:
								<input type="text" class="form-control form-control-lg text-right font-weight-bold text-primary" style="font-size: 5rem !important;height: 6rem;" value="$ `+ addCommas2(registro[3], 0) + `" readonly="">
								Total a Pagar:
								<input type="text" class="form-control form-control-lg text-right font-weight-lighter text-secondary" style="font-size: 2rem !important;height: 3rem;" value="$ `+ addCommas2($FACTURA.TotalPagar, 0) + `" readonly="">
								Entregado Cliente:
								<input type="text" class="form-control form-control-lg text-right font-weight-lighter text-secondary" style="font-size: 2rem !important;height: 3rem;" value="$ `+ addCommas2($FACTURA.entregado, 0) + `" readonly="">
							`;
					}

					alertify.alert('Factura: ' + registro[1], strAlerta, function () {
						if (typeof $CodiVentIdHotel.impresion == "undefined" || $CodiVentIdHotel.impresion == null) {
							$CodiVentIdHotel.impresion = 1;
						}

						if (!($CodiVentIdHotel.ImprimirFacturaPagoPendiente == 'S' && $CodiVentIdHotel.NoImprimirAlConfirmarPago == 'S')) {
							let j = 0;
							let strReportes = '?';
							let funcionFactura = 'ImprimirFactura';

							if (resolucionElectronicaFac == 1 && $MONTAJE.POSImprime == 'S') {
								funcionFactura = 'ImprimirFacturaElectronica';
							}

							strReportes += `r${j}=${funcionFactura}/${registro[2]}/${$CodiVentIdHotel.impresion}`;

							if (registro[7].length > 1) {
								let i = 0;
								registro[7].forEach(it => {
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

							/* var winPrint = window.open(base_url() + 'Reportes/imprimirReportes/' + strReportes);
							winPrint.focus(); */
							if (registro[6] == 'S') {
								setTimeout(function () {
									alertify.alert('Solicitud Recogida:', 'Por Favor Solicite Recogida', function () {
										/* Validamos que si es FE, verificamos campo de comprobante */
										if (resolucionElectronicaFac == 1) {
											if ($MONTAJE.POSImprime == 'N') {
												redireccionFactura();
											} else {
												abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
											}
										} else {
											abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
										}
									});
								}, 50);
							} else {
								/* Validamos que si es FE, verificamos campo de comprobante */
								if (resolucionElectronicaFac == 1) {
									if ($MONTAJE.POSImprime == 'N') {
										redireccionFactura();
									} else {
										abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
									}
								} else {
									abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
								}
							}
						} else {

							if (registro[7].length > 1) {
								let j = 0;
								let strReportes = '?';

								let i = 0;

								registro[7].forEach(it => {
									if (i > 0) {
										strReportes += '&';
									}
									strReportes += 'r' + j + i + '=ImprimirComprobantePago/' + registro[2] + '/' + it + '/' + i + '/' + $CodiVentIdHotel.impresion;
									i++;
								});

								if (registro[6] == 'S') {
									setTimeout(function () {
										alertify.alert('Solicitud Recogida:', 'Por Favor Solicite Recogida', function () {
											abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
										});
									}, 50);
								} else {
									abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
								}
							} else if (Object.keys($FACTURA.FormaPago).length > 1) {
								let j = 0;
								let strReportes = '?';

								let i = 0;
								for (x in $FACTURA.FormaPago) {
									if (i > 0) {
										strReportes += '&';
									}
									strReportes += 'r' + j + i + '=ImprimirComprobantePago/' + registro[2] + '/' + x + '/' + i + '/' + $CodiVentIdHotel.impresion;
									i++;
								}

								if (registro[6] == 'S') {
									setTimeout(function () {
										alertify.alert('Solicitud Recogida:', 'Por Favor Solicite Recogida', function () {
											abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
										});
									}, 50);
								} else {
									abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redireccionFactura', null);
								}

							} else {
								location.reload();
							}
						}
					});
				} else if (registro[0] == '2') {
					alertify.alert('Bloqueo Cartera', registro[1]);
				} else {
					alertify.alert('Error', 'Ocurrió un problema al momento de facturar', function () {
						this.destroy();
					});
					return false;
				}
			} else {
				if (res.alerta) {
					alertify.alert('Bloqueo al facturar', res.msj, function () {
						this.destroy();
					});
					return false;
				} else {
					alertify.error(res.msj);
				}
			}
		}
	});
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
	if (ValorPendiente <= 0 && ValorPendientePropina == 0) {
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

function actualizarFormasPago() {
	DTtblFormaPago.clear();
	total = 0;

	for (var k in $FACTURA.FormaPago[$TerceroId]) {
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

//Recortar los números sin redondear
function myRound(num, dec) {
	var exp = Math.pow(10, dec || 2);
	return parseInt(num * exp, 10) / exp;
}

function redireccionFactura() {
	location.reload();
}

function iniciarFacturacion(data, row, dataIndex) {
	alertify.myConfirm().destroy();

	facturarFactura(row, data, dataIndex);

	currentFact = data.Factura.trim();

	$CodiVentIdHotel.PropinaTarifa = parseFloat(data['Propina_Tarifa']);
	$CodiVentIdHotel.Propina = data['Propina'];
	$CodiVentIdHotel.MostrarCambioCliente = data['MostrarCambioCliente'];
	$CodiVentIdHotel.cartera = data['cartera'];
	$CodiVentIdHotel.PermiteCredito = data['PermiteCredito'];

	$FACTURA = {
		FormaPago: {}
		, TotalPagar: 0
		, entregado: 0
		, FacturaId: null
		, NroFactura: null
		, TerceroId: null
		, Propina: 0
		, FrmPagoValor: []
		, Subtotal: 0
		, AntesIva: 0
		, nombre: ''
		, SocioActivo: null
		, TarjetaActiva: null
	};

	$FACTURA.FacturaId = data['FacturaId'];
	$FACTURA.NroFactura = data['Factura'].trim();
	$FACTURA.TerceroId = data['Codigo'];
	$TerceroId = data['Codigo'];
	$FACTURA.TotalPagar = parseFloat(data['Valor']) + parseFloat(data['Propina_Factura']) - parseFloat(data['RetenFuent']) - parseFloat(data['RetenIva']) - parseFloat(data['RetenIca']) - parseFloat(data['descuento']);
	$PIE.TotalPagar = parseFloat(data['Valor']) + parseFloat(data['Propina_Factura']) - parseFloat(data['RetenFuent']) - parseFloat(data['RetenIva']) - parseFloat(data['RetenIca']) - parseFloat(data['descuento']);
	$PIE.IVA = parseFloat(data['IVA']);
	$PIE.RetenFuent = parseFloat(data['RetenFuent']);
	$PIE.RetenIva = parseFloat(data['RetenIva']);
	$PIE.RetenIca = parseFloat(data['RetenIca']);
	$PIE.Descuento = parseFloat(data['descuento']);
	$FACTURA.Propina = parseFloat(data['Propina_Factura']);
	FormasPago = (data['Tipospago'] == 'S');
	firmaTercero = (data['Firma'] == 'S');
	$FACTURA.Subtotal = parseFloat(data['Subtotal']);
	$FACTURA.nombre = data['Nombre_Cliente'];
	$FACTURA.SocioActivo = data['SocioActivo'];
	$FACTURA.AntesIva = parseFloat(data['AntesIVA']);
	$FACTURA.TarjetaActiva = data['TarjetaActiva'];

	$('#frmFormaTotalFactura').val($PIE.TotalPagar);
	$('#frmFormaIVAFactura').val($PIE.IVA);
	$('#frmFormaPendiente').val($PIE.TotalPagar);

	$('#frmValorfrmValor').val($PIE.TotalPagar);
	$('#frmValorTotalFactura').val($PIE.TotalPagar);
	$('#frmValorIVAFactura').val($PIE.IVA);
	$('#frmValorBase').val(0);
	$('#frmValorPendiente').val($PIE.TotalPagar);
	
	numeroFacturaActual = data['Factura'];

	resolucionElectronicaFac = data.ResolFE;
	
	facturarFactura(row, data, dataIndex);
}

const facturaNoConfirmada = (facturaId, NroFactura) => {
	$.ajax({
		url: rutaGeneral + "facturaNoConfirmada",
		type: 'POST',
		dataType: "json",
		data: {
			facturaId,
			RASTREO: RASTREO(`No se definen la formas de pago de la factura ${NroFactura.trim()} con factura id ${facturaId}`, 'Facturas Pendientes')
		},
		success: (data) => {
			if (!data.success) {
				alertify.error(data.msj);
			}
		}
	});
} 

$(function(){
	RastreoIngresoModulo('Facturas Pendientes');

	tablaSocios = $("#tblCRUD").DataTable({
		ajax: {
			url: rutaGeneral + "DTSocio",
			type: 'POST',
			data: function (d) {
				return $.extend(d, { ALMACENACTUAL: $ALMACENACTUAL, VENDEDOR: $VENDEDOR });
			}
		},
		columns: [
			{ data: "Factura" },
			{ data: "Nombre_Habitacion" },
			{
				data: "Valor",
				className: "valor text-right",
				render: function (row, type, data) {
					return addCommas2((parseFloat(data['Valor']) + parseFloat(data['Propina_Factura']) - parseFloat(data['RetenFuent']) - parseFloat(data['RetenIva']) - parseFloat(data['RetenIca']) - parseFloat(data['descuento'])), 2);
				}
			},
			{ data: "Codigo" },
			{ data: "Nombre_Cliente" },
			{ 
				data: "CodigoANombreDe", 
				visible: ($TIPOCOMERC == 'CLUB' ? true : false)
			},
			{ 
				data: "ANombreDe",
				visible: ($TIPOCOMERC == 'CLUB' ? true : false) 
			},
			{ data: "Fecha" },
			{
				data: "Accion",
				visible: ($TIPOCOMERC == 'CLUB' ? true : false)
			},
			{ data: "Barra" },
			{ data: "Mesa" },
			{ data: "Vendedor" },
			{ data: "Almacén" },
			{ data: "cartera" },
			{ data: "PermiteCredito" },
			{ 
				data: "RespuestasWPP", 
				className: 'RespuestasWPP',
				visible: ($MONTAJE.WhatsAppFactura == 'S' ? true : false)
			}
		],
		language,
		processing: true,
		serverSide: true,
		order: [[0, 'ASC']],
		draw: 10,
		fixedColumns: true,
		pageLength: 15,
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { title: 'Web_Club' } }
		],
		scrollY: $(document).height() - 480,
		scrollX: true,
		scroller: {
			loadingIndicator: true
		},
		scrollCollapse: true,
		dom: domBftr,
		columnDefs: [
			{ visible: ($TIPOCOMERC == 'CLUB' ? true : false), targets: [8] }
		],
		createdRow: function (row, data, dataIndex) {
			if ($MONTAJE.WhatsAppFactura == 'S') {
				if (data.InicaProcesoWPP == 'S' && data.PendienteProcesoWPP == 'S'){
					$(row).addClass("table-danger");
				 } else if (data.InicaProcesoWPP == 'S') {
					$(row).addClass("table-warning");
				}
			}

			$(row).on('click', function () {
				$.ajax({
					type: "POST",
					dataType: "json",
					data: {idFactura: data.FacturaId},
					url: rutaGeneral + "facturaWPP",
					async: false,
					success: (resp) => {
						data.InicaProcesoWPP = resp.InicaProcesoWPP;
						data.PendienteProcesoWPP = resp.PendienteProcesoWPP;
						data.RespuestasWPP = resp.RespuestasWPP;
						data.pendiente = resp.pendiente;
						data.Estado = resp.Estado;
					}
				});

				if ($MONTAJE.WhatsAppFactura == 'S') $(row).find(".RespuestasWPP").text(data.RespuestasWPP);

				if (data.pendiente != "S") {
					alertify.alert('Advertencia', `La factura <strong>${data.Factura}</strong> ya se encuentra facturada.`);
					tablaSocios.ajax.reload();
					return;
				}

				if (data.Estado == "NU") {
					alertify.alert('Advertencia', `La factura <strong>${data.Factura}</strong> se encuentra anulada.`);
					tablaSocios.ajax.reload();
					return;
				}

				if (data.InicaProcesoWPP == 'S' && data.PendienteProcesoWPP == 'S') {
					if ($MONTAJE.WhatsAppFactura == 'S') $(row).addClass("table-danger");
					abrirCerrarModal("#modal-solicitar-usuario", "show");
					$("#formDataAdmin").unbind().submit(function (e) {
						e.preventDefault();
						/* Vamos a validar el usuario ingresado para permisos de administrador */
						if ($(this).valid()) {
							let $fills = $("#formDataAdmin input"), datos = {};
							$.each($fills, (pos, input) => {
								const name = $(input).attr("name");
								datos[name] = $(input).val();
							});
							datos['permiso'] = 2609;
							datos["RASTREO"] = RASTREO(`Accede a facturar en proceso de WhatsApp la factura ${data.Factura.trim()} con el usuario ${datos['usuarioid']}`, 'Facturas Pendientes');

							datos = $.Encriptar(datos);

							$.ajax({
								url: rutaGeneral + 'validarUsuario',
								type: 'POST',
								dataType: 'json',
								data: {
									encriptado: datos
								},
								success: (resp) => {
									resp = JSON.parse($.Desencriptar(resp));
									$("#formDataAdmin")[0].reset();
									$("#formDataAdmin :input").removeClass('is-invalid');
									$("#formDataAdmin").validate().resetForm();
	
									if (resp.valido) {
										alertify.success(resp.mensaje);
										abrirCerrarModal('#modal-solicitar-usuario', 'hide');
										iniciarFacturacion(data, row, dataIndex);
									} else if (!resp.valido) {
										alertify.error(resp.mensaje);
									} else {
										alertify.error(resp.mensaje);
										abrirCerrarModal('#modal-solicitar-usuario', 'hide');
									}
								}
							});
						} else {
							alertify.error("Validar la información de los campos");
						}
					});
				} else if (data.InicaProcesoWPP == 'S') {
					if ($MONTAJE.WhatsAppFactura == 'S') $(row).addClass("table-warning");
					alertify.alert('Advertencia', `La factura <strong>${data.Factura}</strong> no se puede confirmar ya que inició el proceso de whatsapp.`);
				} else {
					iniciarFacturacion(data, row, dataIndex);
				}

			});
		},
		initComplete: function (settings, json) {
			showTableColumns($TIPOCOMERC == 'CLUB' ? [6] : []);
		}
	});

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
		dom: 'tri',
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

											var $tblID = '#tblBusqueda';
											$($tblID).DataTable({
												ajax: {
													url: base_url() + "Administrativos/Servicios/EstadoCuenta/DTBuscarAccionTercero",
													type: 'POST'
												},
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
												initComplete: function () {
													setTimeout(function () {
														$('div.dataTables_filter input').focus();
													}, 500);
													$('div.dataTables_filter input')
														.unbind()
														.change(function (e) {
															e.preventDefault();
															table = $("body").find($tblID).dataTable();
															table.fnFilter(this.value);
														});
												},
												oSearch: { sSearch: value },
												createdRow: function (row, data, dataIndex) {
													$(row).click(function () {
														$(selfie).val(data[0]).change();
														alertify.myAlert().close();
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
											.closest(".input-group").find(".aplicaPropina").prop("checked", false).prop('disabled', false);;

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
															if ($(selfie).find('option:selected').data('socioactivo') != '' && $(selfie).find('option:selected').data('tarjetaactiva') != '') {
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
										// if(($(this).data('credito') == 'S' && respuesta[0]['Firma'] != 'S') || $(this).attr('value') == '22'){
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
					setTimeout(function () {
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
						/*alertify.error('Por favor digite un valor mayor a 0');
						setTimeout(() => {
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
								registro.bancoid = $('.alertify:not(.ajs-hidden) .divBancos select').val().trim();
								FormaPagoTMP.bancoid = registro.bancoid;

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
								registro.numerdocum = $('.alertify:not(.ajs-hidden) .divDocumento input').val().trim();
								FormaPagoTMP.numerdocum = registro.numerdocum;

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
								registro.fechacheq = $('.alertify:not(.ajs-hidden) .divFechaDocum input').val().trim();
								FormaPagoTMP.fechacheq = registro.fechacheq;

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
								registro.cuota = $('.alertify:not(.ajs-hidden) .divManejcuotas input').val().trim();
								FormaPagoTMP.cuota = registro.cuota;

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
								alertify.myAlert2('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
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
						alertify.myAlert2('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
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
		dom: 'tri',
		createdRow: function (row, data, dataIndex) {
			$(row).find('td:eq(1)').html(addCommas2(data[2], 2));
			if (data[0].indexOf('_') != -1) {
				$(row).addClass('rowPropinilla');
			}
		}
	});

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
				$('#ModalFormasPago').modal('toggle');
			}).set('selector', 'input[id="propinaInput"]');

			if (CambioPropina == '__' || CambioPropina == false) {
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
									alertify.myAlert2('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
								}
							}
						);

						$('.DivFormasPago').clone().appendTo('.alertify:not(.ajs-hidden) .ajs-content').removeClass('d-none').on('submit', function (e) {
							e.preventDefault();
							$('.alertify:not(.ajs-hidden) .ajs-footer button').click();
						});

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
							alertify.myAlert2('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
						}
					}
				} else {
					delete $FACTURA.FormaPago[$TerceroId][CodiPagoId];

					actualizarFormasPago();
					alertify.success('Forma de Pago eliminada satisfactoriamente');
					if (validaAlertaFormaPago) {
						alertify.myAlert2('<h5 class="alert alert-warning mb-0">El valor digitado supera el total pendiente de pago, por ende este se ajusta automáticamente.</h5>');
					}
				}
			}, function () {

			});
	});

	$('.numero').inputmask('tres', {
		rightAlign: false,
		maxLength: 10,
		digits: 2
	});

	$('#submitFormaPago').click(function (e) {
		e.preventDefault();
		var total = 0;

		for (var j in $FACTURA.FormaPago) {
			for (var k in $FACTURA.FormaPago[j]) {
				total = parseFloat(total) + parseFloat($FACTURA.FormaPago[j][k].Valor);
				if (typeof $FACTURA.FormaPago[j][k].Propina !== "undefined") {
					total += $FACTURA.FormaPago[j][k].Propina;
				}
			}
		}

		if (total == '' || total == null || isNaN(total)) {
			total = 0;
		}

		total = total.toFixed(2);

		$FACTURA.entregado = parseFloat(total);

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
			}

			alertify.confirm('Advertencia', msg, function () {
				facturarFormasPago();
			}, function () { });
		} else {
			facturarFormasPago();
		}
	});
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

$(document).on('shown.bs.modal', function () {
	DTtblFormaPago.columns.adjust().draw();
	$('#divTblCuentaValor').find('.dataTables_scrollBody').css('height', 400);
	DTCuentaValor.columns.adjust().draw();
});

$(document).on('click', '#btnCancelarFrmPago', function () {
	facturaNoConfirmada($FACTURA.FacturaId, $FACTURA.NroFactura);
	$FACTURA.FormaPago = {};
	DTtblFormaPago.clear().columns.adjust().draw();
	$('#frmFormaBase').val(0);
	$('#frmValorBase').val(0);
	$('#frmFormaPendiente').val(0);
	$('#frmValorPendiente').val(0);
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
	facturaNoConfirmada($FACTURA.FacturaId, $FACTURA.NroFactura);
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
		if ($MONTAJE.DivisionAutomaticaPropina == "S") {
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
			total = parseFloat(total) + parseFloat($FACTURA.FormaPago[j][k].Valor);
			if (typeof $FACTURA.FormaPago[j][k].Propina !== "undefined") {
				total += $FACTURA.FormaPago[j][k].Propina;
			}
		}
	}

	if (total == '' || total == null || isNaN(total)) {
		total = 0;
	}

	total = total.toFixed(2);

	$FACTURA.entregado = total;

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