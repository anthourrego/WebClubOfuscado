let rutaGeneral = base_url() + 'Administrativos/Servicios/CargueCuentaHotel/';
let cabecera = ['ReservaId', 'Nro_Reserva', 'Titular', 'Accion', 'Codigo_Barra', 'Entrada', 'Salida', 'Habitacion', 'Tipo_Habitacion', 'Almacen', 'Sede'];
let tblCuentas;
let tercerosHotel;
let dataFiltro = {};
let datosReserva = {};

$(function () {
	RastreoIngresoModulo('Cargue Cuenta Hotel');

	sessionStorage.removeItem('cuentaHotel');
	sessionStorage.removeItem('datosCuentaHotel');
	sessionStorage.removeItem('tercerosDesayuno');

	$.each(cabecera, (pos, cab) => {
		$('#cabecera').append(`<th class="text-center">${cab.split('_').join(' ')}</th>`)
	});

	tabla();

	$("#UserPedido").on("change", function () {
		let ter = tercerosHotel[$(this).val()];

		$("#collapseTercero").show();
		$("#fotoTercero").prop("src", ter.foto);
		$("#dataTercero").html(`
            <div class="col-6"><strong>Documento</strong></div>
            <div class="col-6">${ter.TerceroId}</div>
            
            <div class="col-6"><strong>Acción</strong></div>
            <div class="col-6">${ter.Accionid == null ? '' : ter.Accionid}</div>
        
            <div class="col-6"><strong>Código de Barra</strong></div>
            <div class="col-6">${ter.barra == null ? '' : ter.barra}</div>

			<div class="col-6"><strong>Edad</strong></div>
            <div class="col-6">${ter.EdadTer == null ? '' : ter.EdadTer}</div>
        
            <div class="col-6"><strong>Tipo</strong></div>
            <div class="col-6">${ter.Tipo}</div>

        `);
	});

	$("#formCargarAccion").on("submit", function (e) {
		e.preventDefault();
		if ($(this).valid()) {
			sessionStorage.setItem('accionPos', 'general');
			let data = {
				ReservaId: $("#ReservaId").val(),
				Tercero: tercerosHotel[$("#UserPedido").val()]['TerceroId'],
				AccionId: tercerosHotel[$("#UserPedido").val()]['Accionid'],
				HeadReservaId: datosReserva.HeadReservaId,
				HabitacionId: datosReserva.HabitacionId,
			}
			sessionStorage.setItem('cuentaHotel', $.Encriptar(data));
			sessionStorage.setItem('datosCuentaHotel', $.Encriptar(data));
			location.href = base_url() + 'Administrativos/Servicios/VistaGeneral?cargueHotel=true';
		}
	});

	let infoDesa = sessionStorage.getItem('regresoMesaDesayuno');
	if (infoDesa) {
		infoDesa = $.Desencriptar(JSON.parse(infoDesa));
		$("#btnRegresarMesas").show();
		$("#btnRegresarMesas").click(function () {
			sessionStorage.removeItem('regresoMesaDesayuno');
			sessionStorage.setItem('accionPos', 'pedido_mesa');
			location.href = base_url() + `Administrativos/Servicios/VistaGeneral/Mesas/${infoDesa.split('"').join('')}`;
		});
	}

});

function tabla() {
	dataFiltro['IDUSUARIO'] = $IDUSUARIO;
	tblCuentas = $('#tabla').DataTable({
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
			data: function (d) {
				return $.extend(d, dataFiltro);
			},
		},
		buttons: [{
			extend: 'copy',
			className: 'copyButton',
			text: 'Copiar'
		}, {
			extend: 'excel',
			className: 'excelButton',
			orientation: 'landscape',
			pageSize: 'letter',
		}, {
			extend: 'pdf',
			className: 'pdfButton',
			tex: 'PDF',
			orientation: 'landscape',
			pageSize: 'letter'
		}, {
			extend: 'print',
			className: 'printButton',
			orientation: 'landscape',
			pageSize: 'letter',
			text: 'Imprimir'
		}],
		columns: [
			{ data: 'ReservaId', width: '11.11%', visible: false }
			, { data: 'Nro_Reserva', width: '11.11%' }
			, { data: 'Titular', width: '11.11%' }
			, { data: 'Accion', width: '11.11%', visible: ($TIPOCOMERC == 'CLUB' ? true : false) }
			, { data: 'Codigo_Barra', width: '11.11%' }
			, { data: 'Entrada', width: '11.11%' }
			, { data: 'Salida', width: '11.11%' }
			, { data: 'Habitacion', width: '11.11%' }
			, { data: 'Tipo_Habitacion', width: '11.11%' }
			, { data: 'Almacen', width: '11.11%' }
			, { data: 'Sede', width: '11.11%' }
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
			$(row).addClass("cursor-pointer");
			$(row).on("click", function (e) {
				e.preventDefault();
				mostrarTerceros(data);
			});
		},
	});
}

function mostrarTerceros(datosR) {
	tercerosHotel = [];
	$("#collapseTercero").hide();
	$(".titulo-data, .subtitulo-data").val("");
	$("#UserPedido").empty();
	$("#UserPedido").append(`<option value="" selected disabled>Seleccione un tercero</option>`);
	$("#ReservaId").val("");
	let data = {
		ReservaId: datosR['ReservaId']
	};
	datosReserva = datosR;
	obtenerInformacion(data, "cargarTercerosReservas", "tercerosReserva")
}

function obtenerInformacion(data, metodoBack, funcion) {
	$.ajax({
		url: rutaGeneral + metodoBack,
		type: 'POST',
		data: data,
		dataType: "json",
		success: (resp) => {
			if (resp.valido && funcion) {
				this[funcion](resp);
			} else if (!resp.valido) {
				alertify.error(resp.mensaje);
			}
		}
	});
}

function tercerosReserva({ datos, msj }) {
	if (datos.length > 0) {
		tercerosHotel = datos;
		$("#ReservaId").val(datosReserva['ReservaId']);
		$(".titulo-data").text("Reserva Nro " + datosReserva['Nro_Reserva']);
		$(".subtitulo-data").text(datosReserva['Habitacion'] + " - " + datosReserva['Tipo_Habitacion'] + " - " + datosReserva['Almacen']);

		datos.forEach(function (element, index) {
			$("#UserPedido").append(`<option ${index == 0 ? 'selected' : ''} value="${index}">${element.nombre}</option>`);
		});

		$("#UserPedido").change();

		$(".bd-accion-modal-sm").modal("show");

		if (datosReserva.AplicaDesayuno == "S") {
			$("#containerDesayuno").html(`
				<button type="button" class="btn btn-secondary tooltip-wrapper" data-html="true" data-toggle="tooltip" id="btnCargarDesayunos" title="Cargar Desayunos">
					Desayunos
				</button>
			`);
			$("#btnCargarDesayunos").unbind().on('click', function () {
				let data = {
					HeadReservaId: datosReserva['HeadReservaId']
				};
				obtenerInformacion(data, "tercerosDesayuno", "tercerosConDesayuno");
			});
		} else {
			$("#containerDesayuno").html(`
				<button type="button" class="btn btn-secondary tooltip-wrapper disabledbtn" data-html="true" data-toggle="tooltip" title="La reserva no tiene desayuno habilitado">
					Desayunos
				</button>
			`);
		}
		$('[data-toggle="tooltip"]').tooltip();
	} else {
		if (msj) {
			alertify.warning(msj);
		} else {
			alertify.warning("No se encontraron terceros asociados a esta reserva.");
		}
	}
}

function tercerosConDesayuno({ datos }) {
	$("#listaTerceros").empty();
	if (datos.length) {
		datos.forEach(it1 => {
			let enc = it1.Huespedes.findIndex(x => !x.TotalDesayuno);
			if (enc > -1) {
				$("#listaTerceros").append(`
					<div class="col-12 mb-2 font-weight-bold">
						<p class="mb-0" style="font-size: 20px;margin-bottom:6px;margin-top: 6px;">${it1.nombre}</p>
						<hr class="my-0 mb-1">
					</div>
				`);
				it1.Huespedes.forEach(it => {
					$("#listaTerceros").append(`
						<div class="col-12 col-sm-4 col-md-4 col-lg-2 mb-2" style="cursor:pointer">
							<div class="card mb-1 h-100 card-tercero" style="box-shadow: none !important;" data-habitacion="${it1.HabitacionId}" data-tercero="${it.TerceroId}" data-reserva="${it1.ReservaId}" data-nombre="${it1.nombre}">
								<div class="card-body px-1 py-1 rounded" style="border:1px solid #b2b9be;">
									<div class="text-center">
										<img src="${it.foto}" style="height: 68px; border-radius: 3px;">
									</div>
									<p style="text-align: center;font-size: 14px;margin-bottom:6px;margin-top: 6px;">${it.nombre}</p>
								</div>
							</div>
						</div>
					`);
				});
			}
		});

		$("#listaTerceros .card-tercero").click(function () {
			if ($(this).hasClass('card-tercero-seleccionado')) {
				$(this).removeClass('card-tercero-seleccionado bg-success');
			} else {
				$(this).addClass('card-tercero-seleccionado bg-success');
			}

			if (!$("#listaTerceros .card-tercero.card-tercero-seleccionado").length) {
				$("#selectTodosTerceros").attr('data-todos', 'N').text("Seleccionar Todos");
			}
		});

		$("#btnElegirTerceros").unbind().on('click', function () {
			let terceros = $(".card-tercero.card-tercero-seleccionado");
			if (terceros.length) {
				let dataTerceros = [];
				$.each(terceros, function () {
					let terceroid = $(this).data('tercero');
					let reservaId = $(this).data('reserva');
					let habitacion = $(this).data('habitacion');
					let nombre = $(this).data('nombre');
					if (terceroid && terceroid != '') {
						dataTerceros.push({ terceroid: terceroid + '', reservaId, habitacion, nombre });
					}
				});
				sessionStorage.setItem('accionPos', 'general');
				let data = {
					ReservaId: datosReserva.ReservaId + '',
					Tercero: '0'
				}
				sessionStorage.setItem('tercerosDesayuno', $.Encriptar(dataTerceros));
				sessionStorage.setItem('cuentaHotel', $.Encriptar(data));
				location.href = base_url() + 'Administrativos/Servicios/VistaGeneral?cargueHotel=true';
			} else {
				alertify.warning("Debe seleccionar al menos un huesped");
			}
		});

		$("#selectTodosTerceros").unbind().on('click', function () {
			let btn = $(this);
			$.each($("#listaTerceros .card-tercero"), function () {
				if (btn.attr('data-todos') == 'S') {
					$(this).removeClass('card-tercero-seleccionado bg-success');
				} else {
					$(this).addClass('card-tercero-seleccionado bg-success');
				}
			});
			if (btn.attr('data-todos') == 'S') {
				btn.attr('data-todos', 'N').text("Seleccionar Todos");
			} else {
				btn.attr('data-todos', 'S').text("Quitar Todos");
			}
		});

		$(".bd-accion-modal-sm").modal("hide");
		$("#elegitTerceros").modal('show');
	} else {
		alertify.warning("No hay huespedes disponibles para el desayuno");
	}
}

function clickTerceroDesayuno(element) {
	if ($(`#${element}`).hasClass('card-tercero-seleccionado')) {
		$(`#${element}`).removeClass('card-tercero-seleccionado');
	} else {
		$(`#${element}`).addClass('card-tercero-seleccionado');
	}
}