let rutaGeneral = base_url() + 'Administrativos/Recepcion/Ingreso/';
let tablaInforme;
let tablaInformeTorn;
let dataFiltro = {};
let dataFiltroTorn = {};

$(function () {
	RastreoIngresoModulo('Informe Ingreso');
    $("#FechaInicial, #FechaFinal, #FechaInicialTorn, #FechaFinalTorn").val(moment().format('YYYY-MM-DD'));
    	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#FechaInicialTorn").on("dp.change", function (e) {
		$('#FechaFinalTorn').data("DateTimePicker").minDate(e.date);
	});
	$("#FechaFinalTorn").on("dp.change", function (e) {
		$('#FechaInicialTorn').data("DateTimePicker").maxDate(e.date);
	});
	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#FechaInicial").on("dp.change", function (e) {
		$('#FechaFinal').data("DateTimePicker").minDate(e.date);
	});
	$("#FechaFinal").on("dp.change", function (e) {
		$('#FechaInicial').data("DateTimePicker").maxDate(e.date);
	});
    $("#FechaFinal, #FechaInicial").change();
    $("#Tipo").empty();

    eventosDisponibles($("#FechaInicialTorn").val(), $("#FechaFinalTorn").val());

    $(document).on('show.bs.tab', function() {
        setTimeout(() => {
            $(window).trigger('resize'); 
        }, 30);
    })

    $.Constantes.tiposTercero.forEach(it => {
        $("#Tipo").append(`<option selected value="${it.valor}">${it.titulo}</option>`);
    });
    $(".chosen-select").chosen({ width: '100%' });

    $("#formFiltro").submit(function (e) {
        e.preventDefault();
        if ($(this).valid()) {
            let $fills = $("#formFiltro input[name], #formFiltro select[name]");
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");

                if (value != "") {
                    dataFiltro[name] = value;
                } else {
                    dataFiltro[name] = "";
                }
            });

            if (tablaInforme) {
                tablaInforme.ajax.reload();
            } else {
                tablaInforme = dtSS({
                    data: {
                        tblID: "#tabla",
                    },
                    ajax: {
                        url: rutaGeneral + "DTInforme",
                        type: "POST",
                        data: function (d) {
                            return $.extend(d, { dataFiltro });
                        },
                    },
                    columns: [
                        {data: "Accion"},
                        {data: "Codigo_Barra"},
                        {
                            data: "Ingreso",
                            render: function(data, type, row, meta ) {
                                return moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A");
                            }
                        },
                        {
                            data: "Salida",
                            render: function(data, type, row, meta ) {
                                return data != null ? moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A"): '';
                            }
                        },
                        {data: "Nro_Documento"},
                        {data: "Nombre"},
                        {data: "Placa"},
                        {data: "Sede"},
                        {data: "Codigo_Carnet"},
                        {data: "Club_Origen"},
                        {data: "Evento"},
                        {data: "Tipo_Invitado"},
                        {data: "Ingreso_Especial"},
                        {data: "Tipo"},
                        {data: "Codigo_Barras_Titular"},
                        {data: "ID_Titular"},
                        {data: "Nombre_del_Titular"},
                        {data: "Reserva_Hotel"},
                        {data: "Usuario"},
                    ],
                    order: [[3, 'DESC']],
                    pageLength: 10,
                    scrollX: true,
                    buttons: [
                        { extend: 'copy', className: 'copyButton', text: 'Copiar', title: 'Web Club Informes Ingresos' },
                        { extend: 'csv', className: 'csvButton', text: 'CSV', title: 'Web Club Informes Ingresos' },
                        { extend: 'excel', action: newExportAction, text: 'Excel', title: 'Web Club Informes Ingresos' },
                        { extend: 'pdf', className: 'pdfButton', tex: 'PDF', title: 'Web Club Informes Ingresos' },
                        { extend: 'print', className: 'printButton', text: 'Imprimir', title: 'Web Club Informes Ingresos' },
                        { className: 'btnFiltros', text: '<i class="fas fa-filter"></i> Filtros'},
                    ],
                    dom: domlBftrip,
                });
            }

            $("#modalFiltro").modal("hide");
        } else {
            alertify.warning("Falta algunos campos llenar");
        }
    });

    $(document).on("click", ".btnFiltros", function(){
        $("#formFiltro").trigger("reset");
        $("#formFiltro select").val('').trigger('chosen:updated');

        $.each(dataFiltro, function(key, value){
            campo = $("#formFiltro [name='" + key + "']");
            if (campo.is("select")) {
                campo.val(value).trigger('chosen:updated');
            } else {
                campo.val(value);
            }
        });

        $("#modalFiltro").modal("show");
    });

    $(document).on("click", "#btnFiltroReset", function(){
        $("#FechaFinal, #FechaInicial").val(moment().format('YYYY-MM-DD')).change();
        $("#nroAccion, #nroDocumento, #Placa, #Reserva").val('');
        $("#ClubCanje").val('').trigger("chosen:updated");
        $("#Tipo, #Sedes").find("option").prop("selected", true).trigger("chosen:updated");
        $("#btnBuscarFiltro").click();
    });
    
    $("#formFiltroTorneo").submit(function (e) {
        e.preventDefault();
        if ($(this)[0].checkValidity()) {
            let $fills = $("#formFiltroTorneo input[name], #formFiltroTorneo select[name]");
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");

                if (value != "") {
                    dataFiltroTorn[name] = value;
                } else {
                    dataFiltroTorn[name] = "";
                }
            });

            if (tablaInformeTorn) {
                tablaInformeTorn.ajax.reload();
            } else {
                tablaInformeTorn = dtSS({
                    data: {
                        tblID: "#tablaTorneo",
                    },
                    ajax: {
                        url: rutaGeneral + "DTInformeTorneo",
                        type: "POST",
                        data: function (d) {
                            return $.extend(d, { dataFiltroTorn });
                            
                        },
                    },
                    columns: [
                        {data: "numAccion"},
                        {data: "numBarra"},
                        {data: "numTercero"},
                        {data: "nombreTer"},
                        {data: "nombreEvento"},
                        {data: "fechaIni"},
                        {data: "fechaFin"},
                        {data: "nombreSede"},
                        {data: "RegIngreso"},
                        {data: "NumRegistro"},
                    ],
                    pageLength: 10,
                    scrollX: true,
                    serverSide: true,
                    order: [[6, 'DESC']],
                    buttons: [
                        { extend: 'copy', className: 'copyButton', text: 'Copiar', title: 'Web Club Informes Ingresos Torneos' },
                        { extend: 'csv', className: 'csvButton', text: 'CSV', title: 'Web Club Informes Ingresos Torneos' },
                        { extend: 'excel', action: newExportAction, text: 'Excel', title: 'Web Club Informes Ingresos Torneos' },
                        { extend: 'pdf', className: 'pdfButton', tex: 'PDF', title: 'Web Club Informes Ingresos Torneos' },
                        { extend: 'print', className: 'printButton', text: 'Imprimir', title: 'Web Club Informes Ingresos Torneos' },
                        { className: 'btnFiltrosSecon', text: '<i class="fas fa-filter"></i> Filtros'},
                    ],
                    dom: domlBftrip,
                    initComplete: function () {
                        setTimeout(() => {
                            $(window).trigger('resize'); 
                        }, 2000);
                        
                    },
                });
            }
            $("#modalFiltroTorneo").modal("hide");
        } else {
            alertify.warning("Falta algunos campos llenar");
        }
    });

    $("#formFiltro, #formFiltroTorneo").submit();

    $(document).on("click", ".btnFiltrosSecon", function(){
        $.each(dataFiltro, function(key, value){
            campo = $("#formFiltroTorneo [name='" + key + "']");
            if (campo.is("select")) {
                campo.val(value).trigger('chosen:updated');
            } else {
                campo.val(value);
            }
        });
        dataFiltroTorn = {};
        $("#modalFiltroTorneo").modal("show");
    });

    $(document).on("dp.change",'#FechaInicialTorn, #FechaFinalTorn', function(){
        eventosDisponibles($("#FechaInicialTorn").val(), $("#FechaFinalTorn").val());
    })

    $(document).on("click", "#btnFiltroResetTorn", function(){
        $("#FechaInicialTorn, #FechaFinalTorn").val(moment().format('YYYY-MM-DD')).change();
        $("#EventoTorn").val('').trigger("chosen:updated");
        $("#btnBuscarFiltroTorn").click();
        dataFiltroTorn.EventoTorn = [""];
    });

    $('#EventoTorn').on('change', function(e, el){
        if(el.selected !== ''){
            $("#EventoTorn option:eq(0)").prop("selected", false);
            $("#EventoTorn").trigger("chosen:updated");
        }else{
            $("#EventoTorn").prop("selectedIndex", -1);
            $("#EventoTorn option:eq(0)").prop("selected", true);
            $("#EventoTorn").trigger("chosen:updated");
        }
    })

});

function eventosDisponibles (fechaIni, fechaFin){
    $.ajax({
        url: rutaGeneral + "cargarEventos",
        type: 'POST',
        dataType: 'json',
        data: {
            fechaIni, fechaFin
        },
        success: function(registro){
            $('#EventoTorn').chosen('destroy');
            $('#EventoTorn').empty();
            $('#EventoTorn').chosen();
            $("#EventoTorn").append(`<option selected value="">TODOS</option>`);
            registro.forEach(it => {
                $("#EventoTorn").append(`<option value="${it.Observacion}">${it.Observacion}</option>`)
            });
            
            $("#EventoTorn").trigger("chosen:updated");
        }
    });
}

