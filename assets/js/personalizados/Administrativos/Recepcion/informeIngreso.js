let rutaGeneral = base_url() + 'Administrativos/Recepcion/Ingreso/';
let tablaInforme;
let dataFiltro = {};

$(function () {
	RastreoIngresoModulo('Informe Ingreso');

    $("#FechaInicial, #FechaFinal").val(moment().format('YYYY-MM-DD'));
	//Se deshabilitan las fecha para no colocar rango erroneos
	$("#FechaInicial").on("dp.change", function (e) {
		$('#FechaFinal').data("DateTimePicker").minDate(e.date);
	});
	$("#FechaFinal").on("dp.change", function (e) {
		$('#FechaInicial').data("DateTimePicker").maxDate(e.date);
	});
    $("#FechaFinal, #FechaInicial").change();
    $("#Tipo").empty()
    ;
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
                                return moment(data, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A");
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

    $("#formFiltro").submit();

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
});

