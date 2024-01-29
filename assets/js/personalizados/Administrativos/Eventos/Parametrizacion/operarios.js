let cabecera = ['Id', 'Nombre', 'Valor_Hora', 'Estado', 'Acciones'];
let rutaGeneral = 'Administrativos/Eventos/Parametrizacion/Operarios/';
let frmtFechOper = 'YYYY-MM-DD HH:mm:ss';
let cantidadSemanas = 0;
let eventoSeleccionado;
let tblOperarios;
let calendar;
let lugares;
let dataTablePrev = [{
    titulo: 'Tercero', id: 'nombre'
}, {
    titulo: 'Valor Hora', id: 'ValorHora'
}, {
    titulo: 'Documento', id: 'Documento'
}, {
    titulo: 'Tipo Documento', id: 'Tipo_Doc'
}, {
    titulo: 'Ciudad', id: 'Ciudad'
}, {
    titulo: 'Fecha de Nacimiento', id: 'fechanacim'
}, {
    titulo: 'Estado', id: 'Estado'
}];
let idOperario;

$(function () {
	RastreoIngresoModulo('Operarios');
    $("#FechaInicial, #FechaFinal").mdtimepicker({
        timeFormat: 'h:mm tt',
        format: 'h:mm tt',
        is24hour: false
    });

    $("#FechaInicial, #FechaFinal").on('click', function (e) {
		$(this).mdtimepicker('setValue', this.value);
        $(this).mdtimepicker('showMelo');
    })

    $("#formCrearDispoOpe").submit(function (e) {
        e.preventDefault();
        const inputs = $("#formCrearDispoOpe input, #formCrearDispoOpe textarea, #formCrearDispoOpe select").toArray();
        const data = {};
        inputs.forEach(elem => {
            const key = $(elem).attr('name');
            let value = $(elem).val();
            if (key === 'LugarId') {
                value = value == '' ? null : value;
            }
            if (key === 'FechaInicial' || key === 'FechaFinal') {
                value = moment(eventoSeleccionado[key === 'FechaInicial' ? 'start' : 'end']).format(frmtFechOper)
            }
            const method = $(elem).attr('required') && !value ? 'addClass' : 'removeClass';
            data[key] = value;
            $(elem)[method]('is-invalid');
        });
        if ($('#formCrearDispoOpe .is-invalid').length) {
            alertify.error("Faltan campos requeridos");
            return
        }
        data['OperarioId'] = idOperario;
        let info = $.Encriptar(data);
        $.ajax({
            url: base_url() + rutaGeneral + 'guardarOperarioDisponibilidad',
            type: 'POST',
			dataType: 'json',
            data: {
                encriptado: info
            },
            cache: false,
            success: (resp) => {
                resp = JSON.parse($.Desencriptar(resp));
                if (!resp.valido) {
                    alertify.error(resp.mensaje);
                } else {
                    let idInsertado = resp.idInsertado;
                    const start = setTime(eventoSeleccionado.start, data.FechaInicial);
                    const end = setTime(eventoSeleccionado.end, data.FechaFinal);
                    const event = { start, end, title: data.Descripcion }
                    calendar.addEventSource([event]);
                    alertify.success(resp.mensaje);
                    $("#formCrearDispoOpe")[0].reset();
                    abrirCerrarModal('modalCalendarioEventos', 'modalCrearEvento');
                    calendar.destroy();
                    initCalendar();
                }
            }
        });
    });

    $.each(cabecera, (pos, cab) => {
        $('#cabecera').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
    });

    tblOperarios = dataTable();
    tblOperarios = dtSS(tblOperarios);

    $(".btnCerrarModalEventos").click(function () {
        calendar.destroy();
        idOperario = null;
        eventosGuardar = [];
    });

    $("#previs").toggle();

    $("#btnTituloOperario").click(function () {
        $("#previs").toggle();
    });

    dataTablePrev.forEach(item => {
        $("#tablaPrev").append(`<tr>
            <td>- ${item.titulo}:</td>
            <td id="pre${item.id}" class="text-right texto-wrap"></td>
        </tr>`);
    });

    $('#btnCerrarModalAgregarDisponibilidad').on('click', function () {
        abrirCerrarModal('modalCalendarioEventos', 'modalCrearEvento');
        initCalendar();
    });

});

function setTime(fecha, tiempo) {
    const date = new Date(fecha);
    const horas = moment(tiempo, 'h:mm A').locale('en').hour();
    const minutos = moment(tiempo, 'h:mm A').locale('en').minute();
    date.setHours(horas);
    date.setMinutes(minutos);
    return new Date(date);
}

eventClick = (ev) => select(ev.event, true);

function select(ev, edit = false) {
    eventoSeleccionado = ev;
    const { start, end } = ev;
    if (moment().isSameOrBefore(moment(start))) {
        const FechaInicial = $("#FechaInicial");
        const startParsed = moment(start).locale('es').format('dddd ll');
        const FechaFinal = $("#FechaFinal");
        const endParsed = moment(end).locale('es').format('dddd ll');
        const fechaSeleccionada = startParsed != endParsed ? `${startParsed} - ${endParsed} ` : startParsed;
        FechaInicial.val(moment(start).locale('en').format('h:mm A'));
        FechaFinal.val(moment(end).locale('en').format('h:mm A'));
        if (ev.extendedProps) {
            $("#LugarId").val(ev.extendedProps.LugarId ? ev.extendedProps.LugarId : '');
            $("#Descripcion").val(ev.extendedProps.Descripcion);
        }
        $(".btn-borrar")[edit ? 'show' : 'hide']();
        $("#formCrearDispoOpe .fechaSeleccionada").text(fechaSeleccionada);
        $(".title-text").text(`${edit ? 'Editar' : 'Agregar'} disponibilidad`);
        $("#modalCrearEvento button[type='submit']").text(edit ? 'Editar' : 'Agregar');
        abrirCerrarModal('modalCrearEvento', 'modalCalendarioEventos');
        calendar.destroy();
        $("#btnCerrarModalCrearEvento").click(function () {
            initCalendar();
            abrirCerrarModal('modalCalendarioEventos', 'modalCrearEvento');
        });
    } else {
        alertify.warning("La hora debe ser mayor a la actual.");
    }
}

function initCalendar() {
    const options = {
        customButtons: {
            cerrar: {
                text: '',
                icon: 'x',
                click: () => $(".toggle-calendar").click()
            },
            collapse: {
                text: '',
                click: () => {
                    $('#collapse-options').collapse('toggle');
                    $('#icon-toggle').toggleClass("fa-angle-up");
                    $('#icon-toggle').toggleClass("fa-angle-down");
                }
            }
        },
        allDaySlot: false,
        height: '100%',
        expandRows: true,
        locale: 'es',
        slotMinTime: '04:00',
        slotMaxTime: '24:00',
        slotDuration: '00:30:00',
		titleFormat: "Hola",
        headerToolbar: {
            left: 'collapse prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek cerrar'
        },
        /* validRange: {
            start: moment().format('YYYY-MM-DD')
        }, */
        initialView: 'timeGridWeek',
        initialDate: new Date(),
        editable: false,
        selectable: true,
        nowIndicator: true,
        dayMaxEvents: true,
        slotLabelFormat: [{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: 'short',
            hour12: true
        }],
        eventClick,
        select,
    }
    let FuCalendar = FullCalendar.Calendar;
    let calendarEl = document.getElementById('calendarioOperario');
    calendar = new FuCalendar(calendarEl, options);
    abrirCerrarModal('modalCalendarioEventos');
    calendar.render();
    cantidadSemanas = 0;
    setTimeout(() => {
        $(".fc-prev-button").click(() => {
            cantidadSemanas--;
            /* if (cantidadSemanas < 1) {
                cantidadSemanas = 0;
            } */
            dataObtenerDisponibilidad(idOperario);
        });
        $(".fc-next-button").click(() => {
            cantidadSemanas++;
            dataObtenerDisponibilidad(idOperario);
        });
    }, 500);
    dataObtenerDisponibilidad(idOperario);
    $(".fc-toolbar-title").click(function () {
        abrirCerrarModal('modalCalendario', 'modalCalendarioEventos');
        $("#cerrarModalCalendario").click(function () {
            abrirCerrarModal('modalCalendarioEventos', 'modalCalendario');
            initCalendar();
        });
    });
    $(".fc-cerrar-button").click(function () {
        abrirCerrarModal(null, 'modalCalendarioEventos');
    });
    setTimeout(() => {
        $(".fc-collapse-button").html("<i id='icon-toggle' class='fas fa-angle-down'></i>");
        insertItems($("#LugarId").children().toArray());
    }, 500);
    initMiniCalendar();
}

function insertItems(items) {
    if ($("#collapse-options").length) {
        $("#collapse-options").remove();
    }
    let checks = '';
    (items || []).forEach((element, pos) => {
        let { value, text } = $(element)[0];
        if (value != '') {
            checks += `<div class="col-md-3">
                <div class="custom-control custom-switch checkboxs">
                    <input type="checkbox" class="check-filtro custom-control-input" value="${value}"  name="${value}chck" id="${value}chck" checked>
                    <label class="custom-control-label text-capitalize" for="${value}chck">${text}</label>
                </div>
            </div>`;
        }
    });
    checks = `<div class="collapse" id="collapse-options">
        <div class="card card-body mb-0 p-4">
            <div class="row d-flex justify-content-between">
                <h5 class="my-auto">  
                    <i class="fa fa-map-marker mr-1" aria-hidden="true"></i>
                    Filtro por lugar
                </h5>
                <button class="btn btn-primary btn-sm" id="check-all" data-bs-toggle="tooltip" data-bs-placement="top" title="Seleccionar todos los lugares">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            <hr class="w-100 m-1 m-b2">
            <div class="row check-options">
                ${checks}
            </div>
        </div>
    </div>`;
    $(".fc-header-toolbar").after(checks);
    $(".check-filtro").on('change', function () {
        let lugares = [];
        $('.checkboxs input:checked').each((pos, item) => lugares.push($(item).val()));
        if (lugares.length) {
            dataObtenerDisponibilidad(idOperario, lugares);
        } else {
            calendar.removeAllEvents();
        }
    });
    $("#check-all").click(function () {
        $.each($(".check-filtro").toArray(), function (pos, el) {
            $(el).prop('checked', true);
        });
        dataObtenerDisponibilidad(idOperario);
    });
}

function dataObtenerDisponibilidad(valor, filtro) {
    let fechaInicio = moment().startOf('week').format(frmtFechOper);
    let fechaFinal = moment().endOf('week').format(frmtFechOper);
    let method = cantidadSemanas >= 0 ? 'add' : 'subtract';
    let cant = (cantidadSemanas >= 0 ? cantidadSemanas : (cantidadSemanas * -1));
    fechaInicio = moment().startOf('week')[method]((cant * 7), 'days').format(frmtFechOper);
    fechaFinal = moment().endOf('week')[method]((cant * 7), 'days').format(frmtFechOper);
    let info = $.Encriptar({ valor, fechaInicio, fechaFinal, tipo: 'OperarioId', filtro });
    informacion(info, 'obtenerDisponibilidad', 'disponibilidadOperario', 'POST');
}

function informacion(data, ruta, funcion, method) {
    $.ajax({
        url: base_url() + rutaGeneral + ruta,
        type: method,
		dataType: 'json',
        data: {
            encriptado: data
        },
        cache: false,
        success: (resp) => {
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
                if (funcion == 'disponibilidadOperario') {
                    calendar.addEventSource([{
                        start: new Date(),
                        end: new Date(),
                    }]);
                    calendar.removeAllEvents();
                    setTimeout(() => {
                        calendar.updateSize();
                    }, 800);
                }
            } else {
                this[funcion](resp);
            }
        },
        error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
    });
}

function disponibilidadOperario(resp) {
    let arrayEventos = [];
    resp.datos.forEach(item => {
        const datos = {
            start: new Date(item.FechaInicial),
            end: new Date(item.FechaFinal),
            title: item.Descripcion + (item.LugarId ? ' - Disponible para ' + item.LugarId : ''),
            id: item.DisponibilidadId,
            LugarId: item.LugarId,
            Descripcion: item.Descripcion
        }
        arrayEventos.push(datos);
    });
    calendar.removeAllEvents();
    calendar.addEventSource(arrayEventos);
    setTimeout(() => {
        calendar.updateSize();
    }, 800);
}

function initMiniCalendar() {
    const miniCalendar = $("#mini-calendar").datetimepicker({
        baseCls: "perfect-datetimepicker",
        viewMode: $.fn.datetimepicker.CONSTS.VIEWMODE.YMD,
        firstDayOfWeek: 1,
        date: new Date(),
        language: 'es',
        onDateChange: function (e) {
            const value = new Date(this.getValue());
            const day = $(e.target).hasClass('day');
            if (day) {
                calendar.gotoDate(value);
                abrirCerrarModal('modalCalendarioEventos', 'modalCalendario');
                initCalendar();
            };
        },
        onOk: function () {
            const value = miniCalendar.getValue();
            if (value) {
                calendar.gotoDate(miniCalendar.getValue());
                abrirCerrarModal('modalCalendarioEventos', 'modalCalendario');
                initCalendar();
            }
        }
    });
    $('.clear, .today').attr('hidden', true);
    $('.ok').addClass('w-100');
    $('.ok').css('background-color', 'var(--primary)');
    $('.ok').css('color', '#ffff');
}

function borrar() {
    if (eventoSeleccionado) {
        let data = {
            Id: +eventoSeleccionado.id,
            OperarioId: idOperario,
            fechaInicio: moment(eventoSeleccionado.start).format(frmtFechOper),
            fechaFin: moment(eventoSeleccionado.end).format(frmtFechOper),
        }
        eliminarInformacion('¿Desea eliminar este evento?', data, 'eliminarDisponibilidad');
    }
}

function eliminarInformacion(mensaje, data, ruta) {
    alertify.confirm('Eliminar', mensaje, function (ok) {
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
                let metodo = (!resp.valido ? 'error' : 'success');
                alertify[metodo](resp.mensaje);
                if (resp.valido) {
                    dataObtenerDisponibilidad(idOperario);
                    delete eventoSeleccionado;
                    abrirCerrarModal('modalCalendarioEventos', 'modalCrearEvento');
                    initCalendar();
                }
            },
            error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
        });
    }, function (err) {
        console.error("Error ", err);
    });
}

function dataTable() {
    return {
        data: {
            tblID: "#tabla",
            select: [
                "o.OperarioId as Id"
                , "t.Nombre as Nombre"
                , "o.ValorHora as Valor_Hora"
                , "CASE o.Estado WHEN 'A' THEN 'Activo' WHEN 'I' THEN 'Inactivo' END as Estado"
                , "''as Acciones"
            ],
            table: [
                'Operario o',
                [
                    ['Tercero t', 't.TerceroID = o.TerceroId', 'LEFT']
                ], [
                    /* [] */
					/* "o.Tipo = 'OT'" */
                ]
            ],
            column_search: ['t.Nombre', 't.TerceroId'],
            columnas: cabecera,
            column_order: ["Id", "Nombre", "Valor_Hora", "Estado", "Acciones"],
            orden: {
                'Id': 'ASC'
                , 'Nombre': 'ASC'
                , 'Valor_Hora': 'ASC'
                , 'Estado': 'ASC'
                , 'Acciones': 'ASC'
            },
        },
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
        dom: 'Bfrtp',
        autoWidth: false,
        columnDefs: [],
        createdRow: function (row, data, dataIndex) {
            accionBotones(row);
        },
        columnDefs: [],
        createdRow: function (row, data, dataIndex) {
            let ver = `
                <button class="disOpe btn btn-warning btn-xs ml-2" data-oper='${data[0]}' title="Elementos" style="margin-bottom:3px"><i class="fas fa-clock"></i></button>
                <button class="verOpe btn btn-info btn-xs" data-oper='${data[0]}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
            `;
            let icono = `uploads/${NIT()}/Lugares/${data[1]}`;
            if (!data[1]) {
                icono = `assets/images/user/nofoto.png`;
            }
            $(row).find('td:eq(' + (cabecera.length - 1) + ')').html(ver);
            $(row).children().last().css('text-align', 'center');
            accionesOperario(row, data);
        }
    };
}

function accionesOperario(row, data) {
    $(row).on("click", ".disOpe", function (e) {
        e.preventDefault();
        idOperario = $(this).data('oper');
        $("#nombreOperario").html(data[1]);
        initCalendar();
    });

    $(row).on("click", ".verOpe", function (e) {
        e.preventDefault();
        let info = $.Encriptar($(this).data('oper'));
        informacion(info, 'obtenerOperario', 'verPrev', 'POST');
    });
}

function abrirCerrarModal(modalAbrir, modalCerrar) {
    $("#" + modalCerrar).modal('hide');
    if (modalAbrir) {
        $("#" + modalAbrir).modal('show');
    }
}

function verPrev(resp) {
    Object.keys(resp.datos[0]).forEach(item => {
        $('#pre' + item).text(resp.datos[0][item]);
        if (item == 'Estado') {
            $('#pre' + item).text((resp.datos[0][item] == 'A' ? 'Activo' : 'Inactivo'));
        }
    });
    $("#previs").show();
}
