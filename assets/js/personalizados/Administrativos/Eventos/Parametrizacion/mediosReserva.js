let rutaGeneral = base_url() + 'Administrativos/Eventos/Parametrizacion/MediosReserva/';
let editarMedioReserva = 0;
let codEditarMedioReserva = 0;
let tblMedioReserva = $('#tblMedioReserva').DataTable({
	dom: domBftrip,
	fixedColumns: true,
	serverSide: true,
	pageLength: 10,
	scrollX: true,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: 'POST',
		data: function (d) { },
	},
	buttons: buttonsDT(["copy", "excel", "pdf", "print"], [{
		className: 'btnFiltros',
		attr: { title: "Crear", "data-toggle": "modal" },
		text: '<i class="fas fa-plus"></i> <strong> Crear Medio De Reserva</strong>'
	}]),
	columns: [
		{ data: 'MedioReservaId' , width: '10%'}
		, { data: 'Nombre' }
		, { data: 'NombreEstado', width: '10%',className: 'text-center' }
		, {
			data: 'Id'
			, width: '10%'
			, className: 'text-center noExport'
			, orderable: false
			, render: function (meta, type, data, meta) {
				btnEditar   = `<button class="editarTipo btn btn-secondary btn-xs" title="Editar"><i class="fas fa-edit"></i></button>`;
				btnEliminar = `<button class="eliminarEstado btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>`;
				return btnEditar + ' ' + btnEliminar;
			}
		}
	],
	createdRow: function (row, data, dataIndex) {
		let codigo = data.Id;
		$(row).find('.editarTipo').click(function () {
			informacion({ codigo }, 'obtenerMedioReserva', 'dataMedioReserva');
		});

		$(row).find('.eliminarEstado').click(function () {
			informacion({ codigo }, 'obtenerMedioReserva', 'dataMedioReservaEliminar');
		});
	},
});

function medioReservaCreado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		$('#modalMedioReserva').modal('hide');
		alertify.success(msj);
		tblMedioReserva.ajax.reload();
		limpiarDatos();
	}
}

function informacion(data, ruta, funcion, noProcess = false) {
	let info = {
		url: rutaGeneral + ruta,
		type: 'POST',
		dataType: 'json',
		data: data,
		cache: false,
		success: (resp) => {
			if (funcion) {
				this[funcion](resp);
			}
		},
		error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
	};

	if (noProcess) {
		info = {
			...info
			, processData: false
			, contentType: false
			, dataType: 'json'
			, cache: false
			, encType: 'multipart/form-data'
		}
	}

	$.ajax(info);
}

function dataMedioReserva({ success, medioReserva, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		editarMedioReserva = medioReserva.Id;
		codEditarMedioReserva = medioReserva.MedioReservaId;
		$("#btnCrearMedioReserva").html('<i class="fas fa-edit"></i> Modificar');
		Object.keys(medioReserva).forEach(item => {
			$('#' + item).val(medioReserva[item]);
		});
		$('#modalMedioReserva').modal('show');
	}
}

function dataMedioReservaEliminar({ success, medioReserva, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.confirm("Advertencia", `¿Esta seguro de eliminar ${medioReserva.Nombre}?`, function () {
			let data = {
				Id: medioReserva.Id
				, Codigo: medioReserva.MedioReservaId
			}
			informacion(data, 'eliminarMedioReserva', 'medioReservaEliminado');
		}, function () { });
	}
}

function medioReservaEliminado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.success(msj);
	}
	tblMedioReserva.ajax.reload();
}

function limpiarDatos() {
	editarMedioReserva = 0;
	codEditarMedioReserva = 0;
	$("#formularioCrearMedioReserva")[0].reset();
	$("#formularioCrearMedioReserva :input").removeClass('is-invalid');
	$("#formularioCrearMedioReserva").validate().resetForm();
	$("#btnCrearMedioReserva").html('<i class="fas fa-save"></i> Crear');
}

$(function () {

	RastreoIngresoModulo('Medios de Reserva');

	$("#formularioCrearMedioReserva").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let formulario = new FormData(this);
			formulario.append("editarMedioReserva", editarMedioReserva);
			informacion(formulario, 'crearMedioReserva', 'medioReservaCreado', true)
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#cancelarCrearMedioReserva").click(function () {
		limpiarDatos();
	});

	$.validator.addMethod('codigoIgual', function (value, element) {
		let respu = true;
		// this.optional(element);
		$.ajax({
			url: rutaGeneral + 'validarCodigo',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: { codigo: value },
			success: (resp) => respu = resp.valido,
		});
		return (editarMedioReserva > 0 ? (codEditarMedioReserva != value ? respu : true) : respu);
	}, 'El código ya se encuentra registrado.');

	$("#MedioReservaId").rules('add', { codigoIgual: true });

	$(".chosen-select").chosen({ width: '100%' });
	
	$(document).on("click", ".btnFiltros", function (event) {
		event.preventDefault();
		$('#modalMedioReserva').modal('show');
		limpiarDatos();
	});
});