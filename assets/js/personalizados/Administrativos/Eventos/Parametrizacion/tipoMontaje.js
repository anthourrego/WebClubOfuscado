
let rutaGeneral = base_url() + 'Administrativos/Eventos/Parametrizacion/TipoMontaje/';
let Id = 0;

let tblTiposMontaje = $('#tabla').DataTable({
	dom: domBftrip,
	fixedColumns: true,
	serverSide: true,
	scrollX: true,
	pageLength: 10,
	ajax: {
		url: rutaGeneral + "cargarDT",
		type: 'POST',
		data: function (d) { },
	},
	buttons: buttonsDT(['copy', 'excel', 'pdf', 'print']
		, [{
			className: 'btnFiltros',
			attr: { title: "Crear", "data-toggle":"modal" },
			text: '<i class="fas fa-plus"></i> <strong> Crear Tipos Montaje</strong>'
		}]
	),
	columns: [
		{ 
			data: 'Imagen', 
			width: '8%', 
			className: 'text-center imagen-tipo-montaje', 
			orderable: false ,
			render: (Imagen) => {
				return `<img width="100%" class="mw-100" src="${rutaGeneral}obtenerImagen/${Imagen}" alt="Imagen">`;
			}
		}
		, { data: 'Nombre' }
		, { data: 'NombreEstado' , width: '10%', className: 'text-center'}
		, {
			data: 'Id'
			,width: '10%'
			,className: 'text-center noExport'
			,orderable: false
			,render: function (meta, type, data, meta) {
				btnEditar   = `<button class="editarTipo btn btn-secondary btn-xs" title="Editar"><i class="fas fa-edit"></i></button>`;
				btnEliminar = `<button class="eliminarEstado btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>`;
				return btnEditar + ' ' + btnEliminar;
			}
		}
	],
	createdRow: function (row, data, dataIndex) {
		let codigo = data.Id;
		$(row).find('.editarTipo').click(function () {
			informacion({ codigo }, 'obtenerTiposMontaje', 'dataTiposMontaje');
		});

		$(row).find('.eliminarEstado').click(function () {
			informacion({ codigo }, 'obtenerTiposMontaje', 'dataTiposMontajeEliminar');
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

function TiposMontajeCreado({ success, msj }){
	if (!success) {
		alertify.error(msj);
	} else {
		$('#modalTipoMontaje').modal('hide');
		alertify.success(msj);
		tblTiposMontaje.ajax.reload();
		limpiarDatos();
	}
}

function informacion(data, ruta, funcion, noProcess = false){
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

function dataTiposMontaje({ success, TipoMontaje, msj }){
	if (!success) {
		alertify.error(msj);
	} else {
		Id = TipoMontaje.TipoMontajeId;
		$("#btnCrearTipoMontaje").html('<i class="fas fa-edit"></i> Modificar');
		Object.keys(TipoMontaje).forEach(item => {
			$('#' + item).val(TipoMontaje[item]);
		});
		let icono = `uploads/${NIT()}/TiposMontaje/${TipoMontaje.Imagen}`;
		$("#eliminarImagen").show();
		if (!TipoMontaje.Imagen) {
			$("#eliminarImagen").hide();
			icono = `assets/images/user/nofoto.png`;
		}
		$('.icon-container').children('img').attr('src', `${base_url() + icono}?${Math.random()}`);
		
		$('#modalTipoMontaje').modal('show');
	}
}

function dataTiposMontajeEliminar({ success, TipoMontaje, msj }){
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.confirm("Advertencia", `¿Esta seguro de eliminar el tipo de montaje?`, function () {
			let data = {
				Id: TipoMontaje.TipoMontajeId
			}
			informacion(data, 'eliminarTiposMontaje', 'TiposMontajeEliminado');
		}, function () { });
	}
}

function TiposMontajeEliminado({ success, msj }){
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.success(msj);
	}
	tblTiposMontaje.ajax.reload();
}

function limpiarDatos(){
	Id = 0;
	$("#formularioCrearTipoMontaje")[0].reset();
	$("#formularioCrearTipoMontaje :input").removeClass('is-invalid');
	$("#formularioCrearTipoMontaje").validate().resetForm();
	$("#btnCrearTipoMontaje").html('<i class="fas fa-save"></i> Crear');
	$('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
	$("#eliminarImagen").hide();
}

$(function (){
	RastreoIngresoModulo('Tipos Montaje');
	$("#eliminarImagen").hide();

	$('.icon-container').click(function (e){
		let id = $(this).parent().children('input').attr('id');
		let actual = $(this);
		$('#' + id).click();
		$('#' + id).on('change', function (evt) {
			let file = $(this).prop('files')[0];
			if (file) {
				let reader = new FileReader();
				reader.onloadend = function () {
					actual.children('img').attr('src', reader.result);
					$("#eliminarImagen").show();
				}
				reader.readAsDataURL(file);
			}
		});
	});

	$("#formularioCrearTipoMontaje").submit(function (e){
		e.preventDefault();
		if ($(this).valid()) {
			let formulario = new FormData(this);

			// formulario.append("imagen",($("#inputIcon")[0].files[0] != undefined) ? $("#inputIcon")[0].files[0] : null);
			formulario.append("imagen", $("#eliminarImagen").is(':hidden'));
			formulario.append("Id", Id);

			if (!$('#inputIcon').prop('files').length) {
				formulario.delete('Icono');
			}

			informacion(formulario, 'crearTiposMontaje', 'TiposMontajeCreado', true)
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#eliminarImagen").on('click', function (){
		$("#eliminarImagen").hide();
		$('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
	});

	$("#cancelarCrearTiposMontaje").click(function (){
		limpiarDatos();
	});

	$(document).on("click", ".btnFiltros", function (event) {
		event.preventDefault();
		$('#modalTipoMontaje').modal('show');
		$("#ProductoId").closest(".input-group").find('.nombre-prod').html('');
		limpiarDatos();
	});
});
