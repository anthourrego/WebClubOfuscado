let rutaGeneral = 'Administrativos/Directorio/Directorio/';
let editarInfo = 0;
let cabeceraDirectorio = ['Codigo', 'Foto', 'Nombre', 'Telefono', 'Categoria', 'Observacion', 'Email', 'Calificacion', 'Estado', 'Acciones'];
let cabeceraCateDirectorio = ['Codigo', 'Nombre', 'Descripcion', 'Prioridad', 'Visualiza', 'Estado', 'Acciones'];
let tblCateDirectorio;
let tblDirectorio;
let dataTablePrevDirectorio = [{
    titulo: 'Categoria', id: 'CategoriaDirectorioId'
}, {
    titulo: 'Telefono', id: 'Telefono'
}, {
    titulo: 'Email', id: 'Email'
}, {
    titulo: 'Observación', id: 'Observacion'
}, {
    titulo: 'Calificación', id: 'Calificacion'
}, {
    titulo: 'Estado', id: 'Estado'
}];
let sqlDirectorio = {
	tblID: "#tabla",
	select: [
		"cd.DirectorioId AS Codigo"
		, "cd.Foto"
		, "cd.Nombre"
		, "cd.Telefono"
		, "ccd.CategoriaDirectorioId"
		, "ccd.Nombre AS NombreDir"
		, "'' AS Acciones"
	],
	table: [
		'APPClubDirectorio AS cd',
		[
			["APPClubCategoriaDirectorio AS ccd", `cd.CategoriaDirectorioId = ccd.CategoriaDirectorioId AND ccd.Visualiza = '${1}' AND ccd.Estado = 'A'`, "INNER"]
		], [
			["cd.Estado = 'A'"]
		]
	],
	column_order: ['Acciones', 'Codigo', 'Foto', 'Nombre', 'Telefono', 'Categoria', 'Observacion', 'Email', 'Calificacion', 'Estado'],
	column_search: ['cd.Nombre', 'ccd.Nombre', 'cd.Telefono'],
	columnas: cabeceraDirectorio,
	orden: {
		'Codigo': 'ASC'
		, 'Foto': 'ASC'
		, 'Nombre': 'ASC'
		, 'Telefono': 'ASC'
		, 'Categoria': 'ASC'
		, 'Observacion': 'ASC'
		, 'Email': 'ASC'
		, 'Calificacion': 'ASC'
		, 'Estado': 'ASC'
		, 'Acciones': 'ASC'
	},
};

let sqlCategoriaDirectorio = {
	tblID: "#tabla",
	select: [
		"CategoriaDirectorioId AS Codigo"
		, "Nombre"
		, "Descripcion"
		, "Prioridad"
		, "Visualiza"
		, "Estado"
		, "'' AS Acciones"
	],
	table: [
		'APPClubCategoriaDirectorio',
		[], []
	],
	column_order: ['Acciones', 'Codigo', 'Nombre', 'Descripcion', 'Prioridad', 'Visualiza', 'Estado'],
	column_search: ['Nombre', 'Descripcion'],
	columnas: cabeceraCateDirectorio,
	orden: {
		'Codigo': 'ASC'
		, 'Nombre': 'ASC'
		, 'Descripcion': 'ASC'
		, 'Prioridad': 'ASC'
		, 'Visualiza': 'ASC'
		, 'Estado': 'ASC'
		, 'Acciones': 'ASC'
	},
};

$(function () {

	if ($('#inputFoto').length) {
		RastreoIngresoModulo('Directorio');
        crearCabecera(cabeceraDirectorio);
        leerFoto();
        $("#eliminarImagen").hide();
        $("#previs").toggle();
        $("#cerrarPrevis").click(function () {
            $("#previs").toggle();
        });
        dataTablePrevDirectorio.forEach(item => {
            $("#tablaPrev").append(`<tr>
                <td>- ${item.titulo}:</td>
                <td id="pre${item.id}" class="text-right texto-wrap"></td>
            </tr>`);
        });
        cargarTabla('tblDirectorio', false);
        obtenerDataTabla('tblDirectorio', 'obtenerDirectorios', cabeceraDirectorio);
    } else {
		RastreoIngresoModulo('Categoria Directorio');
        crearCabecera(cabeceraCateDirectorio);
        cargarTabla('tblCateDirectorio', true);
        $.Constantes.categoriasDirectoriosDisponible.forEach(item => {
            $("#Visualiza").append(`<option value="${item.valor}">${item.titulo}</option>`);
        });
        obtenerDataTabla('tblCateDirectorio', 'obtenerCategorias', cabeceraCateDirectorio);
    }

    $("#btnCancelar").click(function () {
        limpiarDatos();
    });

    $("#Descripcion, #Observacion").on("change", function () {
        $(this).css("height", "auto");
        $(this).css("height", $(this)[0].scrollHeight + "px");
    });

    $("#formCrear").submit(function (e) {
        e.preventDefault();
        if ($("#formCrear").valid()) {
            let $fills = $("#formCrear input, #formCrear textarea, #formCrear select");
            let data = {};
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");
                if (name == "Estado") {
                    value = $(input).prop('checked') ? 'A' : 'I';
                }
                if (name == "Prioridad" || name == "Calificacion") {
                    value = $(input).prop('checked') ? 1 : 0;
                }
                data[name] = value;
            });
            data = { ...data, editarInfo, imagen: $("#eliminarImagen").is(':hidden') };
            info = $.Encriptar(data);
            let formulario = new FormData();
            formulario.append("encriptado", info);
            if ($('#inputFoto').length) {
                formulario.append("Imagen", $('#inputFoto').prop('files')[0]);
                guardarIformacion('guardarDirectorio', formulario);
            } else {
                guardarIformacion('guardarCategoria', formulario);
            }
        } else {
            alertify.error("Valide la información de los campos.");
        }
    });

});

function guardarIformacion(ruta, formulario) {
    $.ajax({
        url: base_url() + rutaGeneral + ruta,
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
                if ($('#inputFoto').length) {
                    obtenerDataTabla('tblDirectorio', 'obtenerDirectorios', cabeceraDirectorio);
                } else {
                    obtenerDataTabla('tblCateDirectorio', 'obtenerCategorias', cabeceraCateDirectorio);
                }
                limpiarDatos();
                $('#modalCrear').modal('hide');
                alertify.success(resp.mensaje);
            }
        }
    });
}

function elegirFoto() {
    $('#inputFoto').click();
}

function leerFoto() {
    $('#inputFoto').change(function (e) {
        e.preventDefault();
        let file = $(this).prop('files')[0];
        if (file) {
            let reader = new FileReader();
            reader.onloadend = function () {
                $('.imagen-contacto').attr('src', reader.result);
                $("#eliminarImagen").show();
            }
            reader.readAsDataURL(file);
        }
    });

    $("#eliminarImagen").on('click', function () {
        $("#eliminarImagen").hide();
        $('.imagen-contacto').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
    });

}

function crearCabecera(array) {
    $.each(array, (pos, cab) => {
        $('#cabeceraTabla').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
    });
}

function cargarTabla(tabla, categoria) {
    this[tabla] = dataTable(categoria);
}

function dataTable(categoria) {
    return $('#tabla').DataTable({
		//data: categoria ? sqlCategoriaDirectorio : sqlDirectorio,
        language: $.Constantes.lenguajeTabla,
        processing: true,
        pageLength: 10,
        order: [],
        dom: 'Bfrtp',
        autoWidth: false,
        buttons: [
            { extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
        ],
        columnDefs: [],
        createdRow: function (row, data, dataIndex) {
            $(row).children().last().css('text-align', 'center');
            if (categoria) {
                accionBotonesCatDirectorio(row);
            } else {
                accionBotonesDirectorio(row);
            }
        }
    });
}

function obtenerDataTabla(tabla, ruta, cabecera) {
    $.ajax({
        url: base_url() + rutaGeneral + ruta,
        type: 'GET',
        cache: false,
        dataType: "json",
        success: (resp) => {
            this[tabla].clear().draw();
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                let filas = organizarColumnas(resp.datos, cabecera);
                this[tabla].rows.add(filas).draw();
                this[tabla].order([0, 'asc']).draw();
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function organizarColumnas(datos, cabecera) {
    let filas = [];
    $.each(datos, function (pos, item) {
        let ver = `
            <button class="ediCat btn btn-primary btn-xs" data-cat="${item.Codigo}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            <button class="eliCat btn btn-danger btn-xs" data-cat='${JSON.stringify({ 'Id': item.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
        `;
        if (item['Calificacion'] >= 0) {
            ver = `
                <button class="ediDir btn btn-primary btn-xs" data-dir="${item.Codigo}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
                <button class="eliDir btn btn-danger btn-xs" data-dir='${JSON.stringify({ 'Id': item.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
                <button class="verDir btn btn-success btn-xs" data-dir='${item.Codigo}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
            `;
        }
        let valores = {};
        cabecera.forEach((cab, pos) => {
            if (cab == "Estado") {
                valores[pos] = item[cab] == 'A' ? 'Activado' : 'Inactivo';
            } else if (cab == 'Visualiza') {
                valores[pos] = $.Constantes.categoriasDirectoriosDisponible.find(i => item[cab] == i.valor)['titulo'];
            } else if (cab == 'Prioridad' || cab == 'Calificacion') {
                valores[pos] = item[cab] == 1 ? 'Si' : 'No';
            } else {
                valores[pos] = item[cab] ? item[cab] : '';
            }
            if (cab == "Observacion" || cab == "Descripcion") {
                valores[pos] = "<div class='textarea'>" + item[cab] + "</div>"
            }
            if (cab == "Foto") {
                let icono = `uploads/${NIT()}/Directorio/${item['Foto']}`;
                if (!item['Foto']) {
                    icono = `assets/images/user/nofoto.png`;
                }
                valores[pos] = `<img style="width:85px; height: 75px;" class="icono" src="${base_url() + icono}?${Math.random()}">`
            }
        });
        valores[cabecera.length - 1] = ver;
        filas.push(valores);
    });
    return filas;
}

function accionBotonesCatDirectorio(row) {
    $(row).on("click", ".ediCat", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('cat'));
        informacion(data, 'obtenerCategoria', 'editar');
    });

    $(row).on("click", ".eliCat", function (e) {
        e.preventDefault();
        let data = $(this).data('cat');
        eliminarInformacion('¿Desea eliminar esta categoria?', data, 'eliminarCategoria');
    });
}

function accionBotonesDirectorio(row) {
    $(row).on("click", ".ediDir", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('dir'));
        informacion(data, 'obtenerDirectorio', 'editar');
    });

    $(row).on("click", ".eliDir", function (e) {
        e.preventDefault();
        let data = $(this).data('dir');
        eliminarInformacion('¿Desea eliminar este directorio?', data, 'eliminarDirectorio');
    });

    $(row).on("click", ".verDir", function (e) {
        e.preventDefault();
        let data = $.Encriptar($(this).data('dir'));
        informacion(data, 'obtenerDirectorio', 'prevDir');
    });
}

function prevDir(resp) {
    Object.keys(resp.datos[0]).forEach(item => {
        if (item === 'Estado') {
            $('#pre' + item).text(resp.datos[0][item] == 'A' ? 'Activo' : 'Inactivo');
        } else if (item === 'Calificacion') {
            $('#pre' + item).text(resp.datos[0][item] == 0 ? 'No' : 'Si');
        } else {
            $('#pre' + item).text(resp.datos[0][item]);
        }
    });
    if (!resp.datos[0]['Foto']) {
        $('#preImagen').hide();
    } else {
        $('#preImagen').show();
        $('#preImagen').attr('src', `${base_url()}uploads/${NIT()}/Directorio/${resp.datos[0]['Foto']}?${Math.random()}`);
    }
    $("#previs").show();
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

function eliminarInformacion(mensaje, data, ruta) {
    alertify.confirm('Eliminar', mensaje, function (ok) {
        data = $.Encriptar(data);
        $.ajax({
            url: base_url() + rutaGeneral + ruta,
            type: 'POST',
            data: {
                encriptado: data
            },
            dataType: "json",
            success: (resp) => {
                resp = JSON.parse($.Desencriptar(resp));
                let metodo = (!resp.valido ? 'error' : 'success');
                alertify[metodo](resp.mensaje);
                if (resp.valido) {
                    if ($('#inputFoto').length) {
                        obtenerDataTabla('tblDirectorio', 'obtenerDirectorios', cabeceraDirectorio);
                    } else {
                        obtenerDataTabla('tblCateDirectorio', 'obtenerCategorias', cabeceraCateDirectorio);
                    }
                }
            },
            error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
        });
    }, function (err) {
        console.error("Error ", err);
    });
}

function editar(resp) {
    editarInfo = resp.datos[0]['DirectorioId'] ? resp.datos[0]['DirectorioId'] : resp.datos[0]['CategoriaDirectorioId'];
    $('#btnCrear').text('Modificar');
    Object.keys(resp.datos[0]).forEach(item => {
        $('#' + item).val(resp.datos[0][item]);
        if (item === 'Estado') {
            $('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
        }
        if (item === 'Prioridad') {
            $('#' + item).prop('checked', (resp.datos[0][item] ? true : false));
        }
    });
    if ($('#inputFoto').length) {
        let foto = `uploads/${NIT()}/Directorio/${resp.datos[0]['Foto']}`;
        $("#eliminarImagen").show();
        if (!resp.datos[0]['Foto']) {
            $("#eliminarImagen").hide();
            foto = `assets/images/user/nofoto.png`;
        }
        $('.imagen-contacto').attr('src', `${base_url() + foto}?${Math.random()}`);
    }
    setTimeout(() => {
        $("#Descripcion, #Observacion").change();
    }, 30);
    $("#modalCrear").modal('show');
}

function limpiarDatos() {
    editarInfo = 0;
    $("#formCrear")[0].reset();
    $("#formCrear :input").removeClass('is-invalid');
    $("#formCrear").validate().resetForm();
    $("#btnCrear").text('Crear');
    if ($('#inputFoto').length) {
        $('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
    }
    $("#eliminarImagen").hide();
}
