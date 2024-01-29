let rutaGeneral = 'Administrativos/Eventos/Eventos/';
let cabecera = ['Foto', 'Titular', 'Lugar', 'FechaInicio', 'FechaFin', 'Contacto', 'Inscripcion', 'Estado', 'Acciones'];
let tblProgramar;

$(function () {
    
    $("#previs").toggle();
    $("#cerrarPrevis").click(function () {
        $("#previs").toggle();
    });

    crearCabecera(cabecera);
    tblProgramar = dataTable();
    obtenerDataTabla();

});

function crearCabecera(array) {
    $.each(array, (pos, cab) => {
        $('#cabeceraTabla').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
    });
}

function dataTable() {
    return $('#tablaEventos').DataTable({
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
        url: base_url() + rutaGeneral + 'obtenerProgramacionEventos',
        type: 'GET',
        cache: false,
        dataType: "json",
        success: (resp) => {
            tblProgramar.clear().draw();
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                let filas = organizarColumnas(resp.datos, cabecera);
                tblProgramar.rows.add(filas).draw();
                tblProgramar.order([0, 'asc']).draw();
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function organizarColumnas(datos, cabecera) {
    let filas = [];
    $.each(datos, function (pos, item) {
        let ver = `
            <button class="ediProg btn btn-primary btn-xs" data-prog="${item.Codigo}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            <button class="eliProg btn btn-danger btn-xs" data-prog='${JSON.stringify({ 'Id': item.Codigo })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
            <button class="verProg btn btn-success btn-xs" data-prog='${item.Codigo}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
        `;
        let valores = {};
        cabecera.forEach((cab, pos) => {
            if (cab == "Estado") {
                valores[pos] = item[cab] == 'A' ? 'Activado' : 'Inactivo';
            } else {
                valores[pos] = item[cab] ? item[cab] : '';
            }
            if (cab == "Foto") {
                let icono = `uploads/${NIT()}/Eventos/${item['Foto']}`;
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

function accionBotones(row) {
    $(row).on("click", ".ediProg", function (e) {
        e.preventDefault();
        window.location.href = `${base_url()}Administrativos/Eventos/Eventos/ProgramarEventos/${$(this).data('prog')}`;
    });

    $(row).on("click", ".eliProg", function (e) {
        e.preventDefault();
        let data = $(this).data('prog');
        eliminarInformacion('¿Desea eliminar esta programación?', data, 'eliminarProgramacionEvento');
    });

    $(row).on("click", ".verProg", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('prog'));
        informacion(data, 'obtenerProgramacionEvento', 'prevInformacion');
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

function prevInformacion(resp) {
    Object.keys(resp.datos[0]).forEach(item => {
        if (item == 'Estado') {
            $('#prev' + item).text(resp.datos[0][item] == 'A' ? 'Activado' : 'Inactivo');
        } else if (item == 'Visualiza') {
            let encont = $.Constantes.categoriasDirectoriosDisponible.find(it => it.valor == resp.datos[0][item]);
            $('#prev' + item).text(encont.titulo);
        } else if (item == 'Titular') {
            $('#prev' + item).html("<div class='descripcion'>" + resp.datos[0][item] + "</div>");
        } else {
            $('#prev' + item).text(resp.datos[0][item]);
        }
    });
    if (!resp.datos[0]['Foto']) {
        $('#prevFoto').hide();
    } else {
        $('#prevFoto').show();
        $('#prevFoto').attr('src', `${base_url()}uploads/${NIT()}/Eventos/${resp.datos[0]['Foto']}?${Math.random()}`);
    }
    $("#previs").show();
}
