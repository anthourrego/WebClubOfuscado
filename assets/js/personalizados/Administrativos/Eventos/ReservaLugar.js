let rutaGeneral = 'ReservaLugar/';
let consultandoAccion = false;
let $GID         = null;
let lugarId      = ['003','005'];
let TerceroId    = '860037707';
let EventoId     = 1;
let EventoReservaId = 2042;
let tblDTAyuda;
let Tipo         = 'E'
let CotizacionId = 3;
let cabecera      = ['Producto', 'Nombre', 'Valor Unitario', 'Valor', 'Cantidad', 'Acciones'];
let cabeceraExcel = ['N°_Documento', 'Nombre', 'Fecha_Nacimiento', 'Telefono', 'Email', 'Observación'];

let editarElemento = null
var DTtblImportar;

let editarLugar = 0;
let codEditarLugar = 0;
lastFocus = '';
let DTTable = {
	cargarElementoDT :''
	,cargarMenuDT :''
	,cargarOtrosDT : ''
}

let Filtro = {
	cargarElementoDT : {
		EventoId,
		TerceroId,
		Tipo : 'E'
	},
	cargarMenuDT : {
		EventoId,
		TerceroId,
		Tipo : 'M'
	},
	cargarOtrosDT : {
		EventoId,
		TerceroId,
		Tipo : 'O'
	}
};

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

$(function () {
	RastreoIngresoModulo('Reserva Lugar');
	$("#tercerosAccion").hide();
	$('.nav-tabs > li a[title]').tooltip();

	iniciarModuloCrearEventos();
	crearCabecera(cabecera, 'crearCabecera');
	tabla('cargarElementoDT');
	tabla('cargarMenuDT');
	tabla('cargarOtrosDT');
	getTotalizados('E');
	$("#fechIncial").val(moment().format("YYYY-MM-DD"));
	$("#fechaFinal").val(moment().format("YYYY-MM-DD"));
	$("#mesanio").val(moment().format("YYYY-MM-DD"));
	

	$(".next-step").click(function (e) {
		var step = $(this).data("step");
		var active = $('#navwizard .nav-link.active').closest(".nav-item");
		
		switch (step) {
			case "datosBasicos":
				if ($('#formularioCrearEventoBasico').valid()) {
					active.next().removeClass('disabled').removeAttr("disabled").find(".nav-link").removeClass('disabled').removeAttr("disabled");
					nextTab(active);
				} else {
					alertify.error("Validar la información de los campos.");
					return;
				}
				break;
		
			default:
				active.next().removeClass('disabled').removeAttr("disabled").find(".nav-link").removeClass('disabled').removeAttr("disabled");
				nextTab(active);
				break;
		}
	});

	$(".prev-step").click(function (e) {
		var active = $('#navwizardMenus .nav-link.active').closest(".nav-item");
		prevTab(active);
	});

	//Wizard
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		if ($(e.target).parent().hasClass('disabled')) return false;

		if ($(e.target).hasClass('calendario')) {
			let datos = {
				eventoId: 1,
				vista: 'reserva'
			}
			iniciarCalendario(datos);
		}
	});

	$('.Tipo').on('shown.bs.tab', function (e) {
		Tipo = $(this).attr('Tipo');
		limpiarDatosElemento();
		getTotalizados(Tipo)

	});

	$.validator.addMethod('codigoIgual', function (value, element) {
		let respu = true;
		// this.optional(element);
		$.ajax({
			url: rutaGeneral + 'validarCodigo',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: { codigo: value , Id : $GID},
			success: (resp) => respu = resp.valido,
		});
		return (editarLugar > 0 ? (codEditarLugar != value ? respu : true) : respu);
	}, 'El código ya se encuentra registrado.');
	$("#EventoId").rules('add', { codigoIgual: true });


	$("#formCrearElemento").submit(function (e) {
		e.preventDefault();
		if ($(this).valid()) {

			if ($("#ProductoIdElemento").attr('data-valido') != 'S') {
				return alertify.error("El producto registrado no es valido.");
			}

			let data = {
				ProductoId: $("#ProductoIdElemento").val()
				, Cantidad: $("#CantidadElemento").val()
				, Id      : editarElemento
				, EventoId
				, Tipo
				// , CotizacionId
				, lugarId
			}
			guardarValoresElemento(data);
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

	$("#btnCancelarCrearElemento").on('click', function () {
		limpiarDatosElemento();
	});

	$("#btnFiltrarDisponibilidad").on('click', function () {
		let data = {
			mesAnio: $("#fechIncial").val()
			, capacidadMinima    : $("#capacidadMinima").val()
			, capacidadMaxima    : $("#capacidadMaxima").val()
			, lugaresFiltroC     : []
			, tipoLugaresFiltroC : []
		};
		iniciarCalendario(data);
	});
	

});

function nextTab(elem) {
	$(elem).next().find('a[data-toggle="tab"]').click();
}

function prevTab(elem) {
	$(elem).prev().find('a[data-toggle="tab"]').click();
}

$('.nav-tabs').on('click', 'li', function (e) {
	e.preventDefault(e);
	if ($('#formularioCrearEventoBasico').valid()) {
		$('.nav-tabs li.active').removeClass('active');
		$(this).addClass('active');
	} else {
			alertify.error("Validar la información de los campos");
			return;
	}
});

$('#modalFoto, #modalConsultarCrear').on('show.bs.modal', function () {
	setTimeout(() => {
		$(this).find("button")[0].focus();
	}, 500);
});

$('#modalFoto, #modalConsultarCrear').on('hide.bs.modal', function () {
	setTimeout(() => {
		$('#numeroAccionCA').val('').focus();
	}, 500);
});

$('#modalTerceros2').on('show.bs.modal', function () {
	$("#modalConsultarCrear").css("z-index", "1071");
	$("#modalConsultarCrear").data('bs.modal')._config.focus = false;
	$("#modalConsultarCrear").data('bs.modal')._config.keyboard = false;
	$(this).data('bs.modal')._config.focus = true;
	$(this).data('bs.modal')._config.keyboard = true;
});

$('#modalTerceros2').on('hide.bs.modal', function () {
	$("#modalConsultarCrear").css("z-index", "1072");
	$("#modalConsultarCrear").data('bs.modal')._config.focus = true;
	$("#modalConsultarCrear").data('bs.modal')._config.keyboard = true;
});

$('#modalConsultarCrear').on('hide.bs.modal', function () {
	$ID = '';
	$CREAR = 0;
	if ($("#checkLectorTercero").is(":checked")) {
		$("#checkLectorTercero").click();
	}
});

$("#btnBuscar").on("click", function () {
	alertify.ajaxAlert = function (url) {
		$.ajax({
			url: url,
			async: false,
			success: function (data) {
				alertify.myAlert().set({
					onclose: function () {
						if (!busquedaClick) {
							$ID = '';
						}
						busqueda = false;
						alertify.myAlert().set({ onshow: null });
						$(".ajs-modal").unbind();
						delete alertify.ajaxAlert;
						$("#tblBusqueda").unbind().remove();
					}, onshow: function () {
						busqueda = true;
						busquedaClick = false;
					}
				});

				alertify.myAlert(data);

				var $tblID = '#tblBusqueda';
				dtSS({
					data: {
						tblID: $tblID,
					},
					ajax: {
						url: rutaGeneral + "DTBucarTercero",
						type: "POST"
					},
					bAutoWidth: false,
					columnDefs: [
						{ targets: [0], width: '1%' },
					],
					ordering: false,
					draw: 10,
					pageLength: 10,
					initComplete: function () {
						setTimeout(function () {
							$('div.dataTables_filter input').focus();
							$('html, body').animate({
								scrollTop: $('div.dataTables_filter input').offset().top
							}, 2000);
						}, 500);
						$('div.dataTables_filter input')
							.unbind()
							.change(function (e) {
								e.preventDefault();
								table = $("body").find($tblID).dataTable();
								table.fnFilter(this.value);
							});
					},
					oSearch: { sSearch: $ID },
					createdRow: function (row, data, dataIndex) {
						$(row).click(function () {
							busquedaClick = true;
							$('#numeroAccionCA').val(data[0].trim()).focusin().change();
							$(self).val(data[0].trim()).change();
							alertify.myAlert().close();
						});
					},
					scrollY: screen.height - 400,
					scroller: {
						loadingIndicator: true
					},
					dom: domftri
				});
			}
		});
	}
	alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
	$("#modalConsultarCrear").modal("hide");
	$CREAR = 1;
});

$('[data-rastreo]').on('focusin', function(){
	lastFocus = $(this).is('select') ? $(this).find("option:selected").text() : $(this).val();
}).on('focusout', function(){
	if($(this).valid()){
		var valor = $(this).is('select') ? $(this).find("option:selected").text() : $(this).val();
		if(valor != lastFocus) guardarValores(this);
	}
});

$("#AplicaMenu, #Boletas, #Interno").on("click",function(){
	var self = this;
	lastFocus = $(this).is(':checked') ? 0 : 1;
	var valor = $(this).is(':checked') ? 1 : 0;
	editarValores(valor,self);
});

$("#inputIcon").change(function(){
	if($GID != ''){
		leerImg(this);
	}else{
		alertify.error('No hay un Cliente cargado');
	}
});

$("#vendedorId").on('focusin', function(){
	lastFocus = $(this).val();
}).on('focusout', function(){
	var value = $(this).val();
	if (value != lastFocus) {
		var self = this;
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
						}, onshow: function () {
							busqueda = true;
							busquedaClick = false;
						}
					});

					alertify.myAlert(data);

					var $tblID = '#tblBusqueda';
					dtSS({
						data: {
							tblID: $tblID
						},
						ajax: {
							url: rutaGeneral + "DTBucarVendedor",
							type: "POST"
						},
						bAutoWidth: false,
						columnDefs: [
							{ targets: [0], width: '1%' },
						],
						ordering: false,
						draw: 10,
						pageLength: 10,
						initComplete: function () {
							setTimeout(function () {
								$('div.dataTables_filter input').focus();
								$('html, body').animate({
									scrollTop: $('div.dataTables_filter input').offset().top
								}, 2000);
							}, 500);
							$('div.dataTables_filter input')
								.unbind()
								.change(function (e) {
									e.preventDefault();
									table = $("body").find($tblID).dataTable();
									table.fnFilter(this.value);
								});
						},
						// oSearch: { sSearch: $ID },
						createdRow: function (row, data, dataIndex) {
							$(row).click(function () {
								busquedaClick = true;
								$(self).val(data[0]).focusout();
								$(self).val(data[0]).closest('.input-group').find('span').text(data[1]).attr('title', data[1]);
								var valor = $(self).val();
								if(valor != lastFocus) guardarValores(self);
								alertify.myAlert().close();
							});
						},
						scrollY: screen.height - 400,
						scroller: {
							loadingIndicator: true
						},
						dom: domftri
					});
				}
			});
		}
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable");
	}
});

function guardarValores(self){
	var valor = $(self).is("select") ? $(self).find("option:selected").text() : $(self).val();
	if (valor != null && valor != undefined) {
		if ($GID == null) {
			var rastreo = 'Crea Evento ['+$(self).attr('data-db')+' : '+lastFocus+' => '+valor+']'; 
			$.ajax({
				url: rutaGeneral + "guardarValores",
				type: "POST",
				dataType :"JSON",
				data: {
					Campo 	: $(self).attr('data-db'),
					Valor	: $(self).val(),
					Tabla 	: $(self).attr('data-tabla'),
					RASTREO : RASTREO(rastreo, 'Crea Evento Datos Basico')
				},
				async: false,
				success: function(resultado) {
					if (resultado != 0) {
						$GID = resultado;
						$("[data-tabla=Evento]").prop("disabled",false);
						$("#TerceroId").prop("disabled", false);
						$("#inputIcon").prop("disabled",false);
					}else{
						alertify.alert("¡Error!","Comuniquese con el administrador del sistema.", function(){
							return false;
						});
					}
				},
				error: function(error) {
					alertify.alert('Error', error.responseText);
				}
			});
		}
		else{
			editarValores($(self).val(),self);
		}
	}
}

function editarValores(value,self){
	if($(self).attr('data-db') == 'FechaInicial' || $(self).attr('data-db') == 'HoraInicial'){
		value = $("#FechaInicial").val() + ' ' + $("#HoraInicial").val();
		Campo = 'FechaInicial';
	}else if($(self).attr('data-db') == 'FechaFinal' || $(self).attr('data-db') == 'HoraFinal'){
		value = $("#FechaFinal").val() + ' ' + $("#HoraFinal").val();
		Campo = 'FechaFinal';
	}else{
		Campo = $(self).attr('data-db');
	}

	var rastreo = 'Modifica Evento [Id : '+$GID+'] ['+$(self).attr('data-db')+' : '+lastFocus+' => '+value+']';

	$.ajax({
		url      : rutaGeneral + "editarValores",
		type     : "POST",
		dataType : "JSON",
		data: {
			Id 		: $GID,
			Valor	: value,
			Campo,
			Tabla 	: $(self).attr('data-tabla'),
			RASTREO : RASTREO(rastreo, 'Crea Evento Datos Basico')
		},
		async: false,
		success: function(resultado) {
			if (resultado == 0) {
				alertify.alert("¡Error!","Comuniquese con el administrador del sistema.",function(){
					return false;
				});
			}
		},
		error: function(error) {
			alertify.alert('Error', error.responseText);
		}
	});
}

function leerImg(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var background = e.target.result;
			$(input).closest('form').off('submit').on('submit',function(e){
				e.preventDefault();
				if(typeof FormData !== 'undefined'){
					// var rastreo = 'Modifica Evento [Id : '+$GID+'] Cambia Foto'+' : '+lastFocus+' => '+value+']';

					var form_data = new FormData();
					form_data.append('file', $(input)[0].files[0]);
					form_data.append('imagen', $(input).attr('data-imagen'));
					form_data.append('src', "");
					form_data.append('EventoId', $GID);
					$.ajax({	
						url: rutaGeneral + "ActualizarImagen",
						type:"POST",
						async		: false,
						cache		: false,
						contentType : false,
						processData : false,
						data:form_data,	
						success:function(respuesta){
							if(respuesta != 1){
								alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
									this.destroy();
								});
							}else{
								$(input).closest('.imagen-container').find(".img-perfil").attr("src", background);
							}
						}
					});
				}
			});
			$(input).closest('form').submit();
		}
		reader.readAsDataURL(input.files[0]);
	}
}

// Elementos
function crearCabecera(array, id) {
	$.each(array, (pos, cab) => {
		$('.' + id).append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
	});
}

function busquedaProducto({ success, producto }) {
	let GetBusqueda = 'DTBuscarProducto' ;
	switch (Tipo) {
		case 'M':
			GetBusqueda = 'DTProductoTodos' ;
		break;
		case 'O':
			GetBusqueda = 'DTProductoTodos' ;
		break;
	}

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
							alertify.myAlert().set('resizable', true).resizeTo('50%', '100%');
						}
					});
					alertify.myAlert(data);

					dtSS({
						data: {
							tblID: '#tblBusqueda'
						},
						ajax: {
							url: rutaGeneral + GetBusqueda,
							type: "POST",
							data:{lugarId}
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
		var campos = encodeURIComponent(JSON.stringify(['ProductoId', 'Nombre', 'Valor']));
		alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
	}
}

$("#ProductoIdElemento").on('change', function (e) {
	e.preventDefault();
	let codigo = $(this).val();
	informacion({ codigo }, 'validarProducto', 'busquedaProducto');
});

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

function limpiarDatosElemento() {
	editarElemento = null;
	$("#ProductoIdElemento").val('');
	$("#ProductoIdElemento").closest('.input-group').find('.nombre-prod').html('');
	$("#CantidadElemento").val(1);
	$("#btnCrearElemento").html('<i class="fas fa-plus"></i>');
}

function tabla(Id) {
	DTTable[Id]  = $('#' + Id).DataTable({
		language: $.Constantes.lenguajeTabla,
		order: [],
		dom: 'Bfrtp',
		fixedColumns: true,
		processing: true,
		serverSide: true,
		pageLength: 10,

		scrollY: $(document).height() - 480,
        scrollX: true,
        scroller: {
            loadingIndicator: true
        },
        scrollCollapse: true,
        columnDefs: [],

		ajax: {
			url: rutaGeneral + 'cargarDatosDT',
			type: 'POST',
			data: function (d) {
				return $.extend(d, Filtro[Id]);
			}
		},
		buttons: [{
			extend: 'copy',
			className: 'copyButton',
			text: 'Copiar',
			exportOptions: { columns: ':not(.noExport)' },
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
		}],
		columns: [
			  { data: "ProductoId", width: '10%' }
			, { data: "Nombre" }
			, { data: "ValorUnitario" , width: '10%'}
			, { data: "Valor" , width: '10%'}
			, { data: "Cantidad" , width: '10%'}
			, {
				data: "Acciones", width: '10%'
				, className: 'text-center noExport'
				, orderable: false
				, render: function (meta, type, data, meta) {
					btnEditar = `<button class="ediElemento btn btn-primary btn-xs" data-elemento="${data.Id}" title="Editar" style="margin-bottom:3px">
						<i class="fas fa-pencil-alt"></i>
					</button>`;
					btnEliminar = `<button class="eliElemento btn btn-danger btn-xs" data-elemento='${data.Id}' title="Eliminar" style="margin-bottom:3px">
						<i class="fas fa-prescription-bottle"></i>
					</button>`;
					return `${btnEditar} ${btnEliminar}`;
				}
			}
		],
		initComplete: function () {
			$('div#'+Id+'_filter input').unbind();
			$('div#'+Id+'_filter input').keyup(function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find('#'+Id+'').dataTable();
				}
			}).change(function (e) {
				e.preventDefault();
				table = $("body").find('#'+Id+'').dataTable();
				table.fnFilter(this.value);
			});
			$('div#'+Id+'_filter input').focus();
			$('div#'+Id+'_paginate').css(
				"margin-bottom", "5px"
			);
		},
		createdRow: function (row, data, dataIndex) {
			$(row).on("click", ".ediElemento", function (e) {
				e.preventDefault();
				editarElemento = $(this).data('elemento');
				$("#btnCrearElemento").html('<i class="fas fa-edit"></i>');
				Object.keys(data).forEach(item => $(`#${item}Elemento`).val(data[item]));
				$("#CantidadElemento").focus();
				$("#ProductoIdElemento").change();
			});

			$(row).on("click", ".eliElemento", function (e) {
				e.preventDefault();
				eliminarInformacion('¿Desea eliminar este elemento?', data, 'eliminarElemento', 'elementos');
			});
		}
	});
}

function guardarValoresElemento(data){
	$.ajax({
		url: rutaGeneral + "guardarValoresElemento",
		type: "POST",
		dataType :"JSON",
		data : {data},
		async: false,
		success: function(resp) {
			if (resp.valido == 0) {
				alertify.error(resp.mensaje);
			} else {
				limpiarDatosElemento();
				switch (Tipo) {
					case 'E':
						DTTable['cargarElementoDT'].ajax.reload();
						break;
					case 'M':
						DTTable['cargarMenuDT'].ajax.reload();
						break;
					case 'O':
						DTTable['cargarOtrosDT'].ajax.reload();
						break;
				}
				getTotalizados(Tipo);
				alertify.success(resp.mensaje);
			}
		},
		error: function(error) {
			alertify.alert('Error', error.responseText);
		}
	});
}

function eliminarInformacion(mensaje, data, ruta, accion) {
	alertify.confirm('Eliminar', mensaje, function (ok) {
		$.ajax({
			url: rutaGeneral + ruta,
			type: 'POST',
			dataType: 'json',
			data: data,
			success: (resp) => {
				let metodo = (!resp.valido ? 'error' : 'success');
				alertify[metodo](resp.mensaje);
				if (resp.valido) {
					switch (Tipo) {
						case 'E':
							DTTable['cargarElementoDT'].ajax.reload();
							break;
						case 'M':
							DTTable['cargarMenuDT'].ajax.reload();
							break;
						case 'O':
							DTTable['cargarOtrosDT'].ajax.reload();
							break;
					}
					ditarElemento = null;
				}
				getTotalizados(Tipo);
			},
			error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
		});

	}, function (err) {
		console.error("Error ", err);
	});
}

function getTotalizados(Tipo = 0){
	$.ajax({
		url: rutaGeneral + 'getTotalizados',
		type: 'POST',
		dataType: 'json',
		data: {
			TerceroId,
			Tipo,
			EventoId
		},
		success: (resp) => {
			switch (Tipo) {
				case 'E':
					$(".divElemento").show();
					$(".divElementoTotal").show();
					DTTable['cargarElementoDT'].ajax.reload();
				break;
				case 'M':
					$(".divElemento").show();
					$(".divElementoTotal").show();
					DTTable['cargarMenuDT'].ajax.reload();
				break;
				case 'O':
					$(".divElemento").show();
					$(".divElementoTotal").show();
					DTTable['cargarOtrosDT'].ajax.reload();
				break;
				case 'B':
					$(".divElementoTotal").show();
					$(".divElemento").hide();
				break;
				default:
					$(".divElementoTotal").hide();
					$(".divElemento").hide();
					DTtblImportar.ajax.reload();
				break;
			}

			$('[id="E"]').val('$ ' + resp.ElementoFijo);
			$('[id="M"]').val('$ ' + resp.Menu);
			$('[id="O"]').val('$ ' + resp.Otros);
			$('[id="T"]').val('$ ' + resp.ValorTotal);
		}
	});
}









