let editarInfo = 0;
let rutaGeneral = 'Administrativos/Eventos/Eventos/';

$(function () {
	bsCustomFileInput.init();
	if ($("#CampoRedaccion").length) {
		initCKEditor();
	}
	$("#eliminarPdf, #eliminarImagen").hide();
	initValues();
});

function initValues() {

	$.Constantes.categoriasDirectoriosDisponible.forEach(item => {
		$("#Visualiza").append(`<option value="${item.valor}">${item.titulo}</option>`);
	});

	$.Constantes.mediosPagosEventos.forEach(item => {
		$("#MediosPago").append(`<option value="${item.valor}">${item.titulo}</option>`)
	});

	$('.img-icono').click(function (e) {
		let id = $(this).parent().children('input').attr('id');
		let actual = $(this);
		$('#' + id).click();
		$('#' + id).on('change', function (evt) {
			let file = $(this).prop('files')[0];
			if (file) {
				let reader = new FileReader();
				reader.onloadend = function () {
					actual.attr('src', reader.result);
					$("#eliminarImagen").show();
				}
				reader.readAsDataURL(file);
			}
		});
	});

	$('#inputPdf').on('change', function (evt) {
		let file = $(this).prop('files')[0];
		if (file) {
			let reader = new FileReader();
			reader.onloadend = function () {
				$("#eliminarPdf").show();
			}
			reader.readAsDataURL(file);
		}
	});

	$("#eliminarPdf").on('click', function () {
		$('#inputPdf').val('');
		$(this).hide();
		bsCustomFileInput.destroy();
		bsCustomFileInput.init();
	});

	$("#eliminarImagen").on('click', function () {
		$(this).parent().children('.img-icono').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
		$(this).hide();
	});

	if ($IDSECCION > 0) {
		let encript = $.Encriptar($IDSECCION);
		informacion(encript, 'obtenerProgramacionEvento', 'editar');
	}

	$("#FormularioProgramarEvento").submit(function (e) {
		e.preventDefault();
		if ($("#FormularioProgramarEvento").valid()) {
			let $fills = $("#FormularioProgramarEvento input, #FormularioProgramarEvento select");
			let data = {};
			$.each($fills, (pos, input) => {
				let value = $(input).val();
				const name = $(input).attr("name");
				if (name == "Estado") {
					value = $(input).prop('checked') ? 'A' : 'I';
				}
				if (name == "Calificacion" || name == "Prioridad" || name == "MultipleInscripcion" || name == "InscripcionApp" || name == "Prioridad" || name == "Notificar") {
					value = $(input).prop('checked') ? 1 : 0;
				}
				data[name] = value;
			});
			let valido = validarFechas(data);
			if (!valido.bandera) {
				alertify.warning(valido.mensaje);
			} else {
				data = {
					...data,
					Contenido: editorEvento.getData(),
					editarInfo,
					imagen: $("#eliminarImagen").is(':hidden'),
					pdf: $("#eliminarPdf").is(':hidden')
				};
				info = $.Encriptar(data);
				let formulario = new FormData();
				formulario.append("Imagen", $('#inputIcon').prop('files')[0]);
				formulario.append("Pdf", $('#inputPdf').prop('files')[0]);
				formulario.append("encriptado", info);
				$.ajax({
					url: base_url() + rutaGeneral + 'guardarProgramacionEvento',
					type: 'POST',
					data: formulario,
					processData: false,
					contentType: false,
					cache: false,
					encType: 'multipart/form-data',
					dataType: "json",
					success: (resp) => {
						resp = JSON.parse($.Desencriptar(resp));
						if (!resp.valido) {
							alertify.error(resp.mensaje);
						} else {
							$("#previs").hide();
							let idInsertado = resp.idInsertado;
							window.location.href = `${base_url()}Administrativos/Eventos/Eventos`;
							limpiarDatos();
							alertify.success(resp.mensaje);
						}
					}
				});
			}
		} else {
			alertify.error("Valide la información de los campos.");
		}
	});

}

initCKEditor = function () {
	CKEDITOR.addCss($.Constantes.estiloEditor);
	editorEvento = CKEDITOR.replace('CampoRedaccion', {
		language: 'es',
		toolbarCanCollapse: true,
		height: 700,
		font_names: $.Constantes.fuenteEditor,
		width: '100%',
		contentsCss: ['https://cdn.ckeditor.com/4.8.0/full-all/contents.css'],
		bodyClass: 'document-editor',
		format_tags: 'p;h1;h2;h3;pre',
		removeDialogTabs: 'image:advanced;link:advanced',
		uploadUrl: base_url() + 'assets/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
		filebrowserImageBrowseUrl: base_url() + 'assets/js/ckfinder/ckfinder.html?type=Images',
		filebrowserUploadUrl: base_url() + 'assets/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files',
		filebrowserImageUploadUrl: base_url() + 'assets/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images',
	});
	CKFinder.setupCKEditor();
	/* editorEvento.on('someEvent', function (evt) {
		contenido = editorEvento.getData();
		if (evt.data.name == 'print') {
			evt.cancel();
			evt.stop();
			contenidoEditorNoticia = `<table>
				<thead>
					<tr>
						<td><div class="page-header-space"></div></td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<div class="page" style="page-break-after: always;width: 100%;">${contenido}</div>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td><div class="page-footer-space"></div></td>
					</tr>
				</tfoot>
			</table>`;
			var ventana = window.open('', '_blank');
			ventana.document.write(`<style>${$.Constantes.imprimirEstilos}</style>${contenido}`);
			ventana.document.close();
			setTimeout(function () {
				ventana.print();
				ventana.close();
			}, 1000);
		}
	}); */
};

function limpiarDatos() {
	editarInfo = 0;
	$("#FormularioProgramarEvento")[0].reset();
    $("#FormularioProgramarEvento :input").removeClass('is-invalid');
    $("#FormularioProgramarEvento").validate().resetForm();
	$("#btnProgramar").text('Crear');
}

function validarFechas(info) {
	let mensaje = '';
	let bandera = 1;
	let array = [{
		llave1: 'FechaInicio', llave2: 'FechaFin', mensaje: 'La fecha inicio debe ser menor a la fecha de finalización.'
	}, {
		llave1: 'FechaInicioPublicacion', llave2: 'FechaFinPublicacion', mensaje: 'La fecha inicio de publicación debe ser menor a la fecha final.'
	}, {
		llave1: 'FechaFinInscripciones', llave2: 'FechaInicio', mensaje: 'La fecha fin de inscripcines debe ser menor a la fecha inicio.'
	}, {
		llave1: 'FechaFinPublicacion', llave2: 'FechaFin', mensaje: 'La fecha fin de publicación debe ser menor a la fecha fin.'
	}];
	array.forEach(it => {
		if (!moment(info[it.llave1]).isSameOrBefore(moment(info[it.llave2]))) {
			bandera = 0;
			mensaje = it.mensaje;
		}
	});
	return { mensaje, bandera };
}

function informacion(data, ruta, funcion) {
	$.ajax({
		url: base_url() + rutaGeneral + ruta,
		type: 'POST',
		data: {
			encriptado: data
		},
		cache: false,
		dataType: "json",
		success: (resp) => {
			resp = JSON.parse($.Desencriptar(resp));
			if (!resp.valido) {
				alertify.error(resp.mensaje);
			} else {
				this[funcion](resp);
			}
		},
		error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
	});
}

function editar(resp) {
	editarInfo = resp.datos[0]['EventoId'];
	$('#btnProgramar').text('Modificar');
	Object.keys(resp.datos[0]).forEach(item => {
		$('#' + item).val(resp.datos[0][item]);
		if (item === 'Estado' || item == "Calificacion" || item == "Prioridad" || item == "MultipleInscripcion" || item == "InscripcionApp" || item == "Prioridad" || item == "Notificar") {
			$('#' + item).prop('checked', (resp.datos[0][item] == 'A' || resp.datos[0][item] == 1 ? true : false));
		}
		if (item === 'Prioridad') {
			$('#' + item).prop('checked', (resp.datos[0][item] ? true : false));
		}
	});
	editorEvento.setData(resp.datos[0]['Contenido'] ? resp.datos[0]['Contenido'] : '');
	let foto = `uploads/${NIT()}/Eventos/${resp.datos[0]['Foto']}`;
	$("#eliminarImagen").show();
	if (!resp.datos[0]['Foto']) {
		$("#eliminarImagen").hide();
		foto = `assets/images/user/nofoto.png`;
	}
	$('.icon-container').children('img').attr('src', `${base_url() + foto}?${Math.random()}`);
	/* $("#eliminarPdf").hide();
	if (resp.datos[0]['PDFEvento']) {
		$("#eliminarPdf").show();
		$('#inputPdf').val(`${base_url()}uploads/${NIT()}/Eventos/${resp.datos[0]['PDFEvento']}?${Math.random()}`);
	} */
}
