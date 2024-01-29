let cabecera = ['Id', 'Codigo', 'Nombre', 'Pais', 'Departamento', 'Ciudad', 'Zona', 'Telefono', 'Estado', 'Acciones'];
let rutaGeneral = 'Administrativos/Eventos/Parametrizacion/Sedes/';
let validandoCodigo = false;
let editarSede = 0;
let tablaSedes;
let dataTablePrev = [
	{
		titulo: 'Código', 
		id: 'SedeId'
	}, {
		titulo: 'Pais', 
		id: 'PaisId'
	}, {
		titulo: 'Departamento', 
		id: 'DptoId'
	}, {
		titulo: 'Ciudad', 
		id: 'CiudadId'
	}, {
		titulo: 'Zona', 
		id: 'ZonaId'
	}, {
		titulo: 'Telefono', 
		id: 'Telefono'
	}, {
		titulo: 'Estado', id: 'Estado'
	}
];
let ciudadEditar;

$(function () {
	RastreoIngresoModulo('Sedes');
	$('input[name=Estado]').prop('checked', true);

	initActions();
});

initActions = function () {

	$("#previs").toggle();
	$.each(cabecera, (pos, cab) => {
		$('#cabecera').append(`<th class="text-center">${cab}</th>`)
	});

	$("#btnTituloSede").click(function () {
		$("#previs").toggle();
	});

	$("#formularioCrearSede").submit(function (event) {
		event.preventDefault();
		crearSede.apply(this);
	});

	$("#DptoId").change(function () {
		let datos = {
			deptoId: $(this).val()
		}
		datosUbicacion(rutaGeneral + 'obtenerCiudades', 'CiudadId', datos);
	});

	$('#SedeId').on('blur', function () {
		let data = $.Encriptar($(this).val());
		validandoCodigo = true;
		$.ajax({
			url: base_url() + rutaGeneral + 'validarCodigo',
			type: 'POST',
			dataType: 'json',
			data: {
				encriptado: data
			},
			success: (resp) => {
				$('#SedeId').removeClass('is-valid, is-invalid');
				resp = JSON.parse($.Desencriptar(resp));
				if (!resp.valido) {
					$('#SedeId').addClass('is-invalid');
					alertify.error(resp.mensaje);
				}
				validandoCodigo = false;
			},
			error: (err) => {
				validandoCodigo = false;
			}
		});
	});

	$('#Telefono').on('keyup', function () {
		let data = Array.from($(this).val());
		$('#Telefono').removeClass('is-invalid')
		data.forEach(item => isNaN(item) || !isFinite(item) ? $('#Telefono').addClass('is-invalid') : null);
	});

	tablaSedes = configurarTabla();
	obtenerSedes();

	$("#abrirModalCrearSede").click(function () {
		$("#CiudadId").html('<option value="">&nbsp;</option>');
	});

	$("#cerrarCrearSede").click(function () {
		limpiarDatos();
	});

	dataTablePrev.forEach(item => {
		$("#tablaPrev").append(`<tr>
			<td>- ${item.titulo}:</td>
			<td id="pre${item.id}" class="text-right texto-wrap"></td>
		</tr>`);
	});

}

datosUbicacion = function (url, tipo, data) {
	data = $.Encriptar(data);
	$.ajax({
		url: base_url() + url,
		type: 'POST',
		dataType: 'json',
		data: {
			encriptado: data
		},
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (resp.valido) {
				$("#" + tipo).html('');
				resp.datos.forEach(item => {
					$("#" + tipo).append(`<option value="${item.ciudadid}">${item.nombre}</option>`);
				});
				if (editarSede) {
					$("#" + tipo).val(ciudadEditar);
				}
			} else {
				alertify.error(resp.mensaje);
			}
		},
		error: (err) => {
			console.error("Error ", err);
		}
	});
}

crearSede = function () {
	if ($("#formularioCrearSede").valid()) {
		if (validandoCodigo) {
			alertify.warning("Validando codigo ingresado.");
			return;
		}
		let $fills = $("#formularioCrearSede input, #formularioCrearSede select");
		let data = {};
		$.each($fills, (pos, input) => {
			let value = $(input).val();
			const name = $(input).attr("name");
			if (name == "Estado") {
				value = $(input).prop('checked') ? 'A' : 'I';
			}
			data[name] = value;
		});
		data = { ...data, editarSede };
		data = $.Encriptar(data);
		$.ajax({
			url: base_url() + rutaGeneral + 'crearSede',
			type: 'POST',
			dataType: 'json',
			data: {
				encriptado: data
			},
			success: (resp) => {
				resp = JSON.parse($.Desencriptar(resp));
				if (resp.valido) {
					let idInsertado = resp.idInsertado;
					limpiarDatos();
					obtenerSedes();
					$('#modalCrearSede').modal('hide');
					alertify.success(resp.mensaje);
					$('#btnCrearSede').text('Crear');
				} else {
					alertify.error(resp.mensaje);
				}
			}
		});
	} else {
		alertify.error("Valide la informacion ingresada.");
	}
}

configurarTabla = function () {
	return $('#tabla').DataTable({
		language: $.Constantes.lenguajeTabla,
		processing: true,
		pageLength: 10,
		order: [],
		dom: 'Bfrtp',
		autoWidth: false,
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
		],
		columnDefs: [{
			targets: 0, visible: false
		}],
		createdRow: function (row, data, dataIndex) {
			$(row).children().last().css('text-align', 'center');
			accionBotones(row);
		}
	});
}

obtenerSedes = function () {
	$.ajax({
		url: base_url() + rutaGeneral + 'obtenerSedes',
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: (resp) => {
			tablaSedes.clear().draw();
			resp = JSON.parse($.Desencriptar(resp));
			if (!resp.valido) {
				alertify.error(resp.mensaje);
			} else {
				let filas = [];
				$.each(resp.datos, function (pos, sede) {
					let ver = `
						<button class="ediSede btn btn-primary btn-xs" data-sede="${sede.Id}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
						<button class="eliSede btn btn-danger btn-xs" data-sede='${JSON.stringify({ 'Id': sede.Id, 'SedeId': sede.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
						<button class="verSede btn btn-success btn-xs" data-sede='${sede.Id}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
					`;
					let valores = {};
					cabecera.forEach((item, pos) => {
						if (item == "Estado") {
							valores[pos] = sede[item] == 'A' ? 'Activado' : 'Inactivo';
						} else {
							valores[pos] = sede[item] ? sede[item] : '';
						}
					});
					valores[cabecera.length - 1] = ver;
					filas.push(valores);
				});
				tablaSedes.rows.add(filas).draw();
				tablaSedes.order([1, 'asc']).draw();
			}
		},
		error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

accionBotones = function (row) {
	$(row).on("click", ".ediSede", function (e) {
		e.preventDefault();
		let data = $.Encriptar($(this).data('sede'));
		obtenerSede(data, 'edicionSede');
	});

	$(row).on("click", ".eliSede", function (e) {
		e.preventDefault();
		let data = $(this).data('sede');
		alertify.confirm('Eliminar', '¿Desea eliminar esta Sede?', function (ok) {
			data = $.Encriptar(data);
			$.ajax({
				url: base_url() + rutaGeneral + 'eliminarSede',
				type: 'POST',
				dataType: 'json',
				data: {
					encriptado: data
				},
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(resp));
					let metodo = (!resp.valido ? 'error' : 'success');
					alertify[metodo](resp.mensaje);
					if (resp.valido) {
						obtenerSedes();
					}
				},
				error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
			});
		}, function (err) {
			console.log("Error ", err);
		});
	});

	$(row).on("click", ".verSede", function (e) {
		e.preventDefault();
		let data = $.Encriptar($(this).data('sede'));
		obtenerSede(data, 'verPrev', true);
	});

}

obtenerSede = function (data, funcion, id) {
	$.ajax({
		url: base_url() + rutaGeneral + 'obtenerSede' + (id ? '?ver=' + id : ''),
		type: 'POST',
		dataType: 'json',
		data: {
			encriptado: data
		},
		cache: false,
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (!resp.valido) {
				alertify.error(resp.mensaje);
			} else {
				this[funcion](resp);
			}
		},
		error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

edicionSede = function (resp) {
	editarSede = resp.datos[0]['Id'];
	$('#btnCrearSede').text('Modificar');
	Object.keys(resp.datos[0]).forEach(item => {
		$('#' + item).val(resp.datos[0][item]);
		if (item == "Estado") {
			$('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
		}
	});
	ciudadEditar = resp.datos[0]['CiudadId'];
	$("#DptoId").change();
	$('#modalCrearSede').modal('show');
}

verPrev = function (resp) {
	Object.keys(resp.datos[0]).forEach(item => {
		$('#pre' + item).text(resp.datos[0][item]);
		if (item == 'Estado') {
			$('#pre' + item).text((resp.datos[0][item] == 'A' ? 'Activo' : 'Inactivo'));
		}
	});
	$("#previs").show();
}

limpiarDatos = function () {
	editarSede = 0;
	$('#btnCrearSede').text('Crear');
	$('#formularioCrearSede')[0].reset();
	$("#formularioCrearSede")[0].reset();
	$("#formularioCrearSede :input").removeClass('is-invalid');
	$("#formularioCrearSede").validate().resetForm();
	$('input[name=Estado]').prop('checked', true);
}
