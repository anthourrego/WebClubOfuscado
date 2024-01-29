let rutaGeneral = 'Administrativos/Noticias/Noticias/';
let editarInfo = 0;
let cabecera = ['Nombre', 'Estado', 'Acciones'];
let tblTipoNoticia;

$(function () {
	RastreoIngresoModulo('Sección Noticias');
    $("input[name=Estado]").prop('checked', true);
    crearCabecera(cabecera);
    tblTipoNoticia = dataTable();;
    obtenerDataTabla();
    $("#btnCancelarCrear").click(function () {
        limpiarDatos();
    });
    $("#FormCrearSecccionNoticias").submit(function (e) {
        e.preventDefault();
        if ($("#FormCrearSecccionNoticias").valid()) {
            let $fills = $("#FormCrearSecccionNoticias input");
            let data = {};
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");
                if (name == "Estado") {
                    value = $(input).prop('checked') ? 'A' : 'I';
                }
                data[name] = value;
            });
            data = { ...data, editarInfo };
            info = $.Encriptar(data);
            $.ajax({
                url: base_url() + rutaGeneral + 'guardarSeccionNoticia',
                type: 'POST',
                data: { encriptado: info },
                dataType: "json",
                success: (resp) => {
                    resp = JSON.parse($.Desencriptar(resp));
                    if (!resp.valido) {
                        alertify.error(resp.mensaje);
                    } else {
                        let idInsertado = resp.idInsertado;
                        obtenerDataTabla();
                        limpiarDatos();
                        $('#CrearSeccionNoticia').modal('hide');
                        alertify.success(resp.mensaje);
                    }
                }
            });
        } else {
            alertify.error("Valide la información de los campos.");
        }
    });
});

function crearCabecera(array) {
    $.each(array, (pos, cab) => {
        $('#cabeceraTabla').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
    });
}

function dataTable() {
    return $('#tabla').DataTable({
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
            accionBotones(row);
        }
    });
}

function obtenerDataTabla() {
    $.ajax({
        url: base_url() + rutaGeneral + 'obtenerSeccionNoticias',
        type: 'GET',
        cache: false,
        dataType: "json",
        success: (resp) => {
            tblTipoNoticia.clear().draw();
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                let filas = organizarColumnas(resp.datos, cabecera);
                tblTipoNoticia.rows.add(filas).draw();
                tblTipoNoticia.order([0, 'asc']).draw();
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function organizarColumnas(datos, cabecera) {
    let filas = [];
    $.each(datos, function (pos, item) {
        let ver = `
            <button class="ediTipo btn btn-primary btn-xs" data-tipo="${item.Codigo}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            <button class="eliTipo btn btn-danger btn-xs" data-tipo='${JSON.stringify({ 'Id': item.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
        `;
        let valores = {};
        cabecera.forEach((cab, pos) => {
            if (cab == "Estado") {
                valores[pos] = item[cab] == 'A' ? 'Activado' : 'Inactivo';
            } else {
                valores[pos] = item[cab] ? item[cab] : '';
            }
        });
        valores[cabecera.length - 1] = ver;
        filas.push(valores);
    });
    return filas;
}

function accionBotones(row) {
    $(row).on("click", ".ediTipo", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('tipo'));
        informacion(data, 'obtenerSeccionNoticia', 'editar');
    });

    $(row).on("click", ".eliTipo", function (e) {
        e.preventDefault();
        let data = $(this).data('tipo');
        eliminarInformacion('¿Desea eliminar esta categoria?', data, 'eliminarSeccionNoticia');
    });
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
                    obtenerDataTabla();
                }
            },
            error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
        });
    }, function (err) {
        console.error("Error ", err);
    });
}

function editar(resp) {
    editarInfo = resp.datos[0]['TipoNoticiaId'];
    $('#btnCrearNoticia').text('Modificar');
    Object.keys(resp.datos[0]).forEach(item => {
        $('#' + item).val(resp.datos[0][item]);
        if (item === 'Estado') {
            $('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
        }
    });
    $("#CrearSeccionNoticia").modal('show');
}

function limpiarDatos() {
    editarInfo = 0;
    $("#FormCrearSecccionNoticias")[0].reset();
    $("#FormCrearSecccionNoticias :input").removeClass('is-invalid');
    $("#FormCrearSecccionNoticias").validate().resetForm();
    $("#btnCrearNoticia").text('Crear');
}
