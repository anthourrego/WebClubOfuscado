let rutaGeneral = 'Administrativos/Noticias/Noticias/';
let cabecera = ['Titulo', 'Tipo_Noticia', 'Visualiza', 'FechaInicio', 'FechaFin', 'Prioridad', 'Estado', 'Acciones'];
let tblNoticias;

$(function () {
	RastreoIngresoModulo('Noticias');
    $("#previs").toggle();
    $("#cerrarPrevis").click(function () {
        $("#previs").toggle();
    });
    crearCabecera(cabecera);
    tblNoticias = dataTable();
    obtenerDataTabla();
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
        url: base_url() + rutaGeneral + 'obtenerNoticias',
        type: 'GET',
        cache: false,
        dataType: "json",
        success: (resp) => {
            tblNoticias.clear().draw();
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                let filas = organizarColumnas(resp.datos, cabecera);
                tblNoticias.rows.add(filas).draw();
                tblNoticias.order([0, 'asc']).draw();
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function organizarColumnas(datos, cabecera) {
    let filas = [];
    $.each(datos, function (pos, item) {
        let ver = `
            <button class="ediNoti btn btn-primary btn-xs" data-noti="${item.NoticiaId}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            <button class="eliNoti btn btn-danger btn-xs" data-noti='${JSON.stringify({ 'Id': item.NoticiaId })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
            <button class="verNoti btn btn-success btn-xs" data-noti='${item.NoticiaId}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
        `;
        let valores = {};
        cabecera.forEach((cab, pos) => {
            if (cab == "Estado") {
                valores[pos] = item[cab] == 'A' ? 'Activado' : 'Inactivo';
            } else if (cab == "Visualiza") {
                let encontro = $.Constantes.categoriasDirectoriosDisponible.find(it => it.valor == item[cab]);
                valores[pos] = encontro.titulo;
            } else if (cab == "Prioridad") {
                valores[pos] = item[cab] == 0 ? 'No' : 'Si';
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
    $(row).on("click", ".ediNoti", function (e) {
        e.preventDefault();
        window.location.href = `${base_url()}Administrativos/Noticias/Noticias/CrearNoticia/${$(this).data('noti')}`;
    });

    $(row).on("click", ".eliNoti", function (e) {
        e.preventDefault();
        let data = $(this).data('noti');
        eliminarInformacion('¿Desea eliminar esta programación?', data, 'eliminarNoticia');
    });

    $(row).on("click", ".verNoti", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('noti'));
        informacion(data, 'obtenerNoticia', 'prevInformacion');
    });
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
    }, function () {});
}

function prevInformacion(resp) {
    if (resp.datos[0]['Contenido'] == '') {
        $('#prevContenido').html('<h5 class="text-center">No hay contenido disponible</h5>');
    } else {
        $('#prevContenido').html(resp.datos[0]['Contenido']);
    }
    $("#previs").show();
}
