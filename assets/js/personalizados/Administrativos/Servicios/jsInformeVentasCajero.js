let rutaGeneral = base_url() + 'Administrativos/Servicios/InformeVentasCajero/';
let dataFiltro = {
	almacenid: [$AlmacenId],
	fechaInicial: moment().format('YYYY-MM-DD'),
	fechaFinal: moment().format('YYYY-MM-DD'),
	FormasPago: [],
	tipoVenta: [],
	cajeros: []
};
if ($MasCajeros == 'N') {
	dataFiltro.cajeros.push($UsuarioId);
}
let tablaInformeVendedor;
let contexto = this;
let tablaVendedorFormaPago;
let tablaTotalFormaPago;

function configurarTabla() {
	if (tablaInformeVendedor) {
		tablaInformeVendedor.ajax.reload();
	} else {
		tablaInformeVendedor = $('#tablaInformeVendedor').DataTable({
			dom: domBftrip,
			fixedColumns: true,
			serverSide: true,
			pageLength: 10,
			scrollX: true,
			fixedColumns: {
				heightMatch: 'none'
			},
			ajax: {
				url: rutaGeneral + 'cargarDT',
				type: 'POST',
				data: function (d) {
					return $.extend(d, dataFiltro);
				},
			},
			buttons: [
				...buttonsDT(["copy", "excel", "pdf", "print", "pageLength"])
				, {
					className: 'btnImprimirReporte',
					text: '<i class="fas fa-print"></i> Imprimir Reporte'
				}
			],
			columns: [
				{ data: 'Cajero' }
				,{ data: 'Almacen' }
				,{ data: 'Factura' }
				,{ data: "TerceroNombre" }
				,{ data: "VendedorNombre" }
				,{ 
					data: 'Valor',
					className: "text-right",
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}
				}
				,{ 
					data: 'ValorIva', 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					} 
				}
				,{ 
					data: "ValorImpoConsumo", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}
				}
				,{ 
					data: 'ValorPropina', 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}
				}
				,{ 
					data: 'ValorTotal', 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}
				}
				,{ data: 'FormaPago' }
				,{ data: 'Fecha' }
				,{ 
					data: "RespuestasWPP", 
					visible: ($MONTAJE.WhatsAppFactura == 'S' ? true : false),
					render: function(data, type, row, meta) {
						let text = "N/A";
						if (row.InicaProcesoWPP == 'S' && row.PendienteProcesoWPP == 'S' && row.FormaPago != '0 | Sin Confirmar Forma de Pago') {
							text = "Completado";
						} else if (row.InicaProcesoWPP == 'S' && row.PendienteProcesoWPP == 'S' && row.FormaPago == '0 | Sin Confirmar Forma de Pago'){
							text = "En Proceso"
						} else if (row.InicaProcesoWPP == 'S' && row.FormaPago == '0 | Sin Confirmar Forma de Pago') {
							text = "Inicio"
						}
						return text;
					}
				}
				,{ 
					data: "RespuestasWPP", 
					className: 'RespuestasWPP',
					visible: ($MONTAJE.WhatsAppFactura == 'S' ? true : false)
				}
				,{ data: 'FechaRegistro' }
				,{ data: 'TipoVenta' }
			]
		});
	}
	totales();
}

function totales() {
	$.ajax({
		url: rutaGeneral + "totales/",
		type: 'POST',
		dataType: 'json',
		data: dataFiltro,
		success: function (respuesta) {
			$('#inputTotalFacturado').val('$' + addCommas(respuesta.Valor ? respuesta.Valor : '0.00'));
			$('#inputTotalSinIva').val('$' + addCommas(respuesta.ValorSinIva ? respuesta.ValorSinIva : '0.00'));
			$('#inputIVA').val('$' + addCommas(respuesta.IVA ? respuesta.IVA : '0.00'));
			$('#Propina').val('$' + addCommas(respuesta.Propina ? respuesta.Propina : '0.00'));
			$('#Descuentos').val('$' + addCommas(respuesta.Descuentos ? respuesta.Descuentos : '0.00'));
			$('#inputImpoConsumo').val('$' + addCommas(respuesta.ImpoConsumo ? respuesta.ImpoConsumo : '0.00'));
			$('#inputTotalIngreso').val('$' + addCommas(respuesta.TotalIngreso ? respuesta.TotalIngreso : '0.00'));
		}
	});
};

function configurarTablaVendedorFormaPago() {
	if (tablaVendedorFormaPago) {
		tablaVendedorFormaPago.ajax.reload();
	} else {
		tablaVendedorFormaPago = $('#tblFormaPagoVendedor').DataTable({
			dom: domBftrip,
			fixedColumns: true,
			serverSide: true,
			pageLength: 10,
			scrollX: true,
			fixedColumns: {
				heightMatch: 'none'
			},
			ajax: {
				url: rutaGeneral + 'cargarDTFormaPago',
				type: 'POST',
				data: function (d) {
					return $.extend(d, dataFiltro);
				},
			},
			buttons: buttonsDT(["copy" ,"excel", "pdf", "print", "pageLength"]),
			columns: [
				{ data: 'CajeroNombre' }
				,{ data: 'FormaPago' }
				,{ 
					data: 'TotalSinIva', 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}
				}
				,{ 
					data: "TotalIva", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}
				}
				,{ 
					data: "TotalImpoConsumo", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					} 
				}
				,{ 
					data: "TotalPropina", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					} 
				}
			]
		});
	}
}

function configurarTablaTotalFormaPago() {
	if (tablaTotalFormaPago) {
		tablaTotalFormaPago.ajax.reload();
	} else {
		tablaTotalFormaPago = $('#tblFormaPagoTotal').DataTable({
			dom: domBftrip,
			fixedColumns: true,
			serverSide: true,
			pageLength: 10,
			scrollX: true,
			fixedColumns: {
				heightMatch: 'none'
			},
			ajax: {
				url: rutaGeneral + 'cargarDTTotalFormaPago',
				type: 'POST',
				data: function (d) {
					return $.extend(d, dataFiltro);
				},
			},
			buttons: buttonsDT(["copy", "excel", "pdf", "print", "pageLength"]),
			columns: [
				{ data: 'FormaPago' }
				,{ 
					data: 'TotalSinIva', 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					} 
				}
				,{ 
					data: "TotalIva", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}  
				}
				,{ 
					data: "TotalImpoConsumo", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					}  
				}
				,{ 
					data: "TotalPropina", 
					className: 'text-right',
					render: function(data, type, row, meta) {
						return '$' + addCommas((data <= 0 ? '0.00' : data));
					} 
				}
			]
		});
	}
}

function obtenerCajeros() {
	$.ajax({
		url: rutaGeneral + "cajeros",
		type: 'POST',
		data: {
			almacenid: $("#almacenid").val()
		},
		dataType: 'json',
		success: function (res) {
			let estruc = "<option selected value='-1'>Todos</option>";
			if (res.length) {
				res.forEach(op => {
					estruc += `<option value="${op.usuarioId}">${op.nombre}</option>`;
				});
			}
			$("#cajeros").html(estruc).trigger('chosen:updated');
		}
	});
}

$(function(){
	let almacenActivo = $Almacenes.find(almacen => almacen.almacenid == $AlmacenId);

	if (almacenActivo !== undefined) {
		$('#almacenid').val($AlmacenId);
	}
	$('#fInicial').val(dataFiltro.fechaInicial);
	$('#fFinal').val(dataFiltro.fechaFinal);
	$(".chosen-select").chosen({ width: '100%' });
	configurarTabla();
	
	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#fInicial").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : 0;
		$('#fFinal').data("DateTimePicker").minDate(fecha);
	});
	$("#fFinal").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : moment().format('YYYY-MM-DD');
		$('#fInicial').data("DateTimePicker").maxDate(fecha);
	});

	$("#fFinal").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));
	
	$(".FiltrosSelec").change(function (e, el) {
		e.preventDefault();
		let values = ['-1'];
		if (el.selected != -1) {
			values = $(this).val().filter(x => x != '-1');
			if (values.length <= 0 || values.length >= ($(this).find("option").length - 1)) values = ['-1'];
		}

		//Esto solo lo hace para el select para tipo evento
		if ($(this).attr("id") == 'almacenid' && el.deselected != '-1') {
			obtenerCajeros();
		}

		$(this).val(values).trigger("chosen:updated");
	});
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (event) {
		contexto[$(this).data('tab')]();
	});

	$("#filtros").on("submit", function(e){
		e.preventDefault();
		if ($(this).valid()) {
			dataFiltro.fechaInicial = $('#fInicial').val();
			dataFiltro.fechaFinal = $('#fFinal').val();
			dataFiltro.almacenid = $("#almacenid").val().filter(x => x != '-1');
			dataFiltro.FormasPago = $("#FormasPago").val().filter(x => x != '-1');
			dataFiltro.tipoVenta = $("#tipoVenta").val().filter(x => x != '-1');

			if ($MasCajeros == 'S') {
				dataFiltro.cajeros = $("#cajeros").val().filter(x => x != '-1');
			}

			let tabla = $("#tabModal .nav-item .nav-link.active").data('tab');
			contexto[tabla]();
			if (tabla != 'configurarTabla') {
				totales();
			}
		}
	});

	$(".btnImprimirReporte").on('click', function() {

		let strDataReport = `&almacenes=${JSON.stringify(dataFiltro.almacenid)}`;

		if (dataFiltro.FormasPago && dataFiltro.FormasPago.length) {
			strDataReport += `&formasPago=${JSON.stringify(dataFiltro.FormasPago)}`;
		}

		if (dataFiltro.tipoVenta && dataFiltro.tipoVenta.length) {
			strDataReport += `&tipoVenta=${JSON.stringify(dataFiltro.tipoVenta)}`;
		}

		if (dataFiltro.cajeros && dataFiltro.cajeros.length) {
			strDataReport += `&cajero=s${JSON.stringify(dataFiltro.cajeros)}`;
		}

		abrirReporte(`${base_url()}Reportes/imprimirVentasCajero?FechaIni=${dataFiltro.fechaInicial}&FechaFin=${dataFiltro.fechaFinal}${strDataReport}`);
	});
});