let rutaGeneral = base_url() + 'Administrativos/Eventos/Eventos/';
let usuariosFacturar = [];
let socios = [];
let sociosEvento = [];
let productoSeleccionado = null;
let invitadosIngresar = [];

$FACTURA = {
	observacion: '',
	anotacion: '',
	FormaPago: {},
	dctoValor: 0,
	dctoPorcentaje: 0,
	MeseroId: null,
	FrmPagoValor: [],
	CortesiaId: null,
	Propina: 0,
	entregado: 0,
	VendedorId: $DATOSVENDEDOR.vendedorid,
};
let productosValidosFactura = [];
$VALORESFAC = {
	TotalPagar: 0,
	TotalFacturado: 0,
	TotalIva: 0
}
let resolucion = '';
let TerceroFactura = {
	TerceroId: null,
	Firma: '',
	AccionId: null
};
let contexto = this;
let tipoVentaActual = {};

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
					title: 'Búsqueda'
				}
			};
		},
		hooks: {
			onclose: function () {
				setTimeout(function () {
					alertify.myAlert().destroy();
				}, 1000);
			}
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

function limpiarContenido(element){
	while (element.lastChild) {
			element.removeChild(element.lastChild);
	}
}

alertify.cantAcomp || alertify.dialog('cantAcomp', function () {
	var input = document.createElement('INPUT');
	var p = document.createElement('P');
	return {
			main: function (_title, _message, _value, _onok, _oncancel) {
					var title, message, value, onok, oncancel;
					switch (arguments.length) {
					case 1:
							message = _title;
							break;
					case 2:
							message = _title;
							value = _message;
							break;
					case 3:
							message = _title;
							value = _message;
							onok = _value;
							break;
					case 4:
							message = _title;
							value = _message;
							onok = _value;
							oncancel = _onok;
							break;
					case 5:
							title = _title;
							message = _message;
							value = _value;
							onok = _onok;
							oncancel = _oncancel;
							break;
					}
					this.set('title', title);
					this.set('message', message);
					this.set('value', value);
					this.set('onok', onok);
					this.set('oncancel', oncancel);
					return this;
			},
			setup: function () {
					return {
							buttons: [
									{
											text: alertify.defaults.glossary.ok,
											key: 13,
											className: alertify.defaults.theme.ok,
									},
									{
											text: alertify.defaults.glossary.cancel,
											key: 27,
											invokeOnClose: true,
											className: alertify.defaults.theme.cancel,
									}
							],
							focus: {
									element: input,
									select: true
							},
							options: {
									maximizable: false,
									resizable: false
							}
					};
			},
			build: function () {
					input.className = alertify.defaults.theme.input;
					input.setAttribute('type', 'text');
					input.value = this.get('value');
					this.elements.content.appendChild(p);
					this.elements.content.appendChild(input);
			},
			prepare: function () {
					//nothing
			},
			setMessage: function (message) {
					if (typeof message === 'string') {
						limpiarContenido(p);
						p.innerHTML = message;
					} else if (message instanceof window.HTMLElement && p.firstChild !== message) {
						limpiarContenido(p);
						p.appendChild(message);
					}
			},
			settings: {
					message: undefined,
					labels: undefined,
					onok: undefined,
					oncancel: undefined,
					value: '',
					type:'text',
					reverseButtons: undefined,
			},
			settingUpdated: function (key, oldValue, newValue) {
					switch (key) {
					case 'message':
							this.setMessage(newValue);
							break;
					case 'value':
							input.value = newValue;
							break;
					case 'type':
							switch (newValue) {
							case 'text':
							case 'color':
							case 'date':
							case 'datetime-local':
							case 'email':
							case 'month':
							case 'number':
							case 'password':
							case 'search':
							case 'tel':
							case 'time':
							case 'week':
									input.type = newValue;
									break;
							default:
									input.type = 'text';
									break;
							}
							break;
					case 'labels':
							if (newValue.ok && this.__internal.buttons[0].element) {
									this.__internal.buttons[0].element.innerHTML = newValue.ok;
							}
							if (newValue.cancel && this.__internal.buttons[1].element) {
									this.__internal.buttons[1].element.innerHTML = newValue.cancel;
							}
							break;
					case 'reverseButtons':
							if (newValue === true) {
									this.elements.buttons.primary.appendChild(this.__internal.buttons[0].element);
							} else {
									this.elements.buttons.primary.appendChild(this.__internal.buttons[1].element);
							}
							break;
					}
			},
			callback: function (closeEvent) {
					var returnValue;
					switch (closeEvent.index) {
					case 0:
							this.settings.value = input.value;
							if (typeof this.get('onok') === 'function') {
									returnValue = this.get('onok').call(this, closeEvent, this.settings.value);
									if (typeof returnValue !== 'undefined') {
											closeEvent.cancel = !returnValue;
									}
							}
							break;
					case 1:
							if (typeof this.get('oncancel') === 'function') {
									returnValue = this.get('oncancel').call(this, closeEvent);
									if (typeof returnValue !== 'undefined') {
											closeEvent.cancel = !returnValue;
									}
							}
							if(!closeEvent.cancel){
									input.value = this.settings.value;
							}
							break;
					}
			}
	};
});

function reiniciarDatos() {
	usuariosFacturar = [];
	socios = [];
	sociosEvento = [];
	invitadosIngresar = [];
	productoSeleccionado = null;
	$("#nroAccion").closest(".input-group").find(".input-group-text").text("Acción");
	$("#terceroFactura").empty().append(`<option value="" disabled selected>Seleccione una opción</option>`);
	$("#contenedorBeneficiarios, #contenedorInvitados").empty().append(`<div class='col-12 d-none noDisponible'>
			<div class='alert alert-secondary text-center'>
				<h5 class='mb-0'>No se han encontrado resultados</h5>
			</div>
		</div>`);

	$("#btnIngresarEvento, #btnCargarInvitados").closest("div").removeClass("d-none");
	$("#nroAccion, #btnFacturarEvento, #bntCancelar, #btnAgregarInvitado, #buscarBeneficiarios, #buscarInvitados, #terceroFactura, #Beneficiarios, #Invitados, #btnIngresarEvento").val('').prop("disabled", true);
	$("#productosfacturarTotal").text('');
	$("#productosFacturarLista").empty();
	$("#productosFacturar").addClass("d-none");
	$("#productosFacturarNoResultados, .ocultarIngreso").removeClass("d-none");
	$("#collapseBeneficiarios, #collapseInvitados").removeClass("show");
	$("#Beneficiarios").removeClass("d-none").addClass("d-flex");

	$PRODUCTOSFACTURAR.forEach(it => {
		it.Terceros = [];
	});
}

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

function calcularValorProductos() {
	let cantTerceros = 0;
	let totalFacturar = 0;
	let totlaIVA = 0;

	$("#productosFacturarLista").empty();
	//validamos si dentro de los productos a facturar ya se seleccionaron terceros
	$PRODUCTOSFACTURAR.forEach(it => {
		let cant = it.Terceros == undefined ? 0 : it.Terceros.length;
		let Total = 0;
		let mostrarValor = '';
		if (cant > 0) {
			Total = cant * it.ValorOriginal;
			Total = calcularIva(it.ivaid, Total);
			totalFacturar += Total.Valor;
			totlaIVA += Total.ivan
			mostrarValor = addCommas2(Math.round(myRound(Total.Valor)));
			$("#productosFacturarLista").append(`
				<div class="col-7 font-weight-bold text-truncate pl-1" title="${it.NombreProducto}">${it.NombreProducto}</div>
				<div class="col-2 font-weight-bold text-truncate" title="${cant}">${cant}</div>
				<div class="col-3 font-weight-bold text-right pr-1 text-truncate" title="${mostrarValor}">${mostrarValor}</div>
				<div class="col-12">
					<hr class="my-1">
				</div>`);
		}

		cantTerceros += cant;
	});

	if (cantTerceros > 0) {
		$("#btnFacturarEvento").prop("disabled", false);
		$("#productosFacturarNoResultados").addClass("d-none");
		$("#productosFacturar").removeClass("d-none");
		$("#productosfacturarSubTotal").text(addCommas2(Math.round(myRound(totalFacturar - totlaIVA))));
		$("#productosfacturarIVA").text(addCommas2(Math.round(myRound(totlaIVA))));
		$("#productosfacturarTotal").text(addCommas2(Math.round(myRound(totalFacturar))));
	} else {
		$("#btnFacturarEvento").prop("disabled", true);
		$("#productosFacturarNoResultados").removeClass("d-none");
		$("#productosFacturar").addClass("d-none");
	}
}

function validacionesEventos(socio) {
	let valid = {
		"success": true,
		"msj": ""
	};

	if ($DATOSEVENTO.EdadMaxima != null && $DATOSEVENTO.EdadMinima != null) {
		if (!(socio.Edad >= $DATOSEVENTO.EdadMinima) || !(socio.Edad <= $DATOSEVENTO.EdadMaxima)) {
			valid.success = false;
			valid.msj = "No se encuentra en el rango de edades permitido";
		}
	} else if ($DATOSEVENTO.EdadMaxima != null) {
		//Se valida la edad maxima
		if (socio.Edad > $DATOSEVENTO.EdadMaxima) {
			valid.success = false;
			valid.msj = "Ha superado la edad máxima permitida";
		}
	} else if ($DATOSEVENTO.EdadMinima != null) {
		//Se valida la edad minima
		if (socio.Edad < $DATOSEVENTO.EdadMinima) {
			valid.success = false;
			valid.msj = "Es menor la edad miníma permitida";
		}
	}

	return valid;
}

//Recortar los números sin redondear
function myRound(num, dec) {
	var exp = Math.pow(10, dec || 2);
	return parseInt(num * exp, 10) / exp;
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

function obtenerInformacion(data, metodoBack, funcion) {
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: 'POST',
		data: data,
		dataType: "json",
		success: (resp) => {
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
			}
		}
	});
}

function dataTipoVenta({ datos }) {
	if (datos) {
		tipoVentaActual = datos;
	} else {
		alertify.warning("No ha seleccionado el tipo de venta");
		redirigirEventos(false, false);
	}
}

function redirigirEventos(directo = false, recargar = true) {
	if (directo) {
		if (recargar) {
			location.reload();
		} else {
			location.href = rutaGeneral
		}
		return;
	}
	setTimeout(() => {
		if (recargar) {
			location.reload();
		} else {
			location.href = rutaGeneral
		}
	}, 1000);
}

function validarResoluciones({ datos, dataFactura }) {
	let resolValida = true;
	if (tipoVentaActual.cartera == 'S') {
		resolucion = 'Credito';
		if (datos.resolucionCredi == null) {
			resolucion = '';
		} else if (datos.resolucionCredi.BloqueoFecha == 1) {
			resolValida = false;
			alertify.alert('Alerta', 'Debe habilitar su Resolución de Facturación Crédito, ésta ya ha vencido', function () {
				redirigirEventos();
			});
		} else if (datos.resolucionCredi.AvisoFactura == 1) {
			alertify.alert('Alerta', 'La Resolución de Facturación está próxima a vencer, se está agotando la numeración autorizada', function () { });
		} else if (datos.resolucionCredi.BloqueoFactura == 1) {
			resolValida = false;
			alertify.alert('Alerta', 'Debe habilitar su Resolución de Facturación, se agotó la numeración de facturación', function () {
				redirigirEventos();
			});
		}
	}

	if (resolucion == '') {
		if (datos.resolucion == null) {
			resolValida = false;
			alertify.alert('Alerta', 'Debe habilitar su Resolución de Facturación', function () {
				redirigirEventos();
			});
		} else if (datos.resolucion.BloqueoFecha == 1) {
			resolValida = false;
			alertify.alert('Alerta', 'Debe habilitar su Resolución de Facturación, ésta ya ha vencido', function () {
				redirigirEventos();
			});
		} else if (datos.resolucion.BloqueoFactura == 1) {
			resolValida = false;
			alertify.alert('Alerta', 'Debe habilitar su Resolución de Facturación, se agotó la numeración de facturación', function () {
				redirigirEventos();
			});
		} else if (datos.resolucion.AvisoFactura == 1) {
			alertify.alert('Alerta', 'La Resolución de Facturación está próxima a vencer, se está agotando la numeración autorizada', function () { });
		}
	}

	if (resolValida) {
		if (!$PRODUCTOSFACTURAR.filter(x => x.Terceros && x.Terceros.length).length) {
			return alertify.warning("No se encontraron personas asignadas al evento");
		}

		$VALORESFAC.TotalIva = 0;
		$VALORESFAC.TotalFacturado = 0;
		productosValidosFactura = $PRODUCTOSFACTURAR.filter(x => x.Terceros && x.Terceros.length).map(op => {
			let Valor = (+op.ValorOriginal * op.Terceros.length);
			let calculos = calcularIva(op.ivaid, Valor);

			op.Iva = calculos.ivan;
			op.Valor = calculos.Valor;
			$VALORESFAC.TotalIva += op.Iva;
			$VALORESFAC.TotalFacturado += Valor;
			op.TerceroId = TerceroFactura.TerceroId;
			op.TerceroIdC = TerceroFactura.TerceroId;
			op.AccionId = TerceroFactura.AccionId;
			op.VendedorId = $FACTURA.VendedorId;
			op.AlmacenId = $DATOSALMACEN.almacenid;
			op.ProductoId = op.ProductoId;
			op.Cantidad = op.Terceros.length;
			op.IvaId = op.ivaid;
			op.PreciPubli = op.ValorOriginal;
			op.UsuarioId = $USUARIOID;
			op.AlmacenIdI = $DATOSALMACEN.almacenid;
			return op;
		});
		$VALORESFAC.TotalPagar = $VALORESFAC.TotalFacturado; //+ $VALORESFAC.TotalIva

		TerceroFactura.Firma = dataFactura.tercero.Firma;
		$("#ModalFormasPago").load(`${base_url()}Administrativos/FormasPago/FormasPago`, {
			dataReserva: {
				almacen: $DATOSALMACEN.almacenid,
				Firma: TerceroFactura.Firma,
				SocioActivo: dataFactura.tercero.SocioActivo,
				TarjetaActiva: dataFactura.tercero.TarjetaActiva,
				CodiVentId: tipoVentaActual.codiventid,
				TerceroId: TerceroFactura.TerceroId,
				FormasPago: $FACTURA.FormaPago[TerceroFactura.TerceroId],
				TotalPagar: $VALORESFAC.TotalPagar.toFixed(2),
				TotalFacturado: $VALORESFAC.TotalFacturado.toFixed(2),
				TotalIva: $VALORESFAC.TotalIva.toFixed(2),
				TipoAcceso: 'Evento',
				FuncionRetorno: 'formaPagoAplicada',
			}
		}, function () {
			$("#ModalFormasPago").modal('show');
		});
	}
}

function facturarEvento() {
	let pendiente = false;
	$.ajax({
		url: rutaGeneral + "facturarCuenta",
		type: 'POST',
		dataType: "json",
		data: {
			TerceroId: TerceroFactura.TerceroId
			, AlmacenId: $DATOSALMACEN.almacenid
			, VendedorId: $FACTURA.VendedorId
			, codiventid: tipoVentaActual.codiventid
			, entregado: $FACTURA.entregado
			, TotalPagar: $VALORESFAC.TotalPagar
			, personasEventos: sociosEvento
			, evento: $DATOSEVENTO

			/* DATOS PENDIENTES PARA LA FACTURA PERO NO SE HAN VALIDADO */
			, RF: 0
			, RI: 0
			, RC: 0
			, IM: 0
			, TariReteId: '' // $PIEORIGINAL.TariReteId
			, TarifaICA: 0 // $PIEORIGINAL.TarifaICA
			, TarifRetIv: 0 // $PIEORIGINAL.TarifRetIv
			, TariRete: 0 // $PIEORIGINAL.TariRete

			, ImpoConsumo: 0
			, BaseGravada: $VALORESFAC.TotalFacturado
			, observasao: {}
			, IVA: $VALORESFAC.TotalIva
			, resolucion: resolucion
			, Factura: $FACTURA
			, MesaId: null
			, selecciones: []
			, pendiente: pendiente
			, AccionPedido: TerceroFactura.AccionId
			, reactivarConsumo: 'false'
			, AlmacenNoFisico: 'N'
			, consumos: []
			, extraRastreo: `Tercero ${TerceroFactura.TerceroId} Vendedor ${$FACTURA.VendedorId}`
			, consumosEventos: productosValidosFactura
			, eventoid: $FACTURA.ReservaEvento
			, RASTREO: RASTREO(`Factura Evento Tercero ${TerceroFactura.TerceroId}`, 'Eventos')
		},
		success: function (res) {
			if (res.success) {
				var registro = res.msj;
				if (registro[0] == '1') {
					if ((pendiente == false) || (pendiente == true && tipoVentaActual.ImprimirFacturaPagoPendiente == 'S')) {
						var strAlerta = 'Felicidades, ';
						if (pendiente == false) {
							strAlerta += 'la cuenta se ha facturado de manera satisfactoria';
						} else {
							strAlerta += 'la cuenta se ha dejado pendiente y la factura se ha generado de manera satisfactoria';
						}
						if (tipoVentaActual.MostrarCambioCliente == "S" && registro[3] > 0) {
							strAlerta += `<br/><br/>
								Cambio:
								<input type="text" class="form-control form-control-lg text-right font-weight-bold text-primary" style="font-size: 5rem !important;height: 6rem;" value="$ `+ addCommas2(registro[3], 0) + `" readonly="">
								Total a Pagar:
								<input type="text" class="form-control form-control-lg text-right font-weight-lighter text-secondary" style="font-size: 2rem !important;height: 3rem;" value="$ `+ addCommas2($VALORESFAC.TotalPagar, 0) + `" readonly="">
								Entregado Cliente:
								<input type="text" class="form-control form-control-lg text-right font-weight-lighter text-secondary" style="font-size: 2rem !important;height: 3rem;" value="$ `+ addCommas2(entregado, 0) + `" readonly="">
							`;
						}

						alertify.alert('Factura: ' + registro[1], strAlerta, function () {
							if (typeof tipoVentaActual.impresion == "undefined" || tipoVentaActual.impresion == null) {
								tipoVentaActual.impresion = 1;
							}
							let j = 0;
							let strReportes = '?';

							strReportes += 'r' + j + '=ImprimirFactura/' + registro[2] + '/' + tipoVentaActual.impresion;

							if (Object.keys($FACTURA.FormaPago).length > 1) {
								let i = 0;
								for (x in $FACTURA.FormaPago) {
									strReportes += '&';
									strReportes += 'r' + j + i + '=ImprimirComprobantePago/' + registro[2] + '/' + x + '/' + i + '/' + tipoVentaActual.impresion;
									i++;
								}
							}

							if (registro[5] == 'S') {
								setTimeout(function () {
									alertify.alert('Solicitud Recogida:', 'Por Favor Solicite Recogida', function () {
										abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redirigirEventos', true);
									});
								}, 50);
							} else {
								abrirReporte(base_url() + 'Reportes/imprimirReportes/' + strReportes, contexto, 'redirigirEventos', true);
							}

						});
					} else {
						redirigirEventos(true);
					}
				} else if (registro[0] == '2') {
					alertify.alert('Bloqueo Cartera', registro[1]);
				} else {
					alertify.alert('Error', 'Ocurrió un problema al momento de facturar', function () {
						this.destroy();
					});
					return false;
				}
			} else {
				if (res.alert) {
					alertify.alert('Advertencia', res.msj, function () {
						redirigirEventos(true);
					});
				} else {
					alertify.error(res.msj);
				}
			}
		}
	});
}

function formaPagoAplicada(datos, cancela = false) {
	if (cancela) {
		$FACTURA.Propina = 0;
		$FACTURA.FormaPago[TerceroFactura.TerceroId] = {};
		$FACTURA.CortesiaId = null;
		$VALORESFAC.TotalPagar = 0;
		$VALORESFAC.TotalFacturado = 0;
		$VALORESFAC.TotalIva = 0;
	} else {
		$FACTURA.FormaPago[TerceroFactura.TerceroId] = datos.FormasPago;
		$FACTURA.entregado = datos.entregado;

		$DATOSEVENTO.ingresoAutomatico = "F";
		$DATOSEVENTO.CantAcompanante = 0;
		if ($DATOSEVENTO.Ingreso == '1') {
			alertify.confirm("Advertencia", "Quiere realizar un ingreso automático a los terceros?", 
				function(){
					$DATOSEVENTO.ingresoAutomatico = "I";
					if ($DATOSEVENTO.ExigeAcompanante == "S") {
						alertify.cantAcomp(
							'Digite la cantidad de compañantes'
							, ''
							, 0
							, function (evt, value) {
								if (value != '') {
									$DATOSEVENTO.CantAcompanante = value;
									facturarEvento();
								} else {
									alertify.warning("Por favor digite una cantidad");
								}
							}
							, function () { }
						).set('type', 'number');
					} else {
						facturarEvento();
					}
				}, function(){
					facturarEvento();
				}).set("labels", {ok: "Si", cancel: "No"});
		} else {
			facturarEvento();
		}
	}
}

function calcularIva(iva, Valor) {
	let ivan = 0;
	if ($DATOSMONTAJE['PreciAnIva'] != 'S') {
		ivan = Valor / (1 + (+iva) / 100) * (+iva) / 100;
	} else {
		ivan = Valor * (+iva) / 100;
		Valor = Valor + ivan;
	}
	return { ivan, Valor };
}

function cardTercero(tercero, tipo, CargarTodos = 0) {
	let aplicaIngreso = "N"
	let card = "";
	let cardId = (tipo == "R" || tercero.IdEventoInvitado != null) ? tercero.IdEventoInvitado : tercero.TerceroID;

	let cardEstado = 0;
	let cardBg ="";
	let EstadoInviDescrip  = (tercero.EstadoInvitado) == null ? "Sin reservar" : tercero.EstadoInviDescrip;
	
	switch (tercero.EstadoInvitado) {
		case "I":
			cardBg = "bg-info text-white disabled";
			cardEstado = 3;
			break;
		case "F":
			cardBg = $DATOSEVENTO.Ingreso == 1 ? (CargarTodos == 0 ? "bg-success text-white" : "") : "bg-c-yellow text-white disabled";
			aplicaIngreso = $DATOSEVENTO.Ingreso == 1 ? 'S' : "N";
			cardEstado = $DATOSEVENTO.Ingreso == 1 ? (CargarTodos == 1) ? 0 : 1  : 3;
			break;
		default:
			cardBg = "";
			break;
	}
	
	//Definimos objeto para ocultar
	let ocultar = {
		TerceroID: "",
		barra: "",
		nombre: "",
		Parentesco: "",
		TipoSocio: "",
		Estado: "",
		telefono: "",
		email: "",
		Edad: "",
		EstadoIngreso: ""
	};

	switch (tipo) {
		case 'S':
			ocultar.telefono = "d-none";
			ocultar.email = "d-none";
			ocultar.EstadoIngreso = "d-none";
			break;
		case 'I':
			ocultar.barra = "d-none";
			ocultar.Parentesco = "d-none";
			ocultar.TipoSocio = "d-none";
			ocultar.Estado = "d-none";
			ocultar.EstadoIngreso = "d-none";
			break;
		case 'R':
			ocultar.Parentesco = "d-none";
			ocultar.TipoSocio = "d-none";
			ocultar.Estado = "d-none";
			ocultar.barra = "d-none";
			break;
		default:
			break;
	}

	//Validamos el tipo de ultimo por si tiene ingreso entonces lo cambiamos a tipo socio reserva
	tipo = (aplicaIngreso == "S" ? "R" : tipo);

	let foto = tercero.foto == null ? base_url() + 'assets/images/user/nofoto.png' : 'data:image/jpeg;base64,' + tercero.foto;

	card = `<div class="col-10 col-sm-6 col-lg-4 items p-1">
			<div class="card widget-statstic-card mb-0  ${cardBg}" data-productoid="" data-tercero='${cardId}' id="card${cardId}" data-tiposocio="${tipo}" data-select='${cardEstado}'>
				<div class="row no-gutters">
					<div class="col-md-4">
						<div class="rounded bg-light w-100 text-center">
							<img class="img-persona rounded" src="${foto}">
						</div>
					</div>
					<div class="col-md-8">
						<div class="card-body px-2 py-1">
							<p title="${(tercero.TerceroID || '')}" class="card-text my-0 w-100 text-truncate ${ocultar.TerceroID}">${(tercero.TerceroID || '')}</p>
							<p title="${(tercero.barra || '')}" class="card-text my-0 w-100 text-truncate ${ocultar.barra}"><b>Barra: </b>${(tercero.barra || '')}</p>
							<p title="${tercero.nombre}" class="card-text my-0 w-100 text-truncate">${tercero.nombre}</p>
							<p title="${(tercero.Parentesco || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios ${ocultar.Parentesco}"><b>Parentesco:</b> ${(tercero.Parentesco || '')}</p>
							<p title="${(tercero.TipoSocio || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios ${ocultar.TipoSocio}"><b>Tipo:</b> ${(tercero.TipoSocio || '')}</p>
							<p title="${(tercero.Estado || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios ${ocultar.Estado}"><b>Estado:</b> ${(tercero.Estado || '')}</p>
							<p title="${(tercero.telefono || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios ${ocultar.telefono}"><b>Teléfono:</b> ${(tercero.telefono || '')}</p>
							<p title="${(tercero.email || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios ${ocultar.email}"><b>Correo:</b> ${(tercero.email || '')}</p>
							<p title="${(tercero.Edad || '0')}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Edad:</b> ${(tercero.Edad || '0')}</p>
							<p title="${(EstadoInviDescrip || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Estado:</b> ${(EstadoInviDescrip || '')}</p>
						</div>
					</div>
				</div>
			</div>
		</div>`;

	//Si es para darle ingresos lo seleccionamos y lo agregamos al array para ingresar
	if (aplicaIngreso == "S" && CargarTodos == 0) {
		invitadosIngresar.push(tercero.IdEventoInvitado);
	}

	return card;
}

function datosTercero({ tercero, msj }) {
	if (tercero && tercero.invitadoNombre) {
		if (tercero.Baloteado == 1) {
			$("#invitadoTerceroId").val("").trigger("focus");
			alertify.alert(
				'Alerta',
				('<h3 class="mensaje-alerta">La persona se encuentra bloqueado por la junta directiva, no se permite su ingreso.</h3>')
			)
			return false;
		}
		if (tercero.IdListaInvitado && tercero.IdListaInvitado != null ) {
			$("#invitadoNombre, #invitadoFechaNac, #invitadoCorreo, #invitadoTelefono").val('')
			$("#invitadoTerceroIdValido").val(0);
			$("#invitadoTerceroId").val("").trigger("focus");
			alertify.alert("Advertecia", "El invitado ya se encuentra en la lista, intente con otro numero de documento", function(){
				$("#invitadoTerceroId").trigger("focus");
			});
		} else {
			Object.entries(tercero).forEach(it => {
				$("#" + it[0]).val(it[1]);
			});
			$("#invitadoTerceroIdValido").val(1);
		}
	} else {
		$("#invitadoNombre, #invitadoFechaNac, #invitadoCorreo, #invitadoTelefono").val('')
		$("#invitadoTerceroIdValido").val(0);
		alertify.warning(msj);
	}
}

//Vaalidamos los estados para mirar si activamos los botones de ingreso o los botones para facturar
function validarEstadosIngresoFacturar(CargarTodos = 0){
	//Validamos para activar los botones de ingresar
	$("#btnIngresarEvento").prop("disabled", (invitadosIngresar.length > 0 ? false : true));
	
	if ((invitadosIngresar.length > 0 && $DATOSEVENTO.Ingreso == 1) || CargarTodos == 1) {
		//Mostramos el botón para ingresar
		$("#btnIngresarEvento").closest("div").removeClass("d-none");
		$(".ocultarIngreso").addClass("d-none");
	} else {
		//Ocultamos el botón de ingresar cuando se pasa a facturar
		$("#btnIngresarEvento").closest("div").addClass("d-none");
		$(".ocultarIngreso").removeClass("d-none");
	}
	$("#terceroFactura").change();
}

function ingresarEvento(idsInvitados){
	if (idsInvitados.length > 0) {
		$.ajax({
			url: rutaGeneral + 'reservarEvento',
			type: 'POST',
			data: {
				idsInvitados,
				evento: $DATOSEVENTO,
				RASTREO: RASTREO(`Evento: ${$DATOSEVENTO.EventoId} - ${$DATOSEVENTO.Nombre}, Invitado: 	`, 'Ingreso Eventos')
			},
			dataType: 'json',
			cache: false,
			success: (resp) => {
				if (resp.valido) {
					alertify.success(resp.mensaje);
					reiniciarDatos();
					$("#codigo").val('').trigger("focus");
					$DATOSEVENTO = resp.evento;
					$("#TotalesInvitados").html(`${$DATOSEVENTO.TotalInvitadosIngresados}/${$DATOSEVENTO.TotalInvitados}`);
					$("#TotalesAcompanantes").html($DATOSEVENTO.TotalAcompanantes);
				} else {
					alertify.warning(resp.mensaje);
				}
			}
		});
	} else {
		alertify.alert("Advertencia", "No hay invitados seleccionados para realizar el ingreso.");
	}
}

$(function () {

	RastreoIngresoModulo('Reserva Evento');

	if ($SOLOINGRESO == '0') {
		try {
			tipoVentaActual = JSON.parse(sessionStorage.getItem('tipoVenta'));
	
			if (!tipoVentaActual) {
				alertify.warning("No ha seleccionado el tipo de venta");
				redirigirEventos(false, false);
				return;
			} else {
				obtenerInformacion({ codivent: tipoVentaActual.codiventid }, 'datoTipoVenta', 'dataTipoVenta');
			}
		} catch (err) {
			alertify.error("No se encontro tipo de venta definido");
			redirigirEventos();
			return;
		}
	}

	//Validamos si tienen productos
	if ($PRODUCTOSFACTURAR.length <= 0) {
		alertify.alert("Alerta", "No se han encontrado productos asociados para el eventos. </br> Debe asociarlos para continuar.", function () {
			redirigirEventos(true, false);
		});
	}

	$("#btnFacturarEvento").on('click', function () {

		if (!$("#terceroFactura").val() || $("#terceroFactura").val() == '') {
			return alertify.warning("No se encontro tercero valido para facturar");
		}

		TerceroFactura.TerceroId = $("#terceroFactura").val();
		TerceroFactura.AccionId = $("#nroAccion").val();
		let datos = {
			almacen: $DATOSALMACEN.almacenid,
			tercero: TerceroFactura.TerceroId,
			vendedor: $FACTURA.VendedorId,
			accion: TerceroFactura.AccionId,
			codivent: tipoVentaActual
		};
		$FACTURA.FormaPago = {};
		$FACTURA.FormaPago[TerceroFactura.TerceroId] = {};
		obtenerInformacion(datos, 'validarResolucion', 'validarResoluciones');
	});

	$('#invitadoFechaNac').data("DateTimePicker").maxDate(moment());

	$("#btnIngresarEvento").on('click', function () {
		let idsInvitados = [];
		invitadosIngresar.forEach(it => {
			idsInvitados.push(sociosEvento.find((i) => i.IdEventoInvitado == it));
		});

		if (idsInvitados.length > 0) {
			if ($DATOSEVENTO.ExigeAcompanante == "S") {
				$DATOSEVENTO.CantAcompanante = 0;
				alertify.cantAcomp(
					'Digite la cantidad de compañantes'
					, ''
					, 0
					, function (evt, value) {
						if (value != '') {
							$DATOSEVENTO.CantAcompanante = value;
							ingresarEvento(idsInvitados);

						} else {
							alertify.warning("Por favor digite una cantidad");
						}
					}
					, function () { }
				).set('type', 'number');
			} else {
				ingresarEvento(idsInvitados);
			}
		} else {
			alertify.alert("Advertencia", "No hay invitados seleccionados para realizar el ingreso.");
		}
	});

	$("#formBuscar").submit(function (e) {
		reiniciarDatos();
		let CargarTodos = $("#btnCargarInvitados").data("activo");
		e.preventDefault();
		if ($(this).valid() || CargarTodos == 1) {
			let datos = new FormData(this);
			datos.set('validaLector', 'false');
			datos.set('moduloLector', 'Ingreso');
			datos.set('ingresoEvento', $DATOSEVENTO.Ingreso);
			datos.set('EventoId', $DATOSEVENTO.EventoId);
			datos.set('CargarTodos', CargarTodos);
			datos.set('SoloIngreso', $SOLOINGRESO);
			$.ajax({
				url: rutaGeneral + 'validarSocioAccion',
				type: 'POST',
				data: datos,
				dataType: 'json',
				processData: false,
				contentType: false,
				cache: false,
				success: (resp) => {
					reiniciarDatos();
					if (resp.success) {
						$("#formBuscar input[name='ingresoModal']").val(0);
						if ((CargarTodos == undefined || CargarTodos == 0) && resp.CargarTodos == undefined) {
							if (!resp.ingresoEspecial && !resp.ingresoInvitado && resp.clubCanje == undefined) {
								resp.msj.forEach(socio => {
									//Si el socio esta baloteado no lo mostramos en ninguna lista
									if (socio.Baloteado <= 0 && socio.IngresoClub == 'N') {
										//Agregamos los terceros validos para facturar
										$("#terceroFactura").append(`<option value="${socio.TerceroID}">${socio.nombre}</option>`);
										//Validamos si es por este que buscaron para colocarlo como tercero a factruar
										if (socio.IngresaActivo) {
											$("#nroAccion").val(socio.AccionId);
											TerceroFactura = socio;
										}
	
										if ($LISTAPRODUCTOS.S.length > 0) {
											//Valida edad
											socio.Edad = socio.fechanacim == null ? 0 : moment($DATOSEVENTO.FechaFinal, "YYYY-MM-DD").diff(moment(socio.fechanacim, "YYYY-MM-DD"), "years");
											let validaEdad = validacionesEventos(socio);
	
											if (validaEdad.success) {
												$("#contenedorBeneficiarios").append(cardTercero(socio, 'S'));
												socio.foto = null;
												sociosEvento.push(socio);
											}
										}
									}
								});

								resp.listaInvitados.forEach(invitado => {
									invitado.Edad = invitado.fechanacim == null ? 0 : moment().diff(moment(invitado.fechanacim, "YYYY-MM-DD"), "years");
									$("#contenedorInvitados").append(cardTercero(invitado, 'I'));
									invitado.foto = null;
									sociosEvento.push(invitado);
								});

								$("#bntCancelar, #buscarBeneficiarios").prop("disabled", false);
	
								if ($LISTAPRODUCTOS.S.length > 0) {
									$("#buscarBeneficiarios, #Beneficiarios").prop("disabled", false);
									$("#collapseBeneficiarios").addClass("show");
								} else {
									$("#buscarBeneficiarios, #Beneficiarios").prop("disabled", true);
									$("#collapseBeneficiarios").removeClass("show");
								}
	
								if ($LISTAPRODUCTOS.I.length > 0) {
									$("#btnAgregarInvitado, #buscarInvitados, #Invitados").prop("disabled", false);
									$("#collapseInvitados").addClass("show");
								} else {
									$("#btnAgregarInvitado, #buscarInvitados, #Invitados").prop("disabled", true);
									$("#collapseInvitados").removeClass("show");
								}
	
								socios = resp.msj;
								$("#terceroFactura").prop("disabled", false).val(TerceroFactura.TerceroID);
							}
						} else {
							$("#Beneficiarios").removeClass("d-flex").addClass("d-none");
							$(".ocultarIngreso").addClass("d-none");
							$("#buscarInvitados, #Invitados, #bntCancelar").prop("disabled", false);
							if (resp.datosReserva != undefined) {
								$("#nroAccion").val(resp.datosReserva.AccionId);
								$("#terceroFactura").append(`<option value="${resp.datosReserva.TerceroId}">${resp.datosReserva.nombre}</option>`).val(resp.datosReserva.TerceroId);
							}
							
							resp.msj.forEach(invitado => {
								invitado.Edad = invitado.fechanacim == null ? 0 : moment().diff(moment(invitado.fechanacim, "YYYY-MM-DD"), "years");
								$("#contenedorInvitados").append(cardTercero(invitado, 'R', CargarTodos));
								invitado.foto = null;
								sociosEvento.push(invitado);
							});
						
							$("#collapseInvitados").addClass("show");

							if (CargarTodos == 1 && resp.msj <= 0) {
								alertify.alert("Advertencia", "No hay invitados pendientes para ingresar");
								$("#bntCancelar").click();
							}
						}
					} else {
						if (resp.socio == "") {
							if ($SOLOINGRESO == "0") {
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
	
											dtSS({
												data: {
													tblID: '#tblBusqueda'
												},
												ajax: {
													url: rutaGeneral + "DTBuscarSocio",
													type: "POST"
												},
												bAutoWidth: false,
												columnDefs: [
													{ targets: [0], width: '1%' },
												],
												ordering: false,
												draw: 10,
												pageLength: 10,
												oSearch: { sSearch: $("#codigo").val() },
												createdRow: function (row, data, dataIndex) {
													$(row).click(function () {
														$("#formBuscar input[name='ingresoModal']").val(1);
														$("#codigo").val(data[0]);
														$("#formBuscar").submit();
														alertify.myAlert().close();
													});
												},
												scrollY: screen.height - 400,
												scroller: {
													loadingIndicator: false
												},
												dom: domftri
											});
										}
									});
								}
								var campos = encodeURIComponent(JSON.stringify(['Código', 'Nombre', 'Barra', 'Acción']));
								alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
							} else {
								alertify.alert("Advertencia", resp.msj);
							}
						} else {
							let fotico = resp.socio.foto == null ? base_url() + "assets/images/user/nofoto.png" : 'data:image/jpeg;base64,' + resp.socio.foto;
							$("#formBuscar input[name='ingresoModal']").val(0);
							if (resp.esTercero && resp.socio.Baloteado <= 0 && $SOLOINGRESO == "0") {
								if ($LISTAPRODUCTOS.I.length > 0) {
									resp.socio.Tipo = 'I';
									resp.socio.Edad = resp.socio.fechanacim == null ? 0 : moment($DATOSEVENTO.FechaFinal, "YYYY-MM-DD").diff(moment(resp.socio.fechanacim, "YYYY-MM-DD"), "years");
									resp.socio.validoTercero = 1;
									let socio = resp.socio;

									let valid = validacionesEventos(socio);

									if (valid.success) {
										$("#contenedorInvitados").append(cardTercero(socio, 'I'));

										socio.foto = null;
										sociosEvento.push(socio);
										socios.push(socio);

										//Le damos click a la tarjeta para que lo agregue
										$(`#card${socio.TerceroID}`).find(".img-persona").click();

									} else {
										alertify.alert("Alerta", valid.msj);
									}
									
									$("#btnAgregarInvitado, #buscarInvitados, #Invitados, #bntCancelar").prop("disabled", false);
									$("#collapseInvitados").addClass("show");

									TerceroFactura = socio;
									//Agregamos los terceros validos para facturar
									$("#terceroFactura").append(`<option value="${socio.TerceroID}">${socio.nombre}</option>`);

									$("#terceroFactura").prop("disabled", false).val(TerceroFactura.TerceroID);
								} else {
									alertify.warning("No se han encontrado productos para los invitados");
								}
							} else {
								if ($SOLOINGRESO == "0") {
									alertify.alert('¡Alerta!', `<div class='row'>
																	<div class='col-4'>
																		<div class="rounded bg-light w-100 text-center">
																			<img class="img-persona rounded" src="${fotico}" alt="">
																		</div>
																	</div>
																	<div class='col-8'>
																		<h5><b>Nro Acción: </b> <span class="font-weight-light">${resp.socio.AccionId || ''}</span></h5>
																		<h5><b>Documento: </b> <span class="font-weight-light">${resp.socio.TerceroId}</span></h5>
																		<h5><b>Nombre: </b> <span class="font-weight-light">${resp.socio.nombre}</span></h5>
																		<hr>
																		<h3 class='mensaje-alerta alert-${resp.reservaTerceroHotel ? 'success' : 'danger'} p-3 rounded'>${resp.msj}</h3>
																	</div>
																</div>`,
										function () {
											setTimeout(() => {
												$("#codigo").focus().select();
											}, 1050);
										});
								} else {
									alertify.alert("Advertencia", resp.msj);
								}
							}
						}
					}

					validarEstadosIngresoFacturar(CargarTodos);
				}
			});
		}
	});

	$("#codigo").on("keydown", function (e) {
		form = $(this).closest("form");
		if (e.which == 13) {
			$("#formBuscar input[name='ingresoModal']").val(0);
			form.submit();
			if ($(this).val().length == 0) {
				setTimeout(() => {
					$(this).focus();
				}, 350);
			}
		}
	});

	//Cambiamos el tercero a facturar si cambian el select
	$("#terceroFactura").on("change", function () {
		TerceroFactura = socios.find(socio => socio.TerceroID.trim() == $(this).val());
		if ($(this).val() > 0 && $(this).val().trim().length > 0) {
			$("#btnAgregarInvitado").closest("div").removeClass("d-none");
			$("#btnAgregarInvitado").prop("disabled", false);
		} else { 
			$("#btnAgregarInvitado").prop("disabled", true);
			$("#btnAgregarInvitado").closest("div").addClass("d-none");
		}
	});

	//Buscador de Beneficiaros y Invitador
	$("#buscarBeneficiarios, #buscarInvitados").on("keyup", function () {
		let nombre = $(this).data("nombre");

		var rex = new RegExp($(this).val(), 'i');

		$(`#contenedor${nombre} .items`).addClass("d-none");

		$(`#contenedor${nombre} .items`).filter(function () {
			return rex.test($(this).find(".card-text").text());
		}).removeClass("d-none");

		if ($(`#contenedor${nombre} .items:not(.d-none)`).length <= 0 && $(this).val().length > 0) {
			$(`#contenedor${nombre}`).find(".noDisponible").removeClass("d-none");
		} else {
			$(`#contenedor${nombre}`).find(".noDisponible").addClass("d-none");
		}
	});

	$("#bntCancelar").on("click", function () {
		reiniciarDatos();
		$("#codigo").val('').trigger("focus");
	});

	$(document).on("click", ".img-persona", function () {
		$("#modalProductosFacturar").empty();
		let card = $(this).closest(".card");
		let idTercero = card.data("tercero").toString();
		let cardEstado = card.data('select');
		let tipo = card.data('tiposocio');
		let productoIdSeleccionado = card.data("productoid");
		let index = null;
		let indexTercero = null;

		if (cardEstado != 3) {
			//Validamos si es para facturar o para ingresar y se realizan las respectivas validaciones
			if (invitadosIngresar.length > 0 && tipo != "R") {
				alertify.confirm("Advertencia", "Actualmente se encuentra seleccionado para ingresar, quiere cambiar la selección a facturar?",
					function(){
						//Damos click a los actualcuemente estan seleccionado como un card success
						$(".card.bg-success").find(".img-persona").click();

						//Luego damos click para pasar a facturar
						card.find(".img-persona").click();
					}, function(){
					}).set("labels", {"ok": "Si", "cancel": "No"});
				return;
			} else {
				//Validamos si los socios tienen productos asociados
				let cantidadSocio = 0;
				sociosEvento.forEach(it => {
					if (it.ProductoId != undefined && it.ProductoId != null && it.EstadoInvitado == null) {
						cantidadSocio++;
					}
				});
				
				if (cantidadSocio > 0 && tipo == "R") {
					alertify.confirm("Advertencia", "Actualmente se encuentra seleccionado para facturar, quiere cambiar la selección a ingresar?",
					function(){
						//Damos click a los actualcuemente estan seleccionado como un card success
						$(".card.bg-success").find(".img-persona").click();
						//Luego damos click para pasar a facturar
						card.find(".img-persona").click();
					}, function(){
					}).set("labels", {"ok": "Si", "cancel": "No"});
					return;
				}
			}

			if (idTercero != '') {
				if (tipo != "R") {
					if ($LISTAPRODUCTOS[tipo].length > 1 && productoIdSeleccionado.length == 0) {
						$LISTAPRODUCTOS[tipo].forEach(it => {
							$("#modalProductosFacturar").append(`<div class="col-6 p-1">
									<div class="card mb-1 h-100 shadow-none productoModalSeleccion" data-terceroid="${idTercero}" data-productoid="${it.ProductoId}">
										<div class="card-body p-1 card-producto">
											<p class="text-truncate mb-0" title="${it.ProductoId}">${it.ProductoId}</p>
											<p class="text-truncate mb-2" title="${it.NombreProducto}">${it.NombreProducto}</p>
											<p class="text-truncate text-right font-weight-bold mb-0">$ ${addCommas2(Math.round(myRound(it.ValorOriginal)))}</p>
										</div>
									</div>
								</div>`);
						});
		
						$("#modalProductos").modal("show");
						return;
					} else {
						productoSeleccionado = $LISTAPRODUCTOS[tipo].length > 1 ? productoIdSeleccionado : $LISTAPRODUCTOS[tipo][0].ProductoId;
						index = $PRODUCTOSFACTURAR.findIndex(it => it.ProductoId == productoSeleccionado);
						indexTercero = sociosEvento.findIndex(it => it.TerceroID == idTercero);
					}
				}
	
				if (cardEstado == 0) {
					//Si terceron no esta definido la definimos
					if (tipo != "R") {
						if ($PRODUCTOSFACTURAR[index].Terceros == undefined) {
							$PRODUCTOSFACTURAR[index].Terceros = [];
						}
						$PRODUCTOSFACTURAR[index].Terceros.push(idTercero);
						sociosEvento[indexTercero].ProductoId = productoSeleccionado;
					} else {
						//Cuando este reservado agregamos para realizar el ingreso
						invitadosIngresar.push(idTercero);
					}
	
					card.addClass("bg-success").addClass("text-white").data("select", '1');
				} else {
					if (tipo != "R") {
						//Filtramos para eliminar el usuario deseleccionado
						$PRODUCTOSFACTURAR[index].Terceros = $PRODUCTOSFACTURAR[index].Terceros.filter((i) => i != idTercero);
						sociosEvento[indexTercero].ProductoId = null;
					} else {
						invitadosIngresar = invitadosIngresar.filter((i) => i != idTercero);
					}
					card.removeClass("bg-success").removeClass("text-white").data("select", '0').data("productoid", "");
				}
			} else {
				alertify.error("Se debe de seleccionar un tercero");
			}
		}

		if (tipo != "R") {
			productoSeleccionado = null;
			calcularValorProductos();
		} else {
			validarEstadosIngresoFacturar();
		}
	});

	$(document).on("click", ".productoModalSeleccion", function (e) {
		let terceroid = $(this).data("terceroid");
		let productoid = $(this).data("productoid");
		let card = $(`#card${terceroid}`);
		card.data("productoid", productoid);
		card.find(".img-persona").click();
		$("#modalProductos").modal("hide");
	});

	//Habilitamos el formulario de agregar invitado
	$("#btnAgregarInvitado").on("click", function () {
		//Validamso si tiene personas para ingresar en caso de que no pasa a modo facturar
		if (invitadosIngresar.length > 0) {
			alertify.confirm("Advertencia", "Actualmente se encuentra seleccionado para ingresar, quiere cambiar la selección a facturar?",
				function(){
					//Damos click a los actualcuemente estan seleccionado como un card success
					$(".card.bg-success").find(".img-persona").click();

					//Luego damos click para pasar a facturar
					$("#btnAgregarInvitado").click();
				}, function(){
				}).set("labels", {"ok": "Si", "cancel": "No"});
			return;
		} else {
			$("#formInvitado").trigger("reset");
			$("#formInvitado").validate().resetForm();
			$("#modalInvitados").modal("show");
		}
	});

	//Cuadno se termine de abrirl modal enfocamos el campo de nombre
	$("#modalInvitados").on("shown.bs.modal", function () {
		$("#invitadoTerceroId").trigger("focus");
		$("#invitadoTerceroIdValido").val(0);

		$("#invitadoTerceroId").off('change').on('change', function () {
			let data = {
				documento: $(this).val(),
				evento: $DATOSEVENTO
			}
			obtenerInformacion(data, 'validarDocumento', 'datosTercero');
		});
	});

	$("#formInvitado").on("submit", function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let edad = moment($DATOSEVENTO.FechaFinal, "YYYY-MM-DD").diff(moment($("#invitadoFechaNac").val(), "YYYY-MM-DD").format("YYYY-MM-DD"), "years");

			let socio = {
				"foto": null,
				"TerceroID": $("#invitadoTerceroId").val(),
				"nombre": $("#invitadoNombre").val(),
				"AccionId": $("#nroAccion").val(),
				"fechanacim": $("#invitadoFechaNac").val(),
				"telefono": $("#invitadoTelefono").val(),
				"email": $("#invitadoCorreo").val(),
				"Tipo": 'I',
				"Edad": edad,
				"validoTercero": $("#invitadoTerceroIdValido").val()
			}

			let valid = validacionesEventos(socio);

			if (valid.success) {
				$("#contenedorInvitados").append(cardTercero(socio, 'I'));

				socio.foto = null;
				sociosEvento.push(socio);

				//Le damos click a la tarjeta para que lo agregue
				$(`#card${socio.TerceroID}`).find(".img-persona").click();
				$("#modalInvitados").modal("hide");
			} else {
				alertify.alert("Alerta", valid.msj);
			}
		}
	});

	//botón de regresa
	$("#btnRegresar").on("click", function () {
		redirigirEventos(true, false);
	});

	$("#btnCargarInvitados").on("click", function(){
		$("#codigo").val("");
		$(this).data("activo", 1);
		$("#formBuscar").submit();
		$(this).data("activo", 0);
	});

	$(".selecionarTodos").on("click", function(){
		if ($DATOSEVENTO.Ingreso == 1) {
			if ($(this).val() == 1) {
				$(".card[data-select]").each(function(index, value) {
					if ($(value).data("select") == 0 && $(value).data("tiposocio") == 'R') {
						$(value).find(".img-persona").click();
					}
				});
			} else {
				$(".card.bg-success").find(".img-persona").click();
			}
		} else {
			alertify.alert("Advertencia", "Esta acción solo se puede ejecutar con el evnetos activo para ingresos");
		}
	});
});
