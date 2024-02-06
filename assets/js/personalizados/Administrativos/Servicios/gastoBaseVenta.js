let rutaGeneral = base_url() + 'Administrativos/Servicios/GastoBaseVenta/';
var contexto = this;
var GastoCajaId;
let opcion;
let usuarioAutoriza = null;
// Teclado Numérico Touch
var punto = false,
	click = false;

function quitarComa(id) {
	if (id != null && id != '') {
		id = id.replace(/,/g, '');
	}
	return +id;
}
let cambioDatoEditar = false;
var selecciones = [];
var estadosMantenimiento = "'I', 'F'"
var DT;
var altoPantalla = $(document).height();
var fechaInicio = moment().format('YYYY-MM-DD'),
	fechaFin = moment().format('YYYY-MM-DD');

function tabla(fechaInicio = "", fechaFin = "") {

	DT = dtSS({
		data: {
			tblID: "#tblCRUD"
		},
		ajax: {
			url: rutaGeneral + "DTGastoBaseVenta",
			type: "POST",
			data: function (d) {
				return $.extend(d, { fechaInicio, fechaFin ,AlmacenId : $ALMACEN});
			}
		},
		// order: false,
		fixedColumns: true,
		pageLength: 8,
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web Club' },
			// { extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: {columns: ':not(:first-child)'}, title: 'Web Club'},
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web Club' } }
			, {
				className: 'btnFiltros',
				text: '<i class="fas fa-plus"></i> Crear gastos'
			}
		],
		columns: [
			{ data: 'accion' },
			{ data: 'GastoCajaId' },
			{ data: 'Consecutivo' },
			{ data: 'Factura' },
			{ data: 'Valor' },
			{ data: 'Concepto' },
			{ data: 'TerceroId' },
			{ data: 'NombreTercero' },
			{ data: 'ConceptoGastoId' },
			{ data: 'NombreConcepto' },
			{ data: 'CentCostId' },
			{ data: 'NombreControCosto' },
			{ data: 'AlmacenId' },
			{ data: 'ALMACEN' },
			{ data: 'Estado' },
			{ data: 'Fecha' },
			{ data: 'UsuarioId' },
			{ data: 'NombreUsuario' },
			{ data: 'Iva' },
			{ data: 'IvaId' },
			{ data: 'RetenFuent' },
			// { data :'TariReteId'},
			{ data: 'ImpoConsumo' },
			{ data: 'PorceReten' },
			{ data: 'RetenIva' },
			{ data: 'RetenIca' },
			{ data: 'DocumentoTipo' }
		],
		initComplete: function () {
			$('div.dataTables_filter input').unbind();
			$("div.dataTables_filter input").keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tblCRUD").dataTable();
					table.fnFilter(this.value);
				}
			});
			$('div.dataTables_filter input').focus();
		},
		createdRow: function (row, data, dataIndex) { },
		rowCallback: function (row, data) {
			btnEliminar = ($anularGastoPermiso ? `<button type="button" class="eliminar btn btn-danger btn-xs mb-2 has-ripple" value="` + data.GastoCajaId + `"><span class="far fa-trash-alt" title="Eliminar"></span></button>` : '');
			btnEditar = ($editarGastoPermiso ? `<button type="button" class="editar btn btn-secondary btn-xs mb-2 has-ripple" value="` + data.GastoCajaId + `"><span class="far fa-edit" title="Editar"></span></button>` : '');
			btnReimprimir = ($reimprimirGastoPermiso ? `<button type="button" class="reimprimir btn btn-info btn-xs mb-2 has-ripple" value="` + data.GastoCajaId + `"><span class="fas fa-print" title="Imprimir"></span></button>` : '');
			var boton = `<div class="btn-group btn-group-xs">
				${data.EstadoOri != 'NU' ? btnEditar : ''}
				${data.EstadoOri != 'NU' ? btnEliminar : ''}
				${btnReimprimir}
			</div>`;

			$(row).find('td:eq(0)').addClass("text-center").html(boton);

			$(row).off('click', '.editar').on('click', '.editar', function (event) {
				GastoCajaId = data.GastoCajaId;
				permiso = 2617;
				event.preventDefault();
				abrirCerrarModal("#modal-solicitar-usuario", "show");
				setTimeout(() => {
					$("#usuarioid").focus();
				}, 100);
			});

			$(row).off('click', '.reimprimir').on('click', '.reimprimir', function (event) {
				event.preventDefault();
				abrirReporte(base_url() + 'Reportes/ImprimirGastoBaseVenta/' + data.GastoCajaId, contexto, 'redireccionGastoBaseVenta');
			});

			$(row).off('click', '.eliminar').on('click', '.eliminar', function (event) {
				event.preventDefault();
				GastoCajaId = data.GastoCajaId;
				permiso = 2618;
				abrirCerrarModal("#modal-solicitar-usuario", "show");
				setTimeout(() => {
					$("#usuarioid").focus();
				}, 100);
			});
		},
		scrollX: '100%',
		scrollY: altoPantalla - 355,
		scroller: {
			loadingIndicator: true
		},
		scrollCollapse: false,
		dom: domBftri,
		columnDefs: [
			{ visible: false, targets: [1, 8, 10, 8, 15] }
		],
	});
}

function GuardarGasto(data) {
	data = { ...data, usuarioAutoriza: usuarioAutoriza,AlmacenId : $ALMACEN };
	data = $.Encriptar(data);
	$.ajax({
		url: rutaGeneral + 'GuardarGasto',
		type: 'POST',
		dataType: 'json',
		data: {
			encriptado: data
		},
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido == 1) {
				cambioDatoEditar = false;
				alertify.success(resp.mensaje);
				DT.ajax.reload();
				alertify.alert('Gasto Base Ventas: ' + resp.idInsert, resp.mensaje, function () {
					abrirReporte(base_url() + 'Reportes/ImprimirGastoBaseVenta/' + resp.id, contexto, 'redireccionGastoBaseVenta');
				});
			} else {
				alertify.error(resp.mensaje);
			}
		}, error: (err) => { console.log("error", err); alertify.error('No fue posible guardar los datos') }
	});
};

function abrirCerrarModal(elemento, metodo, elementoAbrir, metodoAbrir) {
	$(elemento).modal(metodo);
	if (elementoAbrir && metodoAbrir) {
		$(elementoAbrir).modal(metodoAbrir);
	}
}

function redireccionGastoBaseVenta() {
	$(".modalEditar").modal("hide");
	DT.ajax.reload();
}

function validaPorcentaje(param, valor = false) {
	let Valorinput = valor;
	let nvalor = quitarComa($('#Valor').val());
	Iva = quitarComa($('#Iva').val());
	let Porce = param == 'PorceReten' ? (quitarComa(Valorinput) * 100) / (nvalor - Iva) : (Iva * 100) / (nvalor - Iva);
	if (Porce == Infinity || isNaN(Porce)) {
		100
		$('#' + param).val('***.**');
	} else {
		Porce > -1 ? $('#' + param).val(Porce.toFixed(1)) : $('#' + param).val('0.00');
	}
}

$(function () {

	RastreoIngresoModulo('Gasto base venta');

	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#fechaInicio").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : 0;
		$('#fechaFinal').data("DateTimePicker").minDate(fecha);
	});
	$("#fechaFinal").on("dp.change", function (e) {
		var fecha = (e.date._i != undefined) ? e.date : moment().format('YYYY-MM-DD');
		$('#fechaInicio').data("DateTimePicker").maxDate(fecha);
	});

	$("#fechaFinal").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));

	$("#fechaInicio, #fechaFinal").val(moment().format('YYYY-MM-DD')).change();

	$(".chosen-select").chosen({ width: '100%' });
	$('.decimal').inputmask("decimal", {
		digits: 2,
		rightAlign: false,
	});
	$('.numerico').inputmask("numerico", {
		digits: 0,
		rightAlign: false,
	});

	$('.decimalvalor').unbind().inputmask({
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
		if (!tecladoVirutal) {
			if (click == false) {
				var selfie = this;
				setTimeout(function () {
					$(selfie).select();
				}, 0);
			}
			click = false;
		}
	}).val('');

	$(document).on("change", "#Iva", function (event) {
		validaPorcentaje('IvaId');
	});

	$(document).on("change", "#RetenFuent", function (event) {
		validaPorcentaje('PorceReten', $(this).val());
	});

	$(document).on("focus", "#RetenFuent", function (event) {
		validaPorcentaje('PorceReten', $(this).val());
	});

	$("#formDataAdmin").submit(function (e) {
		e.preventDefault();
		/* Vamos a validar el usuario ingresado para permisos de administrador */
		if ($(this).valid()) {
			let $fills = $("#formDataAdmin input"), data = {};
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				data[name] = $(input).val();
			});
			data['permiso'] = permiso; //2600 //permisoAccionActual;

			usuarioAutoriza = data.usuarioid;

			$.ajax({
				url: rutaGeneral + 'validarUsuario',
				type: 'POST',
				data: {
					encriptado: $.Encriptar(data)
				},
				dataType: "json",
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					$("#formDataAdmin")[0].reset();
					$("#formDataAdmin :input").removeClass('is-invalid');
					$("#formDataAdmin").validate().resetForm();

					if (resp.valido) {
						alertify.success(resp.mensaje);
						abrirCerrarModal('#modal-solicitar-usuario', 'hide');
						dataSet = $.Encriptar(GastoCajaId);
						if (permiso == 2617) {
							$.ajax({
								url: rutaGeneral + 'setGuardarGasto',
								type: 'POST',
								dataType: 'json',
								data: {
									encriptado: dataSet
								},
								success: (resp) => {
									if (resp) {
										for (var key in resp) {
											$("[name=" + key + "]").val(resp[key]).trigger("chosen:updated");
										}
									}
									$(".modalEditar").modal("show");
								}, error: (err) => { console.log("error", err); alertify.error('No fue posible listar los datos') }
							});
						} else {
							dataAnular = $.Encriptar({ GastoCajaId, usuario: usuarioAutoriza });
							$.ajax({
								url: rutaGeneral + 'anularGasto',
								type: 'POST',
								dataType: 'json',
								data: {
									encriptado: dataAnular
								},
								success: (resp) => {
									resp = JSON.parse($.Desencriptar(resp));
									if (resp.valido == 1) {
										abrirCerrarModal('#modal-solicitar-usuario', 'hide');
										alertify.success(resp.mensaje);
										DT.ajax.reload();
									} else {
										alertify.error(resp.mensaje);
									}
								}, error: (err) => { console.log("error", err); alertify.error('No fue posible anular los datos') }
							});
						}
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

	tabla(fechaInicio, fechaFin);

	$(document).on("click", ".btnFiltros", function (event) {
		event.preventDefault();
		$("#formData")[0].reset();
		$(".formulario").val('').trigger("chosen:updated");
		let fecha = moment().format('YYYY-MM-DD');
		$("[name=GastoCajaId]").val('').trigger("chosen:updated");
		$("[name=Consecutivo]").val($ConseGasto).trigger("chosen:updated");
		$("[name=CentCostId]").val($centcostid).trigger("chosen:updated");

		$("[name=Fecha]").val(fecha).trigger("chosen:updated");
		$(".modalEditar").modal("show");
	});

	$("#frmFiltros").submit(function (event) {
		event.preventDefault();
		if ($(this).valid()) {
			fechaInicio = $('#fechaInicio').val();
			fechaFin = $('#fechaFinal').val();
			DT.destroy();
			tabla(fechaInicio, fechaFin);
		}
	});

	$('input[name=fecha]').datetimepicker({
		format: 'YYYY-MM-DD',
		minDate: new Date(),
		date: new Date(),
		locale: 'es'
	});

	$('.chosen-select').chosen({ width: "100%", no_results_text: "No se ha encontrado:" });

	$("#formData").submit(function (e) {
		e.preventDefault();

		if (GastoCajaId > 0 && !cambioDatoEditar) {
			cambioDatoEditar = false;
			$(".modalEditar").modal("hide");
		} else {

			if ($("#IvaId").val() == '***.**' || $("#PorceReten").val() == '***.**') {
				alertify.error("Validar la información de los campos Porce Iva o Porce Fuente");
				return;
			}

			if ($(this).valid() && $("#TerceroId").val() != null && $("#ConceptoGastoId").val() != null) {
				var config = {};
				$("#formData").find("[data-db]").each(function () {
					if (this.value) {
						var value = this.value;
						if (value != null && value != '') {
							value = value.replace(/,/g, '');
						}
						config[this.name] = value;
					}
				});
				GuardarGasto(config);
			} else {
				alertify.error("Validar la información de los campos *");
			}
		}
	});

	$(".info-modif").on('change', function () {
		cambioDatoEditar = true;
	});
});