let rutaGeneral = base_url() + 'Administrativos/Eventos/Parametrizacion/TipoLugares/';
let validandoCodigo = false;
let editarTipoLugar = 0;
let codEditarMedioReserva = 0;

let tblTiposEvento = $('#tabla').DataTable({
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
			text: '<i class="fas fa-plus"></i> <strong> Crear Tipo de Lugar</strong>'
		}]
	),
	columns: [
		{ data: 'TipoLugarId', width: '10%', }
		,{ data: 'Nombre' }
		,{ data: 'Cod_Producto' }
		,{ data: 'Nombre_Producto' }
		,{ data: 'NombreEstado', width: '10%', className: 'text-center' }
		,{
			data: 'Id'
			,width: '10%'
			,className: 'text-center noExport'
			,orderable: false
			,orderable: false
			,render: function (meta, type, data, meta) {
				btnEditar   = `<button class="editarTipo btn btn-secondary btn-xs" title="Editar"><i class="fas fa-edit"></i></button>`;
				btnEliminar = `<button class="cambiarEstado btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>`;
				return btnEditar + ' ' + btnEliminar;
			}
		}
	],
	createdRow: function (row, data, dataIndex) {
		let codigo = data.Id; 
		$(row).find('.editarTipo').click(function () {
			informacion({ codigo }, 'obtenerTipoLugar', 'dataTipoLugarF');
		});

		$(row).find('.cambiarEstado').click(function () {
			informacion({ codigo }, 'obtenerTipoLugar', 'dataTipoLugaresEliminar');
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

function busquedaProducto({ success, producto }) {
	if (success) {
		$("#ProductoId").closest(".input-group").find('.nombre-prod').html(producto.nombre);
	} else {
		$('#ProductoId').val('');
		$("#ProductoId").closest(".input-group").find('.nombre-prod').html('');
		
		$('#modalTipoLugar').modal('hide');
		alertify.ajaxAlert = function (url) {
			$.ajax({
				url: url,
				async: false,
				success: function (data) {
					alertify.myAlert().set({
						onclose: function () {
							busqueda = false;
							alertify.myAlert().set({ onshow: null });
							$(".ajs-modal").unbind();
							delete alertify.ajaxAlert;
							$("#tblBusqueda").unbind().remove();
							$('#modalTipoLugar').modal('show');
						}, onshow: function () {
							busqueda = true;
						}
					});
					alertify.myAlert(data);

					dtSS({
						data: {
							tblID: '#tblBusqueda'
						},
						ajax: {
							url: rutaGeneral + "DTBuscarProducto",
							type: "POST"
						},
						bAutoWidth: false,
						columnDefs: [
							{ targets: [0], width: '3%' },
							
						],
						ordering: false,
						draw: 10,
						pageLength: 10,
						oSearch: { sSearch: $("#ProductoId").val() },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								$("#ProductoId").val(data[0]).change();
								alertify.myAlert().close();
							});
						},
						scrollY: screen.height - 400,
						scroller: {
							loadingIndicator: false
						},
						dom: domftri
					});
				}
			});
		}
		var campos = encodeURIComponent(JSON.stringify(['ProductoId', 'Nombre']));
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
	}
}

function dataTipoLugaresEliminar({ success, TipoLugar, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.confirm("Advertencia", `¿Esta seguro de eliminar el tipo de lugar  <strong>` + TipoLugar.Nombre + `</strong>?`, function () {
			let data = {
				codigo: TipoLugar.TipoLugarId,
				Id: TipoLugar.Id
			}
			informacion(data, 'eliminarTipoLugar', 'TipoLugarEliminado');
		}, function () { });
	}
}

function TipoLugarEliminado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		alertify.success(msj);
	}
	tblTiposEvento.ajax.reload();
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

function dataTipoLugarF({ success, TipoLugar, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		codEditarMedioReserva = TipoLugar.TipoLugarId;
		editarTipoLugar = TipoLugar.Id;
		$("#btnCrearTipoLugar").html('<i class="fas fa-edit"></i> Modificar');
		$("#TipoLugarId").attr('disabled', true);
		Object.keys(TipoLugar).forEach(item => {
			$('#' + item).val(TipoLugar[item]);
			if (item == "MultiplesAuxiliares") {
				$('#' + item).prop('checked', (TipoLugar[item] == 'S' ? true : false));
			}
		});
		$("#ProductoId").closest(".input-group").find('.nombre-prod').html('');
		if (TipoLugar.ProductoId) {
			$("#ProductoId").change();
		}
		$('#modalTipoLugar').modal('show');
	}
}

function tipoLugarCreado({ success, msj }) {
	if (!success) {
		alertify.error(msj);
	} else {
		$('#modalTipoLugar').modal('hide');
		alertify.success(msj);
		tblTiposEvento.ajax.reload();
		limpiarDatos();
	}
}

function limpiarDatos() {
	editarTipoLugar = 0;
	codEditarMedioReserva = 0;
	$("#btnCrearTipoLugar").html('<i class="fas fa-save"></i> Crear');
	$('#btnCrearTipoLugar').text('Crear');
	$("#TipoLugarId").attr('disabled', false);
	$("#formularioCrearTipoLugar")[0].reset();
	$("#formularioCrearTipoLugar :input").removeClass('is-invalid');
	$("#formularioCrearTipoLugar").validate().resetForm();
}

$(function () {
	RastreoIngresoModulo('Tipo de Lugar');

	$("#formularioCrearTipoLugar").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			let formulario = new FormData(this);
			formulario.append("Id", editarTipoLugar);
			informacion(formulario, 'crearTipoLugar', 'tipoLugarCreado', true)
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#ProductoId").on('change', function (e) {
		e.preventDefault();
		let codigo = $(this).val();

		informacion({ codigo }, 'validarProducto', 'busquedaProducto');
	});


	$("#cancelarModal").click(function () {
		limpiarDatos();
	});

	$.validator.addMethod('codigoIgual', function (value, element) {
		let respu = true;
		$.ajax({
			url: rutaGeneral + 'validarCodigo',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: { codigo: value },
			success: (resp) => respu = resp.valido,
		});
		return codEditarMedioReserva != value ? respu : true;
	}, 'El código ya se encuentra registrado.');

	$("#TipoLugarId").rules('add', { codigoIgual: true });

	$(".chosen-select").chosen({ width: '100%' });

	$(document).on("click", ".btnFiltros", function (event) {
		event.preventDefault();
		$('#modalTipoLugar').modal('show');
		$("#ProductoId").closest(".input-group").find('.nombre-prod').html('');
		limpiarDatos();
		$("#btnCrearTipoLugar").html('<i class="fas fa-save"></i> Crear');
	});
});
