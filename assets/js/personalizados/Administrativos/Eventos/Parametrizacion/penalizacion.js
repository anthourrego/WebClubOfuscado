let cabecTipoPenal = ['Codigo', 'Nombre', 'Estado', 'Acciones'];
let cabePenalizacion = ['Codigo', 'Tipo_Penalizacion', 'Descripcion', 'Fecha', 'Acciones'];
let editarTipoPenalizacion = 0;
let editarPenalizacion = 0;
let tblTipoPenalizacion;
let tblPenalizacion;
let rutaGeneral = 'Administrativos/Eventos/Parametrizacion/Penalizacion/';

$(function () {

    $("#btnModalTipoPenalizacion").click(function () {
        obtenerInformacion(false, 'cabecTipoPenal', tblTipoPenalizacion, 'tblTipoPenal', 'obtenerTipoPenalizaciones');
        $('input[name=Estado]').prop('checked', true);
    });

    $("#formularioCrearTipoPenalizacion").submit(function (e) {
        e.preventDefault();
        if ($("#formularioCrearTipoPenalizacion").valid()) {
            let $fills = $("#formularioCrearTipoPenalizacion input");
            activarTipoPenalizacion($fills, 'formularioCrearTipoPenalizacion', 'crearTipoPenalizacion', 'tipoPenalizacion', 'editarTipoPenalizacion');
        } else {
            alertify.error("Valide la información de los campos.");
        }
    });

    obtenerInformacion(false, 'cabePenalizacion', tblPenalizacion, 'tblPenal', 'obtenerPenalizaciones');

    $("#btnmodalhacerPenalizacion").click(function () {
        $("input[name=FechaRegis]").val(moment().format('YYYY-MM-DD HH:mm'));
        obtenerInformacion(true, 'cabePenalizacion', tblPenalizacion, 'tblPenal', 'obtenerTipoPenalizaciones');
    });
    submitCrearPenalizacion();

    $("#cerrarModalTipoPenalizacion").click(function () {
        limpiarDatos();
        $('#btnCrearTipoPenalizacion').text('Crear');
    });

    $("#bntCancelarCrearPenalizacion").click(function () {
        limpiarDatos();
    });
	RastreoIngresoModulo('Penalizaciones');
});

submitCrearPenalizacion = function () {
    $("#formularioPenalizacionLugar").submit(function (e) {
        e.preventDefault();
        if ($("#formularioPenalizacionLugar").valid()) {
            let $fills = $("#formularioPenalizacionLugar input, #formularioPenalizacionLugar textarea, #formularioPenalizacionLugar select");
            activarTipoPenalizacion($fills, 'formularioPenalizacionLugar', 'crearPenalizacion', 'penalizacion', 'editarPenalizacion');
        } else {
            alertify.error("Valide la información de los campos.");
        }
    });
}

activarTipoPenalizacion = function (campos, idForm, rutaGuardar, funDespGuardar, editar) {
    let data = {};
    $.each(campos, (pos, input) => {
        let value = $(input).val();
        const name = $(input).attr("name");
        if (name == "Estado") {
            value = $(input).prop('checked') ? 'A' : 'I';
        }
        data[name] = value;
    });
    data[editar] = eval(editar);
    guardarInformacion(data, rutaGuardar, funDespGuardar);
}

guardarInformacion = function (data, ruta, funcion) {
    data = $.Encriptar(data);
    $.ajax({
        url: base_url() + rutaGeneral + ruta,
        type: 'POST',
		dataType: 'json',
        data: {
            encriptado: data
        },
        success: (resp) => {
            resp = JSON.parse($.Desencriptar(resp));
            if (resp.valido) {
                alertify.success(resp.mensaje);
                limpiarDatos();
                this[funcion](resp);
            } else {
                alertify.error(resp.mensaje);
            }
        }
    });
}

tipoPenalizacion = function (resp) {
    let idInsertado = resp.idInsertado;
    obtenerInformacion(false, 'cabecTipoPenal', tblTipoPenalizacion, 'tblTipoPenal', 'obtenerTipoPenalizaciones');
    $('#btnCrearTipoPenalizacion').text('Crear');
    collapseTipoPenalizacion(false);
}

penalizacion = function (resp) {
    let idInsertado = resp.idInsertado;
    obtenerInformacion(false, 'cabePenalizacion', tblPenalizacion, 'tblPenal', 'obtenerPenalizaciones');
    $('#btnCrearPenalizacion').text('Crear');
    $('#modalhacerPenalizacion').modal('hide');
}

collapseTipoPenalizacion = function (abrirPrimero) {
    $('#collapseOneTipoPenalizacion, #collapseTwoTipoPenalizacion').removeClass('show');
    if (abrirPrimero) {
        $('#collapseOneTipoPenalizacion').addClass('show');
    } else {
        $('#collapseTwoTipoPenalizacion').addClass('show');
    }
}

configurarTabla = function (id, cantPage, tipoPenalizacion) {
    return $('#' + id).DataTable({
        language: $.Constantes.lenguajeTabla,
        processing: true,
        pageLength: cantPage,
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
            if (tipoPenalizacion) {
                accionBtnTipoPenalizacion(row);
            } else {
                accionBtnPenalizacion(row);
            }
        }
    });
}

limpiarDatos = function () {
    editarPenalizacion = 0;
    editarTipoPenalizacion = 0;
    $("#formularioCrearTipoPenalizacion")[0].reset();
    $("#formularioCrearTipoPenalizacion :input").removeClass('is-invalid');
    $("#formularioCrearTipoPenalizacion").validate().resetForm();
    $("#formularioPenalizacionLugar")[0].reset();
    $("#formularioPenalizacionLugar :input").removeClass('is-invalid');
    $("#formularioPenalizacionLugar").validate().resetForm();
}

obtenerInformacion = function (crearPenalizacion, cabecera, tabla, idTabla, ruta) {
    if (!crearPenalizacion) {
        let items = eval(cabecera);
        $.each(items, (pos, cab) => {
            $('#id' + cabecera).append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
        });
        if (tabla) {
            tabla.clear().draw();
            tabla.destroy();
        }
        tabla = configurarTabla(idTabla, (idTabla == 'tblTipoPenal' ? 4 : 10), (idTabla == 'tblTipoPenal' ? true : false));
        if (idTabla == 'tblTipoPenal') {
            tblTipoPenalizacion = tabla;
        } else {
            tblPenalizacion = tabla;
        }
    }
    $.ajax({
        url: base_url() + rutaGeneral + ruta,
        type: 'GET',
        cache: false,
		dataType: 'json',
        success: (resp) => {
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                if (!crearPenalizacion) {
                    organizarTabla(resp.datos, cabecera, tabla, idTabla);
                    tabla.order([0, 'asc']).draw();
                } else {
                    $('#TipoPenalizacionId').html('');
                    resp.datos = resp.datos.filter(it => it.Estado == 'A');
                    $.each(resp.datos, function (pos, tipPenal) {
                        $('#TipoPenalizacionId').append(`<option value="${tipPenal.Codigo}">${tipPenal.Nombre}</option>`);
                    });
                }
            }
        },
        error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

organizarTabla = function (datos, cabecera, tabla, idTabla) {
    let filas = [];
    let clase = ('tblTipoPenal' != idTabla ? 'Penal' : 'TipoPenal');
    let data = ('tblTipoPenal' != idTabla ? 'penal' : 'tipopenal');
    $.each(datos, function (pos, opt) {
        let botones = `
            <button class="edi${clase} btn btn-primary btn-xs" data-${data}="${opt.Codigo}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
            <button class="eli${clase} btn btn-danger btn-xs" data-${data}='${opt.Codigo}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
        `;
        let valores = {};
        eval(cabecera).forEach((item, pos) => {
            if (item == "Estado") {
                valores[pos] = opt[item] == 'A' ? 'Activado' : 'Inactivo';
            } else {
                valores[pos] = opt[item] ? opt[item] : '';
            }
        });
        valores[eval(cabecera).length - 1] = botones;
        filas.push(valores);
    });
    tabla.rows.add(filas).draw();
}

accionBtnTipoPenalizacion = function (row) {
    $(row).on("click", ".ediTipoPenal", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('tipopenal'));
        $.ajax({
            url: base_url() + rutaGeneral + 'obtenerTipoPenalizacion',
            type: 'POST',
			dataType: 'json',
            data: {
                encriptado: data
            },
            cache: false,
            success: (resp) => {
                resp = JSON.parse($.Desencriptar(resp));
                if (!resp.valido) {
                    alertify.error(resp.mensaje);
                } else {
                    editarTipoPenalizacion = resp.datos[0]['TipoPenalizacionId'];
                    $('#btnCrearTipoPenalizacion').text('Modificar');
                    Object.keys(resp.datos[0]).forEach(item => {
                        $('#' + item).val(resp.datos[0][item]);
                        if (item == "Estado") {
                            $('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
                        }
                    });
                    collapseTipoPenalizacion(true);
                }
            },
            error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
        });
    });

    $(row).on("click", ".eliTipoPenal", function (e) {
        e.preventDefault();
        let data = $(this).data('tipopenal');
        alertify.confirm('Eliminar', '¿Desea eliminar esta Penalización?', function (ok) {
            data = $.Encriptar(data);
            $.ajax({
                url: base_url() + rutaGeneral + 'eliminarTipoPenalizacion',
                type: 'POST',
				dataType: 'json',
                data: {
                    encriptado: data
                },
                success: (resp) => {
                    resp = JSON.parse($.Desencriptar(resp));
                    let metodo = (!resp.valido ? 'error' : 'success');
                    alertify[metodo](resp.mensaje);
                    if (resp.valido) {
                        obtenerInformacion(false, 'cabecTipoPenal', tblTipoPenalizacion, 'tblTipoPenal', 'obtenerTipoPenalizaciones');
                    }
                },
                error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
            });
        }, function (err) {
            console.log("Error ", err);
        });
    });
}

accionBtnPenalizacion = function (row) {
    $(row).on("click", ".ediPenal", function (e) {
        e.preventDefault();
        obtenerInformacion(true, 'cabePenalizacion', tblPenalizacion, 'tblPenal', 'obtenerTipoPenalizaciones');
        data = $.Encriptar($(this).data('penal'));
        $.ajax({
            url: base_url() + rutaGeneral + 'obtenerPenalizacion',
            type: 'POST',
			dataType: 'json',
            data: {
                encriptado: data
            },
            cache: false,
            success: (resp) => {
                resp = JSON.parse($.Desencriptar(resp));
                if (!resp.valido) {
                    alertify.error(resp.mensaje);
                } else {
                    editarPenalizacion = resp.datos[0]['PenalizacionId'];
                    $('#btnCrearPenalizacion').text('Modificar');
                    Object.keys(resp.datos[0]).forEach(item => {
                        $('#' + item).val(resp.datos[0][item]);
                    });
                    $('#FechaRegis').val(moment(resp.datos[0]['FechaRegis']).format('YYYY-MM-DD HH:mm'));
                    $('#modalhacerPenalizacion').modal('show');
                }
            },
            error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
        });
    });

    $(row).on("click", ".eliPenal", function (e) {
        e.preventDefault();
        let data = $(this).data('penal');
        alertify.confirm('Eliminar', '¿Desea eliminar esta Penalización?', function (ok) {
            data = $.Encriptar(data);
            $.ajax({
                url: base_url() + rutaGeneral + 'eliminarPenalizacion',
                type: 'POST',
				dataType: 'json',
                data: {
                    encriptado: data
                },
                success: (resp) => {
                    resp = JSON.parse($.Desencriptar(resp));
                    let metodo = (!resp.valido ? 'error' : 'success');
                    alertify[metodo](resp.mensaje);
                    if (resp.valido) {
                        obtenerInformacion(false, 'cabePenalizacion', tblPenalizacion, 'tblPenal', 'obtenerPenalizaciones');
                    }
                },
                error: (err) => { console.log("errro ", err); alertify.error('No fue posible obtener los datos') }
            });
        }, function (err) {
            console.log("Error ", err);
        });
    });
}
