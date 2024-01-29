let cabecera = ['Acciones', 'Codigo', 'Imagen', 'Nombre', 'Descripcion', 'Video', 'Visualiza', 'Estado'];
let rutaGeneral = 'Administrativos/Banners/';
let editarBanner = 0;
let tblBanner;
let dataTablePrev = [{
    titulo: 'Descripción', id: 'Descripcion'
}, {
    titulo: 'Video', id: 'URLVideo'
}, {
    titulo: 'Visualiza', id: 'Visualiza'
}, {
    titulo: 'Estado', id: 'Estado'
}];

$(function () {

	RastreoIngresoModulo('Banners');

    $("#eliminarImagen").hide();
    $("#previs").toggle();
    $("#cerrarPrevis").click(function () {
        $("#previs").toggle();
    });

    $.each(cabecera, (pos, cab) => {
        $('#cabeceraTabla').append(`<th class="text-center">${cab.replace('_', ' ')}</th>`)
    });

    $.Constantes.bannerDisponible.forEach(item => {
        $("#Visualiza").append(`<option value="${item.valor}">${item.titulo}</option>`);
    });

    $('.icon-container').click(function (e) {
        let id = $(this).parent().children('input').attr('id');
        let actual = $(this);
        $('#' + id).click();
        $('#' + id).on('change', function (evt) {
            let file = $(this).prop('files')[0];
            if (file) {
                let reader = new FileReader();
                reader.onloadend = function () {
                    actual.children('img').attr('src', reader.result);
                    $("#eliminarImagen").show();
                }
                reader.readAsDataURL(file);
            }
        });
    });

    $("#eliminarImagen").on('click', function () {
        $("#eliminarImagen").hide();
        $('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
    });

    cargarTabla();

    dataTablePrev.forEach(item => {
        $("#tablaPrev").append(`<tr>
            <td>- ${item.titulo}:</td>
            <td id="pre${item.id}" class="text-right texto-wrap"></td>
        </tr>`);
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
                data[name] = value;
            });
            data = { ...data, editarBanner, imagen: $("#eliminarImagen").is(':hidden') };
            info = $.Encriptar(data);
            let formulario = new FormData();
            formulario.append("Imagen", $('#inputIcon').prop('files')[0]);
            formulario.append("encriptado", info);
            $.ajax({
                url: base_url() + rutaGeneral + 'crearBanner',
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
                        cargarTabla();
                        limpiarDatos();
                        $('#CreacionBanners').modal('hide');
                        alertify.success(resp.mensaje);
                    }
                }
            });
        } else {
            alertify.error("Valide la información de los campos.");
        }
    });

    $("#btnCancelarBanner").click(function () {
        limpiarDatos();
    });

    $("#Descripcion").on("change", function () {
        $(this).css("height", "auto");
        $(this).css("height", $(this)[0].scrollHeight + "px");
    });
	/* new QRCode(document.getElementById("qrcode"), "https://prosof.co:8011/dev/WebClub_Pruebas/validar?id=cs.prosof.TemparioApp&name=appclub"); */
});
function cargarTabla() {
    if (tblBanner) {
        tblBanner.destroy();
    }
    tblBanner = dataTable();
    tblBanner = dtSS(tblBanner);
}

function dataTable() {
    return {
        data: {
            tblID: "#tabla",
            select: [
                "BannerId as Codigo"
                , "Imagen"
                , "Nombre"
                , "Descripcion"
                , "URLVideo as Video"
                , "Visualiza"
                , "CASE Estado WHEN 'A' THEN 'Activo' WHEN 'I' THEN 'Inactivo' END as Estado"
                , "'' AS Acciones"
            ],
            table: [
                'APPClubBanner',
                [], []
            ],
            column_order: ["Acciones", "Codigo", "Imagen", "Nombre", "Descripcion", "Video", "Visualiza", "Estado"],
            column_search: ['BannerId', 'Nombre', 'Descripcion'],
            columnas: cabecera,
            orden: {
                'Codigo': 'ASC'
                , 'Imagen': 'ASC'
                , 'Nombre': 'ASC'
                , 'Descripcion': 'ASC'
                , 'Video': 'ASC'
                , 'Visualiza': 'ASC'
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
        columnDefs: [{
			targets: [1], visible:false
		}],
        createdRow: function (row, data, dataIndex) {
            let ver = `
                <button class="ediBanner btn btn-primary btn-xs" data-banner="${data[1]}" title="Editar" style="margin-bottom:3px"><i class="fas fa-pencil-alt"></i></button>
                <button class="eliBanner btn btn-danger btn-xs" data-banner='${JSON.stringify({ 'BannerId': data[1] })}' title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
                <button class="verBanner btn btn-success btn-xs" data-banner='${data[1]}' title="Ver" style="margin-bottom:3px"><i class="fas fa-eye"></i></button>
            `;
            let icono = `uploads/${NIT()}/Banners/${data[2]}`;
            if (!data[2]) {
                icono = `assets/images/user/nofoto.png`;
            }
            let enc = $.Constantes.bannerDisponible.find(it => it.valor == data[6]);
            $(row).find('td:eq(5)').html(enc.titulo);
            $(row).find('td:eq(3)').html("<div class='descripcion'>" + data[4] + "</div>");
            $(row).find('td:eq(1)').html(`<img style="width:85px; height: 75px;" class="icono" src="${base_url() + icono}?${Math.random()}">`).addClass('text-center');
            $(row).find('td:eq(0)').html(ver).addClass('text-center');
            botonesBanner(row);
        },
		initComplete: function(){
			$('div.dataTables_filter input').unbind();
			$("div.dataTables_filter input").keyup( function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tabla").dataTable();
					table.fnFilter( this.value );
				}
			} );
			$('div.dataTables_filter input').focus();
		},
    };
}

function botonesBanner(row) {
    $(row).on("click", ".ediBanner", function (e) {
        e.preventDefault();
        data = $.Encriptar($(this).data('banner'));
        informacion(data, 'obtenerBanner', 'bannerEditar');
    });

    $(row).on("click", ".eliBanner", function (e) {
        e.preventDefault();
        let data = $(this).data('banner');
        eliminarInformacion('¿Desea eliminar este banner?', data, 'eliminarBanner');
    });

    $(row).on("click", ".verBanner", function (e) {
        e.preventDefault();
        let data = $.Encriptar($(this).data('banner'));
        informacion(data, 'obtenerBanner', 'prevBanner');
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

function prevBanner(resp) {
    Object.keys(resp.datos[0]).forEach(item => {
        $('#pre' + item).text(resp.datos[0][item]);
    });
    if (!resp.datos[0]['Imagen']) {
        $('#preImagen').hide();
    } else {
        $('#preImagen').show();
        $('#preImagen').attr('src', `${base_url()}uploads/${NIT()}/Banners/${resp.datos[0]['Imagen']}?${Math.random()}`);
    }
    $("#previs").show();
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
                    cargarTabla();
                }
            },
            error: (err) => { console.error("errro ", err); alertify.error('No fue posible obtener los datos') }
        });
    }, function (err) {
        console.error("Error ", err);
    });
}

function bannerEditar(resp) {
    editarBanner = resp.datos[0]['BannerId'];
    $('#btnCrearBanner').text('Modificar');
    Object.keys(resp.datos[0]).forEach(item => {
        $('#' + item).val(resp.datos[0][item]);
        if (item === 'Estado') {
            $('#' + item).prop('checked', (resp.datos[0][item] == 'A' ? true : false));
        }
    });
    let foto = `uploads/${NIT()}/Banners/${resp.datos[0]['Imagen']}`;
    $("#eliminarImagen").show();
    if (!resp.datos[0]['Imagen']) {
        $("#eliminarImagen").hide();
        foto = `assets/images/user/nofoto.png`;
    }
    $('.icon-container').children('img').attr('src', `${base_url() + foto}?${Math.random()}`);
    setTimeout(() => {
        $("#Descripcion").change();
    }, 30);
    $("#CreacionBanners").modal('show');
}

function limpiarDatos() {
    editarBanner = 0;
    $("#formCrear")[0].reset();
    $("#formCrear :input").removeClass('is-invalid');
    $("#formCrear").validate().resetForm();
    $("#btnCrearBanner").text('Crear');
    $('.icon-container').children('img').attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
    $("#eliminarImagen").hide();
}
