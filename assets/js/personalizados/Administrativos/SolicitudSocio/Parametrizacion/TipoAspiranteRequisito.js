let rutaGeneral = base_url() + 'Administrativos/SolicitudSocio/Parametrizacion/TipoAspiranteRequisito/';
let editarTipoAspiranteRequisito = 0;

let tblTiposAspiranteRequisito = $('#tablaTipoAspiranteRequisito').DataTable({
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
			className: 'btnAbrirModalRequisito btnFiltros',
			attr: { title: "Crear", "data-toggle": "modal" },
			text: '<i class="fas fa-plus"></i> <strong> Crear requisito tipo aspirante</strong>'
		}]
	),
	columns: [
		 { data: 'RequisitoId', width: '10%', }
		,{ data: 'NombreAspirante', width: '20%' }
		,{ data: 'Nombre', width: '40%' }
		,{ data: 'Requerido', width: '10%' }
		,{ data: 'Estado' }
		,{ data: 'Tipo', width: '20%', className: 'text-center' }
		,{
			data: 'Id'
			,width: '10%'
			,className: 'text-center noExport'
			,orderable: false
			,orderable: false
			,render: function (meta, type, data, meta) {
				const extencion = data.Adjunto ? data.Adjunto.split('.')[1] : 'sin extencion';
				if (extencion == "doc" || extencion == "xls" || extencion == "xlsx" || extencion == "docx"  || extencion == "txt" || extencion == "pptx"  || extencion == "scv" && data.Adjunto) {
					btnDowloadRequisito = `<a href='${rutaGeneral}downloadArchivo/${data.Adjunto}/${data.Nombre}' download="${data.Nombre}" ><button class="downloadRequisito btn btn-primary btn-xs" title="Descargar"><i class="fa fa-download"></i></button></a>`;
				} else if (extencion == "jpg" || extencion == "jpeg" || extencion == "png" || extencion == "gif" || extencion == "pdf") {
					btnDowloadRequisito = `<a href='${rutaGeneral}downloadArchivo/${data.Adjunto}/${data.Nombre}' target="_blank" ><button class="btn btn-success btn-xs" title="Descargar"><i class="fa fa-eye"></i></button></a>`;
				} else {
					btnDowloadRequisito = '';
				};
				btnEditar           = `<button class="editarTipo btn btn-secondary btn-xs" title="Editar"><i class="fas fa-edit"></i></button>`;
				btnEliminar         = `<button class="eliminarTipo btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>`;
				return btnDowloadRequisito + ' ' + btnEditar + ' ' + btnEliminar;
			}
		}
	],
	createdRow: function (row, data, dataIndex) {
		let id = data.RequisitoId;

		$(row).find('.downloadRequisito').click(function () {
			$('#modalDownloadRequisito').modal('show');

			//SE DEJA COMENTADO PORQUE LA FUNCIONALIDAD PARA SABER SI EL ARCHIVO EXISTE ANTES DE DESCARGAR NO SIRVE

			// let info = {
			// 	// url: rutaGeneral + 'pruebaDownload' + '/' + data.Adjunto + '/' + data.Nombre,
			// 	url: rutaGeneral + 'downloadArchivo' + '/' + data.Adjunto + '/' + data.Nombre,
			// 	type: 'GET',
			// 	dataType: 'json',
			// 	cache: false,
			// 	success: (resp) => {
			// 		if (resp.success) {
			// 			console.log(resp);
			// 			$('#modalDownloadRequisito').modal('show');
			// 		} else {
			// 			alertify.error('El archivo no existe');
			// 		}
			// 	},
			// 	error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
			// };
			// $.ajax(info);
		});

		$(row).find('.editarTipo').click(function () {
			informacion({ id }, 'obtenerTipoAspiranteRequisito', 'abrirModalEditar');
		});

		$(row).find('.eliminarTipo').click(function () {
			alertify.confirm("Advertencia", `¿Esta seguro de eliminar el requisito de tipo aspirante <strong>` + data.Nombre + `</strong>?`, function () {
				informacion({ id }, 'eliminarTipoAspiranteRequisito', 'tipoAspiranteRequisitoEliminado');
			}, function () { });
		});
	},
});

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

function tipoAspiranteRequisitoEliminado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.success(msj);
	}
	tblTiposAspiranteRequisito.ajax.reload();
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

function abrirModalEditar({ success, data, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		$("#btnCrearTipoAspiranteRequisito").html('<i class="fas fa-edit"></i> Modificar');
		editarTipoAspiranteRequisito = data.RequisitoId;
		Object.keys(data).forEach(item => {
			if (item == "Requerido") {
				$('#' + item).prop('checked', (data[item] == 'S' ? true : false));
			} else if (item == 'Adjunto') {
				let file = new File(['prueba'], data[item]);
				let dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				$('#' + item).prop('FileList', dataTransfer);
			} else {
				$('#' + item).val(data[item]);
			}
		});
		$('#modalTipoAspiranteRequisito').modal('show');
	}
}

function tipoAspiranteRequisitoCreado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		$('#modalTipoAspiranteRequisito').modal('hide');
		alertify.success(msj);
		tblTiposAspiranteRequisito.ajax.reload();
		limpiarDatos();
	}
}

function limpiarDatos() {
	editarTipoAspiranteRequisito = 0;
	$("#btnCrearTipoAspiranteRequisito").html('<i class="fas fa-save"></i> Crear');
	$('#btnCrearTipoAspiranteRequisito').text('Crear');
	$("#TipoLugarId").attr('disabled', false);
	$("#formularioCrearTipoAspiranteRequisito")[0].reset();
	$("#formularioCrearTipoAspiranteRequisito :input").removeClass('is-invalid');
	$("#formularioCrearTipoAspiranteRequisito").validate().resetForm();
}

$(function () {
	RastreoIngresoModulo('Requisito tipo aspirante');

	$("#formularioCrearTipoAspiranteRequisito").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let formulario = new FormData(this);
			formulario.append("editar", editarTipoAspiranteRequisito);
			if ($('#Adjunto').prop('files')[0]) {
				formulario.append("archivo", $('#Adjunto').prop('files')[0]);
			}
			informacion(formulario, 'crearTipoAspiranteRequisito', 'tipoAspiranteRequisitoCreado', true);
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$(document).on("click", ".btnAbrirModalRequisito", function (event) {
		event.preventDefault();
		$('#modalTipoAspiranteRequisito').modal('show');
		$("#ProductoId").closest(".input-group").find('.nombre-prod').html('');
		limpiarDatos();
		$("#btnCrearTipoAspiranteRequisito").html('<i class="fas fa-save"></i> Crear');
	});
});
