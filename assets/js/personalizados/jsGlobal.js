showTeclado = true;

function guardarMenu(e) {
	$.ajax({
		url: base_url() + "login2/estadoMenu",
		type: "POST",
		dataType: 'json',
		data: {
			clase: $(".pcoded-navbar")[0].classList.contains('navbar-collapsed')
		},
		success: () => { }
	});
}

function toTitleCase(str) {
	return str.toLowerCase().split(' ').map(function (word) {
		return (word.charAt(0).toUpperCase() + word.slice(1));
	}).join(' ');
}

function abrirReporte(url, context = null, funcion = null, params = null, evento = 'onunload') {
	var winPrint = window.open(url);

	if (navigator.userAgent.toLocaleLowerCase().indexOf('chrome') > -1) {

		winPrint[evento] = function (e) {
			e.preventDefault();
			if (context && funcion) {
				context[funcion](params);
			}
			setTimeout(() => {
				let win = window.open(base_url(), '_blank');
				win.close();
			}, 10);
			return "¿Está seguro de cerrar la ventana forzada?";
		};
	} else {
		if (context && funcion) {
			context[funcion](params);
		}
	}
}

function peticionCajaCongelada(congelar, adicional) {
	$.ajax({
		url: base_url() + "login2/congelarCaja",
		type: "POST",
		dataType: 'json',
		data: {
			congelar, adicional, RASTREO: RASTREO((congelar == 'S' ? 'Descongela Caja' : 'Congela Caja'), 'Panel Principal')
		},
		success: function (res) {
			if (res.valido) {
				location.reload();
			} else {
				alertify.error(res.msj);
				$("#congelarCaja").click();
			}
		}
	});
}

function soloLetrasNumeros(e, input){
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "abcdefghijklmnopqrstuvwxyz1234567890-+/";
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

function soloNumeros(e, input) {
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "1234567890";
	especiales = "8-37-39-46";

	tecla_especial = false;

	for (var i in especiales) {
		if (key == especiales[i]) {
			tecla_especial = true;
			break;
		}
	}

	if (letras.indexOf(tecla) == -1 && !tecla_especial) {
		return false;
	}
}

function getNotificaciones() {
	$.ajax({
		url: base_url() + "Utilidades/Notificaciones/getNotificaciones",
		global: false,
		success: function (notificaciones) {
			if (notificaciones != '') {
				notificaciones = JSON.parse(notificaciones);
				var total = notificaciones['Total'];
				if (notificaciones['Total'] > 0) {
					$("[id=totalAlertas]").html(notificaciones['Total']);
				} else {
					$("[id=totalAlertas]").html('');
				}
				document.title = `${total ? `(${total})` : ''} Cocora A&B - Prosof`;
				if (notificaciones['Nuevas'].length > 0) {
					for (var i = 0; i < notificaciones['Nuevas'].length; i++) {
						notifyMe(notificaciones['Nuevas'][i]);
					}
				}
			}
		}
	});
}

function spawnNotification(theBody, theTitle) {
	var options = {
		body: theBody,
		icon: base_url() + 'uploads/' + NIT() + '/InformacionHotel/logo_cliente.png'
	}
	var n = new Notification(theTitle, options);
}

function notifyMe(alerta) {
	var titulo = tipoAlerta(alerta['Tipo']);
	if (alerta['Numero'] != '') {
		if (alerta['Tipo'] == 'DE') {
			titulo += ' - ' + alerta['Descripcion'].split('-')[1].trim();
		} else if (alerta['Tipo'] == 'MA') {
			titulo += ' alertas';
		} else {
			titulo += ' - ' + alerta['Numero'];
		}
	}
	// Let's check if the browser supports notifications
	if (!("Notification" in window)) {
		alertify.error("Este navegador no soporta las notificaciones de escritorio.");
	}

	// Let's check whether notification permissions have already been granted
	else if (Notification.permission === "granted") {
		// If it's okay let's create a notification
		spawnNotification(alerta['Descripcion'], titulo);
	}

	// Otherwise, we need to ask the user for permission
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function (permission) {
			// If the user accepts, let's create a notification
			if (permission === "granted") {
				spawnNotification(alerta['Descripcion'], titulo);
			}
		});
	}
	// At last, if the user has denied notifications, and you 
	// want to be respectful there is no need to bother them any more.
}

function notiAS(id, descripcion) {
	alertify.alert('Alerta del Sistema', descripcion, function () {
		$.ajax({
			url: base_url() + "Utilidades/Notificaciones/actualizarAlerta",
			type: 'post',
			data: {
				id: id
			}, success: function (resp) {

			}, error: function (error) {
				console.log(error);
			}
		});
	});
}

function tipoAlerta(tipo) {
	switch (tipo) {
		default:
			return 'General';
			break;
		case 'DE':
			return 'Despertador';
			break;
		case 'MA':
			return 'Memo';
			break;
	}
}

function tipoUrl(tipo, numero) {
	switch (tipo) {
		default:
			return '#';
			break;
		case 'DE':
			return '#';
			break;
		case 'MA':
			return '#';
			break;
	}
}

function addCommas(nStr, decimales = 0) {
	if (nStr != 'null' && nStr > 0) {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '.';
		for (var i = 0; i < decimales; i++) {
			x2 += '0';
		}

		x2 = x2.substr(0, (1 + decimales));

		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		if (decimales == 0) {
			return x1;
		} else {
			return x1 + x2;
		}
	} else {
		str = "0";
		for (let i = 0; i < decimales; i++) {
			if (i == 0) str += '.';
			str += '0';
		}
		return str;
	}
}

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

function primerFocus(validarEventoFocus, currentModal){
	switch (validarEventoFocus) {
		case 2:
			setTimeout(function () {
				selectedInput = '#' + currentModal.find('input[type=search],input[type=text]:not([disabled = true], [disabled = disabled]),textarea,select').filter(':visible:first').attr('id');
				selectedClass = $('.modal').find('input:eq(0)').attr('class') ? $('.modal').find('input:eq(0)').attr('class') : '';
				$(selectedInput).focus();
				if(selectedInput == '#tipEvento' || selectedClass.includes('chosen') || selectedClass.includes('datepicker') || selectedClass.includes('datetimepicker') || $(selectedInput).is('select') || showTeclado == false){
					if (selectedClass.includes('chosen')) {
						firschosen = $(selectedInput).first();
						firschosen.focus();
						setTimeout(() => {
							firschosen.trigger('chosen:open');
						}, 500);
					}
					$('.keyboardContainer').fadeOut();
					$(selectedInput).focus();
				}else{
					$('.keyboardContainer').fadeIn();
					$(selectedInput).focus();
				}
			}, 700);
			break;

		case 3:
			setTimeout(function () {
				$('.ajs-content').find('input:eq(0)').focus();
				selectedInput = '#' + $('.ajs-content').find('input:eq(0)').attr('id');
				$('.keyboardContainer').fadeIn();
			}, 700);
			break;
	
		default:
			setTimeout(function () {
				$(document).find('.dataTables_filter').find('input:eq(0)').each(function(i){
					$(this).attr('id', 'buscar' +i );
					i++;
				});
				selectedClass =  $(document).find('input:eq(0)').attr('class') ? $(document).find('input:eq(0)').attr('class') : '';
				selectedInput = $(document).find('input[type=search],input[type=text],textarea,select').filter(':visible:first').attr('id');
				if (!selectedInput){
					selectedInput = document.querySelector('.form-control');
					selectedInput = selectedInput.id;
				}
				selectedInput = '#' + selectedInput;
				$(selectedInput).focus();
				if(selectedInput == '#valProducto' || selectedClass.includes('chosen') || selectedClass.includes('datepicker') || selectedClass.includes('datetimepicker') || $(selectedInput).is('select') || showTeclado == false){
					if (selectedClass.includes('chosen')) {
						firschosen = $(selectedInput).first();
						firschosen.focus();
						setTimeout(() => {
							firschosen.trigger('chosen:open');
						}, 700);
					}	
					$('.keyboardContainer').fadeOut();  
					$(selectedInput).focus(); 
				}else{	
					$('.keyboardContainer').fadeIn();
					$(selectedInput).focus();
				}
			}, 700);
			break;
	}
}
(function () {
	document.addEventListener('DOMContentLoaded', function (e) {

		alertify.defaults.transition = "slide";
		alertify.defaults.theme.ok = "btn btn-primary";
		alertify.defaults.theme.cancel = "btn btn-secondary";
		
		let validarEventoFocus = 1;
		primerFocus(validarEventoFocus);

		$(document).on('click', 'a[data-toggle=tab]', function () {
			primerFocus(validarEventoFocus = 1);
		});
		
		$('.modal').on('show.bs.modal', function (e) {
			currentModal = $(this);
			setTimeout(() => {
				primerFocus(validarEventoFocus = 2, currentModal);	
			}, 200);
		});
		
		$(".card-vendedor-cuenta-pendiente , .card-vendedor").on('click', function () {
			primerFocus(validarEventoFocus = 3);
		});

		$('.modal').on('hide.bs.modal', function (e) {
			currentModal = $(this);
			primerFocus(validarEventoFocus = 1);
		});

		$('form').attr('autocomplete', 'off');

		$("#overlay").addClass('d-none');

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

		window.onerror = function () {
			$("#overlay").addClass('d-none');
		};

		$(".cerrar").on("click", function (e) {
			e.preventDefault();
			$.ajax({
				url: base_url() + "login2/cierre",
				type: "POST",
				dataType: 'json',
				data: {
					RASTREO: RASTREO('Salida del Sistema CLUBWEB', 'Salida Sistema')
				},
				success: function (resp) {
					if (resp) {
						location.href = resp;
					} else {
						location.reload();
					}
				}
			});
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

		/*Notification.requestPermission();
		getNotificaciones();
		setInterval(function () {
			if (!$.active) {
				getNotificaciones();
			}
		}, 1000 * 30);*/

		$(document).on('click', function () {
			if ($(this).closest('[id=liNotificaciones]').length == 0
				&& $(this).closest('#divDropdownAlerta').length == 0) {
				if (!$("#divDropdownAlerta").hasClass('d-none')) {
					$("#divDropdownAlerta").addClass('d-none');
					$("#liNotificaciones").removeClass('active');
					$('#listadoNotificaciones').html('').addClass('d-none');
					$('#NANoti').removeClass('d-none');
				}
			}
		});

		$("[id=liNotificaciones]").click(function (e) {
			e.preventDefault();
			if (!$('#divDropdownAlerta').is(':visible')) {
				$('#divDropdownAlerta').removeClass('d-none');
				$('[id=listaAlerta]').html('').addClass('d-none');
				$('.NANoti').removeClass('d-none');
				getNotificaciones();
				$(this).addClass('active');
				$.ajax({
					url: base_url() + "Utilidades/Notificaciones/listaNotificaciones",
					cache: false,
					beforeSend: function () {
						$('.loaderNotificaciones').removeClass('d-none');
					},
					complete: function () {
						$('.loaderNotificaciones').addClass('d-none');
					},
					success: function (notificaciones) {
						notificaciones = JSON.parse(notificaciones);
						if (notificaciones.length > 0) {
							$('[id=listaAlerta]').removeClass('d-none');
							$('.NANoti').addClass('d-none');
							$.each(notificaciones, function () {
								var notificacion = `<a href="${tipoUrl(this['Tipo'], this['Numero'])}">
									<div class="panel panel-default panel-noti accionAlerta mb-0 p-0 w-100" data-id="${this['AlertaId']}" data-tipo="${this['Tipo']}" data-descripcion="${this['Descripcion']}" data-fecha="${this['Programada']}">
										<div class="panel-body panel-notificacion noti${this['Tipo']} pb-1 pl-2 pr-2 w-100">
											<strong>${tipoAlerta(this['Tipo'])}</strong><small> ${this['Reserva']}</small>
											<small class="horaNotificacion">${this['Programada']}</small><br>
											<p class="ellipsis">${this['Descripcion']}</p>
										</div>
									</div>
								</a>`;
								$('[id=listaAlerta]').append(notificacion);
							});
						} else {
							$('[id=listaAlerta]').addClass('d-none');
							$('.NANoti').removeClass('d-none');
						}
					}
				});
			} else {
				$('#divDropdownAlerta').addClass('d-none');
			}
		});

		$(document).find('#divDropdownAlerta').on('click', '.accionAlerta', function (e) {
			e.preventDefault();
			if ($(this).attr('data-tipo') == 'DE') {
				id = $(this).attr('data-id');
				descripcion = $(this).attr('data-descripcion');
				fecha = $(this).attr('data-fecha');
				alertify.confirm('Despertador', 'Descartar ' + descripcion + ' <br>Fecha: ' + fecha, function () {
					$.ajax({
						url: base_url() + "Utilidades/Notificaciones/actualizarAlerta",
						type: 'post',
						data: {
							id: id
						}, success: function (resp) {
							getNotificaciones();
							$("[id=liNotificaciones]").click();
						}, error: function (error) {
							console.log(error);
						}
					});
				}, function () { });
			} else if ($(this).attr('data-tipo') == 'MA') {
				id = $(this).attr('data-id');
				descripcion = $(this).attr('data-descripcion');
				fecha = $(this).attr('data-fecha');
				alertify.confirm('Memos', 'Alerta de Memo: ' + descripcion + ' <br>Fecha: ' + fecha, function () {
					$.ajax({
						url: base_url() + "Utilidades/Notificaciones/actualizarAlerta",
						type: 'post',
						data: {
							id: id
						}, success: function (resp) {
							getNotificaciones();
							$("[id=liNotificaciones]").click();
						}, error: function (error) {
							console.log(error);
						}
					});
				}, function () { });
			} else {
				location.href = $(this).closest('a').attr('href');
			}
		});


		$(document).on('click', '.notiAS', function (e) {
			e.preventDefault();
			notiAS($(this).attr("data-id"), $(this).attr("data-descripcion"));
		});

		$('#btnTecladoHUD').on('click', function (e) {
			e.preventDefault();
			$.ajax({
				url: base_url() + "login2/tecladoHUD",
				type: "POST",
				data: {},
				success: function (res) {
					location.reload();
				}
			});
		});

		$("#sincronizarPermisos").click(function (e) {
			e.preventDefault();
			$.ajax({
				url: base_url() + "login2/sincronizarPermisos",
				type: "POST",
				data: {},
				success: function (res) {
					location.reload();
				}
			});
		});

		$("#congelarCaja").click(function (e) {
			e.preventDefault();
			let congelada = $(this).data('congeleda');
			if (congelada == 'S') {
				alertify.prompt(
					'Digite su contraseña'
					, ''
					, ''
					, function (evt, value) {
						if (value != '') {
							peticionCajaCongelada(congelada, { clave: value });
						} else {
							setTimeout(() => {
								$("#congelarCaja").click();
							}, 1);
							alertify.warning("Por favor digite una contraseña valida");
						}
					}
					, function () { }
				).set('type', 'password');
			} else {
				peticionCajaCongelada(congelada, {});
			}
		});
	});
})();