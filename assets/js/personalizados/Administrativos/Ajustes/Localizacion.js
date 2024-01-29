let cabePais = {
    columnas: ['Cod_Pais', 'Nombre_Pais', 'Acciones'],
    select: [
        "p.paisid as Cod_Pais"
        , "p.nombre as Nombre_Pais"
        , "'' as Acciones"
    ],
    table: ['Pais p', [], []],
    column_order: ["p.paisid", "p.nombre", "Acciones"],
    column_search: ['p.nombre ', 'p.paisid'],
    orden: { 'Nombre_Pais': 'DESC' },
};
let cabeCiudad = {
    columnas: ['Cod_Dpto', 'Nombre_Dpto', 'Cod_Ciudad', 'Nombre_Ciudad', 'Acciones'],
    select: [
        "ciu.ciudadid as Cod_Ciudad"
        , "ciu.nombre as Nombre_Ciudad"
        , "dp.dptoid as Cod_Dpto"
        , "dp.nombre as Nombre_Dpto"
        , "'' as Acciones"
    ],
    table: ['Ciudad ciu',
        [
            ['Dpto dp', 'dp.dptoid = ciu.dptoid', 'LEFT']
        ], []
    ],
    column_order: ["ciu.ciudadid","ciu.nombre", "dp.dptoid", "dp.nombre", "Acciones"],
    column_search: ['ciu.nombre', 'ciu.ciudadid'],
    orden: { 'Nombre_Ciudad': 'DESC' },
};
let cabeDepartamento = {
    columnas: ['Cod_Dpto', 'Nombre_Dpto', 'Acciones'],
    select: [
        "dp.dptoid as Cod_Dpto"
        , "dp.nombre as Nombre_Dpto"
        , "'' as Acciones"
    ],
    table: ['Dpto dp', [], []],
    column_order: ["dp.dptoid", "dp.nombre", "Acciones"],
    column_search: ['dp.nombre', 'dp.dptoid'],
    orden: { 'Nombre_Dpto': 'DESC' },
};
let cabeZona = {
    columnas: ['Cod_Zona', 'Nombre_Zona', 'Acciones'],
    select: [
        "z.zonaid as Cod_Zona"
        , "z.nombre as Nombre_Zona"
        , "'' as Acciones"
    ],
    table: ['Zona z', [], []],
    column_order: ["z.zonaid", "z.nombre", "Acciones"],
    column_search: ['z.nombre ', 'z.zonaid'],
    orden: { 'Nombre_Zona': 'DESC' },
};
let rutaBase = 'Administrativos/Ajustes/Localizacion/';
let datoCreacion = 0;
let tituloAccion = '';
let tblLocalizacion;
let editarOpcion;
let valorAccion;

$(function () {

	RastreoIngresoModulo('Localización');

    $.Constantes.creacionLocalizacion.forEach((item, pos) => {
        $("#itemsLocalizacion").append(`
            <a data-toggle="tab" class="list-group-item m-1 p-2" id="${item.valor}" href="#" role="tab">${item.titulo}</a>
        `);
    });

    $('a[data-toggle=tab]').on('show.bs.tab', function () {
        $("#camposCrear").html('');
        tituloAccion = $(this).html();
        valorAccion = $(this).attr('id');
        $("#camposCrear").append(campos(tituloAccion, valorAccion));
        if (tituloAccion == 'Ciudad') {
            departamentos();
        }
        if (tblLocalizacion) {
            tblLocalizacion.destroy();
            $("#tablaLocal tbody").empty();
        }
        let estructura = eval('cabe' + tituloAccion);
        $('#header').html('');
        $.each(estructura.columnas, (pos, cab) => {
            $('#header').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`);
        });
        limpiarValores();
        
        tblLocalizacion = dtSS(configurarTabla(estructura));
    });

    $("#pais").click();

    $("#formularioCrearLocalizacion").submit(function (e) {
        e.preventDefault();
        if ($("#formularioCrearLocalizacion").valid()) {
            let $fills = $("#formularioCrearLocalizacion input, #formularioCrearLocalizacion select");
            let data = {};
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");
                data[name] = value;
            });
            data = { ...data, tituloAccion, editarOpcion };
            data = $.Encriptar(data);
            $.ajax({
                url: base_url() + rutaBase + 'crearLocalizacion',
                type: 'POST',
                data: {
                    encriptado: data
                },
                dataType: "json",
                success: (resp) => {
                    resp = JSON.parse($.Desencriptar(resp));
                    if (resp.valido) {
                        let idInsertado = resp.idInsertado;
                        $("#" + valorAccion).removeClass('active');
                        $("#" + valorAccion).click();
                        limpiarValores();
                        $('#formularioCrearLocalizacion')[0].reset();
                        $("#formularioCrearLocalizacion :input").removeClass('is-invalid');
                        $("#formularioCrearLocalizacion").validate().resetForm();
                        alertify.success(resp.mensaje);
                    } else {
                        alertify.error(resp.mensaje);
                    }
                }
            });
        } else {
            alertify.error("Faltan campos requeridos");
        }
    });

});

function limpiarValores() {
    editarOpcion = 0;
    $("#btnCrearLocalizacion").text('Guardar');
}

function campos(nombre, valor) {
    let data = ``;
    if (nombre == 'Ciudad') {
        data = `<div class="col-12 col-xs-12 col-md-4 form-valid margen">
            <div class="form-group mb-0">
                <select id="dptoid" class="form-control form-control-floating" name="dptoid" placeholder="Departamento" required>
                    <option value=''></option>
                </select>
                <label for="dptoid" class='floating-label'>* Departamento</label>
            </div>
        </div>`
    }
    data += `<div class="col-12 col-xs-12 col-md-4 form-valid margen">
        <div class="form-group mb-0">
            <input type="text" max="99999" id="${valor}id" maxlength="5" placeholder="Codigo ${nombre}" class="form-control form-control-floating" name="${valor}id" required>
            <label for="${valor}id" class='floating-label'>* Codigo ${nombre}</label>
        </div>
    </div>
    <div class="col-12 col-xs-12 col-md-${nombre == 'Ciudad' ? '4' : '8'} form-valid margen">
        <div class="form-group mb-0">
            <input type="text" maxlength="60" id="nombre" class="form-control form-control-floating" placeholder="Nombre ${nombre}" name="nombre" required>
            <label for="nombre" class='floating-label'>* Nombre ${nombre}</label>
        </div>
    </div>
    <div class="col-12 d-flex justify-content-end mb-2 mt-2">
        <button type="submit" class="btn btn-primary" id='btnCrearLocalizacion'
            form='formularioCrearLocalizacion'>Guardar
        </button>
    </div>`
    return data;
}

function departamentos() {
    $.ajax({
        url: base_url() + rutaBase + 'departamentos',
        type: 'POST',
        dataType: "json",
        success: (resp) => {
            resp = JSON.parse($.Desencriptar(resp));
            if (resp.length) {
                resp.forEach(item => {
                    $("#dptoid").append(`<option value='${item.dptoid}'>${item.nombre}</option>`);
                });
            } else {
                alertify.error(resp.mensaje);
            }
        }
    });
}

function configurarTabla(data) {
    data = { ...data, tblID: "#tablaLocal" };
    return {
        data,
        language: $.Constantes.lenguajeTabla,
        processing: true,
        serverSide: true,
        order: [[0, 'ASC']],
        draw: 10,
        fixedColumns: true,
        pageLength: 10,
        buttons: [
            { extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
        ],
        deferRender: true,
        scrollCollapse: true,
        dom: 'Bftrp',
        columnDefs: [],
        createdRow: function (row, data, dataIndex) {
            let buttons = `
                <button class="editLocali btn btn-primary btn-xs" data-locali="${data[(tituloAccion == 'Ciudad' ? 2 : 0)]}" value="" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
                ${tituloAccion == 'Zona'
                    ? ''
                    : `<button class='eliLocali btn btn-danger btn-xs ml-2' data-locali='${data[(tituloAccion == 'Ciudad' ? 2 : 0)]}' value='' title='Eliminar' style='margin-bottom:3px'><i class='fas fa-prescription-bottle'></i></button>`}
            `;
            $(row).find('td:eq(' + (data.length - 1) + ')').html(buttons);
            $(row).children().last().css('text-align', 'center');
            $(row).on("click", ".editLocali", function (e) {
                e.preventDefault();
                editLocalizacion($(this));
            });
            $(row).on("click", ".eliLocali", function (e) {
                e.preventDefault();
                eliLocalizacion($(this));
            });
        },
		initComplete: function(){
			$('div.dataTables_filter input').unbind();
			$("div.dataTables_filter input").keyup( function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tablaLocal").dataTable();
					table.fnFilter( this.value );
				}
			} );
			$('div.dataTables_filter input').focus();
		},
    };
}

function editLocalizacion(actual) {
    let info = { Id: actual.data('locali'), tabla: valorAccion }
    data = $.Encriptar(info);
    $.ajax({
        url: base_url() + rutaBase + 'obtenerLocalizacion',
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
                editarOpcion = info.Id;
                Object.keys(resp.datos[0]).forEach(item => {
                    $('#' + item).val(resp.datos[0][item]);
                });
                if (resp.datos[0].nombreCiudad) {
                    $("#nombre").val(resp.datos[0].nombreCiudad);
                }
                $("#btnCrearLocalizacion").text('Editar');
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function eliLocalizacion(actual) {
    let data = { Id: actual.data('locali'), tabla: valorAccion }
    alertify.confirm('Eliminar', `¿Desea eliminar el registro de ${tituloAccion} ?`, function (ok) {
        data = $.Encriptar(data);
        $.ajax({
            url: base_url() + rutaBase + 'eliminarLocalizacion',
            type: 'POST',
            data: {
                encriptado: data
            },
            dataType: "json",
            success: (resp) => {
                resp = JSON.parse($.Desencriptar(resp));
                let metodo = (!resp.valido ? 'error' : 'success');
                alertify[metodo](resp.mensaje);
                limpiarValores();
                if (resp.valido) {
                    $("#" + valorAccion).removeClass('active');
                    $("#" + valorAccion).click();
                }
            },
            error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
        })
    }, function (err) {
        console.log("Error ", err);
    });
}