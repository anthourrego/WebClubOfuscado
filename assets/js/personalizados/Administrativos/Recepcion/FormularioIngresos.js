let rutaGeneral = base_url() + 'Administrativos/Recepcion/FormularioIngresos/';
let $ID;
let registroSolicitud = null;
let CantAnex = 0;
let AnexObl = 0; 
let PerAnex = 0;
let TipoDocSelect;
let SolicituAut = undefined;
let actualizarSol = 0;
let busquedaProveedor = 0;
let RastreoSeccion = '';
let tipoingresoAuto = null;
let depencendiaId = null;
let validarvistaDoc = null;
let tblAnexos = null;
let tblcomentarios = null;
let tblAnexos2 = null;
let dataDependencias = [];

//VARIABLES DEL LECTOR
var barra 	= [],
textoBarra 	= '',
scanner 	= true,
limiteIngresos = false,
RegistroId 	= null,
inputChecked = "#codigo";

var inputStart, inputStop, firstKey, lastKey, timing, userFinishedEntering;
var minChars = 2;


//PREPARAMOS EL ALERTIFY
alertify.myAlert || alertify.dialog('myAlert',function factory(){
    return {
        main:function(content){
            this.setContent(content);
        },
        setup:function(){
            return {
                options:{
                    maximizable:false,
                    resizable:false,
                    padding:false,
                    title: 'Búsqueda'
                }
            };
        },
        hooks:{
            onclose:function(){
                setTimeout(function(){
                    alertify.myAlert().destroy();
                }, 1000);
            }
        }
    };
});

//INICIALIZAMOS LAS TABLAS
let tblAutorizaciones =  $('#tablaAutorizaciones').DataTable({
    deferRender: true,
    fixedColumns: true,
    serverSide: true,
    scrollX: true,
    pageLength: 10,
    order: [[0, 'DESC']],
    buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
    ajax: {
        url: rutaGeneral + "DTautorizaciones",
        type: 'POST',
    },
    columns: [
        { data: "SolicitudId" },
        { data: "NombreDepen" }, 
        { data: "NombreTipoIng" }, 
        { data: "nombreUsu" }, 
        { data: "TerceroId" }, 
        { data: "NombreTer" },
        { data: "EmpresaId" }, 
        { data: "NombreEmpresa" }, 
        { data: "FechaInicio"}, 
        { data: "FechaFin" },
        { data: "Accion", orderable : false }
    ],
    initComplete: function () {
        setTimeout(() => {
            $(window).trigger('resize'); 
        }, 1000);
        
    },
    createdRow: function (row, data, dataIndex) {
        if(data.Estado == 'REQUIERE SEGURIDAD SOCIAL'){
            $(row).css('background-color', 'rgba(255, 0 ,0 ,0.3)')
        }

        let ver = `
        <button class="verAutSolicitud btn btn-success btn-xs" title="Ver" style="margin-bottom:3px" style="transition:0.4s;"><i class="fas fa-eye"></i></button>
        `;
            $(row)
                .find('td:eq(10)')
                .html(ver)
                .addClass('text-center')
                .on("click", ".verAutSolicitud ", function(e){
                    tipoingresoAuto = data.TipoIngresoId;
                    depencendiaId = data.dependenciaId 
                    e.preventDefault();
                    $('[id=formSolIngreso]')[0].reset();
                    $("#RegistroSolicitudIngresoMod").modal("show");
                    validarvistaDoc = true;
                    IngresardatosModal(data, data.SolicitudId);

                    setTimeout(() => {
                        $('[id=InfoComenta], [id=btnSalirModal], #AutSolicitud, #RechaSolicitud, .solicitudAut').removeClass("d-none");
                        $('.comentatioVer').removeClass("d-none");
                        $('#btnRegistrarSol, .eliAnexo, .verInSolicitudAut').addClass("d-none");
                        $("#RegistroSolicitudIngresoMod").find('#TipoIngresoId, #dependendiasIn, #fechaIni, #fechaFin, #terceroID, #empresaId, #otroProveedor, #btnAdjuntar, #filePd, #FechaIniSol, #FechaFinSol').attr("disabled", true); 
                        $('#TipoIngresoId, #dependendiasIn').trigger('chosen:updated');
                        $("#RegistroSolicitudIngresoMod").find('#comentarioDepen').removeAttr("disabled readonly"); 
                        if($('#empresaId').val() != ''){
                            $('.otroProveedor').addClass('d-none');
                            $('.empresaId').removeClass('d-none');
                        }else{
                            $('.empresaId').addClass('d-none');
                            $('.otroProveedor').removeClass('d-none');
                        }
                    }, 600 );
                    $('.dependenciaAuto').chosen('destroy');
                    $('.dependenciaAuto').empty();
                    $('.dependenciaAuto').chosen();
                    $.ajax({
                        url: rutaGeneral + "validarDependenciasAut",
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            SolicitudId : data.SolicitudId,
                        },
                        success: function(registro){
                            selectAut = $('.dependenciaAuto');
                            registro.forEach(function(opcion){
                                var opciones = '<option value="'+opcion.DependenciaId+'">' + opcion.Nombre + '</option>'; 
                                selectAut.append(opciones);
                            });
                            selectAut.trigger("chosen:updated")
                        }
                    });
                })
    },
}); 

let tblSolicitudes =  $('#tblSolicitudes').DataTable({
    deferRender: true,
    fixedColumns: true,
    serverSide: true,
    scrollX: true,
    pageLength: 10,
    order: [[0, 'DESC']],
    buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength'], [{
		className: 'btnRegistrarSolicitud',
		text: '<i class="fas fa-pencil-alt"></i> Registrar Solicitud'
	},{
        className: 'btnActualizarTabla',
		text: '<i class="fas fa-sync-alt"></i> Actualizar'
    }]),
    ajax: {
        url: rutaGeneral + "DTsolicitudes",
        type: 'POST',
    },
    columns: [
        { data: "SolicitudId" }, 
        { data: "NombreIng" }, 
        { data: "NombreDepen" }, 
        { data: "TerceroId"}, 
        { data: "NombreTer"}, 
        { data: "EmpresaId" },
        { data: "NombreEmpresa" }, 
        { data: "FechaInicio"}, 
        { data: "FechaFin" },
        { data: "Estado" },
        { data: "Accion", orderable : false }
    ],
    initComplete: function () {
        setTimeout(() => {
            $(window).trigger('resize'); 
        }, 1000);
        
    },
    createdRow: function (row, data, dataIndex) {
        if(data.Estado == 'REQUIERE SEGURIDAD SOCIAL'){
            $(row).css('background-color', 'rgba(255, 0 ,0 ,0.3)')
        }

        let ver = '';
        if(data.Estado == 'PENDIENTE' || data.Estado == 'REQUIERE SEGURIDAD SOCIAL'){
            ver = `
                <button class="ediSolicitud btn btn-primary btn-xs" title="Editar" style="margin-bottom:3px" style="transition:0.4s;"><i class="fas fa-pencil-alt"></i></button>
                <button class="verSolicitud btn btn-success btn-xs" title="Ver" style="margin-bottom:3px" style="transition:0.4s;"><i class="fas fa-eye"></i></button>
                <button class="eliSolicitud btn btn-danger btn-xs" title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
            `;
        }else{
            ver = `
                <button class="verSolicitud btn btn-success btn-xs" title="Ver" style="margin-bottom:3px" style="transition:0.4s;"><i class="fas fa-eye"></i></button>
                <button class="eliSolicitud btn btn-danger btn-xs" title="Eliminar" style="margin-bottom:3px"><i class="fas fa-prescription-bottle"></i></button>
            `;
        }
        $(row)
            .find('td:eq(10)')
            .html(ver)
            .addClass('text-center')
            .on("click", ".verSolicitud ", function(e){
                e.preventDefault();
                $('[id=formSolIngreso]')[0].reset();
                $("#RegistroSolicitudIngresoMod").modal("show");

                validarvistaDoc = true;
                IngresardatosModal(data, data.SolicitudId);
                setTimeout(() => {
                    $('[id=InfoComenta], [id=btnSalirModal], .comentatioVer').removeClass("d-none");
                    $('#btnRegistrarSol, .verInSolicitud, .eliAnexo').addClass("d-none");
                    $("#RegistroSolicitudIngresoMod").find('#TipoIngresoId, #dependendiasIn, #fechaIni, #fechaFin, #terceroID, #empresaId, #otroProveedor, #btnAdjuntar, #filePd, #FechaIniSol, #FechaFinSol, #comentarioDepen').attr("disabled", true); 
                    $('#TipoIngresoId, #dependendiasIn').trigger('chosen:updated');
                    $('#comentarioDepen').attr("disabled",false);  
                    $('#comentarioDepen').attr("readonly",false);
                    if($('#empresaId').val() != ''){
                        $('.otroProveedor').addClass('d-none');
                        $('.empresaId').removeClass('d-none');
                    }else{
                        $('.empresaId').addClass('d-none');
                        $('.otroProveedor').removeClass('d-none');
                    }
                }, 600 );
            })
            .on("click", ".ediSolicitud ", function(e){
                e.preventDefault();

                $('[id=formSolIngreso]')[0].reset();
                $("#RegistroSolicitudIngresoMod").modal("show");

                validarvistaDoc = false;
                IngresardatosModal(data, data.SolicitudId);

                setTimeout(() => {
                    $('[id=InfoComenta], [id=btnSalirModal], .modal-footer, #btnActualizarSolicitud, .comentatioVer, .verInSolicitud, .otroProveedor, .empresaId').removeClass("d-none");
                    $('#btnCancelarSolicitud, #btnEnviarSolicitud, #btnRegistrarSol').addClass("d-none");
                    $("#RegistroSolicitudIngresoMod").find('#TipoIngresoId, #dependendiasIn, #fechaIni, #fechaFin, #terceroID, #empresaId, #otroProveedor, #btnAdjuntar, #filePd, #FechaIniSol, #FechaFinSol, #comentarioDepen').removeAttr("disabled readonly"); 
                    $('#TipoIngresoId, #dependendiasIn').trigger('chosen:updated');
                    $('#empresaId').val() == '' ? $('#empresaId').attr('disabled', true) : $('#empresaId').val();
                    $('#otroProveedor').val() == '' ? $('#otroProveedor').attr('disabled', true) : $('#otroProveedor').val();
                }, 600 );
                        
            })
            .on("click", ".eliSolicitud", function(e){
                e.preventDefault();
                    //DESABILITAMOS LA SOLICITUD
                    alertify.confirm('Advertencia', '¿Está seguro de eliminar la solicitud '+data.SolicitudId+ '?', function(){
                        $.ajax({
                            type: "POST",
                            url: rutaGeneral + "deshabilitarSolicitud",
                            data: {
                                SolicitudId : data.SolicitudId,
                                RASTREO: RASTREO('Deshabilita solicitud '+data.SolicitudId, 'Modifica Solicitud')
                            },
                            dataType: "json",
                            success: function(resp){
                                tblAutorizaciones.ajax.reload();
                                tblSolicitudes.ajax.reload();
                                alertify.success("Solicitud eliminada correctamente.");
                            }
                        });
                    }, function(){});
            })
    },
});

//SE AGREGAN LOS EVENTOS E INICIALIZAMOS ATRIBUTOS DE LAS ETIQUETAS
$(document).on('mouseup touchend', function (e) {
    var container = $('.bootstrap-datetimepicker-widget');
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.parent().find("[data-toggle='datetimepicker']").datetimepicker('hide');
    }
});

$('.datetimepicker').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
    sideBySide: true,
    locale: 'es',
});

$(function(){
    if($validarIngreso == 'Sol&Aut'){
        RastreoIngresoModulo('Solicitud y autorización de ingresos');
        RastreoSeccion = 'Solicitud y Autorización Ingresos';
    }else{
        RastreoIngresoModulo('Otros Ingresos');
        RastreoSeccion = 'Otros Ingresos';
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
        if(e.target.id == 'ingreso-tab'){
            $('#bntLimpiar').click();
        }
        validarvistaDoc = false;
        var tabActivo = $(e.target).attr('title');

    })

    $('select[data-db]:not([data-db="DependenciaId"], [data-db="TipoIngresoId"]), input[type=file], textarea, #btnModalTercerosModal, #btnEnviarSolicitud, #btnCancelarSolicitud, #btnAdjuntar, #btnRegistrarSol').attr('disabled', true);
    $('input[data-db]:not([data-db="DependenciaId"], [data-db="TipoIngresoId"]), textarea[data-db]').attr({'readonly': true,'disabled': true });

    $('#otroProveedor, #comentarioDepen, #comentarioAuto').on('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    })

    //Se deshabilitan las fecha para no colocar rango erroneos
    $("[id=fechaIni]").on("dp.change", function (e) {
        $('[id=fechaIni]').data("DateTimePicker").minDate(e.datetime);
        $('[id=fechaFin]').data("DateTimePicker").minDate(e.date);
    });

    $('#AutSolicitud, #RechaSolicitud').click(function(e){
        if($('#dependenciaAuto').val() != ''){
            if(e.target.id == 'AutSolicitud'){
                var autorizar = 1
            }else if(e.target.id == 'RechaSolicitud'){
                var autorizar = 0
            }
            modificarEstadosolicitud(SolicituAut, autorizar, tipoingresoAuto, depencendiaId);
            $('#RegistroSolicitudIngresoMod').addClass('d-none');
        }else{
            alertify.error("Debe asignar al menos una dependencia para continuar con la operación.");
        }
    })

    $("#codigo").on("keydown", function(e){
        if(!$("#checkLector").is(":checked")){
            form = $(this).closest("form");
            if(e.which == 13){
                form.submit();
    
                if ($(this).val().length == 0){
                    setTimeout(() => {
                        $(this).focus();
                    }, 200);
                }
            }
        }
    });
    
    $("[id=btnSalirModal]").click(function(){
        $("#RegistroSolicitudIngresoMod").modal("hide");
    });

    $(".btnRegistrarSolicitud").click(function(){
        if($TipoIngreso.length > 0){
            $('[id=formSolIngreso]')[0].reset();
            $("#RegistroSolicitudIngresoMod").modal("show");
            $("[id=fechaFin]").val(moment().format('YYYY-MM-DD HH:mm'));
            $("[id=fechaIni]").val(moment().format('YYYY-MM-DD HH:mm'));
            $('#dependendiasIn_chosen').css('border', '');
            $('#dependendiasIn_chosen').css('border-radius', '');
        }else{
            alertify.error("El usuario actual no tiene asignación de tipos de ingreso para realizar la solicitud");   
        }
/*         setTimeout(() => {
            $('#RegistroSolicitudIngresoMod').find('input:eq(0)').focus();
        }, 1000); */
    });

    $("#RegistroSolicitudIngresoMod").on('hidden.bs.modal', function(){ 
        $('[id=formSolIngreso]').trigger("reset");
        $("[id=TipoIngresoId], [id=dependendiasIn]").val('').trigger('chosen:updated');
        $('#TipoIngresoId, #dependendiasIn').removeAttr("disabled readonly"); 
        $('#TipoIngresoId, #dependendiasIn').trigger('chosen:updated');
        $('.solicitudAut, .DependediaCl, #InfoTer, #InfoProvee, #OtroProvee, #InfoAnex, #InfoComenta, #btnActualizarSolicitud, #btnCancelarSolicitud, #btnEnviarSolicitud, #btnActualizarSolicitud, #AutSolicitud, #RechaSolicitud').addClass("d-none");
        $('#btnRegistrarSol').removeClass("d-none");
        $('#btnRegistrarSol').attr("disabled", true);
        $('.responMod').removeClass('modal-dialog-scrollable');
        $('#comentarioDepen').val('');
        registroSolicitud = null;
        SolicituAut = undefined;
    })
    
    $('#solicitud').on('click', '.col-form-label-md', function(){
        var self = this;
        setTimeout(function(){
            $(self).next().find('input, select, textarea').focus();
        },0);
    });

    $('.btnActualizarTabla').click(function(){
        tblSolicitudes.ajax.reload();
    }) 
    
    $(".chosen-select").chosen({
        width: '100%'
    });
    
    if($tabIngresos.length === 0){
        $("#solicitud-tab").click();
    }else{
        $("#ingreso-tab").click();
    }

    $(document).on('show.bs.tab', function() {
        setTimeout(() => {
            $(window).trigger('resize'); 
        }, 30);
    })
    
    $("[id=btnEnviarSolicitud],[id=btnActualizarSolicitud] ").click(function(e){
        if(e.target.id === "btnActualizarSolicitud"){
            actualizarSol = 1;
        }
        $('#formSolIngreso').submit();
    });

    $("[id=formSolIngreso]").on("change", "[data-codigo]", function(e){
        if(e.target.id === "terceroID"){
            e.preventDefault();
            lastId = $ID;
            $ID = $("[data-codigo]").val().trim();
            tipoConsulta = 'Tercero';
            if($ID != '' && $ID.length > 0){
                $.ajax({
                    url: rutaGeneral + "cargarTerceroSol",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        codigo: $ID,
                        tipoConsulta,
                        RASTREO: RASTREO('Carga Cliente '+$ID, 'Terceros')
                    },
                    success: function(registro){
                        if(registro != 1){
                            for(var key in registro[0]) {
                                if(registro[0][key] != null){
                                    var value = registro[0][key];
                                    $("[data-db="+key+"]").val(value);
                                }
                            }
                        }else{
                            $('[data-codigo="codigoTer"]').val('');
                            $('#NombreTer').val('');
                            alertify.alert(
                                'Alerta',
                                '<h3 class="mensaje-alerta">La persona'  + " se encuentra bloqueada por la junta directiva, no se permite su ingreso.</h3>"
                            )
                            return false;
                        }
                        if(registro.length == 0){
                            alertify.error("El usuario no se encuentra registrado o se encuentra inactivo.");  
                            $('#NombreTer').val('');  
                            $('[data-codigo="codigoTer"]').val('');
                        }
                    }
                });
            }else{
                $('#NombreTer').val('');
                if($('[data-codigo="terceroID"]').val() != ''){
                $('[data-codigo="terceroID"]').val($ID);
                }
            }
        }else if(e.target.id === "empresaId"){
            e.preventDefault();
            $ID = $('[data-codigo="empresaId"]').val().trim();
            tipoConsulta = 'Empresa';
            if($ID != '' && $ID.length > 0){
                $.ajax({
                    url: rutaGeneral + "cargarTerceroSol",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        codigo: $ID,
                        tipoConsulta,
                        RASTREO: RASTREO('Carga Cliente '+$ID, 'Proveedor')
                    },
                    success: function(registro){
                        if(registro != 1){
                            for(var key in registro[0]) {
                                if(registro[0][key] != null){
                                    var value = registro[0][key];
                                    $("[data-db="+key+"]").val(value);
                                }
                            }
                        }
                        if(registro == 1){
                            $('[data-codigo="codigoTer"]').val('');
                            $('#NombreEmp').val('');  
                            alertify.alert(
                                'Alerta',
                                '<h3 class="mensaje-alerta">La empresa'  + " se encuentra bloqueada por la junta directiva, no se permite su ingreso.</h3>"
                            )
                            return false;
                        }
                        if(registro.length == 0){
                            alertify.error("La empresa no se encuentra registrada o se encuentra inactiva.");    
                            $('[data-codigo="empresaId"]').val('');
                            $('#NombreEmp').val('');
                        }
                    }
                });
            }else{
                $('#NombreEmp').val('');
                if($('[data-codigo="empresaId"]').val() != ''){
                $('[data-codigo="empresaId"]').val($ID);
                }
            }
        }
    });

    $(".checkDoc").on('click', function(){
        if($(this).is(':checked')){
            $(".checkDoc").not(this).prop('checked', false);

            TipoDocSelect = $(this).val();
        }else{
            $(this).prop('checked', false);

            TipoDocSelect = '';
        }
        if(TipoDocSelect == 'SS'){
            $(".validDoc").removeClass('invisible');
            $("[id=FechaIniSol]").val(moment().format('YYYY-MM-DD'));
            $("[id=FechaFinSol]").val(moment().format('YYYY-MM-DD'));
        }else{
            $(".validDoc").addClass('invisible');
            $("[id=FechaIniSol]").val(moment().format('YYYY-MM-DD'));
            $("[id=FechaFinSol]").val(moment().format('YYYY-MM-DD'));
        }
    });

    $("[id=formSolIngreso]").on("change", "[data-db='TipoIngresoId']", function(){
        $('#btnEnviarSolicitud, #btnCancelarSolicitud, #btnAdjuntar, #btnRegistrarSol').attr('disabled', true);
        let tipoIngreso =  $('#TipoIngresoId').val();
        validarCampos(tipoIngreso, ValidaCrear = 0);
        $("[id=TipoIngresoId]").val(tipoIngreso).trigger('chosen:updated');
        $('#btnEnviarSolicitud, #btnCancelarSolicitud, #btnAdjuntar, #btnRegistrarSol').attr('disabled', false);
        $('select[data-db], input[type=file], textarea, #btnModalTercerosModal').attr('disabled', false);
        $('input[data-db]:not(#dependendiasIn, #NombreTer, #NombreEmp), textarea[data-db]').attr({'readonly': false,'disabled': false });

    });

    $('#dependendiasIn').chosen().change(function(){
        if($('#dependendiasIn').val() != ''){
            $('#dependendiasIn_chosen').css('border', '');
            $('#dependendiasIn_chosen').css('border-radius', '');
        }
    })

    $("#formSolIngreso input").on("focusout",  function(e){
        if(e.target.value != ''){
            $(e.target).removeClass('is-invalid')
        }
    });

    $("[id=btnRegistrarSol]").click(function(e){
        validar = document.getElementById('formSolIngreso');
        var formularioUno = new FormData(validar);
        formularioUno.append('Estado', 'A');
        formularioUno.append('NombreEmpresa', $('[name=NombreEmpresa]').val());
        validarRequired = validar.querySelectorAll('[required]');
        if($('#dependendiasIn').val() == ''){
            $('#dependendiasIn_chosen').css('border', '1px solid red');
            $('#dependendiasIn_chosen').css('border-radius', '4px');
        }else{
            $('#dependendiasIn_chosen').css('border', '');
            $('#dependendiasIn_chosen').css('border-radius', '');
        }
        for(var i = 0; i < validarRequired.length; i++){
            var field = validarRequired[i]

            if(field.value == ''){
                field.classList.add('is-invalid');
            }else{
                if(field.classList.contains('is-invalid')){
                    field.classList.remove('is-invalid');
                }
            }
        }
        if(validar.checkValidity()){
            $.ajax({
                url: rutaGeneral + "creaSolicitud",
                type: 'POST',
                dataType: 'json',
                async: false,
                data: formularioUno,
                cache: false,
                processData: false,
                contentType: false,
                encType: 'multipart/form-data',
                success: function(registro){
                    if(registro != 3){
                        registroSolicitud = registro.SolicitudId;
                        validarCampos(registro.TipoIngresoId, ValidaCrear = 1);
                        if(AnexObl == 1 || PerAnex == 1){
                            $('#btnRegistrarSol').addClass('d-none');
                            $('#btnCancelarSolicitud, #btnEnviarSolicitud').removeClass('d-none');
                            $('#TipoIngresoId').attr('disabled', true);
                            $("[id=TipoIngresoId]").trigger('chosen:updated'); 
                        }else{
                            $('#formSolIngreso').submit();
                        }
                    }else{
                        alertify.error("El usuario ya cuenta con una solicitud en ese rango de fechas");
                    }
                }
            });
        }else{
            alertify.error("Complete los campos obligatorios.");
        }
    });
    
    $('[id=formSolIngreso]').submit(function(e){
        e.preventDefault();
        let RegistroSol = 1;
        if(AnexObl == 1){
            if(CantAnex < 1){
                RegistroSol = 0;
            }
        }
        validar = document.getElementById('formSolIngreso');
        if(validar.checkValidity() && RegistroSol == 1){
            let formulario = new FormData(validar);
            formulario.append('validarSeguridad',AnexObl);
            formulario.append('EmpresaId', $('[name="EmpresaId"]').val());
            formulario.append('NombreEmpresa', $('[name="NombreEmpresa"]').val());
            formulario.append('SolicitudId',registroSolicitud = SolicituAut !== undefined ? SolicituAut : registroSolicitud);
            if(actualizarSol == 1){
                formulario.append('editarsolicitud',actualizarSol);
            } 
            $.ajax({
                url: rutaGeneral + "actualizaSolicitud",
                type: 'POST',
                data: formulario, 
                processData: false,
                contentType: false,
                dataType: 'json',
                cache: false,
                encType: 'multipart/form-data',
                success: function(registro){
                    if(registro == 1){
                        if(actualizarSol != 1){
                            alertify.success("Solicitud creada correctamente.");
                        }else{
                            alertify.success("Solicitud actualizada correctamente.");
                        }

                        registroSolicitud = null;
                        setTimeout(() => {
                            $("#RegistroSolicitudIngresoMod").modal('hide');
                            tblSolicitudes.ajax.reload();
                            $('[id=formSolIngreso]').trigger("reset");
                            $("[id=TipoIngresoId]").val('').trigger('chosen:updated');
                        }, 1000);
                    }else{
                        alertify.error("La fecha de ingreso y salida del tercero debe estar dentro del rango de fechas de seguridad social");
                    }
                }  
            });
        }else{
            if (RegistroSol == 0) {
                alertify.error("Adjunte la seguridad social del tercero.");
            }else{
                $('input[required]').addClass('input-invalid');
                alertify.error("Complete los campos obligatorios.");
            }
        }
    })

    $("[id=btnCancelarSolicitud]").click(function(){
        if(registroSolicitud){
            $.ajax({
                url: rutaGeneral + "eliminarSolicitud",
                type: 'POST',
                dataType: 'json',
                data: {
                    Id : registroSolicitud,
                    RASTREO: RASTREO('Elimina solicitud: ', 'Solicitud Ingreso')
                },
                success: function(registro){
                    $("#RegistroSolicitudIngresoMod").modal('hide');
                    tblSolicitudes.ajax.reload();
                }
            });
            registroSolicitud = null;
        }
    });

    $("[id=btnAdjuntar]").click(function(){
        var anexoDoc = $('[id=filePd]').prop('files')[0];
        var FechaIniSeg = $('[id=FechaIniSol]').val();
        var FechaFinSeg = $('[id=FechaFinSol]').val();
        var tipoDoc= TipoDocSelect;
        var formData = new FormData();
        
        formData.append('file' , anexoDoc);
        if(tipoDoc == 'OA'){
            formData.append('FechaIni' , null);
            formData.append('FechaFin' , null);
        }else{
            formData.append('FechaIni' , FechaIniSeg);
            formData.append('FechaFin' , FechaFinSeg);
        }
        formData.append('tipoDoc' , tipoDoc);
        formData.append('registroSolicitud' , SolicituAut !== undefined ? SolicituAut : registroSolicitud);
        if(anexoDoc){
            $.ajax({
                url: rutaGeneral + "actualizaAnexos",
                type: 'POST',
                dataType: 'json',
                processData: false,
                contentType: false,
                async: false,
                data: formData,
                success: function(registro){
                    if(registro == 1){
                        alertify.success('Adjunto guardado correctamente'); 
                        tblAnexos.columns.adjust().draw();
                    }else if(registro == 3){
                        alertify.error('Archivo no valido, verificar el peso o caracteres especiales del archivo'); 
                    }
                }
            });
        }else{
            alertify.error('Por favor, adjunte un archivo'); 
        }
        $('[id=filePd]').val('');
    });

    $("[id='btnRegistrarComentario']").click(function(e){
    var dataComentario = $('#comentarioDepen').val();
        if(dataComentario.trim().length !== 0){
            $.ajax({
                url: rutaGeneral + "agregarComentarios",
                type: 'POST',
                data: {
                    SolicituAut,  dataComentario
                }, 
                success: function(registro){
                    alertify.success('Se ha registrado correctamente'); 
                    $('#comentarioDepen').val('');
                    tblcomentarios.columns.adjust().draw();
                }
            });
        }else{
            alertify.error('No se han agregado datos en el campo de observación'); 
        }
    });

    $("#formBuscar").submit(function(e){
        e.preventDefault();
        if ($(this).valid()) {
			let datos = new FormData(this);
			datos.set('validaLector', $("#checkLector").is(':checked'));
            $.ajax({
                url: rutaGeneral + 'BuscarTerceroIngreso',
                type: 'POST',
                data: datos,
                dataType: 'json',
                processData: false,
                contentType: false,
                cache: false,
                success: (resp) => {
                    respuesta = resp[1];
                    if(resp){
                        busquedaProveedor = {
                            TerceroId : respuesta[0].TerceroId,
                            TipoIngresoId : respuesta[0].TipoIngresoId,
                            Sede : $datosSede.SedeId,
                            Almacen : $datosAlmacen.almacenid
                        };   
                        
                        if(resp[0] == 1 && resp[2] == 'S'){
                            $("#registrarSalida").removeClass("d-none"); 
                            $("#registrarIngreso").addClass("d-none");
                        }else if(respuesta[0].BloqueoPorAutorizacion == 0 && (respuesta[0].Estado == 'PENDIENTE' || respuesta[0].Estado== 'APROBADA')){
                            $("#registrarIngreso").removeClass("d-none");
                        } else if(respuesta[0].BloqueoPorAutorizacion == 1 &&  respuesta[0].Estado== 'APROBADA'){
                            $("#registrarIngreso").removeClass("d-none");
                        } else {
                            $("#registrarIngreso").addClass("d-none");
                        }
                    }

                    if(respuesta){
                        if(respuesta[0].foto !== "" && respuesta[0].foto !== null){
                            $(".img-persona").attr("src", "data:image/jpeg;base64," + respuesta[0].foto);
                        }else{
                            $(".img-persona").attr("src", base_url() + "assets/images/user/nofoto.png");
                        }
                        
                        SolicituAut = respuesta[0].SolicitudId;    
                        cargarTablasAdd(false, false, true);

                        setTimeout(() => {
                            datosTabla = tblAnexos2.data();

                            if(datosTabla.length > 0){
                                $('.tablaDos').removeClass('d-none');
                                validarvistaDoc = true;
                            }else{
                                $('.tablaDos').addClass('d-none');
                            }
                        }, 500);
                        for(var key in respuesta[0]) {
                            if(respuesta[0][key] != null){
                                var value = respuesta[0][key];
                                $("[data-ing="+key+"]").val(value);
                            }
                        }
                        if(resp[0] == 1){
                            $("#cardSocio").removeClass("border border-danger border-success border-warning").addClass("border border-info");
                        }else if(respuesta[0].Estado == 'APROBADA'){
                            $("#cardSocio").removeClass("border border-danger border-success border-info").addClass("border border-success");
                        }else if(respuesta[0].Estado== 'RECHAZADA' || respuesta[0].Estado== 'REQUIERE SEGURIDAD SOCIAL'){
                            $("#cardSocio").removeClass("border border-success border-warning border-info").addClass("border border-danger");
                        }else if(respuesta[0].Estado== 'PENDIENTE'){
                            $("#cardSocio").removeClass("border border-success border-danger border-info").addClass("border border-warning");
                        }
                    }else{
                        $("#bntLimpiar").click();
                        alertify.confirm('Registrar solicitud', 'El tercero no cuenta con una solicitud de ingreso ¿Desea Registrar la solicitud? ', function(){
                            if($TipoIngreso.length > 0){
                                $('[id=formSolIngreso]')[0].reset();
                                $("#RegistroSolicitudIngresoMod").modal("show");
                            }else{
                                alertify.error("El usuario actual no tiene asignación de tipos de ingreso para realizar la solicitud");  
                            }
                        }, function(){});
                    }
                }
            });
        }
    });

    $("#registrarIngreso").click(function (){
        $.ajax({
            url: rutaGeneral + 'ConfirmarIngresoTercero',
            type: 'POST',
            data: {
                busquedaProveedor
            },
            dataType: 'json',
            success: (resp) => {
                $("#cardSocio").removeClass("border border-danger border-sucess border-warning border-success").addClass("border border-info");
                alertify.success("Ingresó correctamente");
            }
        });
        $("#formBuscar").submit();
    })

    $("#registrarSalida").click(function (){    
        $.ajax({
            url: rutaGeneral + 'ConfirmarSalidaTercero',
            type: 'POST',
            data: {
                busquedaProveedor
            },
            dataType: 'json',
            success: (resp) => {
                $("#registrarIngreso, #registrarSalida").addClass("d-none");
                alertify.success("Salió correctamente");
                setTimeout(() => {
                   location.reload(); 
                }, 2000);
            }
        });
        $("#bntLimpiar").click();
    })

    $("#bntLimpiar").on("click", function(){
        SolicituAut = undefined;
        $('.tablaDos').addClass('d-none');
        $("#cardSocio").removeClass("border border-success border-danger border-warning border-info");
        $(".img-persona").attr("src", base_url() + 'assets/images/user/nofoto.png');
        $("[data-ing]").val('');
        $("#formBuscar")[0].reset();
        $("#registrarIngreso, #registrarSalida").addClass("d-none");

    });

    //Lector de cedula eventos
    $("#checkLector").on("click",function(){
        $(this).is(":checked") ? propForm(true) : propForm(false);
    });

    $(inputChecked).on('focusout', function(){
        if($("#checkLector").is(":checked")){
            setTimeout(function(){
                $(inputChecked).focus();
            },50);
        }
    });

    $(inputChecked).on('focus', function(){
        if($("#checkLector").is(":checked")){
            if(scanner == false){
                barra = [];
                textoBarra = '';
                scanner = false;
        
                inputStart = null;
                inputStop = null;
                firstKey = null;
                lastKey = null;
            }
        }
    });

    $(inputChecked).keydown(function (e) {
        if($("#checkLector").is(":checked")){
            $("#checkLector").prop("disabled",true);	
            if( ! (barra == [] && $(this).val() == '')){
                // restart the timer
                if (timing) {
                    clearTimeout(timing);
                }
                
                // handle the key event
                if (e.which == 13) {
                    // Enter key was entered
                    
                    // don't submit the form
                    e.preventDefault();
                    
                    // has the user finished entering manually?
                    if ($(inputChecked).val().trim().length >= minChars){
                        userFinishedEntering = true; // incase the user pressed the enter key
                        inputComplete();
                    }
    
                    var arrUser = $(inputChecked).val().split('-');
    
                    
                    setTimeout(function(){
                        //$("#nomV").val("").focus()
                        $(inputChecked).val(arrUser[0]);
                        //$("#nomV").val(arrUser[3]+" "+arrUser[4]+" "+arrUser[1]+" "+arrUser[2]);
                        $("#formBuscar").submit();
                        $("#checkLector").prop("disabled",false).click();
                        //$(inputChecked).change();
                        //location.reload();
                    },100)
                    
                }else {				
                    // some other key value was entered
                    
                    // could be the last character
                    inputStop = performance.now();
                    lastKey = e.which;
                    
                    // don't assume it's finished just yet
                    userFinishedEntering = false;
                    
                    // is this the first character?
                    if (e.which == 9) {
                        e.preventDefault();
                        $(inputChecked).val($(inputChecked).val().trim()+"-"); 
                        setTimeout(function(){
                            $(inputChecked).focus();
                        },100);
                        return ;
                    }
                    if (e.which == 16) {
                        e.stopPropagation();
                        $(inputChecked).val($(inputChecked).val().trim());
                        return;
                    }
                    if (e.which == 32) {
                        e.stopPropagation();
                        $(inputChecked).val($(inputChecked).val().trim());
                        return ;
                    }
    
                    if (!inputStart) {
                        firstKey = e.which;
                        inputStart = inputStop;
        
                        // watch for a loss of focus
                        $("body").on("blur", inputChecked, inputBlur);
                    }
                    
                    // start the timer again
                    timing = setTimeout(inputTimeoutHandler, 500);
                }
            }
        }
    });

    $(document).off('keydown').on('keypress', function (e) {
        if($("#checkLector").is(":checked")){
            if(e.which == 13){
                e.preventDefault();
            }else{
                textoBarra += e.key;
            }
        
            if(e.which == 13 && scanner == true){
                e.preventDefault();
            }
        }
    });

    $(document).on("keyup", "#codigo", function(){
        //$(this).val($(this).val().replace(/^0/, ''));
		if ($(this).next().find('input').prop("disabled")) {
			$(this).val($(this).val().replace(/^0/, ''));
		}
    });
});

//AGREGAMOS LA FUNCIONES
function IngresardatosModal(Registros, idSolicitudtbl){
    SolicituAut = idSolicitudtbl;
    if(Registros.EmpresaId == '' || Registros.EmpresaId == null){
        Registros.EmpresaOtra = Registros.NombreEmpresa;
        Registros.NombreEmpresa = '';
    }
    setTimeout(() => {
        for(var key in Registros) {
            if(Registros[key] != null){
                var value = Registros[key];
                $("[data-aut="+key+"]").val(value);
            }
        }
        $("[data-aut=TipoIngresoId]").val(Registros.TipoIngresoId).trigger('chosen:updated');
        $("[data-aut=DepenAut]").val(Registros.DepenAut).trigger('chosen:updated');
        $("[data-aut=DependenciaId]").val(Registros.DependenciaId).trigger('chosen:updated');
    }, 500);
    validarCampos(Registros.TipoIngresoId, ValidaCrear = 0, validaEditar = 1);
}

function validarCampos(tipoIngreso, validaCrear, validaEditar){
    if(validaEditar == 1 || validaCrear == 0){
        $('[id=formSolIngreso]')[0].reset();
        $("[id=fechaFin]").val(moment().format('YYYY-MM-DD HH:mm'));
        $("[id=fechaIni]").val(moment().format('YYYY-MM-DD HH:mm'));
    }
    tipoIngresoId = tipoIngreso;
    $('[id=InfoTer], .otroProveedor, .empresaId').removeClass('d-none');
    for(var ingresos of $TipoIngreso ){
        if(ingresos['TipoIngresoId'] == tipoIngresoId){
            parametroIngreso = ingresos;
        }
    } 
    if(parametroIngreso.SolicitaDependencia == 1){
        if($valDepen.length === 0){
            alertify.error("Debe asignar dependencias a su usuario para continuar con la solicitud.");
            setTimeout(() => {
                $('#btnRegistrarSol').attr('disabled', true);
            }, 100);
        }
        $('.DependediaCl').removeClass('d-none');
        $('[id=dependendiasIn]').attr('required', 'required').css('border-color', 'red');
    }else{
        $('.DependediaCl').addClass('d-none');
        $('#dependendiasIn').val('');
        $('#dependendiasIn').trigger('chosen:updated');
        $('[id=dependendiasIn]').removeAttr('required').css('border-color', '');
    }
    if(parametroIngreso.SolicitaEmpresa == 1 && parametroIngreso.EmpresaOtra == 1){
        setTimeout(() => {
            $('[id=InfoProvee] , [id=OtroProvee]').removeClass('d-none'); 

            $("[id=empresaId],[id=otroProveedor] ").on('change focusout', function(e){ 
                if(e.target.id == 'empresaId' && e.target.value != ''){
                    $('[id=otroProveedor]').removeClass('input-invalid');
                    $('[id=otroProveedor]').removeAttr('required');
                    $('[id=empresaId], [id=NombreEmp]').attr('required', 'required');
                    $('[id=NombreEmp]').attr('name', 'NombreEmpresa');
                    $('[id=otroProveedor]').attr('disabled', true);
                }else if(e.target.id == 'otroProveedor' && e.target.value != ''){
                    $('[id=empresaId]').removeClass('input-invalid');
                    $('[id=empresaId], [id=NombreEmp]').removeAttr('required');
                    $('[id=otroProveedor]').attr('required', 'required');
                    $('[id=otroProveedor]').attr('name', 'NombreEmpresa');
                    $('[id=empresaId]').attr('disabled', true);
                }else if(e.target.value == ''){
                    $('[id=otroProveedor]').removeClass('input-invalid');
                    $('[id=otroProveedor]').removeAttr('required');
                    $('[id=empresaId], [id=NombreEmp]').removeClass('input-invalid');
                    $('[id=empresaId], [id=NombreEmp]').removeAttr('required');
                    $('[id=empresaId], [id=otroProveedor]').removeAttr('disabled', false);
                    $('[id=NombreEmp]').removeAttr('name', 'NombreEmpresa');
                    $('[id=otroProveedor]').removeAttr('name', 'NombreEmpresa');
                }
            })
        }, 100);
    }else{
        $('[id=InfoProvee], [id=OtroProvee]').addClass('d-none');
        $('[id=empresaId], [id=otroProveedor], [id=NombreEmp]').removeAttr('required');
        $('[id=otroProveedor], [id=NombreEmp]').removeAttr('name');

        if(parametroIngreso.SolicitaEmpresa == 1 && parametroIngreso.EmpresaOtra == 0){
            $('[id=InfoProvee]').removeClass('d-none'); 
            $('[id=empresaId], [id=NombreEmp]').attr('required', 'required');
            $('[id=NombreEmp]').attr('name', 'NombreEmpresa');
        }else{
            $('[id=InfoProvee]').addClass('d-none');
            $('[id=empresaId], [id=NombreEmp]').removeAttr('required');
            $('[id=NombreEmp]').removeAttr('name');
        }
        if(parametroIngreso.EmpresaOtra == 1 && parametroIngreso.SolicitaEmpresa == 0  ){
            $('[id=OtroProvee]').removeClass('d-none');
            $('[id=otroProveedor]').attr('required', 'required');
            $('[id=otroProveedor]').attr('name', 'NombreEmpresa');
        }else{
            $('[id=OtroProvee]').addClass('d-none');
            $('[id=otroProveedor]').removeAttr('required');
            $('[id=otroProveedor]').removeAttr('name');
        }
    }
    if((parametroIngreso.PermiteAdjuntos == 1 && parametroIngreso.SolicitaSeguridadSocial == 1) && (validaCrear == 1 || validaEditar == 1)){
        AnexObl = 1;
        PerAnex = 1;
        $('[id=InfoAnex], .verInSolicitud').removeClass('d-none');
        setTimeout(() => {
            $('#DocSegSocial').click();
        }, 50);
        
    }else{
        AnexObl = 0;
        PerAnex = 0;
        $('[id=InfoAnex]').addClass('d-none');

        if((parametroIngreso.PermiteAdjuntos == 1 && parametroIngreso.SolicitaSeguridadSocial == 0) && (validaCrear == 1 || validaEditar == 1)){
            AnexObl = 0;
            PerAnex = 1;
            setTimeout(() => {
                $('[id=InfoAnex], .verInSolicitud').removeClass('d-none');
                $('[id=DocSegSocial],[id=DocSegSocialLabel]').addClass('invisible');
                $('[id=DocOtrArchivo]').attr('disabled', false);
                $("[id=DocOtrArchivo]").click();
                $('[id=DocOtrArchivo]').attr('disabled', true);
            }, 100);
        }else{
            AnexObl = 0;
            PerAnex = 0;
            $('[id=DocSegSocial],[id=DocSegSocialLabel]').removeClass('invisible');
            $('[id=DocOtrArchivo]').attr('disabled', false);
            $('[id=InfoAnex]').addClass('d-none');
            if((parametroIngreso.PermiteAdjuntos == 0 && parametroIngreso.SolicitaSeguridadSocial == 1) && (validaCrear == 1 || validaEditar == 1)){
                AnexObl = 1;
                PerAnex = 0;
                setTimeout(() => {
                    $('[id=InfoAnex], .verInSolicitud').removeClass('d-none');
                    $('[id=DocOtrArchivo],[id=DocOtrArchivoLabel]').addClass('invisible');
                    $('[id=DocSegSocial]').attr('disabled', false);
                    $("[id=DocSegSocial]").click();
                    $('[id=DocSegSocial]').attr('disabled', true);
                }, 100);
            }else{
                AnexObl = 0;
                PerAnex = 0;
                $('[id=DocOtrArchivo],[id=DocOtrArchivoLabel]').removeClass('invisible');
                $('[id=DocSegSocial]').attr('disabled', false);
                $('[id=InfoAnex]').addClass('d-none');
            }
        }
    }
    if((parametroIngreso.PermiteAdjuntos == 1 || parametroIngreso.SolicitaSeguridadSocial == 1) && (validaEditar == 1 && ValidaCrear == 0)){
        cargarTablasAdd(true, true);
    }else if((parametroIngreso.PermiteAdjuntos == 0 || parametroIngreso.SolicitaSeguridadSocial == 0) && (validaEditar == 1 && ValidaCrear == 0)){
        cargarTablasAdd(false, true);
    }else if(((parametroIngreso.PermiteAdjuntos == 1 && parametroIngreso.SolicitaSeguridadSocial == 0) || (parametroIngreso.PermiteAdjuntos == 0 && parametroIngreso.SolicitaSeguridadSocial == 1) || (parametroIngreso.PermiteAdjuntos == 1 && parametroIngreso.SolicitaSeguridadSocial == 1)) && ValidaCrear == 1){
        cargarTablasAdd(true);
    }
   
}

function modificarEstadosolicitud(SolicitudId, autorizar, TipoIngresoId){
    alertify.confirm('Advertencia', `¿Está seguro de  ${autorizar == 1 ? 'Autorizar' : 'Rechazar'}  la solicitud ${SolicitudId} ?
        <div class="col-12 mt-3 pl-0 pr-0">
            <textarea id="comentarioAuto" class="form-control form-control-sm form-control-floating" rows="5"
                value="" maxlength="255" data-db="comentarioAuto" style="overflow-y:hidden;"></textarea>
            <label class="floating-label" for="comentarioAuto">Observación</label>
        </div>`
    , function(){
        comentarioAut = $('#comentarioAuto').val();
        dependenciasAut = $('#dependenciaAuto').val();
        $.ajax({
            url: rutaGeneral + "modificarEstadosolicitud",
            type: 'POST',
            dataType: 'json',
            data: {
                SolicitudId, autorizar, TipoIngresoId, comentarioAut, dependenciasAut
            },
            success: function(registro){
                if(registro == 1){
                    alertify.success(`Solicitud ${autorizar == 1 ? 'Autorizada' : 'Rechazada'} correctamente.`);
                    tblAutorizaciones.ajax.reload();
                    $("#RegistroSolicitudIngresoMod").modal("hide");
                    $('#RegistroSolicitudIngresoMod').removeClass('d-none');
                }else{
                    alertify.error("Por favor adjunte una seguridad social valida para la autorización.");
                    $('#RegistroSolicitudIngresoMod').removeClass('d-none');
                }
            }
        });
    }, function(){
        $('#RegistroSolicitudIngresoMod').removeClass('d-none');
    });
}

function cargarTablasAdd(tablaNexo, tablaComen, tablaNexo2){
    if(tablaNexo){
        if(tblAnexos){
            tblAnexos.columns().clear();
            tblAnexos.destroy();
            tblAnexos = null;
        }
        tblAnexos = $('[id=tblAnexos]').DataTable({
            scrollX: '100%',
            scrollCollapse: false,
            serverSide: true,
            retrieve:true,
            pageLength: 10,
            language: {
                infoEmpty: ""
            },
            buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
            paginate: true,
            ajax: {
                url: rutaGeneral + "DTAnexos",
                type: 'POST',
                data: function (d){
                    d.registroSolicitud = SolicituAut !== undefined ? SolicituAut : registroSolicitud;
                }
            },
            columns: [
                { data: "SolicitudId" }, 
                { data: "Nombre" }, 
                { data: "Tipo" }, 
                { data: "FechaInicio"}, 
                { data: "FechaVencimiento" },
                { data: "FechaRegistro" },
                { data: "Ruta",
                    render:function(data, type, row){
                        urlDoc =  data;
                        ver = `
                        <a href="${base_url() + '/uploads/SolicitudIngreso/'+ row['SolicitudId'] + '/' + urlDoc}" target="_blank" class="verAnexo btn btn-info btn-xs" title="Ver" style="transition:0.4s;"><i class="fas fa-eye"></i></a>
                        <button class="eliAnexo btn btn-danger btn-xs " title="Eliminar"><i class="fas fa-prescription-bottle"></i></button>`;
                        return ver;
                    },
                    orderable : false
                }
            ],
            initComplete: function () {
                setTimeout(() => {
                    $(window).trigger('resize'); 
                }, 1000);
                
            },
            drawCallback: function() {
                if(validarvistaDoc){
                    $('.eliAnexo', this).addClass('d-none');
                }
            },
            createdRow: function (row, data, dataIndex) {
                validSS = data['Tipo'];
                if(validSS == 'SEGURIDAD SOCIAL'){
                    CantAnex += 1;
                }
        
            $(row)
            .find('td:eq(6)')
            .addClass('text-center')
            .on("click", ".eliAnexo", function(e){
                e.preventDefault();
                    //DESABILITAMOS ANEXO
                    alertify.confirm('Advertencia', '¿Está seguro de eliminar el documento?', function(){
                        $.ajax({
                            type: "POST",
                            url: rutaGeneral + "eliminarAnexo",
                            data: {
                                Id : data.Id,
                            },
                            dataType: "json",
                            success: function(resp){
                                tblAnexos.columns.adjust().draw();
                            }
                        });
                    }, function(){});
            })
            },
        });
    }
       
    if(tablaComen){
        if(tblcomentarios){
            tblcomentarios.columns().clear();
            tblcomentarios.destroy();
            tblcomentarios = null;
        }
        tblcomentarios = $('[id=tblComentarios]').DataTable({
            scrollX: '100%',
            scrollCollapse: false,
            serverSide: true,
            retrieve:true,
            pageLength: 10,
            language: {
                infoEmpty: ""
            },
            buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
            paginate: true,
            ajax: {
                url: rutaGeneral + "DTcomentarios",
                type: 'POST',
                data: function (d){
                    d.registroSolicitud = SolicituAut !== undefined ? SolicituAut : registroSolicitud;
                }
            },
            columns: [
                { data: "SolicitudId" }, 
                { data: "FechaRegistro" }, 
                { data: "nombre" }, 
                { data: "Comentario"}, 
                { data: "Autorizo"},
            ],
            initComplete: function (row, data, dataIndex) {
                setTimeout(() => {
                    $(window).trigger('resize'); 
                }, 1000);
            },
        });
    }

    if(tablaNexo2){
        if(tblAnexos2){
            tblAnexos2.columns().clear();
            tblAnexos2.destroy();
            tblAnexos2 = null;
        }
        tblAnexos2 = $('[id=tblAnexos2]').DataTable({
            scrollX: '100%',
            scrollCollapse: false,
            serverSide: true,
            retrieve:true,
            pageLength: 10,
            language: {
                infoEmpty: ""
            },
            paginate: true,
            ajax: {
                url: rutaGeneral + "DTAnexos",
                type: 'POST',
                data: function (d){
                    d.registroSolicitud = SolicituAut !== undefined ? SolicituAut : registroSolicitud;
                }
            },
            buttons: buttonsDT(['copy', 'excel', 'pdf', 'print', 'pageLength']),
            columns: [
                { data: "SolicitudId" }, 
                { data: "Nombre" }, 
                { data: "Tipo" }, 
                { data: "FechaInicio"}, 
                { data: "FechaVencimiento" },
                { data: "FechaRegistro" },
                { data: "Ruta",
                    className : 'text-center',
                    render:function(data, type, row){
                        urlDoc =  data;
                        ver = `
                        <a href="${base_url() + '/uploads/SolicitudIngreso/'+ row['SolicitudId'] + '/' + urlDoc}" target="_blank" class="verAnexo btn btn-info btn-xs " title="Ver" style="transition:0.4s;"><i class="fas fa-eye"></i></a>`;
                        return ver;
                    },
                    orderable : false
                }
            ],
            initComplete: function () {
                setTimeout(() => {
                    $(window).trigger('resize'); 
                }, 1000);
                
            },
        });  
    }

}

function soloLetrasNumeros(e){
    key = e.keyCode || e.which;
    tecla = String.fromCharCode(key).toLowerCase();
    letras = "abcdefghijklmnopqrstuvwxyz1234567890+-*/";
    especiales = "8-37-39-46";

    tecla_especial = false;
    
    for (var i in especiales) {
        if (key == especiales[i]) {
            tecla_especial = true;
            break;
        }
    }

    if (letras.indexOf(tecla)==-1 && !tecla_especial) {
        return false;
    }
}

//Funcion del lector
function propForm(prop){
	$("button, select").prop("disabled",prop);
	$("input, a, textarea").not("#codigo, #checkLector").prop("readonly",prop);
	setTimeout(function(){ $(inputChecked).focus()},0);
}

function inputBlur(){
    clearTimeout(timing);
    if ($(inputChecked).val().trim().length >= minChars){
        userFinishedEntering = true;
        inputComplete();
    }
};

function resetValues() {
    barra = [];
    textoBarra = '';
    scanner = false;

    inputStart = null;
    inputStop = null;
    firstKey = null;
    lastKey = null;
    setTimeout(function(){
        $('#codigo').val('').focus();
    },0);
    inputComplete();
}

function isScannerInput() {
    return ((((inputStop - inputStart) / $(inputChecked).val().trim().length) < 30) && $(inputChecked).val() != '');
}

function isUserFinishedEntering(){
    return !isScannerInput() && userFinishedEntering;
}

function inputTimeoutHandler(){
    // stop listening for a timer event
    clearTimeout(timing);
    // if the value is being entered manually and hasn't finished being entered
    if (!isUserFinishedEntering() || $(inputChecked).val().trim().length < 3) {
        // keep waiting for input
        return;
    }
    else{
        reportValues();
    }
}

function inputComplete(){
    // stop listening for the input to lose focus
    $("body").off("blur", inputChecked, inputBlur);
    // report the results
    reportValues();
}

function reportValues() {
    // update the metrics
    $("#startTime").text(inputStart == null ? "" : inputStart);
    $("#firstKey").text(firstKey == null ? "" : firstKey);
    $("#endTime").text(inputStop == null ? "" : inputStop);
    $("#lastKey").text(lastKey == null ? "" : lastKey);
    $("#totalTime").text(inputStart == null ? "" : (inputStop - inputStart) + " milliseconds");
    if (!inputStart) {
        // clear the results
        setTimeout(function(){
        	$(inputChecked).focus().select();
        },3000);
    } else {
        // prepend another result item
        var inputMethod = isScannerInput() ? "Scanner" : "Keyboard";
        if(isScannerInput()){
        	scanner = true;
        	if(barra.length == 0){
				barra.push(textoBarra.trim());
				textoBarra = '';
        	}
        }
        setTimeout(function(){
        	$(inputChecked).focus().select();
        },0);
        inputStart = null;
    }
}
 
setInterval(function(){
	barra = [];
	textoBarra = '';
	scanner = false;

	inputStart = null;
	inputStop = null;
	firstKey = null;
	lastKey = null;
}, 2000);