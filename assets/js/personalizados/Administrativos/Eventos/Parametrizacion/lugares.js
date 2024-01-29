let cabecera = ['Imagen', 'Código', 'Sede', 'Nombre', 'Tipo Lugar', 'Capacidad Mínima', 'Capacidad Máxima', 'Estado', 'Acciones'];
let cabeceraElemento = ['Producto', 'Nombre', 'Cantidad', 'Estado', 'Acciones'];
let rutaGeneral = base_url() + 'Administrativos/Eventos/Parametrizacion/Lugares/';
let editarLugar = 0;
let codEditarLugar = 0;
let DTLugares;
let DTElementos;
let editarElemento = null;
let dataTablePrev = [
	{
		titulo: 'Código', 
		id: 'LugarId'
	}, {
		titulo: 'Sede', 
		id: 'SedeId'
	}, {
		titulo: 'Nombre', 
		id: 'Nombres'
	}, {
		titulo: 'Tipo de lugar', 
		id: 'TipoLugarId'
	}, {
		titulo: 'Cantidad Mínima', 
		id: 'GrupoMinimo'
	}, {
		titulo: 'Cantidad Máxima', 
		id: 'GrupoMaximo'
	}, {
		titulo: 'Valor', 
		id: 'ValorAlquiler'
	}, {
		titulo: 'Estado', 
		id: 'NombreEstado'
	}
];

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

function crearCabecera(array, id) {
	$.each(array, (pos, cab) => {
		$('#' + id).append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
	});
}

function limpiarDatos() {
	editarLugar = 0;
	codEditarLugar = 0;
	$("#formularioCrear")[0].reset();
	$("#formularioCrear :input").removeClass('is-invalid');
	$("#formularioCrear").validate().resetForm();
	$("#btnCrearLugar").text('Crear');
	$("#ManejaElementos").val('N').change();
	$("#Estado").val('A').change();
	$(".chosen-select").trigger('chosen:updated');
	$('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
	$("#eliminarImagen").hide();
}

function tablaLugares() {
	DTLugares = $('#tabla').DataTable({
		language: $.Constantes.lenguajeTabla,
		order: [],
		dom: 'Bfrtp',
		fixedColumns: true,
		processing: true,
		serverSide: true,
		pageLength: 10,
		ajax: {
			url: rutaGeneral + "cargarDT",
			type: 'POST',
			data: function (d) { },
		},
		buttons: [{
			extend: 'copy',
			className: 'copyButton',
			exportOptions: { columns: ':not(.noExport)' },
			text: 'Copiar'
		}, {
			extend: 'excel',
			className: 'excelButton',
			orientation: 'landscape',
			exportOptions: { columns: ':not(.noExport)' },
			pageSize: 'letter',
		}, {
			extend: 'pdf',
			className: 'pdfButton',
			tex: 'PDF',
			orientation: 'landscape',
			exportOptions: { columns: ':not(.noExport)' },
			pageSize: 'letter'
		}, {
			extend: 'print',
			className: 'printButton',
			orientation: 'landscape',
			pageSize: 'letter',
			exportOptions: { columns: ':not(.noExport)' },
			text: 'Imprimir'
		}, {
			className: 'btnModalCrearLugar btnFiltros',
			attr: { title: "Crear", "data-toggle": "modal" },
			text: '<i class="fas fa-plus"></i> <strong> Crear Lugar</strong>'
		}],
		columnDefs: [],
		columns: [
			{ data: 'Icono', width: '10%', className: 'text-center imagen-evento', orderable: false }
			, { data: "Codigo" , width: '10%'}
			, { data: "SedeId" , width: '10%'}
			, { data: "Nombre" }
			, { data: "TipoLugarId" }
			, { data: "Grupo_Min" , width: '10%'}
			, { data: "Grupo_Max" , width: '10%'}
			, { data: "NombreEstado", width: '10%', className: 'text-center' }
			, {
				data: "Acciones", width: '10%'
				, className: 'text-center noExport'
				, orderable: false
				, render: function (meta, type, data, meta) {
					btnEditar = `<button class="ediLugar btn btn-primary btn-xs" data-lugar="${data.Id}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>`;
					btnEliminar = `<button class="eliLugar btn btn-danger btn-xs" data-lugar='${JSON.stringify({ 'Id': data.Id, 'LugarId': data.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>`;
					btnVer = `<button class="verLugar btn btn-success btn-xs" data-lugar='${data.Id}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>`;
					return btnEditar + ' ' + btnEliminar + ' ' + btnVer;
				}
			}
		],
		initComplete: function () {
			$('div#tabla_filter input').unbind();
			$('div#tabla_filter input').keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find('#tabla').dataTable();
				}
			}).change(function (e) {
				e.preventDefault();
				table = $("body").find('#tabla').dataTable();
				table.fnFilter(this.value);
			});
			$('div#tabla_filter input').focus();
			$('div#tabla_paginate').css(
				"margin-bottom", "5px"
			);
		},
		createdRow: function (row, data, dataIndex) {
			$(row).find('.imagen-evento').html(`
				<a href="${rutaGeneral}obtenerImagen/${data.Icono}?${Math.random()}" data-lightbox="carrusel${data.Id}">
					<img src="${rutaGeneral}obtenerImagen/${data.Icono}?${Math.random()}" class="mw-100 m-0 d-block rounded" width="100%" alt="Imagen Evento">
				</a>
			`);

			$(row).on("click", ".ediLugar", function (e) {
				e.preventDefault();
				let info = { lugar: $(this).data('lugar') };
				informacion(info, 'obtenerLugar', 'lugarEditar');
			});

			$(row).on("click", ".eliLugar", function (e) {
				e.preventDefault();
				let data = $(this).data('lugar');
				eliminarInformacion('¿Desea eliminar este lugar?', data, 'eliminarLugar', 'lugares');
			});

			$(row).on("click", ".verLugar", function (e) {
				e.preventDefault();
				let info = {
					lugar: $(this).data('lugar'),
					ver: true
				};
				informacion(info, 'obtenerLugar', 'prevLugar');
				$("#previs").show();
			});
		}
	});
}

function eliminarInformacion(mensaje, data, ruta, accion) {
	alertify.confirm('Eliminar', mensaje, function (ok) {
		if (accion == 'lugares') {
			$.ajax({
				url: rutaGeneral + ruta,
				type: 'POST',
				dataType: 'json',
				data: data,
				success: (resp) => {
					let metodo = (!resp.valido ? 'error' : 'success');
					alertify[metodo](resp.mensaje);
					if (resp.valido) {
						DTLugares.ajax.reload();
					}
				},
				error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
			});
		} else if (accion == 'elementos') {
			/* Regresamos la posicion en 1 de la posicion eliminada hacia adelante */
			DTElementos.row(editarElemento).remove().draw();
			$.each($(".ediElemento[data-elemento]"), function (pos) {
				if (+$(this).attr('data-elemento') > editarElemento) {
					$(this).attr('data-elemento', +$(this).attr('data-elemento') - 1);
				}
			});
			editarElemento = null;
		}

	}, function (err) {
		console.error("Error ", err);
	});
}

function informacion(data, ruta, funcion) {
	$.ajax({
		url: rutaGeneral + ruta,
		type: 'POST',
		dataType: 'json',
		data: data,
		cache: false,
		success: (resp) => {
			if (funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
			}
		},
		error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

function lugarEditar({ datos, mensaje, valido }) {
	if (!valido) return alertify.error(mensaje);

	editarLugar = datos.Id;
	codEditarLugar = datos.LugarId;
	$("#btnCrearLugar").html('<i class="fas fa-edit"></i> Modificar');
	Object.keys(datos).forEach(item => $('#' + item).val(datos[item]));
	$("#eliminarImagen").show();
	if (!datos.Icono) {
		$("#eliminarImagen").hide();
	}
	$('.icon-container').children('img').attr('src', `${rutaGeneral}obtenerImagen/${datos.Icono}`);
	$("#LugarId").prop('readonly', true);
	$(".chosen-select").trigger('chosen:updated');
	$('#modalCrearLugar').modal('show');
	if (datos.ManejaElementos == 'S') {
		$("#ManejaElementos").change();
		DTElementos.clear().draw();
		datos.Productos.forEach((it, x) => {
			let prod = {
				ProductoId: it.ProductoId
				, Nombre: it.Nombre
				, Cantidad: it.Cantidad
				, Estado: it.Estado
				, pos: x
			}
			DTElementos.row.add(prod);
		});
		DTElementos.draw();
		DTElementos.page('last').draw('page');
	}
}

function prevLugar({ datos, mensaje, valido }) {
	if (!valido) return alertify.error(mensaje);

	Object.keys(datos).forEach(item => $('#pre' + item).text(datos[item]));
	$('#preIconoImg').hide();
	let urlIcono = `${rutaGeneral}obtenerImagen/${datos.Icono}`;
	$('#preIconoImg').attr('href', urlIcono);
	$('#preIconoImg').attr('data-lightbox', "carrusel" + datos.LugarId);
	$('#preIconoImg').find('img').attr('src', urlIcono);
	$('#preIconoImg').show();

	$("#container-elementos-prev").hide();
	if (datos.ManejaElementos == 'S') {
		$("#container-elementos-prev").show();
		if (datos.Productos && datos.Productos.length) {
			let estructura = '';
			datos.Productos.forEach(it => {
				estructura += `<tr>
					<td>${it.ProductoId}</td>
					<td>${it.Nombre}</td>
				</tr>`;
			});
			$("#cuerpoPrevTablaElementos").html(estructura);
		} else {
			$("#cuerpoPrevTablaElementos").html(`
				<tr>
					<td colspan="2" class="text-center">No se econtraron registros</td>
				</tr>
			`);
		}
	}
}

function busquedaProducto({ success, producto }) {
	if (success) {
		$("#ProductoIdElemento").val(producto.productoid);
		$("#ProductoIdElemento").closest(".input-group").find('.nombre-prod').html(producto.nombre);
		$("#ProductoIdElemento").attr('data-valido', 'S');
	} else {
		$('#modalCrearLugar').modal('hide');
		$("#ProductoIdElemento").attr('data-valido', 'N');
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
							$('#modalCrearLugar').modal('show');
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
						oSearch: { sSearch: $("#ProductoIdElemento").val() },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								$("#ProductoIdElemento").val(data[0]).change();
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

function tablaElementos() {
	DTElementos = $('#tablaElementos').DataTable({
		language: $.Constantes.lenguajeTabla,
		order: [],
		dom: 'Bfrtp',
		fixedColumns: true,
		pageLength: 3,
		buttons: [{
			extend: 'copy',
			className: 'copyButton',
			exportOptions: { columns: ':not(.noExport)' },
			text: 'Copiar'
		}, {
			extend: 'excel',
			className: 'excelButton',
			orientation: 'landscape',
			pageSize: 'letter',
			exportOptions: { columns: ':not(.noExport)' },
		}, {
			extend: 'pdf',
			className: 'pdfButton',
			tex: 'PDF',
			orientation: 'landscape',
			exportOptions: { columns: ':not(.noExport)' },
			pageSize: 'letter'
		}, {
			extend: 'print',
			className: 'printButton',
			orientation: 'landscape',
			pageSize: 'letter',
			exportOptions: { columns: ':not(.noExport)' },
			text: 'Imprimir'
		}],
		columnDefs: [],
		columns: [
			{ data: "ProductoId", width: '10%' }
			, { data: "Nombre" }
			, { data: "Cantidad" , width: '10%'}
			, {
				data: "Estado"
				, width: '10%'
				, className: 'text-center'
				, render: function (meta, type, data, meta) {
					return data.Estado == 'I' ? 'Inactivo' : 'Activo';
				}
			}, {
				data: "Acciones", width: '10%'
				, className: 'text-center noExport'
				, orderable: false
				, render: function (meta, type, data, meta) {
					btnEditar = `<button class="ediElemento btn btn-primary btn-xs" data-elemento="${data.pos}" title="Editar" style="margin-bottom:3px">
						<i class="fas fa-pencil-alt"></i>
					</button>`;
					btnEliminar = `<button class="eliElemento btn btn-danger btn-xs" data-elemento='${data.pos}' title="Eliminar" style="margin-bottom:3px">
						<i class="fas fa-prescription-bottle"></i>
					</button>`;
					return `${btnEditar} ${btnEliminar}`;
				}
			}
		],
		initComplete: function () {
			$('div#tablaElementos_filter input').unbind();
			$('div#tablaElementos_filter input').keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find('#tablaElementos').dataTable();
				}
			}).change(function (e) {
				e.preventDefault();
				table = $("body").find('#tablaElementos').dataTable();
				table.fnFilter(this.value);
			});
			$('div#tablaElementos_filter input').focus();
			$('div#tablaElementos_paginate').css(
				"margin-bottom", "5px"
			);
		},
		createdRow: function (row, data, dataIndex) {
			$(row).on("click", ".ediElemento", function (e) {
				e.preventDefault();
				let info = DTElementos.data()[$(this).data('elemento')];
				editarElemento = $(this).data('elemento');
				$("#btnCrearElemento").html('<i class="fas fa-edit"></i> Modificar');
				Object.keys(info).forEach(item => $(`#${item}Elemento`).val(info[item]));
				$("#ProductoIdElemento").change();
			});

			$(row).on("click", ".eliElemento", function (e) {
				e.preventDefault();
				let data = $(this).data('elemento');
				eliminarInformacion('¿Desea eliminar este elemento?', data, 'eliminarElemento', 'elementos');
			});
		}
	});
}

function limpiarDatosElemento() {
	$("#ProductoIdElemento").val('');
	$("#ProductoIdElemento").closest('.input-group').find('.nombre-prod').html('');
	$("#CantidadElemento").val(1);
	$("#ValorElemento").val(0);
	$("#EstadoElemento").val('A');
	$("#btnCrearElemento").html('<i class="fas fa-plus"></i> Agregar');
	editarElemento = null;
}

$(function () {
	RastreoIngresoModulo('Lugares');
	$("#previs").toggle();
	$("#eliminarImagen").hide();
	$("#cerrarPrevis").click(function () {
		$("#previs").toggle();
	});

	crearCabecera(cabecera, 'cabecera');
	crearCabecera(cabeceraElemento, 'cabeceraElementos');

	tablaLugares();
	tablaElementos();

	$('.icon-container').click(function (e) {
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

	$("#formularioCrear").submit(function (e) {
		e.preventDefault();

		if ($(this).valid() && $("#TipoLugarId").val() != null) {
			let formulario = new FormData(this);
			if (+formulario.get('GrupoMaximo') < +formulario.get('GrupoMinimo')) {
				alertify.warning("Cantidad mínima debe ser menor a la cantidad máxima.");
				return;
			}
			formulario.append('editarLugar', editarLugar);
			formulario.append('imagen', $("#eliminarImagen").is(':hidden'));
			if ($('#inputIcon').prop('files')[0]) {
				formulario.append("Icono", $('#inputIcon').prop('files')[0]);
			}

			formulario.append('elementos', JSON.stringify(DTElementos.rows().data().toArray()));

			$.ajax({
				url: rutaGeneral + 'crearLugar',
				type: 'POST',
				data: formulario,
				processData: false,
				contentType: false,
				dataType: 'json',
				cache: false,
				encType: 'multipart/form-data',
				success: (resp) => {
					if (!resp.valido) {
						alertify.error(resp.mensaje);
					} else {
						$("#previs").hide();
						limpiarDatos();
						limpiarDatosElemento();
						DTLugares.ajax.reload();
						$('#modalCrearLugar').modal('hide');
						alertify.success(resp.mensaje);
					}
				}
			});
		} else {
			alertify.error("Validar la información de los campos *");
		}
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
		return (editarLugar > 0 ? (codEditarLugar != value ? respu : true) : respu);
	}, 'El código ya se encuentra registrado.');

	$("#LugarId").rules('add', { codigoIgual: true });

	$("#btnCancelarCrearLugar").click(function () {
		limpiarDatos();
		limpiarDatosElemento();
		DTElementos.data().clear().draw();
	});

	dataTablePrev.forEach(item => {
		$("#tablaPrev").append(`<tr>
            <td class="p-2"><b>${item.titulo}: </b></td>
            <td id="pre${item.id}" class="text-right texto-wrap p-2"></td>
        </tr>`);
	});

	$("#eliminarImagen").on('click', function () {
		$("#eliminarImagen").hide();
		$('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
	});

	$('#ValorDeposito, #ValorAlquiler').inputmask("decimal", {
		digits: 2,
		rightAlign: false,
	});

	$("#ManejaElementos").on('change', function () {
		if ($(this).val() == 'S') {
			$("#accordionElementos").removeClass('d-none');
			limpiarDatosElemento();
		} else {
			$("#accordionElementos").addClass('d-none');
		}
	});

	$(".chosen-select").chosen({ width: '100%' });

	$("#ProductoIdElemento").on('change', function (e) {
		e.preventDefault();
		let codigo = $(this).val();
		informacion({ codigo }, 'validarProducto', 'busquedaProducto');
	});

	$("#formCrearElemento").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {

			if ($("#ProductoIdElemento").attr('data-valido') != 'S') {
				return alertify.error("El producto registrado no es valido.");
			}

			let data = {
				ProductoId: $("#ProductoIdElemento").val()
				, Nombre: $("#ProductoIdElemento").closest('.input-group').find('.nombre-prod').text()
				, Cantidad: $("#CantidadElemento").val()
				, Estado: $("#EstadoElemento").val()
				, pos: DTElementos.data().count()
			}

			/* Reemplazamos la posición para saber que esta editando */
			if (editarElemento != null) {
				data.pos = editarElemento;
				DTElementos.row(editarElemento).data(data).draw()
			} else {
				DTElementos.row.add(data).draw();
				DTElementos.page('last').draw('page');
			}
			limpiarDatosElemento();
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#btnCancelarCrearElemento").on('click', function () {
		limpiarDatosElemento();
	});
	
	$(document).on("click", ".btnModalCrearLugar", function (event) {
		event.preventDefault();
		$('#modalCrearLugar').modal('show');
		limpiarDatos();
		limpiarDatosElemento();
		DTElementos.data().clear().draw();
		$("#btnCrearLugar").html('<i class="fas fa-save"></i> Crear');
		$("#LugarId").prop('readonly', false);
	});
});