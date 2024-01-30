var lastfocus = '';
var usuarioAutoriza = 0;
var TotalRegistro = 0;
var banderaUsuario = 0;
var contexto = this;

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
				}, 500);
			}
		}
	};
});

function cuadreCajero() {
	var fecha = $('#fecha').val();
	var usuario = $('#usuario').val();
	var valor = $('#valor').val();

	$.ajax({
		url: base_url() + "Administrativos/Servicios/CuadreCajero/Cuadre",
		type: 'POST',
		dataType: 'json',
		data: {
			fecha: fecha
			, usuario: usuario
			, valor: valor
			, AlmacenId: $ALMACEN
			, usuarioAutoriza: usuarioAutoriza
			, RASTREO: RASTREO('', 'Cuadre de Cajero')
		},
		success: function (registro) {
			switch (registro) {
				case 0:
					alertify.error('Ocurrió un problema al momento de hacer el cuadre');
					break;
				case 2:
					alertify.alert('Advertencia', 'No se encuentra información para cuadre en el día especificado');
					break;
				case 3:
					alertify.alert('Advertencia', 'Existen facturas pendientes por cancelar');
					break;
				default:
					if (registro[0] == '1') {
						alertify.alert('Cuadre Cajero', 'Cuadre de Cajero generado con éxito No ' + registro[1], function () {
							abrirReporte(base_url() + 'Reportes/ImprimirCuadreCajero/' + registro[2], contexto, 'redireccionImprimir');
						});
					} else {
						alertify.alert('Error', 'Ocurrió un problema al momento de registrar el cuadre', function () {
							this.destroy();
						});
						return false;
					}
					break;
			}
		}
	});
}

function redireccionImprimir() {
	setTimeout(() => {
		location.href = base_url() + 'Administrativos/Servicios/PanelPrincipal';
	}, 3000);
};

function cargarTercero() {
	TotalRegistro = null;
	banderaUsuario = 0;
	var usuario = $('#usuario').val();
	var fecha = $('#fecha').val();
	$("#btCuadreSubmit").addClass('invisible');
	$.ajax({
		url: base_url() + "Administrativos/Servicios/CuadreCajero/CargarTercero",
		type: 'POST',
		dataType: 'json',
		data: {
			fecha: fecha
			, AlmacenId: $ALMACEN
			, usuario: usuario
		},
		success: function (res) {
			try {
				TotalRegistro = res;
			} catch (e) {
				alertify.alert('Error', res, function () {
					this.destroy();
				});
				return false;
			}
			if (TotalRegistro[0] == 1) {
				if (TotalRegistro[1] != null && $clavecuadr == 'S') {
					$("#btCuadreSubmit").addClass('invisible');
					$('#valor').val(0);
					banderaUsuario = 1;
					alertify.confirm('Advertencia', 'Este usuario ya generó el cuadre de cajero para este día. ¿Desea generar uno nuevo? ', function () {
						if ($clavecuadr == 'S') {
							abrirCerrarModal("#modal-solicitar-usuario", "show");
						}
						// $("#btCuadreSubmit").removeClass('invisible');
						$('#valor').val(0);
						$('#tarjetas').val(TotalRegistro[2]);
						$('#creditos').val(TotalRegistro[3]);
					}, function () { });


				} else if (TotalRegistro[1] != null && $clavecuadr != 'S') {
					alertify.alert('Advertencia', 'Este Usuario ya generó el cuadre de cajero para este día', function () {
						$('#valor').val(0);
						$('#tarjetas').val(TotalRegistro[2]);
						$('#creditos').val(TotalRegistro[3]);
					});
				} else {
					$("#btCuadreSubmit").removeClass('invisible');
					$('#valor').val(0);
					$('#tarjetas').val(TotalRegistro[2]);
					$('#creditos').val(TotalRegistro[3]);
					usuarioAutoriza = 0;
				}
			} else {
				alertify.alert('Error', 'Ocurrió un problema al momento de cargar la información del cajero', function () {
					this.destroy();
				});
				return false;
			}
		}
	});
}

function abrirCerrarModal(elemento, metodo, elementoAbrir, metodoAbrir) {
	$(elemento).modal(metodo);
	if (elementoAbrir && metodoAbrir) {
		$(elementoAbrir).modal(metodoAbrir);
	}
}

$(function(){
	RastreoIngresoModulo('Cuadre de Cajero');
	
	$('.numero').val('').inputmask('tres', {
		rightAlign: false,
		maxLength: 10,
		digits: 2
	}).focus(function () {
		if (!tecladoVirutal) {
			$(this).select();
		}
	});
	
	$('[data-db=usuarioId]').val($usuarioId);
	$('[data-db=usuarioIdNombre]').text($Usuario);

	cargarTercero();
	lastfocus = $('#fecha').val();

	$("#fecha").data("DateTimePicker").maxDate(moment().format('YYYY-MM-DD'));

	$('#frmCuadre').on("submit", function(e) {
		e.preventDefault();
		if ($(this).valid()) {
			if ($('#valor').val() == '') {
				alertify.confirm('Advertencia', '¿Está seguro de generar el cuadre con valor entregado igual a cero?', function () {
					cuadreCajero();
				}, function () {
		
				});
			} else {
				cuadreCajero();
			}
		}
	});

	$("#frmCuadre").on("change", "[data-foranea]:not([data-codigo])", function () {
		var value = $(this).val();
		var tabla = $(this).attr('data-foranea');
		var self = this;
		if (value != '') {
			var nombre = $(self).attr('data-foranea-codigo');
			var tblNombre = 'nombre';
			$.ajax({
				url: base_url() + "Administrativos/Servicios/CuadreCajero/CargarForanea",
				type: 'POST',
				data: {
					tabla: tabla,
					value: value,
					nombre: nombre,
					tblNombre: tblNombre
				},
				success: function (respuesta) {
					if (respuesta == 0) {
						$(self).val('').closest('.input-group').find('span').text('').attr('title', '');
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
										}
									});
	
									alertify.myAlert(data);
	
									dtSS({
										data: {
											tblID: '#tblBusqueda',
											select: [$(self).attr('data-foranea-codigo'), tblNombre],
											table: [$(self).attr('data-foranea')],
											column_order: [$(self).attr('data-foranea-codigo'), tblNombre],
											column_search: [$(self).attr('data-foranea-codigo'), tblNombre],
											columnas: [$(self).attr('data-foranea-codigo'), tblNombre]
										},
										bAutoWidth: false,
										columnDefs: [
											{ targets: [0], width: '1%' },
										],
										order: [],
										ordering: false,
										pageLength: 10,
										oSearch: { sSearch: value },
										createdRow: function (row, data, dataIndex) {
											$(row).click(function () {
												$(self).val(data[0]).change();
												alertify.myAlert().close();
											});
										},
										deferRender: true,
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
					} else {
						respuesta = JSON.parse(respuesta);
						$(self).closest('.input-group').find('span').text(respuesta[0][tblNombre].trim()).attr('title', respuesta[0][tblNombre].trim());
						cargarTercero();
					}
				}
			});
		} else {
			$(self).closest('.input-group').find('span').text('').attr('title', '');
		}
	});

	$('#frmCuadre').on('focusin', '[id=fecha]', function () {
		lastfocus = $(this).val();
	}).on('focusout', '[id=fecha]', function () {
		if ($(this).val() != lastfocus) {
			if ($('#usuario').val() != '') {
				cargarTercero();
			}
		}
	});

	$("#formDataAdmin").submit(function (e) {
		e.preventDefault();
		$("#btCuadreSubmit").addClass('invisible');

		/* Vamos a validar el usuario ingresado para permisos de administrador */
		if ($(this).valid()) {
			let $fills = $("#formDataAdmin input"), data = {};
			$.each($fills, (pos, input) => {
				const name = $(input).attr("name");
				data[name] = $(input).val();
			});
			data['permiso'] = 2619; //nuevo cuadre cajero;
			datas = $.Encriptar(data);

			$.ajax({
				url: base_url() + "Administrativos/Servicios/CuadreCajero/validarUsuario",
				type: 'POST',
				data: {
					encriptado: datas
				},
				success: (resp) => {
					resp = JSON.parse($.Desencriptar(JSON.parse(resp)));
					$("#formDataAdmin")[0].reset();
					$("#formDataAdmin :input").removeClass('is-invalid');
					$("#formDataAdmin").validate().resetForm();
					if (resp.valido) {
						alertify.success(resp.mensaje);
						$("#btCuadreSubmit").removeClass('invisible');
						abrirCerrarModal('#modal-solicitar-usuario', 'hide');
						usuarioAutoriza = data['usuarioid'];
					} else if (!resp.valido) {
						$("#btCuadreSubmit").addClass('invisible');
						alertify.error(resp.mensaje);
						usuarioAutoriza = 0;
					} else {
						$("#btCuadreSubmit").addClass('invisible');
						alertify.error(resp.mensaje);
						usuarioAutoriza = 0;
						abrirCerrarModal('#modal-solicitar-usuario', 'hide');
					}
				}
			});
		} else {
			alertify.error("Validar la información de los campos");
		}
	});
})






