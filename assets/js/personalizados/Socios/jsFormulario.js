let codeBase64 = 'data:image/jpeg;base64,';
var self;
var accion;
var cedula = '';
var tipo = '';
var $accionId;
var $cedulaEditar='';
let lastModal = null;
//aqui llenamos los beneficiarios de los socios.
var dtBeneficiarios = $('#tblBeneficiarios').DataTable({
 	language,
 	dom: domftrip,
	scrollX: true,
 	processing: true,
     columns: [
		{ data: [0] },
		{ data: [1] },
		{
			data: [2],
			orderable: false,
			visible: true,
			render: function (meta, type, data, meta) {
				return`<div class="text-center">
						<button title="Editar" type="button" class="btn btn-success editarTercBen" >
							<i class="fas fa-edit"></i>
						</button>
					</div>`;
				
			},
		},
	],
 	createdRow: function(row, data, dataIndex){
		$(row).unbind().on("click", ".editarTercBen", function () {
			$cedulaEditar =data[0];
			$('.fotob').closest('.imagen-container').find(".img-perfil").attr("src", base_url() + "assets/images/user/nofoto.png");
			editar = 1;
			$.ajax({
				url: rutaGeneral + "cargarTercero",
				type: 'POST',
				dataType: 'json',
				async:false,
				data: {
					codigo:$cedulaEditar,
					tipo: "B",
				},
				success: function(registro){
					registro.datosTercero.forEach(Beneficiario => {
						$accionId =Beneficiario.Accionid;
						$Tipo = Beneficiario.Tipo;
						actualizarSelect('#tipodocuidb',Beneficiario.tipodocuid,Beneficiario.tipodocuidNombre);
						actualizarSelect('#sexob',Beneficiario.sexo,Beneficiario.sexo);
						$('#TerceroIDb').val(Beneficiario.TerceroID).prop("disabled", true);
						$('#nombrunob').val(Beneficiario.nombruno);
						$('#nombrdosb').val(Beneficiario.nombrdos);
						$('#apellunob').val(Beneficiario.apelluno);
						$('#apelldosb').val(Beneficiario.apelldos);
						$('#emailb').val(Beneficiario.email);
						$('#celularb').val(Beneficiario.celular);
						$('#fechanacimb').val(Beneficiario.fechanacim);

						if(Beneficiario.foto !== "" && Beneficiario.foto !== null) {
							$('.fotob').closest('.imagen-container').find(".img-perfil").attr("src", "data:image/jpeg;base64," + Beneficiario.foto);
						} else {
							$('.fotob').closest('.imagen-container').find(".img-perfil").attr("src", base_url() + "assets/images/user/nofoto.png");
						}
					});
				}
			});
			$("#modalBeneficiario").modal({
				backdrop: "static",
				keyboard: false,
				show: true,
			});

			$('#btnEditarBeneficiario').attr('hidden', false);
			$('#btnGuardarBeneficiario').attr('hidden', true);
		});
 	}
});

//Alerta personalizada para la respuesta del server
alertify.myConfig || alertify.dialog('myConfig', function () {

	var autoConfirm = {
		timer: null,
		index: null,
		text: null,
		duration: null,
		task: function (event, self) {
			if (self.isOpen()) {
				self.__internal.buttons[autoConfirm.index].element.innerHTML = autoConfirm.text + ' (&#8207;' + autoConfirm.duration + '&#8207;) ';
				autoConfirm.duration -= 1;
				if (autoConfirm.duration === -1) {
					clearAutoConfirm(self);
					var button = self.__internal.buttons[autoConfirm.index];
					var closeEvent = createCloseEvent(autoConfirm.index, button);

					if (typeof self.callback === 'function') {
						self.callback.apply(self, [closeEvent]);
					}
					//close the dialog.
					if (closeEvent.close !== false) {
						self.close();
					}
				}
			} else {
				clearAutoConfirm(self);
			}
		}
	};

	function clearAutoConfirm(self) {
		if (autoConfirm.timer !== null) {
			clearInterval(autoConfirm.timer);
			autoConfirm.timer = null;
			self.__internal.buttons[autoConfirm.index].element.innerHTML = autoConfirm.text;
		}
	}

	function startAutoConfirm(self, index, duration) {
		clearAutoConfirm(self);
		autoConfirm.duration = duration;
		autoConfirm.index = index;
		autoConfirm.text = self.__internal.buttons[index].element.innerHTML;
		autoConfirm.timer = setInterval(delegate(self, autoConfirm.task), 1000);
		autoConfirm.task(null, self);
	}


	return {
		main: function (_title, _message, _onok, _oncancel) {
			var title, message, onok, oncancel;
			switch (arguments.length) {
				case 1:
					message = _title;
					break;
				case 2:
					message = _title;
					onok = _message;
					break;
				case 3:
					message = _title;
					onok = _message;
					oncancel = _onok;
					break;
				case 4:
					title = _title;
					message = _message;
					onok = _onok;
					oncancel = _oncancel;
					break;
			}
			this.set('title', title);
			this.set('message', message);
			this.set('onok', onok);
			this.set('oncancel', oncancel);
			return this;
		},
		setup: function () {
			return {
				buttons: [
					{
						text: alertify.defaults.glossary.ok,
						key: 13,
						className: alertify.defaults.theme.ok,
					},
					{
						text: alertify.defaults.glossary.cancel,
						key: 27,
						invokeOnClose: true,
						className: alertify.defaults.theme.cancel,
					}
				],
				focus: {
					element: 0,
					select: false
				},
				options: {
					maximizable: false,
					resizable: false
				}
			};
		},
		build: function () {
			//nothing
		},
		prepare: function () {
			//nothing
		},
		setMessage: function (message) {
			this.setContent(message);
		},
		settings: {
			message: null,
			labels: null,
			onok: null,
			oncancel: null,
			defaultFocus: null,
			reverseButtons: null,
		},
		settingUpdated: function (key, oldValue, newValue) {
			switch (key) {
				case 'message':
					this.setMessage(newValue);
					break;
				case 'labels':
					if ('ok' in newValue && this.__internal.buttons[0].element) {
						this.__internal.buttons[0].text = newValue.ok;
						this.__internal.buttons[0].element.innerHTML = newValue.ok;
					}
					if ('cancel' in newValue && this.__internal.buttons[1].element) {
						this.__internal.buttons[1].text = newValue.cancel;
						this.__internal.buttons[1].element.innerHTML = newValue.cancel;
					}
					break;
				case 'reverseButtons':
					if (newValue === true) {
						this.elements.buttons.primary.appendChild(this.__internal.buttons[0].element);
					} else {
						this.elements.buttons.primary.appendChild(this.__internal.buttons[1].element);
					}
					break;
				case 'defaultFocus':
					this.__internal.focus.element = newValue === 'ok' ? 0 : 1;
					break;
			}
		},
		callback: function (closeEvent) {
			clearAutoConfirm(this);
			var returnValue;
			switch (closeEvent.index) {
				case 0:
					if (typeof this.get('onok') === 'function') {
						returnValue = this.get('onok').call(this, closeEvent);
						if (typeof returnValue !== 'undefined') {
							closeEvent.cancel = !returnValue;
						}
					}
					break;
				case 1:
					if (typeof this.get('oncancel') === 'function') {
						returnValue = this.get('oncancel').call(this, closeEvent);
						if (typeof returnValue !== 'undefined') {
							closeEvent.cancel = !returnValue;
						}
					}
					break;
			}
		},
		hooks: {
			onshow: function () {
				this.elements.footer.style.display = "block";
				this.elements.header.setAttribute("style", "border: 1px solid #e5e5e5 !important;");
				this.elements.content.setAttribute("style", "padding: 16px 24px 16px 16px !important;");
			}
		},
		autoOk: function (duration) {
			startAutoConfirm(this, 0, duration);
			return this;
		},
		autoCancel: function (duration) {
			startAutoConfirm(this, 1, duration);
			return this;
		}
	};
});

alertify.myConfigAlert || alertify.dialog('myConfigAlert', function () {
	return {
		main: function (_title, _message, _onok) {
			var title, message, onok;
			switch (arguments.length) {
				case 1:
					message = _title;
					break;
				case 2:
					if (typeof _message === 'function') {
						message = _title;
						onok = _message;
					} else {
						title = _title;
						message = _message;
					}
					break;
				case 3:
					title = _title;
					message = _message;
					onok = _onok;
					break;
			}
			this.set('title', title);
			this.set('message', message);
			this.set('onok', onok);
			return this;
		},
		setup: function () {
			return {
				buttons: [
					{
						text: alertify.defaults.glossary.ok,
						key: 27,
						invokeOnClose: true,
						className: alertify.defaults.theme.ok,
					}
				],
				focus: {
					element: 0,
					select: false
				},
				options: {
					maximizable: false,
					resizable: false
				}
			};
		},
		build: function () {
			// nothing
		},
		prepare: function () {
			//nothing
		},
		setMessage: function (message) {
			this.setContent(message);
		},
		settings: {
			message: undefined,
			onok: undefined,
			label: undefined,
		},
		settingUpdated: function (key, oldValue, newValue) {
			switch (key) {
				case 'message':
					this.setMessage(newValue);
					break;
				case 'label':
					if (this.__internal.buttons[0].element) {
						this.__internal.buttons[0].element.innerHTML = newValue;
					}
					break;
			}
		},
		callback: function (closeEvent) {
			if (typeof this.get('onok') === 'function') {
				var returnValue = this.get('onok').call(this, closeEvent);
				if (typeof returnValue !== 'undefined') {
					closeEvent.cancel = !returnValue;
				}
			}
		},
		hooks: {
			onshow: function () {
				this.elements.footer.style.display = "block";
				this.elements.header.setAttribute("style", "border: 1px solid #e5e5e5 !important;");
				this.elements.content.setAttribute("style", "padding: 16px 24px 16px 16px !important;");
			}
		},
	};
});

$('#btnEditarBeneficiario').click(function(e){
	if($('#tipodocuidb').val() == null){
		$('#tipodocuidb_chosen').css('border', '1px solid red');
		$('#tipodocuidb_chosen').css('border-radius', '4px');
	}else{
		$('#tipodocuidb_chosen').css('border', '');
		$('#tipodocuidb_chosen').css('border-radius', '');
	}
    if ($("#frmRegistroBeneficiarios").valid() && $('#tipodocuidb').val() != null ) {
        const form = document.querySelector('#frmRegistroBeneficiarios');
        var formData = new FormData(form);
        formData.append('TerceroID',$('#TerceroIDb').val());
        $.ajax({
                url: rutaGeneral + "editarBeneficiario",
                type: 'POST',
                dataType: 'json',
                processData: false,
                contentType: false,
                data: formData,
                success: function(registro){
                    if (registro == 1) {
                        alertify.success("Se actualizo el beneficiario correctamente");
                        $('#modalBeneficiario').modal("hide");
                        cargarTercero(cedula, tipo);
                    }
                },
        });
    }else{
		alertify.error("Valide la información de los campos.");
	}
});

$(document).on('keydown', "input:not(button, [type=search], .flexdatalist-alias, .chosen-search-input,  .dataTables_filter input), select", function (evt) {
	if (evt.keyCode == 13) {
		var fields = $(this).parents('form:eq(0),body').find('input,a,select,button,textarea,div[contenteditable=true]').filter(':visible:not([disabled])');
		var index = fields.index(this);

		if (index > -1 && (index + 1) < fields.length) {
			if (!fields.eq(index + 1).attr('disabled')) {
				if (fields.eq(index).is('button')) {
					fields.eq(index).click();
				} else {
					setTimeout(function () {
						fields.eq(index + 1).focus();
					}, 0);
				}
			} else {
				var self = this;
				setTimeout(function () {
					$(self).change().focusout();
				}, 0);
			}
		} else if ((index + 1) == fields.length) {
			var self = this;
			setTimeout(function () {
				$(self).change().focusout();
			}, 0);
		}
		return false;
	}
});

$(document).on({
	ajaxStart: function () {
		$("#overlay").removeClass('d-none');
		$('.loader-bg').show();
	},
	ajaxStop: function () {
		$("#overlay").addClass('d-none');
		$('.loader-bg').hide();
	},
	ajaxError: function (funcion, request, settings) {
		$("#overlay").removeClass('d-none');
		$('.loader-bg').hide();
		if (request.responseText != '' && request.responseText != undefined) {
			if (request.responseText.includes('DELETE') && request.responseText.includes('REFERENCE') && request.responseText.includes('FK')) {
				alertify.myConfig('Error de Integridad', 'No se puede eliminar, el registro se encuentra referenciado en otras tablas.', function () {
					this.destroy();
					alertify.myConfigAlert('Error de Integridad', request.responseText, function () {
						this.destroy();
					});
				}, function () {
					this.destroy();
				}, 'myConfigAlertify').set('labels', { ok: 'Ver Detalle', cancel: 'OK' });
			} else if (request.responseText.includes('Login::$db')) {
				location.reload();
			} else {
				alertify.myConfig('Error', `Se ha producido un problema al ejecutar el proceso.
					<br/>
					<br/>
					Para obtener más información de este problema y posibles correcciones, pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.`, function () {
					this.destroy();
					alertify.myConfigAlert('Error', request.responseText, function () {
						this.destroy();
					});
				}, function () {
					this.destroy();
				}).set('labels', { ok: 'Ver Detalle', cancel: 'OK' });
			}
			console.error(funcion);
			console.error(request);
			console.error(settings);

		}
	}
});

$(document).ready(function(){   

	//Validamos cuando cambia de pestaña
	$("#beneficialink").on("click", function(){
		setTimeout(() => {
			dtBeneficiarios.columns.adjust();
		}, 500);
	});

	$("#informacionBasica")[0].reset();
	$('#TerceroID').change(function(){
		dtBeneficiarios.clear().draw();
		cedula = $(this).val();
		tipo = $(this).data("tiposocio");
		cargarTercero(cedula, tipo);
	});
	$('#informacionBasica input,select').not('#TerceroID').prop('disabled',true);
	$(".chosen-select").trigger('chosen:updated');

	$(document).on('change', '[data-db=tipodocuId]', function () {
		if ($(this).val() == '31') {
			$(".label-razonsocia").html('<span class="text-danger"> *</span> Razón Social');
			$("#razonsocia").attr('required',true);
			$(".label-nombruno").html('Primer Nombre');
			$(".label-apelluno").html('Primer Apellido');
			$("[data-db=digitverif]").focusin().val(calcularDigitoVerificacion(cedula)).focusout();
			$("[data-db=nombre]").focusin().val($('[data-db=razonsocia]').val()).focusout();
		} else {
			$(".label-nombruno").html('<span class="text-danger">*</span> Primer Nombre');
			$(".label-apelluno").html('<span class="text-danger">*</span> Primer Apellido ');
			$(".label-razonsocia").html('Razón Social');
            $("#razonsocia").attr('required',false);
			$("[data-db=digitverif]").focusin().val('').focusout();
			$("[data-db=nombre]").focusin().val($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val()).focusout();
		}
	});

	$("[data-db=nombruno], [data-db=nombrdos], [data-db=apelluno], [data-db=apelldos]").on("change", function(){
		$("[data-db=nombre]").val($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val());
	});
});

$('.chosen-select').chosen({no_results_text: 'No se encontraron datos'});

$('#beneficiarios').click(function(){
	$("#TerceroIDb").prop("disabled", false);
    $('#modalBeneficiario').modal("show");
		$('[data-imagen=foto]#inputFotob').closest('.imagen-container').find(".img-perfil").attr("src", base_url() + "assets/images/user/nofoto.png");
    $('#btnEditarBeneficiario').attr('hidden', true);
    $('#btnGuardarBeneficiario').attr('hidden', false);
    document.getElementById('frmRegistroBeneficiarios').reset();
    $('#tipodocuidb').chosen('destroy');
    $('#sexob').chosen('destroy');
    $('#tipodocuidb').chosen();
    $('#sexob').chosen();
    $('#btnGuardarBeneficiario').unbind().click(function(e){
        e.preventDefault();
        if($('#tipodocuidb').val() == null){
            $('#tipodocuidb_chosen').css('border', '1px solid red');
            $('#tipodocuidb_chosen').css('border-radius', '4px');
        }else{
            $('#tipodocuidb_chosen').css('border', '');
            $('#tipodocuidb_chosen').css('border-radius', '');
        }
        if ($("#frmRegistroBeneficiarios").valid() && $('#tipodocuidb').val() != null) {
            const form = document.querySelector('#frmRegistroBeneficiarios');
            var formData = new FormData(form);
            formData.append('accion',$accionId);
            formData.append('Tipo', "B");
            $.ajax({
                url: rutaGeneral + "guardarTercero",
                type: 'POST',
                dataType: 'json',
                processData: false,
                contentType: false,
                data: formData,
                success: function(registro){
                    if (registro == 1) {
                        alertify.success("Se guardo el beneficiario correctamente");
                        $('#modalBeneficiario').modal("hide");
                        cargarTercero(cedula, tipo);
                    }else if (registro == 0){
                        alertify.warning("La persona a la que desea agregarle el beneficiario, no es un Socio.");
                    }else if(registro == 2 || registro == 3){
                        alertify.warning("La persona que desea agregar ya se encuentra registrada");
                    }
                },
        
            });
        } else {
            alertify.error("Valide la información de los campos.");
        }
       
    });
});

$("#inputFoto, #inputFotob").change(function(){
	let validaDocumento = $('#'+$(this).data('tercero')).val();
	
	if(validaDocumento != ''){
		leerImg(this,validaDocumento);
	}else{
		if($(this).data('tercero') == 'TerceroID'){
			alertify.error('No hay un cliente cargado');
		}else{
			alertify.error('No hay un beneficiario cargado');
		}
	}
});

function ValidateSize(file) {
	var FileSize = file.files[0].size / 1024 / 1024;
	
	if (FileSize > 2) {
		$(file).val('');
		alertify.error("El tamaño maximo de los archivos/documentos es 2 mb");
	}else{
		console.log(file);
	}
}

$("#informacionBasica").submit(function (e) {
	e.preventDefault();
	if ($("#informacionBasica").valid()) {
        const form = document.querySelector('#informacionBasica');
        var formData = new FormData(form);
        $.ajax({
            url: rutaGeneral + "ActualizarTercero",
            type: 'POST',
            dataType: 'json',
            processData: false,
            contentType: false,
            data: formData,
            success: function(registro){
                if (registro == '1') {
                    alertify.success("Se actualizó correctamente");
                }else{
                    alertify.error("Ocurrio un error.");
                }
            },
        });
	} else {
		alertify.error("Valide la información de los campos.");
	}
});

function cargarTercero(cedula, tipo = "B"){
    $.ajax({
        url: rutaGeneral + "cargarTercero",
        type: 'POST',
        dataType: 'json',
        data: {
            codigo: cedula,
            tipo,
            RASTREO: RASTREO('Carga Tercero '+ cedula, 'Terceros')
        },
        success: function(resp){
					$terceroSocio = resp;
					if (resp.datosTercero.length > 0) {
						resp.datosTercero.forEach(element => {
							$accionId =element.Accionid;
							$Tipo =element.Tipo;
							actualizarSelect('#tipodocuId',element.tipodocuid,element.nombre);
							actualizarSelect('#estadocivilid',element.estadocivilid,element.estadocivilid);
							actualizarSelect('#sexo',element.sexo,element.sexo);
							actualizarSelect('#ciudanacimNombre',element.ciudanacim,element.ciudanacimNombre);
							actualizarSelect('#paisid',element.paisid,element.paisidNombre);
							actualizarSelect('#dptoid',element.dptoid,element.dptoNombre);
							actualizarSelect('#ciudadid',element.ciudadid,element.ciudadidNombre);
							actualizarSelect('#barrioid',element.barrioid,element.barrioidNombre);
							actualizarSelect('#zonaid',element.zonaid,element.zonaidNombre);
							actualizarSelect('#profesionid',element.profesionid,element.profesionidNombre);
							$('#digitverif').val(element.digitverif);
							$('#razonsocia').val(element.razonsocia);
							$('#nombre').val(element.nombruno +' '+element.nombrdos+' '+element.apelluno+' '+element.apelldos)
							$('#nombruno').val(element.nombruno);
							$('#nombrdos').val(element.nombrdos);
							$('#apelluno').val(element.apelluno);
							$('#apelldos').val(element.apelldos);
							$('#email').val(element.email);
							$('#email2').val(element.email2);
							$('#celular').val(element.celular);
							$('#numercredi').val(element.numercredi);
							$('#fechanacim').val(element.fechanacim);
							$('#direccion').val(element.direccion);
							$('#telefono').val(element.telefono);
							$('#ocupacion').val(element.ocupacion);
							$('#hijos').val(element.hijos);
							$('#foto').val(element.foto);
							accion = element.Accionid;

							if (element.tipodocuid == '31') {
								$("[data-db=digitverif]").focusin().val(calcularDigitoVerificacion(cedula)).focusout();
								$("[data-db=nombre]").focusin().val($('[data-db=razonsocia]').val()).focusout();
							} else {
								$("[data-db=digitverif]").focusin().val('').focusout();
								$("[data-db=nombre]").focusin().val($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val()).focusout();
								$('#h2Cliente').text($('[data-db=nombruno]').val() + ' ' + $('[data-db=nombrdos]').val() + ' ' + $('[data-db=apelluno]').val() + ' ' + $('[data-db=apelldos]').val());
							}
							$("#tipodocuId").change();

							if(element.foto !== "" && element.foto !== null){
								$('[data-imagen=foto]').closest('.imagen-container').find(".img-perfil").attr("src", "data:image/jpeg;base64," + element.foto);
							}else{
								$('[data-imagen=foto]').closest('.imagen-container').find(".img-perfil").attr("src", base_url() + "assets/images/user/nofoto.png");
							}
						});

						dtBeneficiarios.clear();
						resp.datosBeneficiario.forEach(element => {
							dtBeneficiarios.row.add([element.TerceroId, element.nombre]).draw();
						});

						$('#informacionBasica input, select, #btnFoto, .subir-foto, #beneficiarios').not('#TerceroID').prop('disabled',false);
						$(".chosen-select").trigger('chosen:updated');
					}else{
						dtBeneficiarios.clear().draw();
						alertify.alert("Advertencia", "La persona con número de documento <b>"+cedula+"</b> no se encuentra registrado como titular de una acción");
						$("#informacionBasica")[0].reset();
						$("#informacionBasica :input").removeClass('is-invalid');
						$("#informacionBasica").validate().resetForm();
						$('#informacionBasica input,select, #btnFoto, .subir-foto, #beneficiarios').not('#TerceroID').prop('disabled',true);
						$(".chosen-select").trigger('chosen:updated');
						$('[data-imagen=foto]').closest('.imagen-container').find(".img-perfil").attr("src", base_url() + "assets/images/user/nofoto.png");
					}
        },

    });
}

$("#dptoid").on("change", function(){
	$.ajax({
		url: rutaGeneral + "cargarCiudades",
		type: "POST",
		async: false,
		dataType: 'json',
		data: {
			dpto: $(this).val(),
		},
		success: function (resp) {
			$("#ciudadid").empty();

			resp.forEach(element => {
				$("#ciudadid").append(`<option value="${element.ciudadid}">${element.nombre}</option>`)
			});

			$("#ciudadid").trigger("chosen:updated")
		},
	});
});

//esta funcion es para actualizar los select cuando cargamos un socio.
function actualizarSelect(selectId,idselect,nombreselect){
	$(selectId).val(idselect).change().trigger("chosen:updated");
    // const select = $(selectId);
    // select.empty();
    // if (idselect != null) {
        // select.append('<option value="'+idselect+'">' + nombreselect + '</option>');
        // select.trigger('chosen:updated');
    // }
}

//funciones para la carga de las imagenes
function seleccionarFoto(param) {
	$("#"+param).click();
}

function leerImg(input,Documento) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var background = e.target.result;
			if(typeof FormData !== 'undefined'){
				var rastreo = RASTREO('Modifica Cliente '+cedula+' Cambia Foto', 'Terceros');
				var form_data = new FormData();
				form_data.append('file', $(input)[0].files[0]);
				form_data.append('imagen', $(input).attr('data-imagen'));
				form_data.append('src', "");
				form_data.append('accion', accion);
				form_data.append('cliente', Documento);
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
						var respuesta = JSON.parse(respuesta);
						if(respuesta != 1 && respuesta != 3){
							alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
								this.destroy();
							});
						}else{
							if(respuesta == 3){
								$('#btnGuardarBeneficiario').attr('hidden',true);
								$('#btnEditarBeneficiario').removeAttr('hidden',false);
							}
							$(input).closest('.imagen-container').find(".img-perfil").attr("src", background);
						}
					}
				});
			}
		}
		reader.readAsDataURL(input.files[0]);
	}
}

function guardarFoto(foto,inputFotob){
	let validaDocumento = $('#'+inputFotob).val();

	if(typeof FormData !== 'undefined'){
		var rastreo = RASTREO('Modifica Cliente '+validaDocumento+' Cambia Foto', 'Terceros');
		var form_data = new FormData();
		form_data.append('file', "");
		form_data.append('imagen', "");
		form_data.append('src', foto.substr(22));
		form_data.append('accion', accion);
		form_data.append('cliente', validaDocumento);
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
				var respuesta = JSON.parse(respuesta);
				if(respuesta != 1 && respuesta != 3){
					alertify.alert('Error', "<h3 class='mensaje-alerta'>" + respuesta + "</h3>", function(){
						this.destroy();
					});
				}else{
					if(respuesta != 3){
						$("#modalFoto").modal("hide");
					}else{
						$('#btnGuardarBeneficiario').attr('hidden',true);
						$('#btnEditarBeneficiario').removeAttr('hidden',false);
					}
					$('#'+inputFotob).closest('form').find(".img-perfil").attr("src", foto);
					$("#modalFoto").modal("hide");
				}
			}
		});
	}
}

$(document).on("hidden.bs.modal", function(e){
	if($(e.target).attr('id') === 'modalFoto' && lastModal === 'modalBeneficiario') {
		$("#modalBeneficiario").modal("show");
	}
});

function modalFoto(inputFotob){
	if (inputFotob == "TerceroID") {
		lastModal = null;
	} else {
		lastModal = 'modalBeneficiario';
	}
	let validaDocumento = $('#'+inputFotob).val();
	
	if(validaDocumento != ''){
		$("#modalBeneficiario").modal("hide");
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
						$($boton).unbind().on("click", function() {
		
							//Pausar reproducción
							$video.pause();
		
							//Obtener contexto del canvas y dibujar sobre él
							let contexto = $canvas.getContext("2d");
							$canvas.width = $video.videoWidth;
							$canvas.height = $video.videoHeight;
							contexto.drawImage($video, 0, 0, $canvas.width, $canvas.height);
		
							let foto = $canvas.toDataURL(); //Esta es la foto, en base 64
							guardarFoto(foto,inputFotob);
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
		if(inputFotob == 'TerceroID'){
			alertify.error('No hay un cliente cargado');
		}else{
			alertify.error('No hay un beneficiario cargado');
		}
	}
	
}

function calcularDigitoVerificacion(myNit) {

	var vpri,

		x,

		y,

		z;

	myNit = myNit.replace(/\s/g, ""); // Espacios

	myNit = myNit.replace(/,/g, ""); // Comas

	myNit = myNit.replace(/\./g, ""); // Puntos

	myNit = myNit.replace(/-/g, ""); // Guiones

	if (isNaN(myNit)) {

		console.log("El nit/cédula '" + myNit + "' no es válido(a).");

		return "";

	};

	vpri = new Array(16);

	z = myNit.length;

	vpri[1] = 3;

	vpri[2] = 7;

	vpri[3] = 13;

	vpri[4] = 17;

	vpri[5] = 19;

	vpri[6] = 23;

	vpri[7] = 29;

	vpri[8] = 37;

	vpri[9] = 41;

	vpri[10] = 43;

	vpri[11] = 47;

	vpri[12] = 53;

	vpri[13] = 59;

	vpri[14] = 67;

	vpri[15] = 71;

	x = 0;
	y = 0;

	for (var i = 0; i < z; i++) {
		y = (myNit.substr(i, 1));
		x += (y * vpri[z - i]);
	}

	y = x % 11;

	return (y > 1) ? 11 - y : y;
}

$(document).on("change", "#TerceroIDb", function () {
	const tmpTerceroId = $(this).val().trim();
	const self = this;

	$.ajax({
		url: rutaGeneral + "validarBeneficiario",
		type: "POST",
		dataType: 'json',
		data: {
			beneficiario: tmpTerceroId,
		},
		success: function (registro) {
			let existe = 0;
			if (registro == 0) {
				alertify.warning(
					"La persona a la que desea agregarle el beneficiario, no es un Socio."
				);
				existe = 1;
			} else if (registro == 2 || registro == 3) {
				alertify.warning(
					"La persona que desea agregar ya se encuentra registrada"
				);
				existe = 1;
			}
			if (existe) {
				$(self).val("");
				setTimeout(() => {
					$(self).focus();
				}, 10);
			}
		},
	});
});