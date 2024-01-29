let cabecera = ['Id', 'Tarjeta', 'Acción', 'Fecha_Registro', 'Fecha_Vencimiento', 'Acciones'];
let rutaGeneral = 'Administrativos/VentaTarjeta/';
let codeBase64 = 'data:image/jpeg;base64,';
let editarTarjeta = 0;
let tblTarjetas;
let tarjetaValida = false;
let tercerosAccion = [];
let dataMostrarTercero = [{
	propiedad: 'TerceroID', titulo: 'Documento'
}, {
	propiedad: 'AccionId', titulo: 'Acción'
}, {
	propiedad: 'barra', titulo: 'Código de Barra'
}, {
	propiedad: 'Tipo', titulo: 'Tipo'
}];

$(function () {

	$('#FechaVencimiento').datetimepicker('minDate', moment().subtract(1,'d').toDate());
	$('#FechaVencimiento').datetimepicker('disabledDates', [moment().subtract(1,'d').toDate()]); 

	$.each(cabecera, (pos, cab) => {
		$('#cabeceraTabla').append(`<th class="text-center">${cab.split('_').join(' ')}</th>`)
	});

	$("#TarjetaSocioId").change(function () {
		tarjetaValida = false;
		informacion({ tarjeta: $(this).val() }, 'validarTarjeta', 'dataTarjeta');
	});

	$("#AccionId").change(function () {
		if ($("#AccionId").val() != "") {
			consultadonAccion = true;
			let data = {
				accion: $("#AccionId").val()
			};
			informacion(data, 'obtenerAccion', 'informacionAccion');
		}
	});

	$('#CrearTarjeta').on('shown.bs.modal', function () {
		$('#TarjetaSocioId').trigger('focus');
		$("#tercerosAccion").hide();
		$("#collapseTercero").removeClass('show');
	});

	cargarTabla();

	$("#formCrear").submit(function (e) {
		e.preventDefault();
		if ($("#formCrear").valid()) {
			let $fills = $("#formCrear input, #formCrear select");
			let data = {};
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				if (name == 'Estado') {
					data[name] = $(input).prop('checked') ? 'A' : 'I';
				} else {
					data[name] = $(input).val();
				}
			});
			data = { ...data, editarTarjeta };
			informacion(data, 'crearTarjeta', 'creacionTarjeta');
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#btnCancelarTarjeta").click(function () {
		limpiarDatos();
	});

	$("#TerceroId").change(function () {
		let enc = tercerosAccion.find(op => op.TerceroID == $(this).val());
		if (enc) {
			$("#dataTercero").html('');
			$("#fotoTercero").prop("src", (!enc.Foto ? base_url() + 'assets/images/user/nofoto.png' : codeBase64 + enc.Foto));
			dataMostrarTercero.forEach(it => {
				$("#dataTercero").append(`
				<div class="col-6"><strong>${it.titulo}</strong></div>
				<div class="col-6">${enc[it.propiedad]}</div>
			`);
			});
			if (!$("#collapseTercero.show")[0]) {
				$("#btnCollapse").click();
			}
		}
	});

});

function cargarTabla() {
	if (tblTarjetas) {
		tblTarjetas.destroy();
	}
	tblTarjetas = dataTable();
	tblTarjetas = dtSS(tblTarjetas);
}

function dataTable() {
	return {
		data: {
			tblID: "#tabla",
			select: [
				"TS.Id"
				, "TS.TarjetaSocioId AS Tarjeta"
				, "TS.AccionId AS 'Acción'"
				, "FORMAT(TS.FechaRegistro, 'yyyy-MM-dd hh:mm') AS Fecha_Registro"
				, "TS.FechaVencimiento AS Fecha_Vencimiento"
				, "'' AS Acciones"
			],
			table: [
				'TarjetaSocio TS',
				[
					["Accion A", "TS.AccionId = A.AccionId", "INNER"]
				], [
					["TS.Estado = 'A'"]
				]
			],
			column_order: ['Id', 'Tarjeta', 'Acción', 'Fecha_Registro', 'Fecha_Vencimiento', 'Acciones'],
			column_search: ['TS.TarjetaSocioId', 'TS.AccionId', 'TS.FechaRegistro', 'TS.FechaVencimiento'],
			columnas: cabecera,
			orden: {
				'Id': 'ASC'
				, 'Tarjeta': 'ASC'
				, 'Accion': 'ASC'
				, 'Fecha_Registro': 'ASC'
				, 'Fecha_Vencimiento': 'ASC'
				, 'Acciones': 'ASC'
			},
		},
		language: $.Constantes.lenguajeTabla,
		processing: true,
		serverSide: true,
		order: [[0, 'ASC']],
		draw: 10,
		fixedColumns: true,
		pageLength: 10,
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
		],
		dom: 'Bfrtp',
		columnDefs: [{
			targets: [0], visible: false
		}],
		createdRow: function (row, data, dataIndex) {
			let ver = `
                <button class="ediTarjeta btn btn-primary btn-xs" data-tarjeta="${data[0]}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            `;
			$(row).find('td:last').html(ver).addClass('text-center');
			botonesTarjeta(row);
		},
		initComplete: function () {
			$('div.dataTables_filter input').unbind();
			$("div.dataTables_filter input").keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tabla").dataTable();
					table.fnFilter(this.value);
				}
			});
			$('div.dataTables_filter input').focus();
		},
	};
}

function botonesTarjeta(row) {
	$(row).on("click", ".ediTarjeta", function (e) {
		e.preventDefault();
		data = $(this).data('tarjeta');
		informacion(data, 'obtenerTarjeta', 'tarjetaEditar');
	});
}

function informacion(data, ruta, funcion) {
	data = $.Encriptar(data);
	$.ajax({
		url: base_url() + rutaGeneral + ruta,
		type: 'POST',
		data: {
			encriptado: data
		},
		cache: false,
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (!resp.valido) {
				alertify.error(resp.mensaje);
			} else {
				this[funcion](resp);
			}
		},
		error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

function tarjetaEditar(resp) {
	editarTarjeta = resp.datos[0]['Id'];
	$('#btnCrearTarjeta').text('Modificar');
	Object.keys(resp.datos[0]).forEach(item => {
		$('#' + item).val(resp.datos[0][item]);
		if (item === 'Estado') {
			$('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
		}
	});
	$("#CrearTarjeta").modal('show');
}

function limpiarDatos() {
	editarTarjeta = 0;
	$("#formCrear")[0].reset();
	$("#formCrear :input").removeClass('is-invalid');
	$("#formCrear").validate().resetForm();
	$("#btnCrearTarjeta").text('Crear');
}

function soloLetrasNumeros(e, input) {
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "abcdefghijklmnopqrstuvwxyz1234567890-+/.";
	especiales = "8-37-39-46";
	tecla_especial = false;
	for (var i in especiales) {
		if (key == especiales[i]) {
			tecla_especial = true;
			break;
		}
	}
	if (letras.indexOf(tecla) == -1 && !tecla_especial) {
		return false;
	}
}

function dataTarjeta() {
	tarjetaValida = true;
}

function informacionAccion({ datos }) {
	$("#btnCrearTercero").hide();
	if (datos.length) {
		let items = '';
		datos.forEach(it => {
			items += `<option value="${it.TerceroID}">${it.Nombre}</option>`;
		});
		tercerosAccion = datos;
		$("#tercerosAccion").show();
		$("#TerceroId").html(items);
		$("#btnCargarAccion, #btnNoCargar").prop("disabled", false);
		$("#TerceroId").change();
		$("#btnCollapse").click();
	} else {
		$("#btnCargarAccion, #btnNoCargar").prop("disabled", true);
	}
}

function creacionTarjeta(resp) {
	cargarTabla();
	limpiarDatos();
	$('#CrearTarjeta').modal('hide');
	alertify.success(resp.mensaje);
}