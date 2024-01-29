let rutaGeneralCuentasPendientes = base_url() + 'Administrativos/Servicios/CuentasPendientes/';
let tblCuentasPendientes;
let datosConsumoCuentaPendiente = {};
let vendedorElegidoCuentaPendiente = null;
let datosConsumoAlertaCuentaPendiente = {};
let dataFiltroCuentaPendiente = {};
let tipoVentaSeleccionadoCuentaPendiente = JSON.parse(sessionStorage.getItem('tipoVenta'));

function dataTable() {

	if ($MODALCUENTASPENDIENTES == 'S') {
		RastreoIngresoModulo('Cuentas Pendientes Mesa');
	}

	dataFiltroCuentaPendiente['almacen'] = $ALMACENCUENTAPENDIENTE;
	tblCuentasPendientes = $('#tablaCuentasPendientes').DataTable({
		order: [],
		dom: domBftrip,
		fixedColumns: true,
		serverSide: true,	
		pageLength: 10,
		scrollX: true,
		ajax: {	
			url: rutaGeneralCuentasPendientes + ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier == 'S' ? "cargarDTAgrupada" : "cargarDT"),
			type: 'POST',
			data: function (d) {
				return $.extend(d, dataFiltroCuentaPendiente);
			},
		},
		columns: [
			{ data: 'Mesa' },
			{ data: 'Nombre_Habitacion' },
			{ data: 'Cupo' },
			{ data: 'Cod_Barra' },
			{ data: 'Identificacion' },
			{ data: 'Cliente_o_Socio' },
			{ 
				data: 'Valor',
				className: "text-right",
				visible: ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier != 'S'),
				render: function(data, type, row, meta){
					return `$ ${addCommas(data, 2)}`;
				}
			},
			{ 
				data: 'Valor', 
				visible: ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier == 'S'),
				className: "text-right", 
				render: function(data, type, row, meta){
					return `$ ${addCommas((data == null ? 0 : data), 2)}`;
				}
			},
			{ 
				data: 'Valor_Pendiente', 
				visible: ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier == 'S'),
				className: "text-right", 
				render: function(data, type, row, meta){
					return `$ ${addCommas((data == null ? 0 : data), 2)}`;
				}
			},
			{ 
				data: 'Valor_Cargado_Cuenta', 
				visible: ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier == 'S'),
				className: "text-right", 
				render: function(data, type, row, meta){
					return `$ ${addCommas((data == null ? 0 : data), 2)}`;
				}
			},
			{ 
				data: 'Valor_Total', 
				visible: ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier == 'S'),
				className: "text-right", 
				render: function(data, type, row, meta){
					return `$ ${addCommas((data == null ? 0 : data), 2)}`;
				}
			},
			{ data: 'Fecha' },
			{ data: 'Vendedor' },
			{ 
				data: 'Almacen', 
				visible: ($DATOSMONTAJECUENTAPENDIENTE.FactConAbier == 'S') 
			}
		],
		createdRow: function (row, data, dataIndex) {
			$(row).addClass("cursor-pointer");
			if (data.ProdsPendientes > 0) {
				$(row).css('background-color', '#ffa0a0');
			}
			$(row).on("click", function (e) {
				e.preventDefault();

				if (tipoVentaSeleccionadoCuentaPendiente.PagoPendiente == 'S' && tipoVentaSeleccionadoCuentaPendiente.vendedor != 'S') {
					alertify.alert('¡Alerta!', '<h3 class="mensaje-alerta">No es posible continuar, el tipo de venta tiene pago pendiente y no solicita vendedor.</h3>');
					return;
				}

				datosConsumoAlertaCuentaPendiente = { mesa: data.Mesa, tercero: data.Identificacion, accion: data.Cupo };

				if (tipoVentaSeleccionadoCuentaPendiente.vendedor == 'S') {
					let pos = $VENDEDORESCUENTAPENDIENTE.findIndex(x => x.vendUser);
					if (pos > -1) {
						vendedorElegido = $VENDEDORESCUENTAPENDIENTE[pos].vendedorid;
						alertaConsumoPendiente();
					} else {

						if ($MODALCUENTASPENDIENTES == 'S') {
							$(".card-principal-modal-pendiente").addClass("d-none");
							$(".contenido-elige-vendedor-pendiente").removeClass("d-none");
						} else {
							$("#ElegirVendedorCuentaPendiente").modal('show');
						}
					}
				} else {
					vendedorElegido = null;
					alertaConsumoPendiente();
				}
			});
		},
	});
}

function alertaConsumoPendiente(row) {
	$(".ElegirVendedorCuentaPendiente").modal('hide');
	if ($MODALCUENTASPENDIENTES == 'S') {
		obtenerInformacionP(datosConsumoAlertaCuentaPendiente, 'cuentaPendienteTercero', 'datosDeConsumoP');
	} else {
		alertify.confirm('Alerta', `¿Desea ir al consumo?`, function (ok) {
			obtenerInformacionP(datosConsumoAlertaCuentaPendiente, 'cuentaPendienteTercero', 'datosDeConsumoP');
		}, function (err) {
			$(".ElegirVendedorCuentaPendiente").modal('hide');
		});
	}
}

function obtenerInformacionP(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneralCuentasPendientes + metodoBack,
		type: 'POST',
		data: {
			encriptado: data
		},
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
				if (metodoBack == "cuentaPendienteTercero") {
					if (tblCuentasPendientes) tblCuentasPendientes.ajax.reload();
				}
			}
		}
	});
}

function datosDeConsumoP(datos) {
	datosConsumoCuentaPendiente = datos;
	$("#ElegirVendedorCuentaPendiente").modal('hide');
	let datosSend = Object.assign({}, {
		...datosConsumoCuentaPendiente
		, tipoVentaSeleccionado: JSON.stringify(tipoVentaSeleccionadoCuentaPendiente)
	});
	sessionStorage.setItem('accionPos', datosSend.accionPos);
	datosSend.arrayProductosPedido = JSON.stringify(datosSend.arrayProductosPedido);
	datosSend['VendedorId'] = vendedorElegido;
	datosSend['terceroPedidoEmpresa'] = (JSON.parse(datos.dataTerceroPendiente).TerceroID != datos.TerceroId ? datos.dataTerceroPendiente : JSON.stringify({}));
	datosSend['AlmacenId'] = $ALMACENCUENTAPENDIENTE;
	datosSend['MesasDesc'] = datosSend.MesaId;
	if (datosSend.MesaId != null && datosSend.MesaId.indexOf("-") > -1) {	
		MesasIDS = datosSend.MesaId.split("-");
		datosSend.MesaId = MesasIDS[MesasIDS.length - 1].toString().trim();
	}
	sessionStorage.setItem('dataPos', $.Encriptar(datosSend));
	location.href = base_url() + 'Administrativos/Servicios/VistaGeneral/Mesas/' + datosSend.AlmacenId.trim();
}

function buscarVendedorP(buscar = '') {
	var cont = 0;
	$("#buscarVendedorP").val(buscar);
	$("#listaVendedoresPendiente").children('div').removeClass('d-none');
	$("#listaVendedoresPendienteEmpty").hide();
	if (buscar == '') return;
	total = 0;
	$("#listaVendedoresPendiente").children('div').filter(function (index, item) {
		total++;
		if ($(item).find('p').text().toLowerCase().includes(buscar.toLowerCase())) return true;
		$(item).addClass('d-none');
		cont++;
		return false;
	});
	if (cont == total) {
		$("#listaVendedoresPendienteEmpty").show();
	}
}

$(function () {
	if ($MODALCUENTASPENDIENTES != 'S') {
		RastreoIngresoModulo('Cuentas Pendientes');
		dataTable();
	}

	$(document).on("click", "#btnCancelarVendedorP", function () {
		vendedorElegidoCuentaPendiente = null;
		datosConsumoAlertaCuentaPendiente = {};
		if ($MODALCUENTASPENDIENTES == 'S' && tblCuentasPendientes) {
			$(".card-principal-modal-pendiente").removeClass("d-none");
			$(".contenido-elige-vendedor-pendiente").addClass("d-none");
			tblCuentasPendientes.ajax.reload();
		} else {
			$("#ElegirVendedorCuentaPendiente").modal("hide");
		}
	});

	if (tipoVentaSeleccionadoCuentaPendiente.vendedor == 'S') {
		$(document).on("click", ".card-vendedor-cuenta-pendiente", function () {
			let actual = this;
			let vend = $VENDEDORESCUENTAPENDIENTE.find(it => it.vendedorid == $(this).data('vendedor'));
			if (vend.Pass && $DATOSMONTAJECUENTAPENDIENTE.SolicitaClaveVendedor == 'S') {

				let mensaje = `
					<h6>${$(this).data("nombre")}</h6>
					<input type="password" class="form-control data-pass p-1 alertify" autocomplete="off">
				`;

				alertify.confirm().setting({
					'message': mensaje,
					'onok': function () {
						let pass = $('.ajs-content').find('.data-pass').val();
						if (pass != '') {
							$.ajax({
								url: rutaGeneralCuentasPendientes + "validarPassVendedor",
								type: 'POST',
								dataType: 'json',
								data: {
									idVendedor: vend.vendedorid,
									pass: pass
								},
								success: function (resp) {
									if (resp.success) {
										vendedorElegido = vend.vendedorid;
										alertaConsumoPendiente();
									} else {
										setTimeout(() => {
											$(actual).click();
										}, 100);
										alertify.error("Contraseña incorrecta");
									}
								}
							});
						} else {
							setTimeout(() => {
								$(actual).click();
							}, 100);
							alertify.warning("Por favor digite una contraseña");
						}
					},
					'title': 'Confirmar Contraseña'
				}).set({
					onshow: function () {
						$(".data-pass").keyup(function (e) {
							e.preventDefault();
							if (e.keyCode == 13 && $(this).val() != '') $('.ajs-ok').click();
						});
						$('.ajs-content').find('.data-pass').val('');
						setTimeout(function () {
							$('.ajs-content').find('.data-pass').focus();
						}, 1000);
					},
					onclose: function () {
						alertify.alert().set({ onshow: null });
					}
				}).show();
			} else {
				vendedorElegido = vend.vendedorid;
				alertaConsumoPendiente();
			}
		});
	}

	$(document).on('click', '#btnBuscarVendedorP', function () {
		buscarVendedorP($("#buscarVendedorP").val());
	});
	
	$(document).on('keyup', '#buscarVendedorP', function (e) {
		e.stopImmediatePropagation();
		buscarVendedorP($(this).val());
	});
});

