alertify.defaults.theme.ok = "btn btn-primary";
alertify.defaults.theme.cancel = "btn btn-danger";
alertify.defaults.theme.input = "form-control";

let facturacionParcial = false;

const totales = {
		totalFijos: 0,
		totalMenus: 0,
		totalOtros: 0,
		totalServicios: 0,
		totalTotal: 0,
		totalAdicionales: 0
	},
	rutaGeneral = base_url() + "Administrativos/Servicios/Eventos/";

const tblMenu = $("#tMenu").DataTable({
	data: nuevaReserva.complementos.menus,
	ordering: false,
	paging: false,
	buttons: [],
	bInfo: false,
	bPaginate: false,
	scrollX: true,
	columns: [
		{
			data: "ProductoId",
			width: "1%",
		},
		{
			data: "Imagen",
			width: "1%",
			visible: false,
		},
		{
			data: "nombre",
			width: "auto",
		},
		{
			data: "AlmacenMarcha",
			width: "auto",
		},
		{
			data: "Valor",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "total",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "cantidad",
			width: "1%",
			render: function (data, type, row) {
				const fCantidad = addCommas(data);
				const CantidadMarcha = isNaN(parseInt(row.CantidadMarcha))
					? 0
					: parseInt(row.CantidadMarcha);
				const cantidadRestante = parseInt(data) - CantidadMarcha;
				const fCantidadRestante = addCommas(cantidadRestante);
				row.cantidadRestante = cantidadRestante;
				return `${fCantidadRestante} / ${fCantidad}`;
			},
		},
		{
			data: null,
			width: "1%",
			visible: (nuevaReserva.cotizacion.estado == "AC" ? true : false),
			render: function (data, type, row) {
				return `<input
					type="text"
					${row.cantidadRestante <= 0 ? "disabled" : ""}
					class="form-control form-control-floating px-0 text-center cantidad ${row.cantidadRestante <= 0 ? "" : "data-int"}"
					placeholder="Cantidad Consumido"
					value="${row.cantidadRestante <= 0 ? "N/A" : "0"}"
				>`;
			},
		},
	],
	createdRow: function (row, data, dataIndex) {
		$(row)
			.find(".data-int")
			.inputmask({
				groupSeparator: "",
				alias: "integer",
				placeholder: "0",
				autoGroup: !0,
				digitsOptional: !1,
				clearMaskOnLostFocus: !1,
				rightAlign: false,
				allowMinus: false
			})
			.focus(function () {
				$(this).select();
			})
			.on("change", function () {
				let consumido = isNaN(parseInt($(this).val()))
					? 0
					: parseInt($(this).val());

				if (consumido > data.cantidadRestante) {
					consumido = data.cantidadRestante;
				}
				$(this).val(consumido);
				data.consumido = consumido;
			});
	},
	drawCallback: function (settings) {
		let api = this.api(),
			rows = api.rows({ page: "current" }).nodes(),
			lastMenu = null;

		// Itera sobre las filas y agrega una fila de nombre de menú cuando cambia
		api.rows().every(function () {
			const data = this.data();
			if (lastMenu != data.menu) {
				let fechaServicio = "";
				const FORMAT = "DD/MM/YYYY";

				if (data.desde && !data.hasta && !data.hora) {
					fechaServicio = moment(data.desde).format(FORMAT);
				}

				if (data.desde && !data.hasta && data.hora) {
					fechaServicio = moment(data.desde).format(FORMAT) + " " + data.hora;
				}

				if (data.desde && data.hasta && data.hora) {
					fechaServicio =
						moment(data.desde).format(FORMAT) +
						" - " +
						moment(data.hasta).format(FORMAT) +
						" " +
						data.hora;
				}

				if (data.desde && data.hasta && !data.hora) {
					fechaServicio =
						moment(data.desde).format(FORMAT) +
						" - " +
						moment(data.hasta).format(FORMAT);
				}

				if (!data.desde && !data.hasta && data.hora) {
					fechaServicio = data.hora;
				}

				$(rows[this.index()]).before(
					`<tr class="group">
						<th colspan="3" class="py-1 h4">${data.nombreMenu}</th>
						<th colspan="2" class="py-1 text-center">Fecha Servicio:</th>
						<th colspan="2" class="py-1 text-right">${fechaServicio}</th>
					</tr>`
				);

				lastMenu = data.menu;
			}
		});
	},
});

const tblOtros = $("#tOtros").DataTable({
	data: nuevaReserva.complementos.otros,
	ordering: false,
	paging: false,
	buttons: [],
	bInfo: false,
	bPaginate: false,
	scrollX: true,
	columns: [
		{
			data: "ProductoId",
			width: "1%",
		},
		{
			data: "Imagen",
			width: "1%",
			visible: false,
		},
		{
			data: "nombre",
			width: "auto",
		},
		{
			data: "Valor",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "total",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "cantidad",
			width: "1%",
			render: function (data, type, row) {
				return addCommas(data);
			},
		},
	],
	createdRow: function (row, data, dataIndex) {},
	drawCallback: function (settings) {},
});

const tblServicios = $("#tServicios").DataTable({
	data: nuevaReserva.complementos.servicios,
	ordering: false,
	paging: false,
	buttons: [],
	bInfo: false,
	bPaginate: false,
	scrollX: true,
	columns: [
		{
			data: "ProductoId",
			width: "1%",
		},
		{
			data: "Imagen",
			width: "1%",
			visible: false,
		},
		{
			data: "nombre",
			width: "auto",
		},
		{
			data: "Valor",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "total",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "cantidad",
			width: "1%",
			render: function (data, type, row) {
				return addCommas(data);
			},
		},
	],
	createdRow: function (row, data, dataIndex) {},
	drawCallback: function (settings) {},
});

const tblElementos = $("#tElementos").DataTable({
	data: nuevaReserva.complementos.elementosFijos,
	ordering: false,
	paging: false,
	buttons: [],
	bInfo: false,
	bPaginate: false,
	scrollX: true,
	columns: [
		{
			data: "ProductoId",
			width: "1%",
		},
		{
			data: "Imagen",
			width: "1%",
			visible: false,
		},
		{
			data: "nombre",
			width: "auto",
		},
		{
			data: "Valor",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "total",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "cantidad",
			width: "1%",
			render: function (data, type, row) {
				return addCommas(data);
			},
		},
	],
	createdRow: function (row, data, dataIndex) {},
	drawCallback: function (settings) {
		let api = this.api(),
			rows = api.rows({ page: "current" }).nodes(),
			lastMenu = null;

		// Itera sobre las filas y agrega una fila de nombre de menú cuando cambia
		api.rows().every(function () {
			const data = this.data();
			if (lastMenu != data.menu) {
				$(rows[this.index()]).before(
					`<tr class="group">
						<th colspan="5" class="py-1 h4">${data.nombreMenu}</th>
					</tr>`
				);

				lastMenu = data.menu;
			}
		});
	},
});

const tblAdicionales = $("#tAdicionales").DataTable({
	data: nuevaReserva.complementos.adicionales,
	ordering: true,
	paging: false,
	scrollY: "500px",
	buttons: [],
	bInfo: true,
	bPaginate: false,
	scrollX: true,
	columns: [
		{
			data: "ProductoId",
			width: "1%",
		},
		{
			data: "Imagen",
			width: "1%",
			visible: false,
		},
		{
			data: "nombre",
			width: "auto",
		},
		{
			data: "AlmacenMarcha",
			width: "auto",
		},
		{
			data: "ConsumoId",
			width: "1%",
		},
		{
			data: "FechaRegis",
			width: "1%",
			render: function(data){
				return data == null ? '' : moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A");
			}
		},
		{
			data: "FechaConsu",
			width: "1%",
			render: function(data){
				return data == null ? '' : moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A");
			}
		},
		{
			data: "nombreVendedor",
			width: "1%",
		},
		{
			data: "cantidad",
			width: "1%",
			/*render: function (data, type, row) {
				const fCantidad = addCommas(data);
				const CantidadMarcha = isNaN(parseInt(row.CantidadMarcha))
					? 0
					: parseInt(row.CantidadMarcha);
				const cantidadRestante = parseInt(data) - CantidadMarcha;
				const fCantidadRestante = addCommas(cantidadRestante);
				row.cantidadRestante = cantidadRestante;
				return `${fCantidadRestante} / ${fCantidad}`;
			},*/
		},
		{
			data: "Valor",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
		{
			data: "total",
			width: "1%",
			render: function (data, type, row) {
				return `$&nbsp;${data
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
			},
		},
	],
	createdRow: function (row, data, dataIndex) {},
});

const facturarCuenta = (parcial = false) => {
	const data = cargarData(true);
	$.ajax({
		url: rutaGeneral + "facturarCuenta",
		type: "POST",
		dataType: "json",
		data: {
			data: JSON.stringify(data),
			eventoId: nuevaReserva.cotizacion.eventoId,
			parcial
		},
		success: (resp) => {
			if (resp.success){
				let datos = resp.datos;
				$datosPost = {
					consumos: JSON.stringify(datos.idConsumos),
					AlmacenId: datos.AlmacenEventos,
					TerceroId: datos.datosEvento.TerceroId,
					tipoVentaSeleccionado: JSON.stringify(datos.codiVent),
					accionPos: 'evento',
					VendedorId: datos.datosEvento.VendedorId,
					arrayProductosPedido: JSON.stringify([]),
					ConAccion: 'false',
					MesaId: null,
					reservaHotel: null,
					AccionPedido: datos.datosEvento.AccionId,
					reactivarConsumo: 'false',
					datosTerceroReactivar: JSON.stringify({}),
					numeroPersonasReactivar: 0,
					codBarraTercero: datos.datosEvento.barra,
					habitacionHotel: null,
					terceroPedidoEmpresa: JSON.stringify({}),
					dataTerceroPendiente: JSON.stringify({}),
					ventanaCambioPedido: 'N',
					almacenOriginal: datos.AlmacenEventos,
					factElectronicaDirecta: 'false',
					dataFechasHotel: JSON.stringify({"EntradaReservaHotel": null,"SalidaReservaHotel": null}),
					HeadReservaIdHotel: null,
					TerceroIdConsumo: datos.datosEvento.TerceroId,
					consumosOcultos: 'false',
					eventoId: datos.datosEvento.EventoId,
					meseroId
				}
				$.redirectPost(base_url() + 'Administrativos/Servicios/EstadoCuenta/Facturador', $datosPost);
			} else {
				alertify.alert("Advertencia", resp.msj);
			}

		},
	});
}

// Event listeners
$("#btnMarcha").click(function (e) {
	e.preventDefault();

	const data = cargarData();

	if (data.menus.length === 0) {
		alertify.warning("No hay productos consumidos a poner en marcha");
	} else {
		let lastMenu = null;
		let lProductos = "<ul>";

		data.menus.forEach((producto) => {
			if (lastMenu != producto.menu) {
				if (lastMenu != null) {
					lProductos += `</ul></li>`;
				}
				lProductos += `<li><b>${producto.nombreMenu}</b><ul>`;
				lastMenu = producto.menu;
			}
			lProductos += `<li>${producto.nombre} <b>(${producto.consumido})</b></li>`;
		});

		lProductos += "</ul>";

		alertify.confirm(
			"Poner en Marcha",
			`¿Está seguro de Poner en Marcha los siguientes productos y cantidades?<br/><br/>${lProductos}`,
			function () {
				$.ajax({
					url: rutaGeneral + "ponerEnMarcha",
					type: "POST",
					dataType: "json",
					data: {
						data: JSON.stringify(data),
						eventoId: nuevaReserva.cotizacion.eventoId,
						meseroId
					},
					success: function (res) {
						if (res.success) {
							alertify.success(res.msj);
							setTimeout(() => {
								window.location.reload();
							}, 1000);
						} else {
							alertify.error(res.msj);
						}
					},
				});
			},
			function () {}
		);
	}
});

$(".btn-facturacion").on("click", function(e){
	e.preventDefault();
	facturacionParcial = $(this).data("parcial");
	if (facturacionParcial == false) {
		facturarCuenta(false);
	} else {
		$("#modal-facturacion").modal("hide");
	}
});

$("#modal-facturacion").on("hidden.bs.modal", function(e) {
	e.preventDefault();
	if (facturacionParcial === true) {
		$("#modal-solicitar-usuario").modal("show");
	}
});

$("#modal-solicitar-usuario").on("hidden.bs.modal", function(e) {
	e.preventDefault();
	$("#formDataAdmin")[0].reset();
	facturacionParcial = false;
});

$("#formDataAdmin").submit(function (e) {
	e.preventDefault();
	if ($(this).valid()) {
		UserAutorizaActual = $("#usuarioid").val();
		let data = {
			clave: $("#superclave").val(),
			usuarioid: UserAutorizaActual,
			actual: "N",
			cambio: `Usuario ${UserAutorizaActual} autoriza la facturación de solo lo puesto en marcha del Evento Nro ${nuevaReserva.cotizacion.evento}`,
			programa: "Eventos",
			permiso: 2640  
		};

		$.ajax({
			type: "POST",
			dataType: "json",
			url: base_url() + 'Administrativos/Servicios/PanelPrincipal/validarUsuario',
			data: {
				encriptado: $.Encriptar(data),
			},
			success: (resp) => {
				resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido) {
				facturarCuenta(true);
			} else {
				alertify.error(resp.mensaje);
			}
			}
		});
	} else {
		alertify.error("Llene los campos del formulario.");
	}
});

$("#btnCancelar").on("click", function(){
	location.href = base_url() + 'Administrativos/Servicios/PanelPrincipal';
});

$(".Tipo").on("shown.bs.tab", function(e) {
	switch ($(this).attr("href")) {
		case "#datosOtros":
			tblOtros.columns.adjust();
			break;
		case "#datosServicios":
			tblServicios.columns.adjust();
			break;
		case "#datosElemento":
			tblElementos.columns.adjust();
			break;
		case "#datosMenu":
			tblMenu.columns.adjust();
			break;
		case "#datosAdicionales":
			tblAdicionales.columns.adjust();
			break;
	}
});

// Métodos

function cargarData(cargarTodo = false) {
	const data = {
		menus: [],
		otros: [],
		servicios: [],
		elementosFijos: [],
		adicionales: [],
	};

	tblMenu
		.rows()
		.data()
		.each((producto) => {
			let {
				ProductoId,
				consumido,
				eventoProductoId,
				nombre,
				nombreMenu,
				menu,
			} = producto;
			if (!cargarTodo) {
				if (typeof consumido !== "undefined" && consumido > 0) {
					data.menus.push({
						ProductoId,
						consumido,
						eventoProductoId: eventoProductoId,
						nombre,
						nombreMenu,
						menu,
					});
				}
			} else {
				consumido = typeof consumido !== "undefined" ? consumido : 0;
				data.menus.push({
					ProductoId,
					consumido,
					eventoProductoId,
					nombre,
					nombreMenu,
					menu,
				});
			}
		});
	if (cargarTodo) {
		tblOtros
			.rows()
			.data()
			.each((producto) =>
				data.otros.push({
					ProductoId: producto.ProductoId,
					consumido: producto.cantidad,
					eventoProductoId: producto.eventoProductoId,
				})
			);
		tblServicios
			.rows()
			.data()
			.each((producto) =>
				data.servicios.push({
					ProductoId: producto.ProductoId,
					consumido: producto.cantidad,
					eventoProductoId: producto.eventoProductoId,
				})
			);
		tblElementos
			.rows()
			.data()
			.each((producto) => {
				if (producto.ElementoId == -1) {
					data.elementosFijos.push({
						ProductoId: producto.ProductoId,
						consumido: producto.cantidad,
						eventoProductoId: producto.eventoProductoId,
					});
				}
			});

		tblAdicionales
			.rows()
			.data()
			.each((producto) => {
				if (producto.cantidad && producto.cantidad > 0) {
					data.adicionales.push({
						ProductoId: producto.ProductoId,
						consumido: producto.cantidad,
						eventoProductoId: producto.eventoProductoId,
					});
				}
			});
	}

	return data;
}

// Procedimientos

totales.totalMenus = nuevaReserva.complementos.menus.reduce(
	(acumulador, producto) => acumulador + parseFloat(producto.total),
	0
);
totales.totalOtros = nuevaReserva.complementos.otros.reduce(
	(acumulador, producto) => acumulador + parseFloat(producto.total),
	0
);
totales.totalServicios = nuevaReserva.complementos.servicios.reduce(
	(acumulador, producto) => acumulador + parseFloat(producto.total),
	0
);
totales.totalFijos = nuevaReserva.complementos.elementosFijos.reduce(
	(acumulador, producto) => acumulador + parseFloat(producto.total),
	0
);
totales.totalAdicionales = nuevaReserva.complementos.adicionales.reduce(
	(acumulador, producto) => acumulador + parseFloat(producto.total),
	0
);
totales.totalTotal =
	totales.totalFijos +
	totales.totalMenus +
	totales.totalOtros +
	totales.totalServicios +
	totales.totalAdicionales;

$("#totalElementos").val(`$ ${addCommas(totales.totalFijos)}`);
$("#totalMenus").val(`$ ${addCommas(totales.totalMenus)}`);
$("#totalOtros").val(`$ ${addCommas(totales.totalOtros)}`);
$("#totalServicios").val(`$ ${addCommas(totales.totalServicios)}`);
$("#totalTotal").val(`$ ${addCommas(totales.totalTotal)}`);
$("#totalAdicionales").val(`$ ${addCommas(totales.totalAdicionales)}`);
$("#totalAnticipos").val(`$ ${addCommas(nuevaReserva.datosBasicos.anticipos)}`);

if (nuevaReserva.cotizacion.estado == "CO") {
	alertify.confirm(
		"Iniciar Evento",
		"¿Desea dar inicio al evento y con esto comenzar su ciclo de facturación?",
		function () {
			$.ajax({
				url: rutaGeneral + "iniciarEvento",
				type: "POST",
				dataType: "json",
				data: {
					eventoId: nuevaReserva.cotizacion.eventoId,
					meseroId
				},
				success: function (res) {
					if (res.success) {
						alertify.success(res.msj);
						setTimeout(() => {
							window.location.reload();
						}, 1000);
					} else {
						alertify.error(res.msj);
					}
				},
			});
		},
		function () {
			window.history.back();
		}
	);
}

if (nuevaReserva.cotizacion.estado == "FA") {
	alertify.confirm(
		"Facturación",
		"¿Desea cancelar el ciclo de facturación actual e iniciar nuevamente?",
		function () {
			$.ajax({
				url: rutaGeneral + "reiniciarEvento",
				type: "POST",
				dataType: "json",
				data: {
					eventoId: nuevaReserva.cotizacion.eventoId,
				},
				success: function (res) {
					if (res.success) {
						alertify.success(res.msj);
						setTimeout(() => {
							window.location.reload();
						}, 1000);
					} else {
						alertify.error(res.msj);
					}
				},
			});
		},
		function () {}
	).set('labels', {ok: "Si", cancel: "No"});
}

$.extend({
	redirectPost: function (location, args) {
		var form = $('<form></form>');
		form.attr("method", "post");
		form.attr("action", location);

		$.each(args, function (key, value) {
			var field = $('<input></input>');

			field.attr("type", "hidden");
			field.attr("name", key);
			field.attr("value", value);

			form.append(field);
		});
		$(form).appendTo('body').submit();
	}
});