let rutaGeneralCrearEvento = 'Administrativos/Eventos/ReservaLugar/';
let dataMostrarTerceroEvento = [{
	propiedad: 'TerceroID', titulo: 'Documento'
}, {
	propiedad: 'barra', titulo: 'Código de Barra'
}];

// if ($TIPOCOMERC == 'CLUB') {
// 	dataMostrarTerceroEvento = dataMostrarTerceroEvento.concat([
// 		{
// 			propiedad: 'AccionId', titulo: 'Acción'
// 		}, {
// 			propiedad: 'Tipo', titulo: 'Tipo'
// 		}, {
// 			propiedad: 'TarjetaSocioId', titulo: 'Tarjeta Socio'
// 		}
// 	]);
// }

function iniciarModuloCrearEventos() {

	// $(".chosen-select").chosen({ width: '100%' });

	$("#eliminarImagenCrearEvento, #btnCrearTercero").hide();

	$('.icon-container-crear-evento').click(function (e) {
		let id = $(this).parent().children('input').attr('id');
		let actual = $(this);
		$('#' + id).click();
		$('#' + id).on('change', function (evt) {
			let file = $(this).prop('files')[0];
			if (file) {
				let reader = new FileReader();
				reader.onloadend = function () {
					actual.children('img').attr('src', reader.result);
					$("#eliminarImagenCrearEvento").show();
				}
				reader.readAsDataURL(file);
			}
		});
	});

	$("#eliminarImagenCrearEvento").on('click', function () {
		$(this).hide();
		$('.icon-container-crear-evento').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
	});

	$("#TerceroId").on('change', function (e) {
		e.preventDefault();
		let data = {
			accion: $("#TerceroId").val()
			, ingreso: 'N'
			, sede: null
			, almacen: null
			, fechaActual: moment().toDate()
		};
		obtenerInformacionCrearEvento(data, 'obtenerAccion', 'informacionAccion');
	});

	$("#btnCrearTercero").on('click', function () {
		$("#modalConsultarCrear").modal('show');
	});

	$("#modalConsultarCrear").on('shown.bs.modal', function () {

		$("#btnIrCrearTercero").on("click", function () {
			if ($TERCCrear.includes(parseInt('0'))) {
				$ID = $("#numeroAccionCA").val();
				if ($ID != '' && $ID.length > 0) {
					$.ajax({
						url: rutaGeneral + "registrarTercero",
						type: 'POST',
						dataType: 'json',
						data: {
							codigo: $ID,
							nombreuno: '',
							nombrdos: '',
							apelluno: '',
							apelldos: '',
							sexo: '',
							fechaNac: '',
							RASTREO: RASTREO('Registra Cliente ' + $ID, 'Terceros')
						},
						success: function (respuesta) {
							if (respuesta != '1') {
								alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function () {
									this.destroy();
								});
							} else {
								// $ID = lastID;
							}
							$("[data-codigo]").val($ID).change();
						}
					});
					$("#modalConsultarCrear").modal("hide");
					setTimeout(() => {
						$("#modalTerceros2").modal("show");
					}, 200);
				} else {
					alertify.error("Error con el número de documento, no se puede crear el tercero.");
				}
			} else {
				alertify.alert('¡Alerta!', '<h3 class="mensaje-alerta">No tienes permiso para crear terceros</h3>');
			}
			$CREAR = 1;
		});

	});

	$("#Interno").on("click", function(e){
		let checked = $(this).is(":checked"); 
		if (checked) {
			$(".no-aplica-interno").addClass("d-none");
			$(".si-aplica-interno").removeClass("d-none");
			$(".divDatos").removeClass("col-md-7").addClass("col-md-10");
		} else {
			$(".no-aplica-interno").removeClass("d-none");
			$(".si-aplica-interno").addClass("d-none");
			$(".divDatos").addClass("col-md-7").removeClass("col-md-10");
		}
	});
}

function obtenerInformacionCrearEvento(data, metodoBack, funcion) {
	encriptado = $.Encriptar(data);
	$.ajax({
		url: base_url() + rutaGeneralCrearEvento + metodoBack,
		type: 'POST',
		data: { encriptado },
		dataType: "json",
		success: (resp) => {
			if (funcion) this[funcion](resp);
		}
	});
}

function informacionAccion(resp) {
	resp = JSON.parse($.Desencriptar(resp));
	if (resp.valido) {
		$("#btnCrearTercero").hide();
		if (resp.datos.length) {
			let datos = resp.datos;
			$("#UserTercero").html('');
			datos.forEach((it, pos) => {
				$("#UserTercero").append(`<option value="" selected></option>`);
				$("#UserTercero").append(`<option data-pos="${pos}" value="${it.TerceroID}">${it.Nombre}</option>`);
			});
			$("#tercerosAccion").show();

			$("#UserTercero").off('change').change(function () {
				let enc = datos[$(this).find(':selected').data('pos')];
				if (enc) {
					$("#dataTercero").html('');
					$("#fotoTercero").prop("src", enc.Foto);
					dataMostrarTerceroEvento.forEach(it => {
						$("#dataTercero").append(`
							<div class="col-6"><strong>${it.titulo}</strong></div>
							<div class="col-6 prop${it.propiedad}">${enc[it.propiedad]}</div>
						`);
					});
					if (!$("#collapseTercero.show").length) {
						$("#btnCollapse").click();
					}
				}
				// 
				guardarValores(this);
			});
			$(".chosen-select").trigger('chosen:updated');
			$(".chosen-select").chosen({ width: '100%' });
		}
	} else {
		alertify.error(resp.mensaje);
		$("#btnCrearTercero").show();
		$("#UserTercero").html('');
		$(".chosen-select").trigger('chosen:updated');
		$("#tercerosAccion").hide();
		if ($("#collapseTercero.show").length) {
			$("#btnCollapse").click();
		}
	}
}
