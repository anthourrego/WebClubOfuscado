let tablaInformeVendedor;
let rutaGeneral = base_url() + 'Administrativos/Servicios/InformeVendedor/';
let dataFiltro = {
	vendedor: $vendedor,
	almacen: $almacen,
	fechaInicial: moment().format('YYYY-MM-DD'),
	fechaFinal: moment().format('YYYY-MM-DD')
};
let alamacenNoFisico = {};

function configurarTabla() {
	tablaInformeVendedor = $('#tablaInformeVendedor').DataTable({
		dom: domBftrip,
		fixedColumns: true,
		serverSide: true,
		pageLength: 10,
		scrollX: true,
		ajax: {
			url: rutaGeneral + "cargarDT",
			type: 'POST',
			data: function (d) {
				return $.extend(d, dataFiltro);
			},
		},
		buttons: [{
			extend: 'copy',
			className: 'copyButton',
			text: 'Copiar'
		}, {
			extend: 'excel',
			className: 'excelButton',
			orientation: 'landscape',
			pageSize: 'letter',
		}, {
			extend: 'pdf',
			className: 'pdfButton',
			tex: 'PDF',
			orientation: 'landscape',
			pageSize: 'letter'
		}, {
			className: 'btnImprimir',
			text: '<i class="fas fa-print"></i> Imprimir'
		}, {
			className: 'btnImprimirNoFisico',
			text: '<i class="fas fa-print"></i> Imprimir No Fisico'
		}],
		columns: [
			{ data: 'FacturaId', width: '11.11%' }
			, { data: 'Nombre_Habitacion', width: '11.11%' }
			, { data: 'Factura', width: '11.11%' }
			, { data: 'Forma Pago', width: '11.11%' }
			, { data: 'Fecha', width: '11.11%' }
			, { data: 'Código Vendedor', width: '11.11%' }
			, { data: 'Vendedor', width: '11.11%' }
			, { data: 'Almacén', width: '11.11%' }
			, { data: 'Subtotal', width: '11.11%', className: 'subTotal' }
			, { data: 'IVA', width: '11.11%', className: 'valorIva' }
			, { data: 'Propina', width: '11.11%', className: 'propina' }
			, { data: 'Valor Total', width: '11.11%', className: 'valorTotal' }
		],
		createdRow: function (row, data, dataIndex) {
			$(row).find('.subTotal').html(addCommas(data['Subtotal']));
			$(row).find('.valorIva').html(addCommas(data['IVA']));
			$(row).find('.propina').html(addCommas(data['Propina']));
			$(row).find('.valorTotal').html(addCommas(data['Valor Total']));
		},
	});
}

function obtenerInformacion(data, metodoBack, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: 'POST',
		data: { encriptado: data },
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
				if (tablaInformeVendedor && metodoBack != 'validarFacturas') {
					tablaInformeVendedor.destroy();
					tablaInformeVendedor.clear().draw();
					tablaInformeVendedor = null;
				}
			}
		}
	});
}

function informacionVendedor(resp) {
	dataFiltro.fechaInicial = $("#FechaIni").val();
	dataFiltro.fechaFinal = $("#FechaFin").val();

	if (moment(dataFiltro.fechaInicial).isAfter(dataFiltro.fechaFinal)) {
		return alertify.warning("La fecha inicial debe ser menor a la final");
	}
	if (tablaInformeVendedor) {
		tablaInformeVendedor.ajax.reload();
	} else {
		configurarTabla();
	}
}

function almacenesNoFisicos({ almacenes }) {
	if (almacenes.length == 1) {
		irAlmacenNoFisico(almacenes[0]);
	} else {
		let estructura = '';
		almacenes.forEach(op => {
			estructura += `<div onclick='irAlmacenNoFisico(${JSON.stringify(op)})' title="Ir al almacen" class="m-b-10 d-flex border rounded justify-content-between align-items-center pl-2">
				<div style="width: 72%;">
					<h6>${op.almacenid} - ${op.nombre}</h6>
				</div>
				<button type="button" title="Ir a la cuenta" class="btn btn-sm btn-secondary" style="max-height: 75px; height: 75px;">
					<i class="fas fa-share-square"></i>
				</button>
			</div>`;
		});
		$("#listaAlmacenes").html(estructura);
		$("#almacenNoFisico").modal('show');
	}
}

function irAlmacenNoFisico(info) {
	info.almacenid = info.almacenid.trim();
	alamacenNoFisico = info;
	if ($("#formCodigoVendedor").valid()) {
		let data = {
			vendedor: $vendedor,
			almacen: alamacenNoFisico.almacenid,
			fechaInicial: $("#FechaIni").val(),
			fechaFinal: $("#FechaFin").val()
		}
		$("#almacenNoFisico").modal('hide');
		obtenerInformacion(data, 'validarFacturas', 'facturasValidadasNoFisico');
	} else {
		alertify.error("Valide la fecha inicio y/o la final");
	}
}

function facturasValidadasNoFisico() {
	let strReportes = `?r0=imprimirInformeVendedor/${$vendedor}/${alamacenNoFisico.almacenid}/${$("#FechaIni").val()}/${$("#FechaFin").val()}`;
	abrirReporte(base_url() + `Reportes/imprimirReportes/${strReportes}`, this, null, null, 'onbeforeunload');
}

function facturasValidadas() {
	let strReportes = `?r0=imprimirInformeVendedor/${$vendedor}/${$almacen}/${$("#FechaIni").val()}/${$("#FechaFin").val()}`;
	abrirReporte(base_url() + `Reportes/imprimirReportes/${strReportes}`, this, null, null, 'onbeforeunload');
}

$(function () {
	RastreoIngresoModulo('Informe Vendedor');

	$("#FechaIni, #FechaFin").val(moment().format('YYYY-MM-DD'));

	let data = {
		vendedor: $vendedor,
		fechaInicial: $("#FechaIni").val(),
		fechaFinal: $("#FechaFin").val(),
		almacen: $almacen
	};
	obtenerInformacion(data, 'validarVendedor', 'informacionVendedor');

	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#FechaIni").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : 0;
		$('#FechaFin').data("DateTimePicker").minDate(fecha);
	});
	$("#FechaFin").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : moment().format('YYYY-MM-DD');
		$('#FechaIni').data("DateTimePicker").maxDate(fecha);
	});

	$("#FechaFin").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));

	$("#formCodigoVendedor").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let data = {
				vendedor: $vendedor,
				fechaInicial: $("#FechaIni").val(),
				fechaFinal: $("#FechaFin").val(),
				almacen: $almacen
			};
			if (moment(data.fechaInicial).isAfter(data.fechaFinal)) {
				return alertify.warning("La fecha inicial debe ser menor a la final");
			}
			obtenerInformacion(data, 'validarVendedor', 'informacionVendedor');
		}
	});

	$(document).on("click", ".btnImprimir", function () {
		if ($("#formCodigoVendedor").valid()) {
			let data = {
				vendedor: $vendedor,
				almacen: $almacen,
				fechaInicial: $("#FechaIni").val(),
				fechaFinal: $("#FechaFin").val()
			}
			obtenerInformacion(data, 'validarFacturas', 'facturasValidadas');
		} else {
			alertify.error("Valide la fecha inicio y/o la final");
		}
	});

	$(document).on("click", ".btnImprimirNoFisico", function () {
		let data = {
			vendedor: $vendedor || null
		}
		obtenerInformacion(data, 'obtenerAlmacenesNoFisico', 'almacenesNoFisicos');
	});

	$("#btnCancelarModal").on('click', function () {
		$("#almacenNoFisico").modal('hide');
	});
});