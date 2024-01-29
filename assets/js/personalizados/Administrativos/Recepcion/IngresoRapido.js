let rutaGeneral = 'Administrativos/Recepcion/Ingreso/';
//vARIABLES DEL LECTOR
var barra 	= [],
textoBarra 	= '',
scanner 	= true,
limiteIngresos = false,
RegistroId 	= null,
inputChecked = "#codigo";

var inputStart, inputStop, firstKey, lastKey, timing, userFinishedEntering;
var minChars = 2;

$(function(){
	RastreoIngresoModulo('Ingreso Rapido');
    if($DATOSALMACEN == '' || $DATOSALMACEN == null){
        alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>Su usuario no tiene ningún almacén asociado y/o se encuentra inactivo.</h3>", function(){
            window.location.href = base_url();
        });
    }

    if($DATOSSEDE == '' || $DATOSSEDE == null){
        alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>El almacén asociado no tienen una sede vinculada y/o se encuentra inactiva.</h3>", function(){
            window.location.href = base_url();
        });
    }

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

    $("#formBuscar").submit(function(e){
        e.preventDefault();
        if ($(this).valid()) {
			let datos = new FormData(this);
			datos.set('validaLector', $("#checkLector").is(':checked'));
            datos.set('moduloLector', 'Ingreso rápido');
            datos.set('limiteIngresos', limiteIngresos);
            $.ajax({
                url: base_url() + rutaGeneral + 'ingresoRapido',
                type: 'POST',
                data: datos,
                dataType: 'json',
                processData: false,
                contentType: false,
                cache: false,
                success: (resp) => {
                    limiteIngresos = false;
                    if (resp.socio != ''){
                        let socio = resp.socio;
                        if (socio.foto == null) {
                            $(".img-persona").attr("src", base_url() + 'assets/images/user/nofoto.png');
                        } else {
                            $(".img-persona").attr("src", 'data:image/jpeg;base64,' + socio.foto);
                        }
                        $("#observacion").addClass("d-none").find("textarea").val('');

                        if (resp.ingresoEspecial) {
                            $("#nroAccionEspecial").val(socio.AccionId);
                            $("#documentoEspecial").val(socio.TerceroId);
                            $("#nombreEspecial").val(socio.nombre);
                            $("#tipoIngresoEspecial").val(socio.TipoIngresoEspecial);
                            $("#diasIngresoEspecial").val(socio.conteoFechas);
                            $("#nombreTitularEspecial").val(socio.TitularNombre);
                            $("#vacunaEspecial").val(socio.CarnetVacunacion == 'S' ? 'Si' : 'No');
                            $(".socio").addClass("d-none");
                            $(".ingresoEspecial").removeClass("d-none");
                            if(socio.CarnetVacunacion == 'S' && socio.URLCarnetCovid != null && socio.URLCarnetCovid.length > 0){
                                $("#carnetVacunaEspecial").attr("href", socio.URLCarnetCovid).closest(".form-group").removeClass("d-none");
                            } else {
                                $("#carnetVacunaEspecial").attr("href", "#").closest(".form-group").addClass("d-none");
                            }

                        } else {
                        
                            if (socio.AccionCanjeId){
                                $("#nroAccion").val(socio.AccionCanjeId);
                                $("#nombreClub").val(socio.NombreClub).closest("div.form-group").removeClass("d-none");
                                $("#diasIngreso, #diasIngresoPendientes").val('').closest("div.form-group").addClass("d-none");
                                $("#diasRestantes").val(socio.DiasRestantes).closest("div.form-group").removeClass("d-none");
                            } else {
                                $("#nombreClub").val('').closest("div.form-group").addClass("d-none");
                                $("#diasIngreso").val(socio.conteoFechas).closest("div.form-group").removeClass("d-none");
                                $("#diasIngresoPendientes").val(socio.IngresosAnio == 0 ? 'N/A' : ((socio.IngresosAnio - socio.conteoFechaSistema) < 0 ? '0' : (socio.IngresosAnio - socio.conteoFechaSistema))).closest("div.form-group").removeClass("d-none");
                                $("#diasRestantes").val('').closest("div.form-group").addClass("d-none");
                                $("#nroAccion").val(socio.Accionid);
                                //Se realiza validación si se tiene una reserva
                                if(socio.Reserva && socio.Reserva != null && socio.Reserva != ''){
                                    $("#nroAccion").closest("div.form-group").addClass("d-none");
                                    $("#nroReserva").val(socio.Reserva).closest("div.form-group").removeClass("d-none");
                                    $("#diasIngreso, #diasIngresoPendientes").closest("div.form-group").addClass("d-none");
                                } else {
                                    $("#nroAccion").closest("div.form-group").removeClass("d-none");
                                    $("#nroReserva").closest("div.form-group").addClass("d-none");
                                    $("#diasIngreso, #diasIngresoPendientes").closest("div.form-group").removeClass("d-none");
                                }
                            }

                            $("#documento").val(socio.TerceroId);
                            $("#nombre").val(socio.nombre);
                            $("#estado").val(socio.EstadoSocio);
                            $("#tipoCliente").val(socio.TipoSocio);
                            $("#vacuna").val(socio.CarnetVacunacion == 'S' ? 'Si' : 'No');
                            if (socio.Tipo == 'T'){
                                $("#observacion").removeClass("d-none").find("textarea").val(socio.Observacion);
                            }
                            if(socio.CarnetVacunacion == 'S' && socio.URLCarnetCovid != null && socio.URLCarnetCovid.length > 0){
                                $("#carnetVacuna").attr("href", socio.URLCarnetCovid).closest(".form-group").removeClass("d-none");
                            } else {
                                $("#carnetVacuna").attr("href", "#").closest(".form-group").addClass("d-none");
                            }

                            $(".ingresoEspecial").addClass("d-none");
                            $(".socio").removeClass("d-none");
                        }
                        $("#mensaje").html(resp.msj).removeClass("alert-success").addClass("alert-warning").closest("div.col-12").removeClass("d-none");
                    } else {
                        $(".img-persona").attr("src", base_url() + 'assets/images/user/nofoto.png');
                        $("#nroAccion, #documento, #nombre, #estado, #tipoCliente, #diasIngreso, #diasIngresoPendientes, #nroAccionEspecial, #documentoEspecial, #nombreEspecial, #tipoIngresoEspecial, #diasIngresoEspecial, #nombreTitularEspecial, #nombreClub, #diasRestantes").val('');
                        $(".ingresoEspecial").addClass("d-none");
                        $(".socio").removeClass("d-none");
                        $("#nombreClub, #diasRestantes").closest("div.form-group").addClass("d-none");
                        $("#mensaje").html('').closest("div.col-12").addClass("d-none");
                    }

                    if (resp.success) {
                        alertify.success(resp.msj);
                        $("#mensaje").html(resp.msj).removeClass("alert-warning").addClass("alert-success");
                        $("#cardSocio").removeClass("border border-danger").addClass("border border-success");
                        setTimeout(() => {
                            $("#codigo").val('').focus();
                        }, 500);
                    } else {
                        $("#cardSocio").removeClass("border border-success").addClass("border border-danger");
                        if (resp.validaCarnet) {
                            let socio = resp.socio;
                            let foto = socio.foto == null ? base_url() + 'assets/images/user/nofoto.png' : 'data:image/jpeg;base64,' + socio.foto;
                            alertify.confirm('Advertencia', `<div class='row'>
                                        <div class='col-4'>
                                            <div class="rounded bg-light w-100 text-center">
                                                <img class="img-persona rounded" src="${foto}" alt="">
                                            </div>
                                        </div>
                                        <div class='col-8'>
                                            <h5><b>Nro Acción: </b> <span class="font-weight-light">${socio.AccionId}</span></h5>
                                            <h5><b>Documento: </b> <span class="font-weight-light">${socio.TerceroId}</span></h5>
                                            <h5><b>Nombre: </b> <span class="font-weight-light">${socio.nombre}</span></h5>
                                            <hr>
                                            <h4 class='mensaje-alerta alert-warning p-3 rounded'>El tercero no tiene registrado el carnet de vacunación, para ingresar debe tenerlo. <br> ¿Quiere actualizar el registro?</h3>
                                        </div>
                                    </div>`, function(){
                                $.ajax({
                                    url: base_url() + rutaGeneral + "actualizarTercero",
                                    dataType: 'json',
                                    type: 'POST',
                                    data: {
                                        cliente: socio.TerceroId,
                                        nombre: "CarnetVacunacion",
                                        value: 'S',
                                        tabla: 'Tercero',
                                        RASTREO: RASTREO(`Actualiza registro de vacunación del tercero [TerceroID: ${socio.TerceroId}]`, 'Ingreso Rapido Club')
                                    },
                                    success: function(res){
                                       if (res) {
                                            $("#codigo").val(socio.TerceroId);
                                            $("#formBuscar").submit();   
                                            alertify.success("Carnet de vacunación registrado correctamente.");
                                       } else{
                                           alertify.error("Error al actualizar el registro");
                                       }
                                    }
                                });
                            },function(){
                                setTimeout(() => {
                                    $("#codigo").val('').focus();
                                }, 500);
                            });
                        } else if (resp.limiteYear) {
                            alertify.confirm('¡Alerta!', "<h3>" + resp.msj + " ¿Está seguro de realizar el ingreso?</h3>", function(){
                                limiteIngresos = true;
                                $("#formBuscar").submit();
                            }, function(){}).set('labels', { ok: `Si`, cancel: `No` });
                        }else {
                            alertify.alert('¡Alerta!', "<h3>" + resp.msj + "</h3>", function(){
                                setTimeout(() => {
                                    $("#codigo").val('').focus();
                                }, 500);
                            })
                        }
                    }
                }
            });
        }
    });

    $("#bntLimpiar").on("click", function(){
        $("#cardSocio").removeClass("border border-success border-danger");
        $(".img-persona").attr("src", base_url() + 'assets/images/user/nofoto.png');
        $("#nroAccion, #documento, #nombre, #estado, #tipoCliente, #mensaje").val('');
        $("#mensaje").html('').removeClass("alert-success alert-warning").closest("div.col-12").addClass("d-none");
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