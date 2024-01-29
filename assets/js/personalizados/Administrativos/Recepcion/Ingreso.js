let rutaGeneral = base_url() + 'Administrativos/Recepcion/Ingreso/';
let usuariosRegistrar = [];
let socios = [];
let invitadosDia = 0;
let invitadosMes = 0;
let contInvitados = 0;
let busqueda = false;
let busquedaClick = false;
let $CREAR = 0;
let MODIFICAR = 0;
let socioIngresoEspecial = [];
let conteoFechasInvitado = 0;
let ingresoModal = false;
let ultimaPlacaBuscada = '';
var formularioDatos = sessionStorage.getItem('frmRegistroClientes');

let dataAjax = {
	cliente: ''
};
var $ID = '';
let $IDbarra = '';
let lastFocus = '';
let lastID = '';
let INGRESOMESINVITADOS = 0;
let validarLectorTercero = false;
let validarVacuna = false;


//vARIABLES DEL LECTOR
var barra 	= [],
textoBarra 	= '',
scanner 	= true,
RegistroId 	= null,
inputChecked = "#codigo",
arrUser = [];

var inputStart, inputStop, firstKey, lastKey, timing, userFinishedEntering;
var minChars = 2;

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

var dtContactos = $('#tblContactos').DataTable({
	language,
	dom: domftrip,
	processing: true,
	ajax: {
		url: rutaGeneral + 'qContactos',
		type: 'POST',
		data: function(d){
			return  $.extend(d, dataAjax);
		}
	},
	columns: [
		{data: 'contactoid'},
		{data: 'nombre'},
		{data: 'cargo'},
		{data: 'dependencia', visible: false},
		{data: 'fechanacim', visible: false},
		{data: 'email', visible: false},
		{data: 'telefono', visible: false},
		{data: 'celular', visible: false},
		{data: 'GestionCartera', visible: false}
	],
	createdRow: function(row, data, dataIndex){
		$(row).click(function(){
			cargarCRUD(row, data.contactoid);
		});
	}
});

function listaPlacasAsociadas(disabledSearch = false){
	alertify.ajaxAlert = function(url){
		$.ajax({
			url: url,
			async: false,
			success: function(data){
				alertify.myAlert().set({
					onclose:function(){
						busqueda = false;
						alertify.myAlert().set({onshow:null});
						$(".ajs-modal").unbind();
						delete alertify.ajaxAlert;
						$("#tblBusqueda").unbind().remove();
					},onshow:function(){
						busqueda = true;
						alertify.myAlert().set('resizable', true).resizeTo('90%', '100%');
					}
				});

				alertify.myAlert(data);

				var $tblID = '#tblBusqueda';
				dtSS({
					data:{
						tblID : $tblID,
					},
					bAutoWidth: false,
					columnDefs: [
						{targets: [0], width: '1%'},
					],
					ajax: {
						url: rutaGeneral + "DTBuscarSocioPlaca",
						type: "POST"
					},
					ordering: false,
					draw: 10,
					pageLength: 10,
					initComplete: function(){
						setTimeout(function(){
							$('div.dataTables_filter input').focus();
						},500);
						$('div.dataTables_filter input').unbind().change(function(e){
							e.preventDefault();
							table = $("body").find($tblID).dataTable();
							table.fnFilter( this.value );
						});

						$('div.dataTables_filter input').prop("disabled", disabledSearch);
					},
					oSearch: { sSearch: ultimaPlacaBuscada },
					createdRow: function(row,data,dataIndex){
						$(row).click(function(){
							$("#formPlaca input[name='tercero']").val(data[0]);
							$("#codigo").val(data[0]);
							$("#placa").val(data[2]);
							$("#formBuscar").submit();
							alertify.myAlert().close();
						});
					},
					scrollY: screen.height - 400,
					scroller: {
						loadingIndicator: false
					},
					dom: domftri
				});

			}
		});
	}
	var campos = encodeURIComponent(JSON.stringify(['Código', 'Nombre', 'Placa', 'Acción']));
	alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
}

$(function(){
	sessionStorage.clear();
	RastreoIngresoModulo('Ingreso');
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

	//Permisos
	$("[data-codigo]").focusin().change();
	$('[data-permiso]').each(function(){
		
		switch ($(this).attr('data-permiso')) {
			case '0':
			break;
			case '60':
			case '55':
			case '71':
			case '95':
				if ( ($(this).is(':button')) && ($(this).hasClass('btnAgregar')) && ( ! $TERCCrear.includes(parseInt($(this).attr('data-permiso')))) ){
					$(this).attr('disabled', true).attr('data-deshabilitado', '1');
				}else if ( ($(this).is(':button')) && ($(this).hasClass('btnEliminar')) && ( ! $TERCElimi.includes(parseInt($(this).attr('data-permiso')))) ){
					$(this).attr('disabled', true).attr('data-deshabilitado', '1');
				}
			break;
			case '55':
				if ( ($(this).is(':button')) && ($(this).hasClass('btnAgregar')) && ( ! $TERCCrear.includes(parseInt($(this).attr('data-permiso')))) ){
					$(this).attr('disabled', true).attr('data-deshabilitado', '1');
				}else if ( ($(this).is(':button')) && ($(this).hasClass('btnEliminar')) && ( ! $TERCModif.includes(parseInt($(this).attr('data-permiso')))) ){
					$(this).attr('disabled', true).attr('data-deshabilitado', '1');
				}
			break;
			case '86':
				$(this).attr('disabled', false).attr('data-deshabilitado', '0').attr('readonly', false);
			break;
			case '56':
				if (!$TERCModif.includes(parseInt($(this).attr('data-permiso')))){
					$(this).attr('disabled', true).attr('data-deshabilitado', '1');
				}
			break;
			default:
				if ( (! $(this).is(':button')) && ( ! $TERCModif.includes(parseInt($(this).attr('data-permiso')))) ){
					$(this).attr('disabled', true).attr('data-deshabilitado', '1');
				} 
			break;
		}
	});

	$(document).on('click', '.col-form-label-md', function(){
		var self = this;
		setTimeout(function(){
			$(self).next().find('input, select, textarea').focus();
		},0);
	});

	$('[readonly]').each(function(){
		$(this).attr('disabled', true);
	});
	
	$('input[data-db]:not([data-codigo]), input[data-crud], textarea[data-db]').attr('readonly', true);
	$('select[data-db]:not([data-codigo]), select[data-crud], .btnEliminar, input[type=file]:not(#adj), #btnFoto').attr('disabled', true);

	$("#frmRegistroClientes").on("focusin", "[data-db], [data-crud]", function(){
		lastFocus = $(this).val();
		if(lastFocus == null){
			lastFocus = '';
		}
	});
	
	$('#frmRegistroClientes').submit(function(e){
		e.preventDefault();
	});

	$("[data-codigo]").on("keypress", function(e){
		if(e.which == 13){
			e.preventDefault();
			$(this).change();
		}
	});

	
//-------------------------------------------------------------------------------------------------------------------

	$("#frmRegistroClientes").on("change", "[data-codigo]", function(){
		$ID = $("[data-codigo]").val().trim();
		$ID = $ID.replace(/[-/]/g, '');
		lastID = $ID.trim();
		conteoFechasInvitado = 0;
		if(($ID.length <= 4) || (!$("#checkLectorTercero").is(":checked") && $ID.length > 30)){
			$("#checkLectorTercero").prop("disabled", true);
			$('#btnGuardarClientes').prop("disabled", true);
			alertify.error('El numero de documento es invalido');
		}else {
			dataAjax.cliente = $ID.trim();
			dtContactos.ajax.reload();
			$("#checkLectorTercero").prop("disabled", false);
			$('#btnGuardarClientes').prop("disabled", false);
			$("#frmRegistroClientes").trigger("reset");
			$("#TerceroID").val(lastID);
			$('.img-perfil').attr("src", base_url() + "assets/images/user/nofoto.png");
			$('input[data-db]:not([data-codigo]), input[data-crud], textarea[data-db]').attr('readonly', false);
			$('select[data-db]:not([data-codigo]), select[data-crud], .btnEliminar, input[type=file]:not(#adj), .btnAgregar, .btnEliminar, #btnEliminarCliente,[data-db]input[type=checkbox]:not(.noBloquear),[data-crud]input[type=checkbox], #btnFoto').attr('disabled', true);
			$('span[data-db]').text('').attr('title', '');
			
			if (MODIFICAR == 1 || !usuariosRegistrar.find(element => element == $ID)) {
				if($ID != '' && $ID.length > 0){
					$.ajax({
						url: rutaGeneral + "cargarTercero",
						type: 'POST',
						dataType: 'json',
						data: {
							SedeId: $DATOSSEDE.SedeId,
							ingresoModal: 0,
							codigo: $ID,
							validaLector: validarLectorTercero,
							RASTREO: RASTREO('Carga Cliente '+$ID, 'Terceros')
						},
						success: function(registro){
							if(registro.length > 0) {
								if ($("#checkLectorTercero").is(":checked")) {
									$("#checkLectorTercero").click();
								}
								if (registro[0].estado == 'A' || MODIFICAR == 1) {
									if (registro[0].Ingreso == null || MODIFICAR == 1) {
										if (registro[0].Accionid == null || MODIFICAR == 1) {
											if (registro[0].Baloteado == 0 || MODIFICAR == 1) {
												if (registro[0].SolicitaCarnetVacunacion == 'S') {
													if((registro[0].ingresosMes >= 1 && registro[0].contTipoinvitado == 0) || registro[0].contTipoinvitado > 0 || MODIFICAR == 1){
														$IDbarra = registro[0].barra;
														for(var key in registro[0]) {
															if(registro[0][key] != null){
																var value = registro[0][key];
																$("[data-db="+key+"]").val(value);
																$("span[data-db="+key+"]").text(value).attr('title', value);
																if($("[data-db="+key+"]").is('input[type=checkbox]')){
																	if (value == 1) {
																		$("[data-db="+key+"]").prop('checked', true);
																	} else {
																		$("[data-db="+key+"]").prop('checked', false);
																	}
																}
															}
														}


														validadInputRequerido(registro[0]["tipodocuid"]);

														if(registro[0]["foto"] !== "" && registro[0]["foto"] !== null){
															$('[data-imagen=foto]').closest('.imagen-container').find(".img-perfil").attr("src", "data:image/jpeg;base64," + registro[0]['foto']);
														}else{
															$('[data-imagen=foto]').closest('.imagen-container').find(".img-perfil").attr("src", base_url() + "assets/images/user/nofoto.png");
														}
						
														$('select[data-db]:not([data-codigo]), select[data-crud-codigo], [data-imagen=foto], input[type=checkbox]:not([disabled]), .btnAgregar, #btnEliminarCliente,[data-db]input[type=checkbox]:not(.noBloquear), #btnFoto').attr('disabled', false);
														$('input[data-db]:not([data-codigo]), input[data-crud-codigo], textarea[data-db]').attr('readonly', false);
														$('[data-deshabilitado=1]').each(function(){
															$(this).attr('disabled', true);
														});

														$("#vacunaCovidInvitado").val(registro[0].CarnetVacunacion == 'S' ? 'Si' : 'No');

														if(registro[0].CarnetVacunacion == 'S' && registro[0].URLCarnetCovid != null && registro[0].URLCarnetCovid.length > 0){
															$("#carnetVacunaInvitado").attr("href", registro[0].URLCarnetCovid).closest(".form-group").removeClass("d-none");
														} else {
															$("#carnetVacunaInvitado").attr("href", "#").closest(".form-group").addClass("d-none");
														}

														INGRESOMESINVITADOS = registro[0].ingresosMes;
														conteoFechasInvitado = registro[0]["conteoFechas"]
														$CREAR = 0;
														//var event = new Event('editar');
													} else {
														alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>El invitado <b>" + registro[0].TerceroID.trim() + "</b> ha superado el límite de ingresos permitido por mes.</h3>", function(){
															setTimeout(() => {
																$("[data-codigo]").focus();
															}, 500);
														});
														$ID = ''; 
													}
												} else {
													let tercero = registro[0];
													let fotico = tercero.foto == null ? base_url() + "assets/images/user/nofoto.png" : 'data:image/jpeg;base64,' + tercero.foto; 
													alertify.confirm('Advertencia', `<div class='row'>
															<div class='col-4'>
																<div class="rounded bg-light w-100 text-center">
																	<img class="img-persona rounded" src="${fotico}" alt="">
																</div>
															</div>
															<div class='col-8'
																<h5><b>Documento: </b> <span class="font-weight-light">${tercero.TerceroID}</span></h5>
																<h5><b>Nombre: </b> <span class="font-weight-light">${tercero.nombre}</span></h5>
																<hr>
																<h4 class='mensaje-alerta alert-warning p-3 rounded'>El tercero no tiene registrado el carnet de vacunación, para ingresar debe tenerlo. <br> ¿Quiere actualizar el registro?</h4>
															</div>
														</div>`, function(){
														$.ajax({
															url: rutaGeneral + "actualizarTercero",
															dataType: 'json',
															type: 'POST',
															data: {
																cliente: tercero.TerceroID,
																nombre: "CarnetVacunacion",
																value: 'S',
																tabla: 'Tercero',
																RASTREO: RASTREO(`Actualiza registro de vacunación del tercero [TerceroID: ${tercero.TerceroID}]`, 'Ingreso Club')
															},
															success: function(res){
															if (res) {
																	$("[data-codigo]").val(tercero.TerceroID).change();
																	alertify.success("Carnet de vacunación registrado correctamente.");
															} else{
																alertify.error("Error al actualizar el registro");
															}
															}
														});
													},function(){
														setTimeout(() => {
															$("[data-codigo]").focus();
														}, 500);
														$ID = '';
													});  
												}
											} else {
												alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>La persona se encuentra bloqueado por la junta directiva, no se permite su ingreso.</h3>", function(){
													setTimeout(() => {
														$("[data-codigo]").focus();
													}, 500);
												});
												$ID = '';
											}
										} else {
											let elSocio = registro[0].validSocio;

											let fotico = elSocio.socio.foto == null ? base_url() + "assets/images/user/nofoto.png" : 'data:image/jpeg;base64,' + elSocio.socio.foto; 
											alertify.alert('¡Alerta!',  `<div class='row'>
																			<div class='col-4'>
																				<div class="rounded bg-light w-100 text-center">
																					<img class="img-persona rounded" src="${fotico}" alt="">
																				</div>
																			</div>
																			<div class='col-8'>
																				<h5><b>Nro Acción: </b> <span class="font-weight-light">${elSocio.socio.AccionId}</span></h5>
																				<h5><b>Documento: </b> <span class="font-weight-light">${elSocio.socio.TerceroId}</span></h5>
																				<h5><b>Nombre: </b> <span class="font-weight-light">${elSocio.socio.nombre}</span></h5>
																				<hr>
																				<h4 class='mensaje-alerta alert-danger p-3 rounded'>${elSocio.msj}</h4>
																			</div>
																		</div>`, 
											function(){
												setTimeout(() => {
													$("[data-codigo]").focus();
												}, 500);
											});
											$ID = '';
										}
									} else {
										alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>El invitado <b> " + registro[0].nombre.trim() + " </b> ya figura con ingreso: <br> Ingresó: <b> " + moment(registro[0].Ingreso, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A") + "</h3>", function(){
											setTimeout(() => {
												$("[data-codigo]").focus();
											}, 500);
										});
										$ID = '';
									}
								} else {
									alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>La persona no está activo...</h3>", function(){
										setTimeout(() => {
											$("[data-codigo]").focus();
										}, 500);
									});
									$ID = '';
								}
									
							}else{
								if ($TERCCrear.includes(parseInt(0))) {
									$("#modalConsultarCrear").modal("show");
								} else {
									$("#btnBuscar").click();
								}
							}
							lastFocus = $(':focus').val();
							//document.dispatchEvent(event);
						}
					});
				}else{
					if($('[data-codigo]').val() != ''){
						$('[data-codigo]').val($ID);
					}
				}
			} else {
				alertify.warning("El invitado ya se encuentra agregado.");
				$ID = '';
			}
			if ($ID != '') {
				$('#btnGuardarClientes').removeAttr('disabled')
				$('#btnModalTercerosModal').removeAttr('disabled')
			}

			validarLectorTercero = false;
		}
	});

	$("#frmRegistroClientes").on("focusout keydown", "[data-db]:not([data-codigo], input[type=checkbox])", function(e){
		if ($CREAR == 1){ $ID=Object.values(formularioDatos)[0]};
		if(e.type === 'focusout' || e.type === 'keydown' && e.keyCode === 13 || e.type === 'keydown' && e.keyCode === 9){
			//validacion para cuando se cambia de input y que guarde los datos en la sessionStore para que no guarde datos sin requerimiento
			var inputs = document.querySelectorAll('#frmRegistroClientes input');
			if (e.keyCode === 13 || e.keyCode === 9 || e.target !== inputs ) {
				let value=$('[data-db="tipodocuid"]').val();

				if (value == '31') {
					$('[data-db="nombre"]').val($('[data-db="razonsocia"]').val());
				}else if ($('[data-db="nombruno"]').val() || $('[data-db="nombrdos"]').val() || $('[data-db="apelluno"]').val() || $('[data-db="apelldos"]').val()) {
					$('[data-db="nombre"]').val($('[data-db="nombruno"]').val() + ' ' + $('[data-db="nombrdos"]').val() + ' ' + $('[data-db="apelluno"]').val() + ' ' + $('[data-db="apelldos"]').val());
				}
				if (MODIFICAR ==0 && $CREAR == 1) {
					inputs.forEach(function(input){
						input.addEventListener('change',function(){
							validadInputRequerido(value);							
							guardarValor(this);
						});
					});
					formularioDatos['nombre'] = $('[data-db="nombre"]').val();
					sessionStorage.setItem('frmRegistroClientes',JSON.stringify(formularioDatos));	
				}
			}
			if($(this).attr('required') && $(this).val() == ''){
				$(this).val(lastFocus);
			}else{
				var value = $(this).val();
				var tabla = $(this).attr('data-foranea');
				if(value != lastFocus){
					var self 	= this;
					if($(self).attr('data-foranea')){
						if(value != ''){
							var antes = lastFocus;
							var nombre = $(self).attr('data-foranea-codigo');
							switch($(self).attr('data-foranea')){	
								case 'TariRete':
									var tblNombre = 'tarireteid';
									if(typeof $(this).attr('data-tarireteid') !== 'undefined' && $(this).attr('data-tarireteid') != ''){
										value = $(this).attr('data-tarireteid');
										nombre = 'tarireteid';
									}
								break;
								default:
									var tblNombre = 'nombre';
								break;
							}
							$.ajax({
								url: rutaGeneral + "CargarForanea",
								type: 'POST',
								data: {
									tabla : tabla,
									value : value,
									nombre: nombre,
									cliente: $ID,
									tblNombre: tblNombre
								},
								success: function(respuesta){
									if(respuesta == 0){
										switch($(self).attr('data-foranea')){
											case 'TariRete':
												alertify.ajaxAlert = function(url){
													$.ajax({
														url: url,
														async: false,
														success: function(data){
															alertify.myAlert().set({
																onclose:function(){
																	busqueda = false;
																	alertify.myAlert().set({onshow:null});
																	$(".ajs-modal").unbind();
																	delete alertify.ajaxAlert;
																	$("#tblBusqueda").unbind().remove();
																},onshow:function(){
																	lastFocus = antes;
																	busqueda = true;
																}
															});
		
															alertify.myAlert(data);
															
															dtSS({
																data: {
																	tblID: '#tblBusqueda' 
																},
																ajax: {
																	url: rutaGeneral + "DTTarifaRete",
																	type: 'POST',
																	data: function (d) {
																		return $.extend(d, { tabla: $(self).attr('data-foranea') });
																	},
																},
																bAutoWidth: false,
																columnDefs: [
																	{targets: [0], width: '1%'},
																],
																ordering: false,
																draw: 10,
																pageLength: 10,
																oSearch: { sSearch: value },
																createdRow: function(row,data,dataIndex){
																	$(row).click(function(){
																		$(self).val(antes).focusin().val(data[2]).attr('data-tarireteid', data[0]).focusout();
																		alertify.myAlert().close();
																	});
																},
																scrollY: screen.height - 400,
																scroller: {
																	loadingIndicator: true
																},
																dom: domftri
															});
														}
													});
												}
												var campos = encodeURIComponent(JSON.stringify(['ID', 'Descripción', 'Tarifa', 'Base']));
												alertify.ajaxAlert(base_url()+"Busqueda/DataTable?campos="+campos);
											break;
											default:
												alertify.ajaxAlert = function(url){
													$.ajax({
														url: url,
														async: false,
														success: function(data){
															alertify.myAlert().set({
																onclose:function(){
																	busqueda = false;
																	alertify.myAlert().set({onshow:null});
																	$(".ajs-modal").unbind();
																	delete alertify.ajaxAlert;
																	$("#tblBusqueda").unbind().remove();
																},onshow:function(){
																	lastFocus = antes;
																	busqueda = true;
																}
															});
		
															alertify.myAlert(data);
		
															var $tblID = '#tblBusqueda';
															var config = {
																data:{
																	tblID : $tblID,
																	select: [$(self).attr('data-foranea-codigo'), tblNombre],
																	table : [$(self).attr('data-foranea')],
																	column_order : [$(self).attr('data-foranea-codigo'), tblNombre],
																	column_search : [$(self).attr('data-foranea-codigo'), tblNombre],
																	orden : {},
																	columnas : [$(self).attr('data-foranea-codigo'), tblNombre]
																},
																bAutoWidth: false,
																processing: true,
																serverSide: true,
																columnDefs: [
																	{targets: [0], width: '1%'},
																],
																order: [],
																ordering: false,
																draw: 10,
																language,
																pageLength: 10,
																initComplete: function(){
																	setTimeout(function(){
																		$('div.dataTables_filter input').focus();
																		$('.alertify').animate({
																			scrollTop: $('div.dataTables_filter input').offset().top
																		}, 2000);
																	},500);
																	$('div.dataTables_filter input')
																	.unbind()
																	.change(function(e){
																		e.preventDefault();
																		table = $("body").find($tblID).dataTable();
																		table.fnFilter( this.value );
																	});
																},
																oSearch: { sSearch: value },
																createdRow: function(row,data,dataIndex){
																	$(row).click(function(){
																		$(self).val(antes).focusin().val(data[0]).focusout();
																		validadInputRequerido(data[0]);
																		guardarValor(self);
																		alertify.myAlert().close();
																	});
																},
																deferRender: true,
																scrollY: screen.height - 400,
																scroller: {
																	loadingIndicator: true
																},
																dom: 'ftri'
															}
															dtSS(config);
														}
													});
												}
												alertify.ajaxAlert(base_url()+"Busqueda/DataTable");
											break;
										}
									}else{
										lastFocus = antes;
										respuesta = JSON.parse(respuesta);
		
										switch($(self).attr('data-foranea')){
											case 'TariRete':
												$(self).attr('data-tarireteid', '');
												$(self).closest('.input-group').find('.input-group-addon').focusin().val(respuesta[0][tblNombre]);
												actualizar($(self).closest('.input-group').find('.input-group-addon'), lastFocus);
											break;
											default:
												$(self).closest('.input-group').find('span').text(respuesta[0][tblNombre]).attr('title', respuesta[0][tblNombre]);
												actualizar(self, lastFocus);
											break;
										}
										switch($(self).attr('data-db')){
											case 'ciudadid':
												$('[data-db="dptoid"]').focusin().val(respuesta[0]['dptoid']).focusout();
											break;
											case 'ciudacorre':
												$('[data-db="dptocorre"]').focusin().val(respuesta[0]['dptoid']).focusout();
											break;
										}
									}
								}
							});
						}else{
							switch($(self).attr('data-foranea')){
								case 'TariRete':
									$(self).closest('.input-group').find('.input-group-addon').focusin().val('');
									actualizar($(self).closest('.input-group').find('.input-group-addon'), lastFocus);
								break;
								default:
									$(self).closest('.input-group').find('span').text('').attr('title', '');
									actualizar(self, lastFocus);
								break;
							}
						}
					}else{
						actualizar(self, lastFocus);
					}
				}
			}
		}
	});

	$(document).on("change", "[data-db]:not([data-codigo])input[type=checkbox]", function(){
		if($(this).is(':checked')){
			var value = '1',
				lastFocus = '0';
		}else{
			var value = '0',
				lastFocus = '1';
		}
		$(this).val(value);
		$(this).focusout();
		actualizar(this, lastFocus);
	});

	$("#codigo, #codigoLector, #placa").on("keydown", function(e){
		if(!$("#checkLector, #checkLector2").is(":checked")){
			form = $(this).closest("form");
			if(e.which == 13){
				$("#formBuscar input[name='ingresoModal']").val(0);
				form.submit();
				if ($(this).val().length == 0){
					setTimeout(() => {
						$(this).focus();
					}, 350);
				}
			}
		}
	});

	$("#formBuscar").submit(function(e){
		e.preventDefault();
		if ($(this).valid()) {
			let datos = new FormData(this);
			datos.set('validaLector', $("#checkLector").is(':checked'));
			datos.set('moduloLector', 'Ingreso');
			$.ajax({
				url: rutaGeneral + 'validarSocioAccion',
				type: 'POST',
				data: datos,
				dataType: 'json',
				processData: false,
				contentType: false,
				cache: false,
				success: (resp) => {
					validarVacuna = resp.validaCarnet == 'S' ? true : false; 
					usuariosRegistrar = [];
					socios = [];
					invitadosDia = 0;
					invitadosMes = 0;
					contInvitados = 0;
					$("#nroAccion").closest(".input-group").find(".input-group-text").text("Acción");
					$("#cardSocio .img-persona").attr("src", base_url() + "assets/images/user/nofoto.png");
					$("#contenedorBeneficiarios, #contenedorInvitados").empty().append(`<div class='col-12 d-none noDisponible'>
							<div class='alert alert-secondary text-center'>
								<h5 class='mb-0'>No se han encontrado resultados</h5>
							</div>
						</div>`);
					$("#estado, #tipoCliente, #nroAccion, #textIngreso, #placaS, #ingresosS, #btnRegistrar, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #invitadorMes, #buscarBeneficiarios, #buscarInvitados, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub").val('').prop("disabled", true);
					$("#checkLector2").prop("disabled", true);
					$("#cardSocio .card-text").empty();
					$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
					$("#cardSocio").removeClass("bg-danger bg-success bg-c-yellow text-white border").addClass("disabled").data("tercero", '').data('select', '3');
					if(resp.success){
						$("#formBuscar input[name='ingresoModal']").val(0);

						if (resp.ingresoEspecial || resp.ingresoInvitado) {
							socioIngresoEspecial = resp.socio;
							if (resp.validaCarnet == true) {
								let fotico = socioIngresoEspecial.foto == null ? base_url() + "assets/images/user/nofoto.png" : 'data:image/jpeg;base64,' + socioIngresoEspecial.foto; 
								alertify.confirm('Advertencia', `<div class='row'>
										<div class='col-4'>
											<div class="rounded bg-light w-100 text-center">
												<img class="img-persona rounded" src="${fotico}" alt="">
											</div>
										</div>
										<div class='col-8'>
											<h5><b>Nro Acción: </b> <span class="font-weight-light">${socioIngresoEspecial.AccionId || ''}</span></h5>
											<h5><b>Documento: </b> <span class="font-weight-light">${socioIngresoEspecial.TerceroId}</span></h5>
											<h5><b>Nombre: </b> <span class="font-weight-light">${socioIngresoEspecial.nombre}</span></h5>
											<hr>
											<h4 class='mensaje-alerta alert-warning p-3 rounded'>El tercero no tiene registrado el carnet de vacunación, para ingresar debe tenerlo. <br> ¿Quiere actualizar el registro?</h4>
										</div>
									</div>`, function(){
									$.ajax({
										url: rutaGeneral + "actualizarTercero",
										dataType: 'json',
										type: 'POST',
										data: {
											cliente: socioIngresoEspecial.TerceroId,
											nombre: "CarnetVacunacion",
											value: 'S',
											tabla: 'Tercero',
											RASTREO: RASTREO(`Actualiza registro de vacunación del tercero [TerceroID: ${socioIngresoEspecial.TerceroId}]`, 'Ingreso Club')
										},
										success: function(res){
										   if (res) {
												$("#codigo").val(socioIngresoEspecial.TerceroId);
												$("#formBuscar").submit();
												alertify.success("Carnet de vacunación registrado correctamente.");
										   } else{
											   alertify.error("Error al actualizar el registro");
										   }
										}
									});
								},function(){
									setTimeout(() => {
										$("#codigo").focus();
									}, 500);
								});
							} else {
								if (socioIngresoEspecial.foto == null) {
									$("#formIngresoEspecial img").attr("src", base_url() + 'assets/images/user/nofoto.png');
								} else {
									$("#formIngresoEspecial img").attr("src", 'data:image/jpeg;base64,' + socioIngresoEspecial.foto);
								}
								$("#observacionEspecial").addClass("d-none").find("textarea").val('');
								$("#vacunaEspecial").val(socioIngresoEspecial.CarnetVacunacion == 'S' ? 'Si' : 'No');

								if(socioIngresoEspecial.CarnetVacunacion == 'S' && socioIngresoEspecial.URLCarnetCovid != null && socioIngresoEspecial.URLCarnetCovid.length > 0){
									$("#carnetVacunaEspecial").attr("href", socioIngresoEspecial.URLCarnetCovid).closest(".form-group").removeClass("d-none");
								} else {
									$("#carnetVacunaEspecial").attr("href", "#").closest(".form-group").addClass("d-none");
								}
	
								if(resp.ingresoEspecial){
									socioIngresoEspecial.Tipo = 'E';
									$(".modalIngresoEspecialTitulo").text("Especial");
									$("#nroAccionEspecial").val(socioIngresoEspecial.AccionId).closest("div.form-group").removeClass("d-none");
									$("#nombreTitularEspecial").val(socioIngresoEspecial.TitularNombre).closest("div.form-group").removeClass("d-none");
									$("#tipoIngresoEspecial").val(socioIngresoEspecial.TipoIngresoEspecial);
								} else{
									socioIngresoEspecial.Tipo = socioIngresoEspecial.Tipo == 'T' ? 'T' : 'I';
									$(".modalIngresoEspecialTitulo").text("Invitado");
									$("#nroAccionEspecial").val("").closest("div.form-group").addClass("d-none");
									$("#nombreTitularEspecial").val("").closest("div.form-group").addClass("d-none");
									$("#tipoIngresoEspecial").val(socioIngresoEspecial.Tipo == 'T' ? "Invitado Torneo" : "Invitado");
									$("#observacionEspecial").removeClass("d-none").find("textarea").val(socioIngresoEspecial.Observacion);
								}
								
								$("#documentoEspecial").val(socioIngresoEspecial.TerceroId);
								$("#nombreEspecial").val(socioIngresoEspecial.nombre);
								
								$("#diasIngresoEspecial").val(socioIngresoEspecial.conteoFechas);
								
								$("#modalIngresoEspecial").modal("show");
							}
						} else {
							$("#contenedorBeneficiarios, #contenedorInvitados").empty().append(`<div class='col-12 d-none noDisponible'>
									<div class='alert alert-secondary text-center'>
										<h5 class='mb-0'>No se han encontrado resultados</h5>
									</div>
								</div>`);
							$("#codigoLector, #btnLector").val('').prop("disabled", false);
							$("#checkLector2").prop("disabled", false);
							$("#textIngreso").html("Sin ingresar");
							
							$("#invitadorDia").val(resp.invitadosDia === true ? 'N/A' : resp.invitadosDia);
							$("#invitadorMes").val(resp.invitadosMes === true ? 'N/A' : resp.invitadosMes);

							resp.msj.forEach(socio => {
								if (socio.Titular) {
									$("#IngresoCanjeId").val(socio.IngresoCanjeId);
									$("#nombreClub").val(socio.NombreClub);
									$("#codigo").val(socio.TerceroID.trim());
									if(resp.reservaTerceroHotel){
										$("#nroAccion").val(resp.reservaTerceroHotel[0].Reserva).closest(".input-group").find(".input-group-text").text("Reserva");
									} else {
										$("#nroAccion").val(socio.AccionId);
									}

									$("#cardSocio .documento").html(socio.TerceroID).attr("title", socio.TerceroID);
									$("#cardSocio .barras").html("<b>Barra:</b> " + (socio.barra || '')).attr("title", (socio.barra || ''));
									$("#cardSocio .nombre").html(socio.nombre).attr("title", socio.nombre);
									$("#cardSocio .estado").html("<b>Estado:</b> " + (socio.Estado == null ? '' : socio.Estado)).attr("title", socio.Estado);
									$("#cardSocio .tipoCliente").html("<b>Tipo: </b>" + (socio.TipoSocio == null ? '' : socio.TipoSocio)).attr("title", socio.TipoSocio);

									$("#cardSocio").data("tercero", socio.TerceroID.trim()); 
									$("#cardSocio").removeClass("bg-danger bg-c-yellow bg-success text-white disabled border");
									$("#cardsocio").removeClass
									$("#cardSocio").find(".st-icon, .st-icon3").removeClass("d-none");
									$("#cardSocio").data("select", '0');
									$("#cardSocio").find(".btnVacuna").data('terceroid', socio.TerceroID.trim());
									$("#cardSocio").find(".btnVacuna").data('otrobloqueo', false);
									$("#cardSocio").find(".btnVacuna").data('vacunado', socio.CarnetVacunacion == 'S' ? 'S' : 'N');
									$("#cardSocio").find(".btnVacuna").data('url', socio.URLCarnetCovid != null ? socio.URLCarnetCovid : '');

									$("#placaS").val('').prop("disabled", false).next("label").text("Placa");
	
									if(socio.CarnetVacunacion == 'S'){
										$("#cardSocio").find(".st-icon3").removeClass("bg-c-gray").addClass("bg-c-green-dark");
									} else {
										$("#cardSocio").find(".st-icon3").removeClass("bg-c-green-dark").addClass("bg-c-gray");
									}

									if (socio.foto == null) {
										$("#cardSocio img").attr("src", base_url() + 'assets/images/user/nofoto.png');
									} else {
										$("#cardSocio img").attr("src", 'data:image/jpeg;base64,' + socio.foto);
									}
									
									if (socio.PermitirIngreso <= 0 || socio.bloqueaSocioAusente == 1) {
										let limitUp = (socio.IngresosInformativos == "S") ? "limitUP" : "disabled";
										$("#cardSocio").addClass("bg-c-yellow text-white " + limitUp).data("select", '3');
										$("#placaS").val((socio.bloqueaSocioAusente == 0 ? 'Límite de ingreso superado' : 'Fecha final del Perido superada')).prop("disabled", true).next("label").text("Estado:");
										$("#cardSocio").find(".btnVacuna").data('otrobloqueo', true);
									} else if (socio.Baloteado > 0) {
										$("#cardSocio").addClass("bg-c-yellow text-white disabled").data("select", '3');
										$("#placaS").val('Bloqueado').prop("disabled", true).next("label").text("Estado:");
										$("#cardSocio").find(".btnVacuna").data('otrobloqueo', true);
									} else if (socio.Sede == 0) {
										$("#cardSocio").addClass("bg-c-yellow text-white disabled").data("select", '3');
										$("#placaS").val('No tiene ingreso habilitado a la sede').prop("disabled", true).next("label").text("Acceso:");
										$("#cardSocio").find(".btnVacuna").data('otrobloqueo', true);
									} else if (socio.Ingreso) {
										$("#cardSocio").addClass("bg-c-yellow text-white disabled").data("select", '3');
										$("#placaS").val(moment(socio.Ingreso, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A")).prop("disabled", true).next("label").text("Ingreso");
										$("#cardSocio").find(".btnVacuna").data('otrobloqueo', true);
										$("#textIngreso").html("Dentro del Club");
										if (socio.IngresaActivo) {
											$("#cardSocio").addClass('border');
										}
									} else if (resp.SolicitaCarnetVacunacion == true && socio.CarnetVacunacion != 'S'){
										$("#cardSocio").addClass("bg-c-yellow text-white disabled").data("select", '3');
										$("#placaS").val('No ha presentado carnet').prop("disabled", true).next("label").text("Vacunación:");
									} else if (socio.IngresaActivo){
										$("#cardSocio").addClass("bg-success text-white border").data("select", '1');
										usuariosRegistrar.push(socio.TerceroID.trim());
										
										if ($("#formPlaca input[name='tercero']").val().trim() == socio.TerceroID){
											$("#placaS").val($("#placa").val());
										}
									}

									if (socio.IngresaActivo){
										$("#cardSocio").addClass("border")
									}

									if (resp.clubCanje) {
										$("#nombreClub").closest("div").removeClass("d-none");
										$("#tipoCliente, #estado, #invitadorDia, #btnAgregarInvitado").closest("div").addClass("d-none");
										$("#cardSocio .ingresosFaltantes").addClass('d-none');
										$("#cardSocio .ingresos").html("<b>Días restantes:</b> " + socio.DiasRestantes).attr("title", "Días restantes: " + socio.DiasRestantes);
									} else {
										$("#nombreClub").closest("div").addClass("d-none");
										$("#nroAccion, #tipoCliente, #estado, #invitadorDia, #btnAgregarInvitado").closest("div").removeClass("d-none");
										$("#cardSocio .ingresos").html("<b>Ingresos año:</b> " + socio.conteoFechas).attr("title", "Ingresos año: " + socio.conteoFechas);
										$("#cardSocio .ingresosFaltantes").html("<b>Ingresos pendientes:</b> " + (socio.IngresosAnio == 0 ? 'N/A' : ((socio.IngresosAnio - socio.conteoFechaSistema) < 0 ? '0' : (socio.IngresosAnio - socio.conteoFechaSistema)))).attr("title", "Ingresos pendientes: " + (socio.IngresosAnio == 0 ? 'N/A' : ((socio.IngresosAnio - socio.conteoFechaSistema) < 0 ? '0' : (socio.IngresosAnio - socio.conteoFechaSistema)))).removeClass("d-none");
									}
								} else {
									let foto = socio.foto == null ? base_url() + 'assets/images/user/nofoto.png' : 'data:image/jpeg;base64,' + socio.foto;
									let css = '';
									let select = 0;
									let value = '';
									let otroBloqueo = false;
									let label = 'Placa';
									let conteoFechasSocio = '';
									let conteoFechasSocioFaltante = '';

									if ($("#formPlaca input[name='tercero']").val().trim() == socio.TerceroID){
										value = $("#placa").val();
									}

									if (resp.clubCanje) {
										conteoFechasSocio = `<p title="<b>Días restantes:</b> ${socio.DiasRestantes}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Días restantes:</b> ${socio.DiasRestantes}</p>`;
									} else {
										conteoFechasSocio = `<p title="<b>Ingresos:</b> ${socio.conteoFechas}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Ingresos:</b> ${socio.conteoFechas}</p>`;
										conteoFechasSocioFaltante = `<p title="Ingresos pendientes: ${socio.IngresosAnio == 0 ? 'N/A' : ((socio.IngresosAnio - socio.conteoFechaSistema) < 0 ? '0' : (socio.IngresosAnio - socio.conteoFechaSistema))}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Ingresos pendientes:</b> ${socio.IngresosAnio == 0 ? 'N/A' : ((socio.IngresosAnio - socio.conteoFechaSistema) < 0 ? '0' : (socio.IngresosAnio - socio.conteoFechaSistema))}</p>`; 
									}
									if (socio.PermitirIngreso <= 0 || socio.bloqueaSocioAusente == 1) {
										css = 'bg-c-yellow text-white';
										select = 3;
										label = 'Estado';
										value = socio.bloqueaSocioAusente == 0 ? 'Límite de ingreso superado' : "Fecha final del Perido superada";
										otroBloqueo = true;
										if (socio.IngresosInformativos == "S") {
											css = css + " limitUP";
										} else {
											css = css + " disabled";
										}
									} else if (socio.Baloteado > 0) {
										css = 'bg-c-yellow text-white disabled';
										select = 3;
										label = 'Estado';
										value = 'Bloqueado';
										otroBloqueo = true;
									} else if (socio.Sede == 0) {
										css = 'bg-c-yellow text-white disabled';
										select = 3;
										label = 'Acceso';
										value = 'No tiene ingreso habilitado a la sede';
										otroBloqueo = true;
									} else if (socio.IngresoClub == 'S') {
										css = 'bg-c-yellow text-white disabled';
										select = 3;
										label = 'Bloqueado';
										value = 'Tiene bloqueado el ingreso';
										otroBloqueo = true;
									} else if (socio.Ingreso) {
										css = socio.IngresaActivo ? 'bg-success text-white disabled border' : 'bg-success text-white disabled';
										select = 3;
										label = 'Ingreso';
										value = moment(socio.Ingreso, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm:ss A");
										otroBloqueo = true;
									} else if (resp.SolicitaCarnetVacunacion == true && socio.CarnetVacunacion != 'S'){
										css = 'bg-c-yellow text-white disabled';
										select = 3;
										label = 'Vacunación';
										value = 'No ha presentado carnet';
									} else if (socio.IngresaActivo) {
										css = 'bg-success text-white border';
										select = 1;
										usuariosRegistrar.push(socio.TerceroID);  
									}
									
									$("#contenedorBeneficiarios").append(`
										<div class="col-10 col-sm-6 col-lg-4 items p-1">
											<div class="card widget-statstic-card ${css} ${socio.IngresaActivo ? 'border' : ''} mb-0" data-tercero='${socio.TerceroID}' id="card${socio.TerceroID}" data-select='${select}'>
												<div class="row no-gutters">
													<div class="col-md-4">
														<div class="rounded bg-light w-100 text-center">
															<img class="img-persona rounded" src="${foto}">
															<i class="st-icon2 far fa-id-card ${socio.CarnetVacunacion == 'S' ? 'bg-c-green-dark' : 'bg-c-gray'} btnVacuna" data-terceroid="${socio.TerceroID}" data-vacunado="${socio.CarnetVacunacion == 'S' ? 'S' : 'N'}" data-otrobloqueo="${otroBloqueo}" data-url="${socio.URLCarnetCovid}" title="Carnet de vacunación"></i>
														</div>
													</div>
													<div class="col-md-8">
														<div class="card-body px-2 pb-1">
															${$VERDATOSBENEFICIARIO ? '<i class="st-icon fas fa-edit bg-c-purple"></i>' : ''}
															<p title="${socio.TerceroID}" class="card-text my-0 w-100 text-truncate">${socio.TerceroID}</p>
															<p title="${(socio.barra || '')}" class="card-text my-0 w-100 text-truncate "><b>Barra: </b>${(socio.barra || '')}</p>
															<p title="${socio.nombre}" class="card-text my-0 w-100 text-truncate">${socio.nombre}</p>
															<p title="${(socio.Parentesco || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Parentesco:</b> ${(socio.Parentesco || '')}</p>
															<p title="${(socio.TipoSocio || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Tipo:</b> ${(socio.TipoSocio || '')}</p>
															<p title="${(socio.Estado || '')}" class="card-text my-0 w-100 text-truncate font-beneficiarios"><b>Estado:</b> ${(socio.Estado || '')}</p>
															${conteoFechasSocio}
															${conteoFechasSocioFaltante}
															<div class="form-group mt-3 form-group-placa">
																<input id="placa${socio.TerceroID}" ${select == 3 ? 'disabled' : ''} placeholder="Placa" name="placa${socio.TerceroID}" class="form-control form-control-sm form-control-floating font-beneficiarios" autocomplete="off" type="text" title="${value}" value="${value}">
																<label class="floating-label" for="placa${socio.TerceroID}">${label}</label>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>`);
									
								}
							});
							$("#bntCancelar, #btnAgregarInvitado, #buscarBeneficiarios, #buscarInvitados").prop("disabled", false);
	
							if(usuariosRegistrar.length > 0){
								$("#btnRegistrar").prop('disabled', false);
							} else {
								$("#btnRegistrar").prop('disabled', true);
							}
							
							
							socios = resp.msj;
							invitadosDia = resp.invitadosDia;
							invitadosMes = resp.invitadosMes;

							//Validamos si ha superado los limites para darle click
							if (resp.limiteYear) {
								let paraDarleClik = socios.find(it => it.IngresaActivo == true); 
								if (paraDarleClik.Titular == true) {
									$("#cardSocio").find(".img-persona").click();
								} else {
									$("#card" + paraDarleClik.TerceroID.trim()).find(".img-persona").click();
								}
							}
						}
					} else {
						if (resp.socio == "") {
							alertify.ajaxAlert = function(url){
								$.ajax({
									url: url,
									async: false,
									success: function(data){
										alertify.myAlert().set({
											onclose:function(){
												busqueda = false;
												alertify.myAlert().set({onshow:null});
												$(".ajs-modal").unbind();
												delete alertify.ajaxAlert;
												$("#tblBusqueda").unbind().remove();
											},onshow:function(){
												busqueda = true;
												alertify.myAlert().set('resizable', true).resizeTo('90%', '100%');
											}
										});

										alertify.myAlert(data);
										
										dtSS({
											data: {
												tblID :'#tblBusqueda'
											},
											ajax: {
												url: rutaGeneral + "DTBuscarSocio",
												type: "POST"
											},
											bAutoWidth: false,
											columnDefs: [
												{targets: [0], width: '1%'},
											],
											ordering: false,
											draw: 10,
											pageLength: 10,
											oSearch: { sSearch: $("#codigo").val() },
											createdRow: function(row,data,dataIndex){
												$(row).click(function(){
													$("#formBuscar input[name='ingresoModal']").val(1);
													$("#codigo").val(data[0]);
													$("#formBuscar").submit();
													alertify.myAlert().close();
												});
											},
											scrollY: screen.height - 400,
											scroller: {
												loadingIndicator: false
											},
											dom: domftri
										});
									}
								});
							}
							var campos = encodeURIComponent(JSON.stringify(['Código', 'Nombre', 'Barra', 'Acción']));
							alertify.ajaxAlert(base_url() + "Busqueda/DataTable?campos=" + campos);
						} else {
							$("#formBuscar input[name='ingresoModal']").val(0);
							let fotico = resp.socio.foto == null ? base_url() + "assets/images/user/nofoto.png" : 'data:image/jpeg;base64,' + resp.socio.foto; 
							alertify.alert('¡Alerta!',  `<div class='row'>
															<div class='col-4'>
																<div class="rounded bg-light w-100 text-center">
																	<img class="img-persona rounded" src="${fotico}" alt="">
																</div>
															</div>
															<div class='col-8'>
																<h5><b>Nro Acción: </b> <span class="font-weight-light">${resp.socio.AccionId || ''}</span></h5>
																<h5><b>Documento: </b> <span class="font-weight-light">${resp.socio.TerceroId}</span></h5>
																<h5><b>Nombre: </b> <span class="font-weight-light">${resp.socio.nombre}</span></h5>
																<hr>
																<h3 class='mensaje-alerta alert-${resp.reservaTerceroHotel ? 'success' : 'danger'} p-3 rounded'>${resp.msj}</h3>
															</div>
														</div>`, 
							function(){
								setTimeout(() => {
									$("#codigo").focus().select();
								}, 1050);
							});
						}       
					}
				}
			});
		}
	});

	$("#bntCancelar").on("click", function(){
		$("#cardSocio .img-persona").attr("src", base_url() + "assets/images/user/nofoto.png");
		$("#contenedorBeneficiarios, #contenedorInvitados").empty().append(`<div class='col-12 d-none noDisponible'>
				<div class='alert alert-secondary text-center'>
					<h5 class='mb-0'>No se han encontrado resultados</h5>
				</div>
			</div>`);
		$("#codigo, #placa, #formPlaca input[name='tercero']").val('');
		$("#estado, #tipoCliente, #nroAccion, #textIngreso, #placaS, #btnRegistrar, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #invitadorMes, #buscarBeneficiarios, #buscarInvitados, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub").val('').prop("disabled", true);
		$("#checkLector2").prop("disabled", true);
		$("#nombreClub").closest("div").addClass("d-none");
		$("#nroAccion, #tipoCliente, #estado, #invitadorDia, #btnAgregarInvitado").closest("div").removeClass("d-none");
		$("#placaS").next("label").text("Placa");
		$("#cardSocio .card-text").empty();
		$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
		$("#textIngreso").html("");
		$("#cardSocio").removeClass("bg-danger bg-success text-white border bg-c-yellow").addClass("disabled").data("tercero", '').data('select', '3');
		invitadosDia = 0;
		invitadosMes = 0;
		contInvitados = 0;
		usuariosRegistrar = [];
		socios = [];
		setTimeout(() => {
			$("#codigo").focus();
		}, 0);
	});

	$("#btnRegistrar").on("click", function(){
		if (usuariosRegistrar.length > 0) {
			let AccionId = ($("#nroAccion").closest(".input-group").find(".input-group-text").text() == 'Reserva' ? null : $("#nroAccion").val());
			let TitularId = $("#cardSocio .documento").text().trim();
			let IngresoCanjeId = $("#IngresoCanjeId").val();
			let terceroIngresar = [];

			usuariosRegistrar.forEach(nroDocumento => {
				terceroIngresar.push(socios.find(socio => socio.TerceroID.trim() == nroDocumento));
			});

			terceroIngresar.forEach(tercero => {
				if (tercero.Titular) {
					AccionId = tercero.AccionId;
					tercero.placa = $("#placaS").val(); 
				} else {
					tercero.placa = $("#placa" + tercero.TerceroID).val()
				}
			});

			$.ajax({
				url: rutaGeneral + 'registrarIngreso',
				type: 'POST',
				data: {
					AccionId,
					TitularId,
					terceroIngresar,
					contInvitados,
					IngresoCanjeId,
					AlmacenId: $DATOSALMACEN.almacenid,
					SedeId: $DATOSALMACEN.SedeId
				},
				dataType: 'json',
				async: false,
				success: (resp) => {
					if (resp.success) {
						$("#cardSocio .img-persona").attr("src", base_url() + "assets/images/user/nofoto.png");
						$("#contenedorBeneficiarios, #contenedorInvitados").empty().append(`<div class='col-12 d-none noDisponible'>
								<div class='alert alert-secondary text-center'>
									<h5 class='mb-0'>No se han encontrado resultados</h5>
								</div>
							</div>`);
						$("#codigo, #placa, #formPlaca input[name='tercero']").val('');
						$("#estado, #tipoCliente, #nroAccion, #textIngreso, #btnRegistrar, #bntCancelar, #btnAgregarInvitado, #btnEntradaOtrosClubes, #btnEntradaEventos, #invitadorDia, #placaS, #invitadorMes, #buscarBeneficiarios, #buscarInvitados, #codigoLector, #btnLector, #IngresoCanjeId, #nombreClub").val('').prop("disabled", true);
						$("#checkLector2").prop("disabled", true);
						$("#cardSocio .card-text").empty();
						$("#cardSocio").removeClass("bg-danger bg-success bg-c-yellow text-white border").addClass("disabled").data("tercero", '').data('select', '3');
						$("#cardSocio").find(".st-icon, .st-icon3").addClass("d-none");
						$("#placaS").next("label").text("Placa");
						$("#textIngreso").html("");
			
						invitadosDia = 0;
						invitadosMes = 0;
						contInvitados = 0;
						usuariosRegistrar = [];
						socios = [];
						setTimeout(() => {
							$("#codigo").focus();
						}, 0);
						alertify.success("Ingreso correctamente");
					} else {
						alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>" + resp.msj + "</h3>")
					}
				}
			});
			
		} else {
			alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>No ha seleccion ningún tercero para registros el ingreso.</h3>");
		}
	});

	$("#btnAgregarInvitado").on("click", function(){
		sessionStorage.clear();
		$("#modalTerceros .modal-title").html('<i class="fas fa-user-plus"></i> Agregar invitado');
		$("#checkLectorTercero").prop("disabled", false);
		$("#frmRegistroClientes").trigger("reset");
		$('.img-perfil').attr("src", base_url() + "assets/images/user/nofoto.png");
		$('input[data-db]:not([data-codigo]), input[data-crud], textarea[data-db]').attr('readonly', true);
		$('select[data-db]:not([data-codigo]), select[data-crud], .btnEliminar, input[type=file]:not(#adj), .btnAgregar, .btnEliminar, #btnEliminarCliente,[data-db]input[type=checkbox]:not(.noBloquear),[data-crud]input[type=checkbox], #btnFoto').attr('disabled', true);
		$('span[data-db]').text('').attr('title', '');
		arrUser = [];

		if (invitadosMes === true || contInvitados < invitadosMes) {
			if (invitadosDia === true || contInvitados < invitadosDia) {
				$("#modalTerceros").modal("show");
			} else {
				alertify.warning("Ha superado el límite de invitado por día.");
			}
		} else {
			alertify.warning("Ha superado el límite de invitado por mes.");
		}
	});

	$("#formLector").submit(function(e){
		e.preventDefault();
		if ($(this).valid()) {
			let codigo = $("#codigoLector").val().trim();
	
			if(codigo.length > 0){
				socio = socios.find(socio => socio.barra.trim() == codigo)

				if (!socio) {
					socio = socios.find(socio => socio.TerceroID.trim() == codigo);
				}

				if (socio) {
					if (socio.PermitirIngreso <= 0) {
						alertify.warning("El tercero ha superado límite de ingresos.");
					} else if (socio.Baloteado > 0) {
						alertify.warning("El tercero se encuentra bloqueado.");
					} else if (socio.Ingreso) {
						alertify.warning("El tercero ya se encuentra dentro del club.");
					} else if (socio.Titular){
						if ($("#cardSocio").data("select") != '3') {
							$("#cardSocio").addClass("bg-success").addClass("text-white").data("select", '1');
							usuariosRegistrar.push($("#cardSocio").data("tercero").toString());
						} else {
							alertify.warning("El titular ya se encuentra seleccionado.");
						}
					} else {
						card = $("#card" + socio.TerceroID);
						if (card.data("select") != '3') {
							if (card.data("tercero") != '' && card.data("select") == 0) {
								card.addClass("bg-success").addClass("text-white").data("select", '1');
								usuariosRegistrar.push(card.data("tercero").toString());
							} else {
								alertify.warning("El socio ya se encuentra seleccionado.");
							}
						}
					}
				} else {
					$.ajax({
						url: rutaGeneral + "validarIngresoEspecial",
						type: 'POST',
						dataType: 'json',
						data: {
							accionId: $("#nroAccion").val()
							,codigo
							,validaLector: $("#checkLector2").is(":checked")
						},
						success: function(resp){
							if (resp.success) {
								let invitado = resp.msj;
								let foto = invitado.foto == null ? base_url() + 'assets/images/user/nofoto.png' : 'data:image/jpeg;base64,' + invitado.foto;
								let terceroId = invitado.TerceroId.trim();
								let nombreTercero = invitado.nombre.trim();

								usuariosRegistrar.push(terceroId);
								socios.push({
									"TerceroID": terceroId
									,"Tipo": "E"
									,"barra": invitado.Barras
									,"nombre": nombreTercero
								});

								$("#contenedorInvitados").append(`
								<div class="col-10 col-sm-6 col-lg-4">
									<div id="card${terceroId}" class="card bg-success widget-statstic-card text-white items" data-tercero='${terceroId}' data-select='1'>
										<div class="row no-gutters">
											<div class="col-md-4">
												<div class="rounded bg-light w-100 text-center">
													<img class="img-persona rounded" src="${foto}">
												</div>
												<i class="st-icon2 far fa-id-card ${invitado.CarnetVacunacion == 'S' ? 'bg-c-green-dark' : 'bg-c-gray'} btnVacuna" data-terceroid="${terceroId}" data-vacunado="${invitado.CarnetVacunacion == 'S' ? 'S' : 'N'}" data-url="${invitado.URLCarnetCovid}" title="Carnet de vacunación"></i>
											</div>
											<div class="col-md-8">
												<div class="card-body px-2 pb-1">
													${$VERDATOSBENEFICIARIO ? '<i class="st-icon fas fa-edit bg-c-purple"></i>' : ''}
													<p title="${terceroId}" class="card-text my-0 w-100 text-truncate">${terceroId}</p>
													<p title="${nombreTercero}" class="card-text my-0 w-100 text-truncate">${nombreTercero}</p>
													<p title="Ingresos: ${invitado.conteoFechas}" class="font-beneficiarios card-text my-0 w-100 text-truncate"><b>Ingresos:</b> ${invitado.conteoFechas}</p>
													<p title="${invitado.TipoIngresoEspecial}" class="card-text my-0 w-100 text-truncate font-beneficiarios">${invitado.TipoIngresoEspecial}</p>
													<div class="form-group mt-3">
														<input id="placa${terceroId}" placeholder="Placa" name="placa${terceroId}" class="form-control form-control-sm form-control-floating" autocomplete="off" type="text" title="" value="">
														<label class="floating-label" for="placa${terceroId}">Placa</label>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>`);

								if(usuariosRegistrar.length > 0){
									$("#btnRegistrar").prop('disabled', false);
								} else {
									$("#btnRegistrar").prop('disabled', true);
								}

							} else {
								if(resp.carnet == true) {
									let tercero = resp.tercero;
									let foto = tercero.foto == null ? base_url() + 'assets/images/user/nofoto.png' : 'data:image/jpeg;base64,' + tercero.foto;
									alertify.confirm('Advertencia', `<div class='row'>
											<div class='col-4'>
												<div class="rounded bg-light w-100 text-center">
													<img class="img-persona rounded" src="${foto}" alt="">
												</div>
											</div>
											<div class='col-8'>
												<h5><b>Nro Acción: </b> <span class="font-weight-light">${tercero.AccionId}</span></h5>
												<h5><b>Documento: </b> <span class="font-weight-light">${tercero.TerceroId}</span></h5>
												<h5><b>Nombre: </b> <span class="font-weight-light">${tercero.nombre}</span></h5>
												<hr>
												<h4 class='mensaje-alerta alert-warning p-3 rounded'>El tercero no tiene registrado el carnet de vacunación, para ingresar debe tenerlo. <br> ¿Quiere actualizar el registro?</h4>
											</div>
										</div>`, function(){
										$.ajax({
											url: rutaGeneral + "actualizarTercero",
											dataType: 'json',
											type: 'POST',
											data: {
												cliente: tercero.TerceroId,
												nombre: "CarnetVacunacion",
												value: 'S',
												tabla: 'Tercero',
												RASTREO: RASTREO(`Actualiza registro de vacunación del tercero [TerceroID: ${tercero.TerceroId}]`, 'Ingreso Club')
											},
											success: function(res){
											   if (res) {
													$("#codigoLector").val(tercero.TerceroId);
													$("#formLector").submit();
													alertify.success("Carnet de vacunación registrado correctamente.");
											   } else{
												   alertify.error("Error al actualizar el registro");
											   }
											}
										});
									},function(){
										setTimeout(() => {
											$("#codigoLector").val('').focus();
										}, 500);
									});
								} else {
									alertify.warning(resp.msj);
								}
							}
						}
					});
					//alertify.warning("No se ha encontrado tercero en la lista cargada de socios.");
				}

				if(usuariosRegistrar.length > 0){
					$("#btnRegistrar").prop('disabled', false);
				} else {
					$("#btnRegistrar").prop('disabled', true);
				}

				setTimeout(() => {
					$("#codigoLector").val('').focus();
				}, 500);
			}
		}

	});

	$(document).on("click", ".img-persona", function(){
		let card = $(this).closest(".card");
		if (card.hasClass("limitUP") && card.data("tercero") != '') {
			if (card.data('select') == 3) {
				let datos = socios.find(socio => socio.TerceroID.trim() == card.data("tercero").toString());
				let fotico = datos.foto == null ? base_url() + "assets/images/user/nofoto.png" : 'data:image/jpeg;base64,' + datos.foto;
				let msj = datos.bloqueaSocioAusente == 0 ? "Ha superado el límite de ingresos" : "La fecha final de perido ha finalizado";
				alertify.confirm('Advertencia', `<div class='row'>
							<div class='col-4'>
								<div class="rounded bg-light w-100 text-center">
									<img class="img-persona rounded" src="${fotico}" alt="">
								</div>
							</div>
							<div class='col-8'>
								<h5><b>Nro Acción: </b> <span class="font-weight-light">${datos.AccionId || ''}</span></h5>
								<h5><b>Documento: </b> <span class="font-weight-light">${datos.TerceroID}</span></h5>
								<h5><b>Nombre: </b> <span class="font-weight-light">${datos.nombre}</span></h5>
								<hr>
								<h3 class='mensaje-alerta alert-warning p-3 rounded'>${msj}. ¿Está seguro de realizar el ingreso?</h3>
							</div>
						</div>`, function(){
					card.addClass("bg-success").removeClass("bg-c-yellow").data("select", "1");
					card.find(".form-group-placa label").html("Placa");
					card.find(".form-group-placa input").val("");
					usuariosRegistrar.push(card.data("tercero").toString());

					if(usuariosRegistrar.length > 0){
						$("#btnRegistrar").prop('disabled', false);
					} else {
						$("#btnRegistrar").prop('disabled', true);
					}
				}, function(){
					card.addClass("bg-c-yellow").removeClass("bg-success").data("select", "3");
					card.find(".form-group-placa label").html("Estado");
					card.find(".form-group-placa input").val("Límite de ingreso superado");
					usuariosRegistrar = usuariosRegistrar.filter((i) => i != card.data("tercero"));

					if(usuariosRegistrar.length > 0){
						$("#btnRegistrar").prop('disabled', false);
					} else {
						$("#btnRegistrar").prop('disabled', true);
					}
				}).set('labels', { ok: `Si`, cancel: `No` });
				
			} else {
				card.addClass("bg-c-yellow").removeClass("bg-success").data("select", "3");
				card.find(".form-group-placa label").html("Estado");
				card.find(".form-group-placa input").val("Límite de ingreso superado");
				usuariosRegistrar = usuariosRegistrar.filter((i) => i != card.data("tercero"));
			}
		} else{
			if (card.data('select') != 3) {
				if (card.data("tercero") != '' && card.data("select") == 0) {
					card.addClass("bg-success").addClass("text-white").data("select", '1');
					usuariosRegistrar.push(card.data("tercero").toString());
				} else {
					card.removeClass("bg-success").removeClass("text-white").data("select", '0');
					//Filtramos para eliminar el usuario deseleccionado
					usuariosRegistrar = usuariosRegistrar.filter((i) => i != card.data("tercero"));
				}
			}
		}

		if(usuariosRegistrar.length > 0){
			$("#btnRegistrar").prop('disabled', false);
		} else {
			$("#btnRegistrar").prop('disabled', true);
		}
	});

	//Buscador de Beneficiaros y Invitador
	$("#buscarBeneficiarios, #buscarInvitados").on("keyup", function(){
		let nombre = $(this).data("nombre"); 

		var rex = new RegExp($(this).val(), 'i');

		$(`#contenedor${nombre} .items`).addClass("d-none");

		$(`#contenedor${nombre} .items`).filter(function(){
			return rex.test($(this).find(".card-text").text());
		}).removeClass("d-none");

    if ($(`#contenedor${nombre} .items:not(.d-none)`).length <= 0 && $(this).val().length > 0) {
			$(`#contenedor${nombre}`).find(".noDisponible").removeClass("d-none");
		} else {
			$(`#contenedor${nombre}`).find(".noDisponible").addClass("d-none");
		}
	});

	$('.imagen-container').on({
		'mouseenter': function () {
			$(".cambio-foto").attr('hidden', false);
		},
		'mouseleave': function () {
			$(".cambio-foto").attr('hidden', true);
		},
	});

	$("[data-crud-tabla]").on("change", "[data-crud-codigo]", function(){
		cargarCRUD(this, $(this).val());
	});

	$("[data-crud-tabla]").on("focusout", "[data-crud]:not([data-crud-codigo], input[type=checkbox])", function(){
		var self = this,
			value = $(this).val();
			retornar = false;
		if($(this).closest('[data-crud-tabla]').find('[data-crud-codigo]').val() != '' && $ID != ''){
			$(self).closest('[data-crud-tabla]').find('[required]').each(function(){
				if($(this).val() == ""){
					retornar = true;
				}
			});
			if($(this).val() != lastFocus && retornar != true){
				if($(self).attr('data-foranea')){
					if(value != ''){
						var antes = lastFocus;
						var tblNombre = 'nombre';
						$.ajax({
							url: rutaGeneral + "CargarForanea",
							type: 'POST',
							data: {
								tabla : $(self).attr('data-foranea'),
								value : value,
								nombre: $(self).attr('data-foranea-codigo'),
								cliente: $ID,
								tblNombre: tblNombre
							},
							success: function(respuesta){
								if(respuesta == 0){
									alertify.ajaxAlert = function(url){
										$.ajax({
											url: url,
											async: false,
											success: function(data){
												alertify.myAlert().set({
													onclose:function(){
														busqueda = false;
														alertify.myAlert().set({onshow:null});
														$(".ajs-modal").unbind();
														delete alertify.ajaxAlert;
														$("#tblBusqueda").unbind().remove();
													},onshow:function(){
														lastFocus = antes;
														busqueda = true;
													}
												});
	
												alertify.myAlert(data);
	
												var $tblID = '#tblBusqueda';
												var config = {
													data:{
														tblID : $tblID,
														select: [$(self).attr('data-foranea-codigo'), tblNombre],
														table : [$(self).attr('data-foranea')],
														column_order : [$(self).attr('data-foranea-codigo'), tblNombre],
														column_search : [$(self).attr('data-foranea-codigo'), tblNombre],
														orden : [],
														columnas : [$(self).attr('data-foranea-codigo'), tblNombre]
													},
													bAutoWidth: false,
													columnDefs: [
														{targets: [0], width: '1%'},
													],
													order: [],
													ordering: false,
													draw: 10,
													pageLength: 10,
													initComplete: function(){
														setTimeout(function(){
															$('div.dataTables_filter input').focus();
															$('html, body').animate({
																scrollTop: $('div.dataTables_filter input').offset().top
															}, 2000);
														},500);
														$('div.dataTables_filter input')
														.unbind()
														.change(function(e){
															e.preventDefault();
															table = $("body").find($tblID).dataTable();
															table.fnFilter( this.value );
														});
													},
													oSearch: { sSearch: value },
													createdRow: function(row,data,dataIndex){
														$(row).click(function(){
															$(self).val(antes).focusin().val(data[0]).focusout();
															alertify.myAlert().close();
														});
													},
													scrollY: screen.height - 400,
													scroller: {
														loadingIndicator: true
													},
													dom: domftri
												}
												dtSS(config);
											}
										});
									}
									alertify.ajaxAlert(base_url()+"Busqueda/DataTable");
								}else{
									lastFocus = antes;
									respuesta = JSON.parse(respuesta);
	
									$(self).closest('.input-group').find('span').text(respuesta[0][tblNombre]).attr('title', respuesta[0][tblNombre]);
									actualizarCRUD(self);
									
								}
							}
						});
					}else{
						$(self).closest('.input-group').find('span').text('').attr('title', '');
						actualizarCRUD(self);
					}
				}else{
					actualizarCRUD(self);
				}
			}
		}
	});
	
	$("[data-crud-tabla]").on("change", "[data-crud]:not([data-crud-codigo])input[type=checkbox]", function(){
		if($(this).is(':checked')){
			var value = '1',
				lastFocus = '0';
		}else{
			var value = '0',
				lastFocus = '1';
		}
		$(this).val(value);
		$(this).focusout();
		actualizarCRUD(this);
	});
	
	$("[data-crud-tabla]").on("click", ".btnEliminar", function(e){
		e.preventDefault();
		var self = this;
		var permiso 	= $(self).attr('data-permiso') ? $(self).attr('data-permiso') : '0';
		if($(this).closest('[data-crud-tabla]').find('[data-crud-codigo]').val() != '' && $ID != ''){
			alertify.confirm('Advertencia', '¿Está seguro de retirar el registro?', function(){
				$.ajax({
					url: rutaGeneral + "eliminarCRUD",
					dataType: 'json',
					type: 'POST',
					data: {
						tabla: $(self).closest('[data-crud-tabla]').attr('data-crud-tabla'),
						codigo: $(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').val(),
						cliente: $ID,
						permiso: permiso,
						nombreCodigo: $(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').attr('data-crud-codigo'),
						RASTREO: RASTREO('Elimina registro '+$(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').val()+' de '+$('.nav-link.active[role=tab]').text().trim()+' Cliente '+$ID, 'Terceros')
					},
					success: function(res){
						switch(res.toString()){
							case '1':
								var fn = Function($(self).closest('[data-crud-dt]').attr('data-crud-dt')+'.ajax.reload();');
								fn();
								$(self).closest('[data-crud-tabla]').find('input, select').val('');
								$(self).closest('[data-crud-tabla]').find('input[data-crud]:not([data-crud-codigo])').attr('readonly', true);
								$(self).closest('[data-crud-tabla]').find('select[data-crud]:not([data-crud-codigo]), .btnEliminar').attr('disabled', true);
							break;
							case '2':
								alertify.alert('Advertencia', '<h3 class="mensaje-alerta">No posee los permisos para Eliminar el registro</h3>', function(){
									this.destroy();
								});
							break;
							default:
								alertify.alert('Error', "<h3 class='mensaje-alerta'>" + res + "</h3>", function(){
									this.destroy();
								});
							break;
						}
					}
				});
			},function(){});
		}
	});
	
	$(".numeric").inputmask({
		groupSeparator:"",
		alias:"integer",
		placeholder:"0",
		autoGroup:!0,
		digitsOptional:!1,
		clearMaskOnLostFocus:!1
	}).click(function(){
		$(this).select();
	});
	
	$('.btnAgregar').click(function(e){
		e.preventDefault();
		if($(this).closest('#informacionAdicionalCRM').length > 0){
			CRM = {
				CRMDatoid: null,
				CRMTablaid: null,
				dato: '',
				tipo: '',
				nombre: '',
				value: ''
			};
			alertify.ajaxAlert = function(url){
				$.ajax({
					url: url,
					async: false,
					success: function(data){
						alertify.myAlert().set({
							onclose:function(){
								busqueda = false;
								alertify.myAlert().set({onshow:null});
								$(".ajs-modal").unbind();
								delete alertify.ajaxAlert;
								$("#tblBusqueda").unbind().remove();
								$('.ajs-content').html('');
							},onshow:function(){
								busqueda = true;
							}
						});
	
						alertify.myAlert(data);
	
						var $tblID = '#tblBusqueda';
						var config = {
							data:{
								tblID : $tblID,
							},
							ajax: {
								url: rutaGeneral + "DTCRMTablas",
								type: "POST"
							},
							bAutoWidth: false,
							columnDefs: [
								{targets: [0], width: '1%'},
							],
							order: [],
							ordering: false,
							draw: 10,
							pageLength: 10,
							initComplete: function(){
								setTimeout(function(){
									$('div.dataTables_filter input').focus();
									$('html, body').animate({
										scrollTop: $('div.dataTables_filter input').offset().top
									}, 2000);
								},500);
								$('div.dataTables_filter input')
								.unbind()
								.change(function(e){
									e.preventDefault();
									table = $("body").find($tblID).dataTable();
									table.fnFilter( this.value );
								});
							},
							oSearch: { sSearch: '' },
							createdRow: function(row,data,dataIndex){
								$(row).click(function(){
									CRM.CRMTablaid = data[0];
									CRM.tipo = data[2];
									CRM.nombre = data[1];
									alertify.myAlert().close();
									if(CRM.CRMTablaid != null){
										if(CRM.tipo == 'L'){
											// Seleccionar
											alertify.ajaxAlert = function(url){
												$.ajax({
													url: url,
													async: false,
													success: function(data){
														alertify.myAlert().set({
															onclose:function(){
																busqueda = false;
																alertify.myAlert().set({onshow:null});
																$(".ajs-modal").unbind();
																delete alertify.ajaxAlert;
																$("#tblBusqueda").unbind().remove();
																if(CRM.CRMDatoid != null){
																	guardarCRM();
																}
															},onshow:function(){
																busqueda = true;
															}
														});
	
														alertify.myAlert(data);
	
														var $tblID = '#tblBusqueda';
														dtSS({
															data:{
																tblID : $tblID,
															},
															ajax: {
																url: rutaGeneral + "DTCRMDatos",
																type: "POST",
																data: function (d) {
																	return $.extend(d, { CRMTTablaid: CRM.CRMTablaid });
																},
															},
															bAutoWidth: false,
															columnDefs: [
																{targets: [0], width: '1%'},
															],
															ordering: false,
															draw: 10,
															pageLength: 10,
															initComplete: function(){
																setTimeout(function(){
																	$('div.dataTables_filter input').focus();
																	$('html, body').animate({
																		scrollTop: $('div.dataTables_filter input').offset().top
																	}, 2000);
																},500);
																$('div.dataTables_filter input')
																.unbind()
																.change(function(e){
																	e.preventDefault();
																	table = $("body").find($tblID).dataTable();
																	table.fnFilter( this.value );
																});
															},
															oSearch: { sSearch: '' },
															createdRow: function(row,data,dataIndex){
																$(row).click(function(){
																	CRM.CRMDatoid = $(this).closest("tr").find("td").eq(0).text();
																	CRM.value = $(this).closest("tr").find("td").eq(1).text();
																	alertify.myAlert().close();
																});
															},
															scrollY: screen.height - 400,
															scroller: {
																loadingIndicator: true
															},
															dom: domftri
														});
														
													}
												});
											}
											alertify.ajaxAlert(base_url()+"Busqueda/DataTable");
										}else{
											// Escribir
											alertify.prompt().set({onshow:function(){
													$(document).find(".ajs-input").attr('maxlength', 60).addClass('form-control');
												}
											});
											alertify.prompt(CRM.nombre,'',''
											,function(evt,value){
												CRM.dato = value;
												CRM.value = value;
												guardarCRM();
												this.destroy();
											},function(){
												this.destroy();
											});
										}
									}
								});
							},
							scrollY: screen.height - 400,
							scroller: {
								loadingIndicator: true
							},
							dom: domftri
						}
						dtSS(config);
					}
				});
			}
			alertify.ajaxAlert(base_url()+"Busqueda/DataTable");
		}else if($(this).closest('#adjuntos').length > 0){
			if (typeof FormData !== 'undefined') {
				if ($("[id=adj]")[0].files[0] != undefined){ 
					var form_data = new FormData();
					form_data.append('Lista_Anexos', $("[id=adj]")[0].files[0]);
					form_data.append('Id', $ID);
					form_data.append('nombreCliente', $('[data-db="nombre"]').val().trim());
					form_data.append('Tipo', 'TER');
	
					$.ajax({
						url 		: base_url() + "Configuracion/Terceros/RegistroClientes/guardarAdjunto",
						type 		: "POST",
						data 		: form_data,
						async		: false,
						cache		: false,
						contentType : false,
						processData : false,
						success: function(resultado){
							if (resultado == 3) {
								alertify.error("No se permiten caracteres especiales en el nombre del adjunto");
							} else if (resultado == 0) {
								alertify.error("No se pudo guardar el adjunto, comuniquese con el administrador del sistema");
							}else{
								alertify.success('Adjunto guardado correctamente');
								$('#adj').val("");
								$('#adj').next('.custom-file-label').html('Seleccione un archivo...');
								dtAdjuntos.ajax.reload();
							}
						}
					});
				} else {
					alertify.error("No ha seleccionado el adjunto");
				}
			}
		}else{
			cargarCRUD($(this).closest('[data-crud-tabla]').find('[data-crud-codigo]'), 0);
		}
	});

	$("#inputFoto").change(function(){
		if($ID != ''){
			leerImg(this);
		}else{
			alertify.error('No hay un Cliente cargado');
		}
	});

	$('#modalFoto, #modalConsultarCrear').on('show.bs.modal', function () {
		$("#modalTerceros").css("z-index", "1071");
		$("#modalTerceros").data('bs.modal')._config.focus = false;
		$("#modalTerceros").data('bs.modal')._config.keyboard = false;

		$(this).data('bs.modal')._config.focus = true;
		$(this).data('bs.modal')._config.keyboard = true;

		setTimeout(() => {
			$(this).find("button")[0].focus();
		}, 500);

	});

	$('#modalFoto, #modalConsultarCrear').on('hide.bs.modal', function () {
		$("#modalTerceros").css("z-index", "1072");
		$("#modalTerceros").data('bs.modal')._config.focus = true;
		$("#modalTerceros").data('bs.modal')._config.keyboard = true;
		setTimeout(() => {
			$("[data-codigo]").focus();
		}, 500);
	});

	$('#modalConsultarCrear').on('hide.bs.modal', function () {
		$ID = '';
		$CREAR = 0;

		if ($("#checkLectorTercero").is(":checked")) {
			$("#checkLectorTercero").click();
		}

	});

	$('#modalTerceros').on("shown.bs.modal", function(){
		formularioDatos = {};
		if (MODIFICAR == 0) {
			$("#checkLectorTercero").click();
		}
		setTimeout(() => {
			$("[data-codigo]").focus();
		}, 350);
	});


	$("#cerrarModaltercero").on("click", function(e){
		e.preventDefault();
		/* Vamos a validar el usuario ingresado para permisos de administrador */
		$("#modalTerceros").modal("hide");
	});


	$('#modalTerceros').on('hide.bs.modal', function (e) {
		if ($CREAR == 1){ $ID=Object.values(formularioDatos)[0]};
		if ($("#checkLectorTercero").is(":checked") == true) {
			$("#checkLectorTercero").prop("disabled", false).click();
		}
		if ($('[data-db="TerceroID"]').val() == '' && $('[data-db="nombruno"]').val() == '' && $('[data-db="apelluno"]').val() == '' ) {
			modal= document.querySelector("#modalTerceros")
			modal.classList.remove('show');
			modal.setAttribute('aria-hidden','true');
			$('#btnAgregarInvitado,#bntCancelar,#btnRegistrar').removeAttr('disabled');
		}else{
			if ($ID != '' && MODIFICAR == 0) {
				if ($CREAR == 1) { 
					if ($('#frmRegistroClientes').valid()) {
						$.ajax({
							url: rutaGeneral + "registrarTercero",
							type: 'POST',
							dataType: 'json',
							data: {
								datos: formularioDatos,
								RASTREO: RASTREO('Creación Cliente '+JSON.stringify(formularioDatos), 'Terceros')
							},
							success: function(respuesta){
								if(respuesta != '1'){
									alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
										this.destroy();
									});
								}else{
									$ID = lastID;
								}
								$("[data-codigo]").val($ID).change();
							}
						});
						sessionStorage.clear();
					} else {
						alertify.error("Validar todos los campos obligatorios");
						e.preventDefault();
					}
				}
				if ($('#frmRegistroClientes').valid()) {
					tipoInvitado();			
				}
			} else {
				$("[data-codigo]").attr('readonly', false);
				if ($ID != '') {
					socios.forEach(socio => {
						if(socio.TerceroID == $ID){
							socio.barra = $('[data-db="barra"]').val();
						}
					});
		
					let foto = $(this).find(".img-perfil").attr("src");
					let nombre = $("[data-db='nombre']").val()
					$("[data-tercero='" + $ID + "'] p:eq(1)").text(nombre).attr("title", nombre);
					$("[data-tercero='" + $ID + "'] .img-persona").attr("src", foto);
				}
				$ID = '';
				MODIFICAR = 0;
				conteoFechasInvitado = 0;
			}

		}
	});

	$("#btnBuscar").on("click", function(){
		alertify.ajaxAlert = function(url){
			$.ajax({
				url: url,
				async: false,
				success: function(data){
					alertify.myAlert().set({
						onclose:function(){
							if (!busquedaClick) {
								$ID = '';
							}
							setTimeout(() => {
								$("#modalTerceros").data('bs.modal')._config.focus = true;
								$("#modalTerceros").data('bs.modal')._config.keyboard = true;
							}, 350);
							busqueda = false;
							alertify.myAlert().set({onshow:null});
							$(".ajs-modal").unbind();
							delete alertify.ajaxAlert;
							$("#tblBusqueda").unbind().remove();
						},onshow:function(){
							setTimeout(() => {
								$("#modalTerceros").data('bs.modal')._config.focus = false;
								$("#modalTerceros").data('bs.modal')._config.keyboard = false;
							}, 350);
							busqueda = true;
							busquedaClick = false;
						}
					});

					alertify.myAlert(data);

					var $tblID = '#tblBusqueda';
					dtSS({
						data:{
							tblID : $tblID,
						},
						ajax: {
							url: rutaGeneral + "DTBucarTercero",
							type: "POST"
						},
						bAutoWidth: false,
						columnDefs: [
							{targets: [0], width: '1%'},
						],
						ordering: false,
						draw: 10,
						pageLength: 10,
						initComplete: function(){
							setTimeout(function(){
								$('div.dataTables_filter input').focus();
								$('html, body').animate({
									scrollTop: $('div.dataTables_filter input').offset().top
								}, 2000);
							},500);
							$('div.dataTables_filter input')
							.unbind()
							.change(function(e){
								e.preventDefault();
								table = $("body").find($tblID).dataTable();
								table.fnFilter( this.value );
							});
						},
						oSearch: { sSearch: $ID },
						createdRow: function(row,data,dataIndex){
							$(row).click(function(){
								busquedaClick = true;
								$("[data-codigo]").val(data[0].trim()).focusin().change();
								$(self).val(data[0].trim()).change();
								alertify.myAlert().close();
							});
						},
						scrollY: screen.height - 400,
						scroller: {
							loadingIndicator: true
						},
						dom: domftri
					});
				}
			});
		}
		alertify.ajaxAlert(base_url()+"Busqueda/DataTable");

		//this.destroy();
		$("#modalConsultarCrear").modal("hide");
		$CREAR = 1;
	});

	$("#btnCrear").on("click", function(){
		var fechaOriginal;
		formularioDatos = {};		
		formularioDatos['TerceroID'] = $ID;
		sessionStorage.setItem('frmRegistroClientes',JSON.stringify(formularioDatos));
		if(arrUser.length != 0){
			fechaOriginal = arrUser[6];
			if(fechaOriginal != undefined){
				partesFecha = fechaOriginal.split('/');
				dia = partesFecha[0];
				mes = partesFecha[1];
				año = partesFecha[2];
				var nuevaFecha = `${año}-${mes}-${dia}`;
			}
			var datosArray = [
				{'key' : 'nombruno', 'value' : arrUser[3]},
				{'key' : 'nombrdos', 'value' : arrUser[4]},
				{'key' : 'apelluno', 'value' : arrUser[1]},
				{'key' : 'apelldos', 'value' : arrUser[2]},
				{'key' : 'sexo', 'value' : arrUser[5]},
				{'key' : 'fechanacim', 'value' : nuevaFecha}
			]
			datosArray.forEach(function(daticos){
				$('[data-db='+daticos.key+']').val(daticos.value);
				campo = $('[data-db='+daticos.key+']');
				guardarValor(campo);
			})
			$('#frmRegistroClientes').change();
		}
		$("#modalConsultarCrear").modal("hide");
		$CREAR = 1;
	});
	
	$(document).on("click", ".st-icon", function(){
		MODIFICAR = 1;
		$("#modalTerceros .modal-title").html('<i class="fas fa-user-edit"></i> Modificar tercero');
		$("#checkLectorTercero").prop("disabled", true);
		$("[data-codigo]").val($(this).closest(".card").data("tercero")).change().attr('readonly', true);
		$("#modalTerceros").modal("show");
	});

	//Ingreso especial
	$("#formIngresoEspecial").submit(function(e){
		e.preventDefault();

		if ($(this).valid() && Object.keys(socioIngresoEspecial).length > 0) {
			socioIngresoEspecial.placa = $("#placaEspecial").val();
			//El tipo es E por que es tipo ingreso especial
			//socioIngresoEspecial.Tipo = 'E';
			socioIngresoEspecial.AlmacenId = $DATOSALMACEN.almacenid;
			socioIngresoEspecial.SedeId = $DATOSALMACEN.SedeId;

			$.ajax({
				url: rutaGeneral + 'registroIngresoNormal',
				type: 'POST',
				data: {
					ingreso: socioIngresoEspecial
				},
				dataType: 'json',
				async: false,
				success: (resp) => {
					if (resp.success) {
						socioIngresoEspecial = [];
						alertify.success("Ingreso correctamente");
						setTimeout(() => {
							$("#codigo").focus();
						}, 0);
						$('#modalIngresoEspecial').modal("hide");
					} else {
						alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>" + resp.msj + "</h3>")
					}
				}
			});
		} else {
			alertify.alert('¡Alerta!', '<h3 class="mensaje-alerta">Error al realizar el ingreso.</h3>');
		}
	});

	$('#modalIngresoEspecial').on('hide.bs.modal', function () {
		socioIngresoEspecial = [];
		$("#codigo").val('');
		setTimeout(() => {
			$("#codigo").focus();
		}, 350);
	});

	$('#modalIngresoEspecial').on('shown.bs.modal', function () {
		setTimeout(() => {
			if ($(this).find("[form='formIngresoEspecial']").prop("disabled") === true) {
				propForm(false);
				$("#checkLector").prop("checked", false);
	
				setTimeout(() => {
					$("#placaEspecial").trigger("focus");
				}, 500);
			}
		}, 1000);
	});

	//Lector de cedula eventos
	$("#checkLector, #checkLectorTercero, #checkLector2").on("click",function(){
		inputChecked = "#" + $(this).val();
		$(this).is(":checked") ? propForm(true) : propForm(false);
	});

	$("#codigo, #codigoLector, #TerceroID").on('focusout', function(){
		if($("#checkLector, #checkLectorTercero, #checkLector2").is(":checked")){
			setTimeout(function(){
				$(inputChecked).focus();
			},50);
		}
	});

	$(document).on('focus', "#codigo, #TerceroID, #codigoLector", function(){
		if($("#checkLector, #checkLectorTercero, #checkLector2").is(":checked")){
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

	$("#codigo, #TerceroID, #codigoLector").keydown(function (e) {
		if($("#checkLector, #checkLectorTercero, #checkLector2").is(":checked")){

			if(inputChecked == "#codigo") {
				$("#checkLector").prop("disabled",true);	
			} else if (inputChecked == "#codigoLector") {
				$("#checkLector2").prop("disabled",true);	
			} else {
				$("#checkLectorTercero").prop("disabled",true);
			}

			if( ! (barra == [] && $(inputChecked).val() == '')){
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
					arrUser = $(inputChecked).val().split('-');
	
					setTimeout(function(){
						//$("#nomV").val("").focus()
						$(inputChecked).val(arrUser[0]);
						//$("#nomV").val(arrUser[3]+" "+arrUser[4]+" "+arrUser[1]+" "+arrUser[2]);
						if(inputChecked == "#codigo") {
							$("#formBuscar").submit();
							$("#checkLector").prop("disabled",false).click();
						} else if (inputChecked == "#codigoLector") { 
							$("#formLector").submit();
							$("#checkLector2").prop("disabled",false).click();
						} else {
							validarLectorTercero = $("#checkLectorTercero").is(":checked");
							$(inputChecked).change();
							$("#checkLectorTercero").prop("disabled",false).click();
							setTimeout(() => {
								$("#checkLectorTercero").focus();
							}, 200);
						}
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
		if($("#checkLector, #checkLector2, #checkLectorTercero").is(":checked")){
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

	$(document).on("keyup", "#codigo, #TerceroID, #codigoLector", function(){
		if ($(this).next().find('input').prop("disabled")) {
			$(this).val($(this).val().replace(/^000/, ''));
		} 
	});
	
	//Validar la placa del tercero asociado
	$("#formPlaca").on("submit", function(e){
		e.preventDefault();
		if($(this).valid()){
			$.ajax({
				url: rutaGeneral + "validarPlacaTercero",
				type: 'POST',
				data: new FormData(this),
				processData: false,
				contentType: false,
				cache: false,
				dataType: "json",
				success: function(resp){
					$("#listaPlacas").closest(".input-group-append").addClass("d-none");
					if (resp.PlacaInicial.length > 0) {
						ultimaPlacaBuscada = resp.PlacaInicial[0].Placa.trim();
					}

					if(resp.PlacaInicial.length == 1) {
						let dataPlaca = resp.PlacaInicial[0];
						$("#formPlaca input[name='tercero']").val(dataPlaca.TerceroId);
						$("#codigo").val(dataPlaca.TerceroId);
						$("#formBuscar").submit();
					} else if (resp.PlacaInicial.length > 1){
						listaPlacasAsociadas();
					} else {
						alertify.warning("No se han encontrado resultados.");
					}

					if (resp.PlacaSecundaria.length >= 1) {
						$("#listaPlacas").closest(".input-group-append").removeClass("d-none");
					}
				}
			});
		}
	});

	$("#listaPlacas").on("click", function(){
		let placaActual = $("#placa").val().trim();
		if (placaActual == ultimaPlacaBuscada) {
			listaPlacasAsociadas(true);
		} else {
			$("#listaPlacas").closest(".input-group-append").addClass("d-none");
			alertify.warning("La placa buscada no coincide con la ultima busqueda realizada.");
		}
	});

	$(".toUpperTrim").keyup(function(){
		$(this).val($(this).val().toUpperCase().trim());
	});

	$("#btnModalTercerosModal").on("click", function(){
		sessionStorage.clear();
		$("[data-db='TerceroID']").val('').change();
		$("[data-db='tipodocuid']").val('').change();
		$("[data-db='nombruno']").val('').change();
		$("[data-db='apelluno']").val('').change();
		$("#modalTerceros").modal("hide");
	});


	$("#btnGuardarClientes").click(function (e) {
		e.preventDefault();
		let validarDoc = true;
		if(formularioDatos){
			formularioDatos.TerceroID = formularioDatos.TerceroID.replace(/[-/]/g, '');
			if(formularioDatos.TerceroID.length <= 4 || formularioDatos.TerceroID == "00000"){
				validarDoc = false;	
			}
		}
		/* Vamos a validar el usuario ingresado para permisos de administrador */
		if ($('#frmRegistroClientes').valid()) {
			if (validarDoc) {
				$("#modalTerceros").modal("hide");
				$('#btnAgregarInvitado,#bntCancelar,#btnRegistrar').removeAttr('disabled');
				formularioDatos = {};
			}else{
				alertify.error("El numero de documento es invalido");
			}
		} else {
			alertify.error("Validar la información de los campos");
		}
	});


	//Funcion de vacunación
	$(document).on("click", ".btnVacuna", function(){
		let btnVacuna = $(this);
		if($(this).data('vacunado') == 'N'){
			if (validarVacuna == true) {
				let datos = socios.find(socio => socio.TerceroID.trim() == $(this).data('terceroid'));
				let foto = datos.foto == null ? base_url() + 'assets/images/user/nofoto.png' : 'data:image/jpeg;base64,' + datos.foto;
				alertify.confirm('Advertencia', `<div class='row'>
						<div class='col-4'>
							<div class="rounded bg-light w-100 text-center">
								<img class="img-persona rounded" src="${foto}" alt="">
							</div>
						</div>
						<div class='col-8'>
							<h5><b>Nro Acción: </b> <span class="font-weight-light">${datos.AccionId ? datos.AccionId : ''}</span></h5>
							<h5><b>Documento: </b> <span class="font-weight-light">${datos.TerceroID}</span></h5>
							<h5><b>Nombre: </b> <span class="font-weight-light">${datos.nombre}</span></h5>
							<hr>
							<h4 class='mensaje-alerta alert-warning p-3 rounded'>El tercero no tiene registrado el carnet de vacunación, para ingresar debe tenerlo. <br> ¿Está seguro de registrar los datos de vacunación?</h4>
						</div>
					</div>`, function(){
					$.ajax({
						url: rutaGeneral + "actualizarTercero",
						dataType: 'json',
						type: 'POST',
						data: {
							cliente: datos.TerceroID,
							nombre: "CarnetVacunacion",
							value: 'S',
							tabla: 'Tercero',
							RASTREO: RASTREO(`Actualiza registro de vacunación del tercero [TerceroID: ${datos.TerceroID}]`, 'Ingreso Club')
						},
						success: function(res){
						   if (res) {
							   if(datos.Titular) {
								   $("#placaS").attr("title", '').val('').prop("disabled", false).closest(".form-group-placa").find("label").text("Placa");
							   } else {
									$("#placa" + datos.TerceroID).attr("title", '').val('').prop("disabled", false).closest(".form-group-placa").find("label").text("Placa");
							   }

							   btnVacuna.removeClass("bg-c-gray").addClass("bg-c-green-dark").data('vacunado', 'S');
								if (btnVacuna.data('otrobloqueo') == false) {
									btnVacuna.closest(".widget-statstic-card").removeClass("bg-c-yellow disabled").data('select', '0');
									if (!btnVacuna.closest(".widget-statstic-card").hasClass("bg-success")) {
										btnVacuna.closest(".widget-statstic-card").removeClass("text-white");
									}
									btnVacuna.closest(".widget-statstic-card").find(".form-group-placa input").attr("title", '').val('').prop("disabled", false);
									btnVacuna.closest(".widget-statstic-card").find(".form-group-placa label").text("Placa");
								}
								alertify.success("Carnet de vacunación registrado correctamente.");
						   } else{
							   alertify.error("Error al actualizar el registro");
						   }
						}
					});
				},function(){});
			} else {
				alertify.warning("El tercero no se encuentra vacunado.");
			}
		} else {
			let url = btnVacuna.data('url');
			if(url != null && url.length > 0){
				var win = window.open(url, '_blank');
				win.focus();
			} else {
				alertify.success("El tercero ya se encuentra vacunado, pero no se le ha registrado el documento.");
			}
		}
	});
});

function soloLetrasNumerosIngreso(e, input){
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "abcdefghijklmnopqrstuvwxyz1234567890-/";
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

function guardarValor(campo){
	var valor = campo.value == undefined ? campo[0].value : campo.value;
	var nombreCampo = campo.dataset == undefined ? campo[0].dataset.db : campo.dataset.db;
	if(nombreCampo != undefined || nombreCampo != null){
		formularioDatos[nombreCampo] = valor;
	}
	sessionStorage.setItem('frmRegistroClientes',JSON.stringify(formularioDatos));
}

function validadInputRequerido(value){
	if(value == '31'){
		$(".validaNit").text('* Razón Social');
		$(".validaNombre").text('Primer Nombre');
		$(".validaApellido").text('Primer Apellido');
		$(".validaIdentificacion").text('* Identificación');

		$("[data-db=razonsocia]").prop('required',true);
		$("[data-db=tipodocuid]").prop('required',true);
		$("[data-db=nombruno]").prop('required',false).removeClass('input-invalid');
		$("[data-db=apelluno]").prop('required',false).removeClass('input-invalid');
		$('#frmRegistroClientes').validate().resetForm(); 
	}else{
		$(".validaNit").text(' Razón Social');
		$(".validaNombre").text('* Primer Nombre');
		$(".validaApellido").text('* Primer Apellido');
		$(".validaIdentificacion").text('* Identificación');

		$("[data-db=razonsocia]").prop('required',false).removeClass('input-invalid');
		$("[data-db=nombruno]").prop('required',true);
		$("[data-db=apelluno]").prop('required',true);
		$("[data-db=tipodocuid]").prop('required',true);
		$('#frmRegistroClientes').validate().resetForm(); 
	}
}

function actualizar(self, lastFocus){
	if($(self).attr('data-db') == 'RespoFisca'){
		var value = $(self).val();
		value = value.join(';');
	}else{
		var value = $(self).val();
	}
	if(value == null){
		value = '';
	}
	if ($CREAR != 1) {
		if(value != lastFocus && busqueda != true){
			var nombre 	= $(self).attr('data-db'),
			value 		= value,
			tabla 		= $(self).attr('data-tabla') ? $(self).attr('data-tabla') : 'Tercero';
			permiso 	= $(self).attr('data-permiso') ? $(self).attr('data-permiso') : '0';
			stringModif = $CREAR == 1 ? 'Crear' : 'Modificar';
			last 		= lastFocus;
			$.ajax({
				url: rutaGeneral + "actualizarTercero",
				type: 'POST',
				dataType: 'json',
				async: false,
				data: {
					cliente: $ID,
					nombre: nombre,
					value: value,
					tabla: tabla,
					permiso: permiso,
					RASTREO: RASTREO('Modifica Cliente '+$ID+' Cambia '+$(self).attr('data-nombre')+' '+lastFocus+' -> '+value, 'Terceros')
				},
				success: function(respuesta){
					switch(respuesta.toString()){
						case '1':
							switch(nombre){
								case 'tipodocuid':
									if(value == '31'){
										$("[data-db=digitverif]").focusin().val(calcularDigitoVerificacion($ID)).focusout();
										$("[data-db=nombre]").focusin().val($('[data-db=razonsocia]').val()).focusout();
										$('#h2Cliente').text($('[data-db=razonsocia]').val());
	
										
										
										// $(".validaNit").text('* Razón Social');
										// $(".validaNombre").text('Primer Nombre');
										// $(".validaApellido").text('Primer Apellido');
	
										// $("[data-db=razonsocia]").prop('required',true);
										// $("[data-db=nombruno]").prop('required',false).removeClass('input-invalid');
										// $("[data-db=apelluno]").prop('required',false).removeClass('input-invalid');
										// $('#frmRegistroClientes').validate().resetForm() 
									}else{
										$("[data-db=digitverif]").focusin().val('').focusout();
										$("[data-db=nombre]").focusin().val($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val()).focusout();
										$('#h2Cliente').text($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val());
	
										// $(".validaNit").text(' Razón Social');
										// $(".validaNombre").text('* Primer Nombre');
										// $(".validaApellido").text('* Primer Apellido');
										// $(".validaApellido").text('* Primer Apellido');
	
										// $("[data-db=razonsocia]").prop('required',false).removeClass('input-invalid');
										// $("[data-db=nombruno]").prop('required',true);
										// $("[data-db=apelluno]").prop('required',true);
										// $('#frmRegistroClientes').validate().resetForm() 
										
									}
									validadInputRequerido(value);
								break;
								case 'nombruno':
								case 'nombrdos':
								case 'apelluno':
								case 'apelldos':
									if($('[data-db=tipodocuid]').val() != '31'){
										$("[data-db=nombre]").focusin().val($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val()).focusout();
										$('#h2Cliente').text($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val());
									}
								break;
								case 'razonsocia':
									if($('[data-db=tipodocuid]').val() == '31'){
										$("[data-db=nombre]").focusin().val($('[data-db=razonsocia]').val()).focusout();
										$('#h2Cliente').text($('[data-db=razonsocia]').val());
									}
								break;
								case 'EsCliente':
									if(value == 0){
										$('[data-db=EsProveedor]').attr('disabled', true);
									}else{
										$('[data-db=EsProveedor]').attr('disabled', false);
									}
								break;
								case 'EsProveedor':
									if(value == 0){
										$('[data-db=EsCliente]').attr('disabled', true);
									}else{
										$('[data-db=EsCliente]').attr('disabled', false);
									}
								break;
							}
							lastFocus = $('[data-db]:not([data-codigo]):focus').val();
						break;
						case '2':
							$(self).val(last);
							alertify.alert('Advertencia', '<h3 class="mensaje-alerta">No posee los permisos para ' + stringModif + ' el ' + $(self).attr('data-nombre') + "</h3>", function(){
								this.destroy();
							});
						break;
						default:
							$(self).val(last);
							alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
								this.destroy();
							});
						break;
					}
				}
			});
		}	
	}
}

function cargarCRUD(self, codigo){
	permiso 	= $(self).closest('[data-crud-tabla]').attr('data-permiso') ? $(self).closest('[data-crud-tabla]').attr('data-permiso') : '0';
	$(self).closest('[data-crud-tabla]').find('input, select').val('');
	$(self).closest('[data-crud-tabla]').find('span[data-crud]').text('').attr('title', '');
	$(self).closest('[data-crud-tabla]').find('input[type=checkbox]').prop('checked', false);
	if(codigo === ''){
		$(self).closest('[data-crud-tabla]').find('input[data-crud]:not([data-crud-codigo])').attr('readonly', true);
		$(self).closest('[data-crud-tabla]').find('select[data-crud]:not([data-crud-codigo]), .btnEliminar, input[type=file],[data-crud]input[type=checkbox]').attr('disabled', true);
	}else{
		$(self).closest('[data-crud-tabla]').find('input[data-crud]:not([data-crud-codigo])').attr('readonly', false);
		$(self).closest('[data-crud-tabla]').find('select[data-crud]:not([data-crud-codigo]), .btnEliminar, input[type=file],[data-crud]input[type=checkbox]').attr('disabled', false);
		$(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').val(codigo);
		$.ajax({
			url: rutaGeneral + "cargarCRUD",
			type: 'POST',
			data: {
				tabla: $(self).closest('[data-crud-tabla]').attr('data-crud-tabla'),
				codigo: codigo,
				cliente: $ID,
				nombreCodigo: $(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').attr('data-crud-codigo'),
				permiso: permiso,
				RASTREO: RASTREO(' de '+$('.nav-link.active[role=tab]').text().trim()+' Cliente '+$ID, 'Terceros')
			},
			success: function(res){
				try{
					var registro = JSON.parse(res);
				}catch(e){
					alertify.alert('Error', "<h3 class='mensaje-alerta'>" + res + "</h3>", function(){
						this.destroy();
					});
					return false;
				}
				if(isNaN(registro)){
					if(registro.length > 0) {
						for(var key in registro[0]) {
							if(registro[0][key] != null){
								var value = registro[0][key];
								$(self).closest('[data-crud-tabla]').find("[data-crud="+key+"]").val(value);
								$(self).closest('[data-crud-tabla]').find("span[data-crud="+key+"]").text(value).attr('title', value);
								if($("[data-crud="+key+"]").is('input[type=checkbox]') && value == 1){
									$("[data-crud="+key+"]").prop('checked', true);
								}else{
									$("[data-crud="+key+"]").prop('checked', false);
								}
							}
						}
						//var event = new Event('editar');
					}else{
						$(self).closest('[data-crud-tabla]').find("[data-crud-codigo]").val(res);
						$(self).closest('[data-crud-tabla]').find('.btnEliminar').attr('disabled', true);
						//var event = new Event('crear');
					}
					lastFocus = $(':focus').val();
					$ID = $("[data-codigo]").val();
				}else{
					if(res == -1){
						alertify.alert('Advertencia', '<h3 class="mensaje-alerta">No posee los permisos para Crear el registro en ' + $('.nav-link.active[role=tab]').text().trim() + "</h3>", function(){
							this.destroy();
						});
					}else{
						$(self).closest('[data-crud-tabla]').find("[data-crud-codigo]").val(res);
						var fn = Function($(self).closest('[data-crud-dt]').attr('data-crud-dt')+'.ajax.reload();');
						fn();
					}
				}
			//document.dispatchEvent(event);
			}
		});
	}
}

function actualizarCRUD(self){
	var permiso 	= $(self).attr('data-permiso') ? $(self).attr('data-permiso') : '0';
	$.ajax({
		url: rutaGeneral + "guardarCRUD",
		type: 'POST',
		dataType: 'json',
		data: {
			tabla: $(self).closest('[data-crud-tabla]').attr('data-crud-tabla'),
			nombre: $(self).attr('data-crud'),
			value: $(self).val(),
			codigo: $(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').val(),
			cliente: $ID,
			nombreCodigo: $(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').attr('data-crud-codigo'),
			permiso: permiso,
			RASTREO: RASTREO(' registro '+$(self).closest('[data-crud-tabla]').find('[data-crud-codigo]').val()+' de '+$('.nav-link.active[role=tab]').text().trim()+' Cliente '+$ID+' '+$(self).attr('data-nombre')+' '+lastFocus+' -> '+$(self).val(), 'Terceros')
		},
		success: function(res){
			switch(res.toString()){
				case '1':
					var fn = Function($(self).closest('[data-crud-dt]').attr('data-crud-dt')+'.ajax.reload();');
					fn();
					$(self).closest('[data-crud-tabla]').find('.btnEliminar').attr('disabled', false);
				break;
				case '2':
					alertify.alert('Advertencia', '<h3 class="mensaje-alerta">No posee los permisos para Modificar el '+$(self).attr('data-nombre') + "</h3>", function(){
						this.destroy();
					});
				break;
				default:
					alertify.alert('Error', "<h3 class='mensaje-alerta'>" + res + "</h3>", function(){
						this.destroy();
					});
				break;
			}
		}
	});
}

function calcularDigitoVerificacion ( myNit ) {

	var vpri,x,y,z;

	myNit = myNit.replace ( /\s/g, "" ) ; // Espacios

	myNit = myNit.replace ( /,/g, "" ) ; // Comas

	myNit = myNit.replace ( /\./g, "" ) ; // Puntos

	myNit = myNit.replace ( /-/g, "" ) ; // Guiones

	if ( isNaN ( myNit ) ) {

		console.log ("El nit/cédula '" + myNit + "' no es válido(a).") ;

		return "" ;

	};

	vpri = new Array(16) ;

	z = myNit.length ;

	vpri[1] = 3 ;

	vpri[2] = 7 ;

	vpri[3] = 13 ;

	vpri[4] = 17 ;

	vpri[5] = 19 ;

	vpri[6] = 23 ;

	vpri[7] = 29 ;

	vpri[8] = 37 ;

	vpri[9] = 41 ;

	vpri[10] = 43 ;

	vpri[11] = 47 ;

	vpri[12] = 53 ;

	vpri[13] = 59 ;

	vpri[14] = 67 ;

	vpri[15] = 71 ;

	x = 0 ;
	y = 0 ;

	for ( var i = 0; i < z; i++ ) {
		y = ( myNit.substr (i, 1 ) ) ;
		x += ( y * vpri [z-i] ) ;
	}

	y = x % 11 ;

	return ( y > 1 ) ? 11 - y : y ;
}

function seleccionarFoto() {
	$("#inputFoto").click();
}

function leerImg(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var background = e.target.result;
			$(input).closest('form').off('submit').on('submit',function(e){
				e.preventDefault();
				if(typeof FormData !== 'undefined'){
					var rastreo = RASTREO('Modifica Cliente '+$ID+' Cambia Foto', 'Terceros');
					var form_data = new FormData();
					form_data.append('file', $(input)[0].files[0]);
					form_data.append('imagen', $(input).attr('data-imagen'));
					form_data.append('src', "");
					form_data.append('cliente', $ID);
					form_data.append('cambio', rastreo.cambio);
					form_data.append('fecha', rastreo.fecha);
					form_data.append('programa', rastreo.programa);
					$.ajax({	
						url: rutaGeneral + "ActualizarImagen",
						type:"POST",
						async		: false,
						cache		: false,
						contentType : false,
						processData : false,
						data:form_data,	
						success:function(respuesta){
							if(respuesta != 1){
								alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
									this.destroy();
								});
							}else{
								$(input).closest('.imagen-container').find(".img-perfil").attr("src", background);
							}
						}
					});
				}
			});
			$(input).closest('form').submit();
		}
		reader.readAsDataURL(input.files[0]);
	}
}

function guardarFoto(foto){
	if(typeof FormData !== 'undefined'){
		var rastreo = RASTREO('Modifica Cliente '+$ID+' Cambia Foto', 'Terceros');
		var form_data = new FormData();
		form_data.append('file', "");
		form_data.append('imagen', "");
		form_data.append('src', foto.substr(22));
		form_data.append('cliente', $ID);
		form_data.append('cambio', rastreo.cambio);
		form_data.append('fecha', rastreo.fecha);
		form_data.append('programa', rastreo.programa);
		$.ajax({	
			url: rutaGeneral + "ActualizarImagen",
			type:"POST",
			async		: false,
			cache		: false,
			contentType : false,
			processData : false,
			data:form_data,	
			success:function(respuesta){
				if(respuesta != 1){
					alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
						this.destroy();
					});
				}else{
					$(".img-perfil").attr("src", foto);
					$("#modalFoto").modal("hide");
				}
			}
		});
	}
}

function modalFoto(){
	if ($ID != '') {
		$("#modalFoto").modal("show");
		/*
			Tomar una fotografía y guardarla en un archivo v3
			@date 2018-10-22
			@author parzibyte
			@web parzibyte.me/blog
		*/
		const tieneSoporteUserMedia = () =>
			!!(navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia) || navigator.webkitGetUserMedia || navigator.msGetUserMedia)
		const _getUserMedia = (...arguments) =>
			(navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia) || navigator.webkitGetUserMedia || navigator.msGetUserMedia).apply(navigator, arguments);
		
		// Declaramos elementos del DOM
		const $video = document.querySelector("#video"),
			$canvas = document.querySelector("#canvas"),
			$estado = document.querySelector("#estado"),
			$boton = document.querySelector("#btnFotoModal"),
			$listaDeDispositivos = document.querySelector("#listaDeDispositivos");
		
		const limpiarSelect = () => {
			for (let x = $listaDeDispositivos.options.length - 1; x >= 0; x--)
				$listaDeDispositivos.remove(x);
		};
		const obtenerDispositivos = () => navigator
			.mediaDevices
			.enumerateDevices();
		
		// La función que es llamada después de que ya se dieron los permisos
		// Lo que hace es llenar el select con los dispositivos obtenidos
		const llenarSelectConDispositivosDisponibles = () => {
		
			limpiarSelect();
			obtenerDispositivos()
				.then(dispositivos => {
					const dispositivosDeVideo = [];
					dispositivos.forEach(dispositivo => {
						const tipo = dispositivo.kind;
						if (tipo === "videoinput") {
							dispositivosDeVideo.push(dispositivo);
						}
					});
		
					// Vemos si encontramos algún dispositivo, y en caso de que si, entonces llamamos a la función
					if (dispositivosDeVideo.length > 0) {
						// Llenar el select
						dispositivosDeVideo.forEach(dispositivo => {
							const option = document.createElement('option');
							option.value = dispositivo.deviceId;
							option.text = dispositivo.label;
							$listaDeDispositivos.appendChild(option);
						});
					}
				});
		}
		
		(function() {
			// Comenzamos viendo si tiene soporte, si no, nos detenemos
			if (!tieneSoporteUserMedia()) {
				alert("Lo siento. Tu navegador no soporta esta característica");
				$estado.innerHTML = "Parece que tu navegador no soporta esta característica. Intenta actualizarlo.";
				return;
			}
			//Aquí guardaremos el stream globalmente
			let stream;
		
		
			// Comenzamos pidiendo los dispositivos
			obtenerDispositivos()
				.then(dispositivos => {
					// Vamos a filtrarlos y guardar aquí los de vídeo
					const dispositivosDeVideo = [];
		
					// Recorrer y filtrar
					dispositivos.forEach(function(dispositivo) {
						const tipo = dispositivo.kind;
						if (tipo === "videoinput") {
							dispositivosDeVideo.push(dispositivo);
						}
					});
		
					// Vemos si encontramos algún dispositivo, y en caso de que si, entonces llamamos a la función
					// y le pasamos el id de dispositivo
					if (dispositivosDeVideo.length > 0) {
						// Mostrar stream con el ID del primer dispositivo, luego el usuario puede cambiar
						mostrarStream(dispositivosDeVideo[0].deviceId);
					}
				});
		
		
		
			const mostrarStream = idDeDispositivo => {
				_getUserMedia({
						video: {
							// Justo aquí indicamos cuál dispositivo usar
							deviceId: idDeDispositivo,
						}
					},
					(streamObtenido) => {
						// Aquí ya tenemos permisos, ahora sí llenamos el select,
						// pues si no, no nos daría el nombre de los dispositivos
						llenarSelectConDispositivosDisponibles();
		
						// Escuchar cuando seleccionen otra opción y entonces llamar a esta función
						$listaDeDispositivos.onchange = () => {
							// Detener el stream
							if (stream) {
								stream.getTracks().forEach(function(track) {
									track.stop();
								});
							}
							// Mostrar el nuevo stream con el dispositivo seleccionado
							mostrarStream($listaDeDispositivos.value);
						}
		
						// Simple asignación
						stream = streamObtenido;
		
						// Mandamos el stream de la cámara al elemento de vídeo
						$video.srcObject = stream;
						$video.play();
		
						//Escuchar el click del botón para tomar la foto
						//Escuchar el click del botón para tomar la foto
						$boton.addEventListener("click", function() {
		
							//Pausar reproducción
							$video.pause();
		
							//Obtener contexto del canvas y dibujar sobre él
							let contexto = $canvas.getContext("2d");
							$canvas.width = $video.videoWidth;
							$canvas.height = $video.videoHeight;
							contexto.drawImage($video, 0, 0, $canvas.width, $canvas.height);
		
							let foto = $canvas.toDataURL(); //Esta es la foto, en base 64
							guardarFoto(foto);
							//Reanudar reproducción
							$video.play();
						});
					}, (error) => {
						console.log("Permiso denegado o error: ", error);
						$estado.innerHTML = "No se puede acceder a la cámara, o no diste permiso.";
					});
			}
		})();
	} else {
		alertify.error('No hay un Cliente cargado');
	}
	
}

function tipoInvitado(){
	alertify.ajaxAlert = function(url){
		$.ajax({
			url: url,
			async: false,
			success: function(data){
				alertify.myAlert().set({
					onclose:function(){
						$ID = '';
						MODIFICAR = 0;
						conteoFechasInvitado = 0;
						alertify.myAlert().set({onshow:null});
						$(".ajs-modal").unbind();
						delete alertify.ajaxAlert;
					},onshow:function(){

					}
				});

				alertify.myAlert(data);

				var $tblID = '#tblBusqueda';
				var config = {
					data:{
						tblID : $tblID,
					},
					ajax: {
						url: rutaGeneral + "DTTipoInvitado",
						type: "POST",
						data: function (d) {
							return $.extend(d, { ID: $ID });
						},
					},
					bAutoWidth: false,
					columnDefs: [
						{targets: [0], width: '1%'},
					],
					ordering: false,
					draw: 10,
					pageLength: 10,
					initComplete: function(){
						setTimeout(function(){
							$('div.dataTables_filter input').focus();
							$('html, body').animate({
								scrollTop: $('div.dataTables_filter input').offset().top
							}, 2000);
						},500);
						$('div.dataTables_filter input')
						.unbind()
						.change(function(e){
							e.preventDefault();
							table = $("body").find($tblID).dataTable();
							table.fnFilter( this.value );
						});
					},
					createdRow: function(row,data,dataIndex){
						if(data[2] == 0) {
							$(row).addClass("letra-disabled");    
						} 
					
						$(row).click(function(){
							if (data[2] == 1) {
								if (data[3] == 0 || INGRESOMESINVITADOS >= 1) {
									usuariosRegistrar.push($ID);
									socios.push({
										"TerceroID": $ID
										,"Tipo": "I"
										,"TipoInvitadoId": data[0]
										,"barra": $IDbarra
										,"nombre": $('[data-nombre="Nombre"]').val()
									});

									$RASTREO = 'Agrega Invitado Código ' + codigo.value + ' Acción ' + nroAccion.value +  " TerceroID " +  $ID + " barra " + $IDbarra + " nombre " + $('[data-nombre="Nombre"]').val() + ' Invitado :  ' + data[1];
									RastreoIngresoModulo('Ingreso Club',$RASTREO);
		
									contInvitados++;
		
									$("#contenedorInvitados").append(`
									<div class="col-10 col-sm-6 col-lg-4">
										<div id="card${$ID}" class="card bg-success widget-statstic-card text-white items" data-tercero='${$ID}' data-select='1'>
											<div class="row no-gutters">
												<div class="col-md-4">
													<div class="rounded bg-light w-100 text-center">
														<img class="img-persona rounded" src="${$(".img-perfil").attr("src")}">
													</div>
													<i class="st-icon2 far fa-id-card ${$('[data-db="CarnetVacunacion"]').val() == 'S' ? 'bg-c-green-dark' : 'bg-c-gray'} btnVacuna" data-terceroid="${$ID}" data-vacunado="${$('[data-db="CarnetVacunacion"]').val()}" data-url="${$('#carnetVacunaInvitado').attr('href')}" title="Carnet de vacunación"></i>
												</div>
												<div class="col-md-8">
													<div class="card-body px-2 pb-1">
														${$VERDATOSBENEFICIARIO ? '<i class="st-icon fas fa-edit bg-c-purple"></i>' : ''}
														<p title="${$ID}" class="card-text my-0 w-100 text-truncate">${$ID}</p>
														<p title="${$("input[data-db='nombre']").val()}" class="card-text my-0 w-100 text-truncate">${$("input[data-db='nombre']").val()}</p>
														<p title="Ingresos mes: ${conteoFechasInvitado}" class="card-text my-0 w-100 text-truncate"><b>Ingresos mes:</b> ${conteoFechasInvitado}</p>
														<p title="${data[1]}" class="card-text my-0 w-100 text-truncate">${data[1]}</p>
														<div class="form-group mt-3">
															<input id="placa${$ID}" placeholder="Placa" name="placa${$ID}" class="form-control form-control-sm form-control-floating" autocomplete="off" type="text" title="" value="">
															<label class="floating-label" for="placa${$ID}">Placa</label>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>`);
		
									if(invitadosMes !== true || invitadosDia !== true){
										if (contInvitados === invitadosMes || contInvitados === invitadosDia) {
											$("#btnAgregarInvitado").prop("disabled", true);
										}
									}
		
									if(usuariosRegistrar.length > 0){
										$("#btnRegistrar").prop('disabled', false);
									} else {
										$("#btnRegistrar").prop('disabled', true);
									}
									
									alertify.myAlert().close();
								} else {
									alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>El invitado <b>" + $ID + "</b> ha superado el límite de ingresos permitido por mes.</h3>", function(){}).elements.footer.style.display = 'block';
								}
							} else {
								alertify.alert('¡Alerta!', "<h3 class='mensaje-alerta'>Ya consumio los ingresos permitidos de " + data[1] +".</h3>", function(){}).elements.footer.style.display = 'block';
							}
						});
					},
					scrollY: screen.height - 400,
					scroller: {
						loadingIndicator: true
					},
					dom: domftri
				}

				if (INGRESOMESINVITADOS < 0) {
					config.data.table[2].push(['TI.LimitaIngresos = 0']);
				}
				dtSS(config);
			}
		});
	}
	alertify.ajaxAlert(base_url()+"Busqueda/DataTable");

	//this.destroy();
	$("#modalConsultarCrear").modal("hide");
	$CREAR = 1;
}

//Funcion del lector
function propForm(prop){
	setTimeout(() => {
		$("button, select").not("#btnCrear, #btnBuscar, .btnCerrarModalConsultarCrear, #btnCerrarModalConsultarCrear").prop("disabled",prop);
		$("input, a, textarea").not("#codigo, #codigoLector, #checkLector, #checkLectorTercero, #checkLector2, [data-db='TerceroID']").prop("readonly",prop);
	}, 100);

	setTimeout(function(){ $(inputChecked).focus()},0);

	if ($ID == ''){
		$('input[data-db]:not([data-codigo]), input[data-crud], textarea[data-db]').attr('readonly', true);
		$('select[data-db]:not([data-codigo]), select[data-crud], .btnEliminar, input[type=file]:not(#adj), .btnAgregar, .btnEliminar, #btnEliminarCliente,[data-db]input[type=checkbox]:not(.noBloquear),[data-crud]input[type=checkbox], #btnFoto').attr('disabled', true);
	}
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
		$(inputChecked).val('').focus();
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
