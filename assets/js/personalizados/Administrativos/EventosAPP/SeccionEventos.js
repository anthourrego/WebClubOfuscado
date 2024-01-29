let rutaGeneral = 'Administrativos/Eventos/Eventos/';
let editarInfo = 0;
let cabecera = ['Codigo', 'Nombre', 'Descripcion', 'Prioridad', 'Visualiza', 'Estado', 'Acciones'];
let tblSeccion;

$(function () {

    crearCabecera(cabecera);
    tblSeccion = dataTable();
    $.Constantes.categoriasDirectoriosDisponible.forEach(item => {
        $("#Visualiza").append(`<option value="${item.valor}">${item.titulo}</option>`);
    });
    obtenerDataTabla();

    $("#btnCancelar").click(function () {
        limpiarDatos();
    });

    $("#Descripcion").on("change", function () {
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
                if (name == "Prioridad") {
                    value = $(input).prop('checked') ? 1 : 0;
                }
                data[name] = value;
            });
            data = { ...data, editarInfo };
            info = $.Encriptar(data);
            $.ajax({
                url: base_url() + rutaGeneral + 'guardarSeccionEvento',
                type: 'POST',
                data: { encriptado: info },
                dataType: "json",
                success: (resp) => {
                    resp = JSON.parse($.Desencriptar(resp));
                    if (!resp.valido) {
                        alertify.error(resp.mensaje);
                    } else {
                        $("#previs").hide();
                        let idInsertado = resp.idInsertado;
                        obtenerDataTabla();
                        limpiarDatos();
                        $('#CrearSeccionEventos').modal('hide');
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
            accionBotonesCatDirectorio(row);
        }
    });
}

function obtenerDataTabla() {
    $.ajax({
        url: base_url() + rutaGeneral + 'obtenerSeccionEventos',
        type: 'GET',
        cache: false,
        dataType: "json",
        success: (resp) => {
            tblSeccion.clear().draw();
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                let filas = organizarColumnas(resp.datos, cabecera);
                tblSeccion.rows.add(filas).draw();
                tblSeccion.order([0, 'asc']).draw();
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function organizarColumnas(datos, cabecera) {
    let filas = [];
    $.each(datos, function (pos, item) {
        let ver = `
            <button class="ediSec btn btn-primary btn-xs" data-sec="${item.Codigo}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            <button class="eliSec btn btn-danger btn-xs" data-sec='${JSON.stringify({ 'Id': item.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
        `;
        let valores = {};
        cabecera.forEach((cab, pos) => {
            if (cab == "Estado") {
                valores[pos] = item[cab] == 'A' ? 'Activado' : 'Inactivo';
            } else if (cab == 'Visualiza') {
                valores[pos] = $.Constantes.categoriasDirectoriosDisponible.find(i => item[cab] == i.valor)['titulo'];
            } else if (cab == 'Prioridad') {
                valores[pos] = item[cab] == 1 ? 'Si' : 'No';
            } else {
                valores[pos] = item[cab] ? item[cab] : '';
            }
            if (cab == "Descripcion") {
                valores[pos] = "<div class='textarea'>" + item[cab] + "</div>"
            }
        });
        valores[cabecera.length - 1] = ver;
        filas.push(valores);
    });
    return filas;
}

function accionBotonesCatDirectorio(row) {
    $(row).on("click", ".ediSec", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('sec'));
        informacion(data, 'obtenerSeccionEvento', 'editar');
    });

    $(row).on("click", ".eliSec", function (e) {
        e.preventDefault();
        let data = $(this).data('sec');
        eliminarInformacion('¿Desea eliminar esta categoria?', data, 'eliminarSeccionEvento');
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
    editarInfo = resp.datos[0]['SeccionEventoId'];
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

    setTimeout(() => {
        $("#Descripcion").change();
    }, 30);
    $("#CrearSeccionEventos").modal('show');
}

function limpiarDatos() {
    editarInfo = 0;
    $("#formCrear")[0].reset();
    $("#formCrear :input").removeClass('is-invalid');
    $("#formCrear").validate().resetForm();
    $("#btnCrear").text('Crear');
}
