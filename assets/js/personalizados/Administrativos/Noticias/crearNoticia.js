let editarInfo = 0;
let rutaGeneral = 'Administrativos/Noticias/Noticias/';

$(function () {
	RastreoIngresoModulo('Crear Noticia');
	if ($("#editorCuerpo").length) {
		initCKEditor();
	}
	initValues();
});

function initValues() {

	if ($IDNOTICIA > 0) {
		let encript = $.Encriptar($IDNOTICIA);
		informacion(encript, 'obtenerNoticia', 'editar');
	}

    $.Constantes.categoriasDirectoriosDisponible.forEach(item => {
        $("#Visualiza").append(`<option value="${item.valor}">${item.titulo}</option>`);
    });

	$("#formularioCrear").submit(function (e) {
		e.preventDefault();
		if ($("#formularioCrear").valid()) {
			let $fills = $("#formularioCrear input, #formularioCrear select");
            let data = {};
			$.each($fills, (pos, input) => {
                let value = $(input).val();
				const name = $(input).attr("name");
            	if (name == "Estado") {
					value = $(input).prop('checked') ? 'A' : 'I';
				}
				if (name == "Prioridad") {
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
					Contenido: editor.getData(),
					editarInfo
				};
				info = $.Encriptar(data);
			    $.ajax({
					url: base_url() + rutaGeneral + 'guardarNoticia',
					type: 'POST',
					data: {encriptado: info},
					datatype: "json",
					success: (resp) => {
						resp = JSON.parse($.Desencriptar(resp));
						if (!resp.valido) {
							alertify.error(resp.mensaje);
						} else {
							$("#previs").hide();
							let idInsertado = resp.idInsertado;
							window.location.href = `${base_url()}Administrativos/Noticias/Noticias`;
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
    editor = CKEDITOR.replace('editorCuerpo', {
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
    //editor.setData(editor.getData() + '<div>{header}</div><div>{/header}</div><div class="footerP">{footer}</div><div>{/footer}</div>');
    editor.on('beforeCommandExec', function (evt) {
        htmlNoticia = editor.getData();
        htmlNoticia = htmlNoticia.replace("{header}", "<div class='page-header' style='position: fixed; top: 0mm; width: 99%;'>");
        htmlNoticia = htmlNoticia.replace("{/header}", "</div>");
        htmlNoticia = htmlNoticia.replace("{footer}", "<div class='page-footer' style='position: fixed; bottom: 0;width: 99%;'>");
        htmlNoticia = htmlNoticia.replace("{/footer}", "</div>");
        if (evt.data.name == 'print') {
            evt.cancel();
            evt.stop();
            htmlNoticia = `<table>
				<thead>
					<tr>
						<td><div class="page-header-space"></div></td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<div class="page" style="page-break-after: always;width: 100%;">${htmlNoticia}</div>
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
            ventana.document.write(`<style>${$.Constantes.imprimirEstilos}</style>${htmlNoticia}`);
            ventana.document.close();
            setTimeout(function () {
                ventana.print();
                ventana.close();
            }, 1000);
        }
    });
};

function limpiarDatos() {
	editarInfo = 0;
	$("#formularioCrear")[0].reset();
    $("#formularioCrear :input").removeClass('is-invalid');
    $("#formularioCrear").validate().resetForm();
	$("#btnCrearNoticia").text('Crear');
}

function validarFechas(info) {
	let mensaje = '';
	let bandera = 1;
	let array = [{
		llave1: 'FechaInicio', llave2: 'FechaFin', mensaje: 'La fecha inicio debe ser menor a la fecha de fin.'
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
		dataType: "json",
		cache: false,
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
	editarInfo = resp.datos[0]['NoticiaId'];
	$('#btnCrearNoticia').text('Modificar');
	Object.keys(resp.datos[0]).forEach(item => {
		$('#' + item).val(resp.datos[0][item]);
		if (item === 'Estado' || item == "Calificacion" || item == "Prioridad" || item == "MultipleInscripcion" || item == "InscripcionApp" || item == "Prioridad" || item == "Notificar") {
			$('#' + item).prop('checked', (resp.datos[0][item] == 'A' || resp.datos[0][item] == 1 ? true : false));
		}
		if (item === 'Prioridad') {
			$('#' + item).prop('checked', (resp.datos[0][item] ? true : false));
		}
	});
	editor.setData(resp.datos[0]['Contenido'] ? resp.datos[0]['Contenido'] : '');
}
