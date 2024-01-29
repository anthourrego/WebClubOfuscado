let dataFiltro = {
	tblVendedorTop1: {},
	tblProductoTop1: {},
	tblMesaTop1: {},
	tblMesaFacturaTop1: {},
	tblMesaHoraTop1: {},
	tblMesaPromedio: {}
};

let tabla = {
	tblVendedorTop1: '',
	tblMesaTop1: '',
	tblMesaFacturaTop1: '',
	tblMesaHoraTop1: '',
	tblProductoTop1: '',
	tblMesaPromedio: '',
}

let dataGrafico = {
	graficaVendedorTop1: '',
	graficaMesaTop1: '',
	graficaMesaFacturaTop1: '',
	graficaMesaHoraTop1: '',
	graficaProductoTop1: '',
	graficaMesaPromedio: ''
};
let dataVendedorTop1 = [];

let grafica = {
	graficaVendedorTop1: '',
	graficaMesaTop1: '',
	graficaMesaFacturaTop1: '',
	graficaMesaHoraTop1: '',
	graficaProductoTop1: '',
	graficaMesaPromedio: '',
}

$(function () {
	$('#almacenid').val('');
	$('#zonaid').val('');
	$('#FechaInicial').val('');
	$('#FechaFinal').val('');
	$('#tamano').val(6);
	$('#dias').val(1);

	datoDashboardGrafica('horizontalBar');
	$('.contenidoAvanzado' + 1).addClass('d-none');
	$('.contenidoGrafico' + 1).removeClass('d-none');
	$('.contenidoAvanzado' + 2).addClass('d-none');
	$('.contenidoGrafico' + 2).removeClass('d-none');
	$('.contenidoAvanzado' + 3).addClass('d-none');
	$('.contenidoGrafico' + 3).removeClass('d-none');
	$('.contenidoAvanzado' + 4).addClass('d-none');
	$('.contenidoGrafico' + 4).removeClass('d-none');
	$('.contenidoAvanzado' + 5).addClass('d-none');
	$('.contenidoGrafico' + 5).removeClass('d-none');
	$('.contenidoAvanzado' + 6).addClass('d-none');
	$('.contenidoGrafico' + 6).removeClass('d-none');
});

$(document).on("click", ".btnFiltros", function (e) {
	e.preventDefault();
	$("#formFiltro select").val('T').trigger("chosen:updated");
	$("#tamano").val(6).trigger("chosen:updated");
	$("#FechaInicial, #FechaFinal").val(moment().format('YYYY-MM-DD'));
	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#FechaInicial").on("dp.change", function (e) {
		$('#FechaFinal').data("DateTimePicker").minDate(e.date);
	});
	$("#FechaFinal").on("dp.change", function (e) {
		$('#FechaInicial').data("DateTimePicker").maxDate(e.date);
	});
	$("#FechaFinal, #FechaInicial").change();

	$.each(dataFiltro['tblVendedorTop1'], function (key, value) {
		campo = $("#formFiltro [name='" + key + "']");
		if (campo.is("select")) {
			campo.val(value).trigger('chosen:updated');
		} else {
			campo.val(value);
		}
	});
	$("#modalFiltro").modal("show");
});

$(document).on("click", "#btnFiltroReset", function (e) {
	e.preventDefault();
	$("#FechaFinal, #FechaInicial").val(moment().format('YYYY-MM-DD'));
	$("#FechaFinal, #FechaInicial").change();
	$("#almacenId").val('T').trigger("chosen:updated");
	$("#zonaid").val('T').trigger("chosen:updated");
	$("#Tipo").find("option").prop("selected", true);
	$("#Tipo").val('').trigger("chosen:updated");
	$("#tamano").val(6).trigger("chosen:updated");
	$("#btnBuscarFiltro").click();
});

$(document).on("click", "#btnBuscarFiltro", function (e) {
	e.preventDefault();
	let data = {
		'FechaInicial': $('#FechaInicial').val(),
		'FechaFinal': $('#FechaFinal').val(),
		'almacenid': $('#almacenid').val(),
		'zonaid': $('#zonaid').val()
	}

	if (dataPermisos.tblVendedorTop1) {
		organizarFiltro('tblVendedorTop1', 'graficaVendedorTop1', data);
	}
	if (dataPermisos.tblProductoTop1) {
		organizarFiltro('tblProductoTop1', 'graficaProductoTop1', data);
	}
	if (dataPermisos.tblMesaTop1) {
		organizarFiltro('tblMesaTop1', 'graficaMesaTop1', data);
	}
	if (dataPermisos.tblMesaFacturaTop1) {
		organizarFiltro('tblMesaFacturaTop1', 'graficaMesaFacturaTop1', data);
	}
	if (dataPermisos.tblMesaHoraTop1) {
		organizarFiltro('tblMesaHoraTop1', 'graficaMesaHoraTop1', data);
	}
	if (dataPermisos.tblMesaPromedio) {
		dataFiltro['tblMesaPromedio'] = { ...data };
		dataFiltro['tblMesaPromedio']['tblTabla'] = 'tblMesaPromedio';
		grafica['graficaMesaPromedio'].destroy();
	}
	datoDashboardGrafica('horizontalBar');
	$("#modalFiltro").modal("hide");
});

function organizarFiltro(tabla, grafica, data) {
	dataFiltro[tabla] = { ...data };
	dataFiltro[tabla]['tblTabla'] = tabla;
}

$(document).off("change", "#almacenid").on('change', "#almacenid", function (e) {
	e.preventDefault();
	$('#zonaid').html('<option selected value="T">Todos</option>');
	$.ajax({
		url: base_url() + "Administrativos/Dashboard/obtenerZonas/" + $(this).val().trim(),
		type: 'GET',
		dataType: "json",
		success: function (respuesta) {
			$.each(respuesta, function (i, item) {
				$('#zonaid').append($('<option>', {
					value: item.ZonaId,
					text: item.Nombre
				}));
			});
		}
	});
});

$('.btn_verGraficas').on('click', function () {
	contenido = $(this).attr('data-contenido');
	if ($(this).val() == 0) {
		$('.contenidoAvanzado' + contenido).addClass('d-none');
		$('.contenidoGrafico' + contenido).removeClass('d-none');
		$(this).val(1);
		$(this).html('<i class="fas fa-newspaper"></i>');
		IdGrafica = $(this).attr('data-grafica');
		grafica[IdGrafica].destroy();
		graficar($('.' + IdGrafica).val(), dataGrafico[IdGrafica], IdGrafica);
	} else {
		$('.contenidoAvanzado' + contenido).removeClass('d-none');
		$('.contenidoGrafico' + contenido).addClass('d-none');
		$(this).html('<i class="fas fa-chart-bar"></i>');
		$(this).val(0);
		let tablaStr = $(this).attr('data-tabla');
		if (tablaStr) {
			if (tabla[tablaStr].ajax) {
				tabla[tablaStr].ajax.reload();
			} else {
				DataTableFull(tablaStr)
			}
		}
	}
	$(this).removeClass('has-ripple');
});

$(".selectorGrafica").change(function () {
	IdGrafica = $(this).attr('data-grafica');
	grafica[IdGrafica].destroy();
	graficar($(this).val(), dataGrafico[IdGrafica], IdGrafica);
});

function DataTableFull(Strtable) {
	dataFiltro[Strtable]['tblTabla'] = Strtable;
	switch (Strtable) {
		case 'tblProductoTop1':
			columns = [
				{ data: 'cantidad' }
				, { data: 'Referencia' }
				, { data: 'Nombre' }
				, { data: 'Venta' }
				, { data: 'Ingreso' }
				, { data: 'Iva' }
				, { data: 'Descuento' }
			];
			break;

		case 'tblMesaTop1':
			columns = [
				{ data: 'mesa' }
				, { data: 'personas' }
				, { data: 'Nombre' }
				, { data: 'Venta' }
				, { data: 'Ingreso' }
				, { data: 'Iva' }
				, { data: 'Descuento' }
			];
			break;

		case 'tblMesaFacturaTop1':
			columns = [
				{ data: 'mesa' }
				, { data: 'factura' }
				, { data: 'Nombre' }
				, { data: 'Venta' }
				, { data: 'Ingreso' }
				, { data: 'Iva' }
				, { data: 'Descuento' }
			];
			break;

		case 'tblMesaHoraTop1':
			columns = [
				{ data: 'mesa' }
				, { data: 'hora' }
				, { data: 'Nombre' }
				, { data: 'Venta' }
				, { data: 'Ingreso' }
				, { data: 'Iva' }
				, { data: 'Descuento' }
			];
			break;

		default:
			columns = [
				{ data: "Nombre" },
				{ data: "Venta" },
				{ data: "Ingreso" },
				{ data: "Iva" },
			];
			break;
	}

	tabla[Strtable] = $('#' + Strtable).DataTable({
		language,
		order: [],
		dom: 'lBfrtip',
		processing: true,
		serverSide: true,
		pageLength: 3,
		ajax: {
			url: base_url() + "Administrativos/Dashboard/carga",
			type: 'POST',
			data: function (d) {
				return $.extend(d, dataFiltro[Strtable]);
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
			action: newExportAction,
		}, {
			extend: 'pdf',
			className: 'pdfButton',
			tex: 'PDF',
			orientation: 'landscape',
			pageSize: 'letter'
		}, {
			extend: 'print',
			className: 'printButton',
			orientation: 'landscape',
			pageSize: 'letter',
			text: 'Imprimir'
		}],
		columns: columns,
		initComplete: function () {
			$('div#' + Strtable + '_filter input').unbind();
			$('div#' + Strtable + '_filter input').keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find('#' + Strtable).dataTable();
				}
			}).change(function (e) {
				e.preventDefault();
				table = $("body").find('#' + Strtable).dataTable();
				table.fnFilter(this.value);
			});
			$('div#' + Strtable + '_filter input').focus();
			$('div#' + Strtable + '_paginate').css(
				"margin-bottom", "5px"
			);
		}
	});
}

//Esta función me permite hacer las graficas
function graficar(tipo, vector, Strgrafica) {
	var vLabel = [];
	var vData = [];

	for (var i = 0; i < vector.length; i++) {
		if (i > 9)
			break;
		vLabel.push(vector[i]['labels']);
		vData.push(vector[i]['cantidad']);
	}

	if (tipo != 'line' && tipo != 'radar') {
		grafica[Strgrafica] = new Chart(document.getElementById(Strgrafica), {
			type: tipo,
			data: {
				labels: vLabel,
				datasets: [{
					label: 'Datos',
					data: vData,
					backgroundColor: [
						'rgba(255, 99, 132, 0.6)',
						'rgba(54, 162, 235, 0.6)',
						'rgba(255, 206, 86, 0.6)',
						'rgba(75, 192, 192, 0.6)',
						'rgba(153, 102, 255, 0.6)',
						'rgba(255, 159, 64, 0.6)',
						'rgba(255, 99, 132, 0.6)',
						'rgba(54, 162, 235, 0.6)',
						'rgba(255, 206, 86, 0.6)',
						'rgba(75, 192, 192, 0.6)',
						'rgba(153, 102, 255, 0.6)',
						'rgba(255, 206, 86, 0.6)'
					]
				}]
			}
		});
	} else {
		grafica[Strgrafica] = new Chart(document.getElementById(Strgrafica), {
			type: tipo,
			data: {
				labels: vLabel,
				datasets: [{
					label: '',
					data: vData,
					fill: false,
					borderColor: 'gray',
					backgroundColor: 'transparent',
					pointBorderColor: 'gray',
					pointBackgroundColor: 'lightgray',
					pointRadius: 5,
					pointHoverRadius: 15,
					pointHitRadius: 30,
					pointBorderWidth: 2
				}]
			}
		});
	}
}

function datoDashboardGrafica(tipo) {
	$("#VendedorVenta").html('$' + 0);
	$("#VendedorNombre").html('Nombre Vendedor');
	dataGrafico['graficaVendedorTop1'] = [];
	dataGrafico['graficaMesaTop1'] = [];
	dataGrafico['graficaMesaFacturaTop1'] = [];
	dataGrafico['graficaMesaHoraTop1'] = [];
	dataGrafico['graficaProductoTop1'] = [];
	dataGrafico['graficaMesaPromedio'] = [];
	$("#ProductoCantidad").html(0);
	$("#ProductoNombre").html('Nombre Producto');
	$("#Venta").html('$0');
	$("#Descuento").html('Descuento $0.00');
	$('#trpromedio').html('<td>0.00</td><td>0.00</td>');
	$("#totalProducto").html('0');

	$.ajax({
		url: base_url() + "Administrativos/Dashboard/datoDashboard",
		type: 'POST',
		data: {
			almacenId: $('#almacenid').val()
			, zonaId: $('#zonaid').val()
			, FechaInicial: $('#FechaInicial').val()
			, FechaFinal: $('#FechaFinal').val()
		},
		dataType: "json",
		success: function (respuesta) {
			$('#dias').html(respuesta.dias);
			if (respuesta.productoTop1.length > 0) {
				dataGrafico['graficaProductoTop1'] = respuesta.productoTop1;
				$("#ProductoCantidad").html(respuesta.productoTop1[0].cantidad);
				$("#ProductoNombre").html(respuesta.productoTop1[0].labels);
			}

			if (respuesta.vendedorTop1.length > 0) {
				dataGrafico['graficaVendedorTop1'] = respuesta.vendedorTop1;
				$("#VendedorVenta").html('$' + respuesta.vendedorTop1[0].Venta);
				$("#VendedorNombre").html(respuesta.vendedorTop1[0].labels);
			}

			if (respuesta.mesaTop1.length > 0) {
				dataGrafico['graficaMesaTop1'] = respuesta.mesaTop1;
			}

			if (respuesta.mesaFacturaTop1.length > 0) {
				dataGrafico['graficaMesaFacturaTop1'] = respuesta.mesaFacturaTop1;
			}

			if (respuesta.mesaHoraTop1.length > 0) {
				dataGrafico['graficaMesaHoraTop1'] = respuesta.mesaHoraTop1;
			}

			if (respuesta.ventaTotal.Venta != null) {
				$("#Venta").html('$' + respuesta.ventaTotal.Venta);
				$("#Descuento").html('Descuento $' + respuesta.ventaTotal.Descuento);
			}

			if (respuesta.mesaPromedio.length > 0) {
				dataGrafico['graficaMesaPromedio'] = respuesta.mesaPromedio;
				$('#trpromedio').html('<td>' + (respuesta.mesaPromedio[0].cantidad || 0) + '</td>' + '<td>' + (respuesta.mesaPromedio[1].cantidad || 0) + '</td>');
			}

			if (respuesta.totalProducto.cantidad > 0) {
				$("#totalProducto").html(respuesta.totalProducto.cantidad);
			}

			if (dataPermisos.tblVendedorTop1) graficar(tipo, dataGrafico['graficaVendedorTop1'], 'graficaVendedorTop1');

			if (dataPermisos.tblProductoTop1) graficar(tipo, dataGrafico['graficaProductoTop1'], 'graficaProductoTop1');

			if (dataPermisos.tblMesaTop1) graficar(tipo, dataGrafico['graficaMesaTop1'], 'graficaMesaTop1');

			if (dataPermisos.tblMesaFacturaTop1) graficar(tipo, dataGrafico['graficaMesaFacturaTop1'], 'graficaMesaFacturaTop1');

			if (dataPermisos.tblMesaHoraTop1) graficar(tipo, dataGrafico['graficaMesaHoraTop1'], 'graficaMesaHoraTop1');

			if (dataPermisos.tblMesaPromedio) graficar(tipo, dataGrafico['graficaMesaPromedio'], 'graficaMesaPromedio');
		}
	});
}
