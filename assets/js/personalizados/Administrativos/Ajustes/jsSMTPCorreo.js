let rutaBase = base_url() + 'Administrativos/Ajustes/SMTPCorreo/';
// se crea variable para las diferentes pestañas la cual cuando evento sea == 1 es de eventos y cuando sea == 0 es de general

function obtenerInfo(evento){
	$.ajax({
		url: rutaBase + 'obtenerDatos',
		type: "POST",
		data:{ evento },
		dataType: "json",
		success: function(resp){
			if (resp.length > 0) {
				$("#email").val(resp[0].emailSMTP);
				$("#servidor").val(resp[0].servidorSMTP);
				$("#puerto").val(resp[0].puertoSMTP);
				$("#conexion").val(resp[0].sslSMTP);
				$("#contra").val("");
				$("#servidor, #puerto, #conexion").prop("disabled", true);
				
				if (resp[0].tipoEmailSMTP == undefined) {
					let server = "O";

					switch (resp[0].servidorSMTP) {
						case "smtp.office365.com":
							server = "F";
							break;
						case "smtp.gmail.com":
							server = "G";
							break;
						case "smtp.live.com":
							server = "H";
							break;
						case "smtp.office365.com":
							server = "F";
							break;
					}

					$("#tipoCorreo").val(server).trigger("chosen:updated");
				} else {
					$("#tipoCorreo").val(resp[0].tipoEmailSMTP).trigger("chosen:updated");
				}
			}
		},
		error: function(error){
			alertify.alert('Error', error.responseText);
		}
	});
}

function pruebasEmail(correo) {
	// console.log(correo,evento);
	data = new FormData();
	data.append('tipoCorreo', $("#tipoCorreo").val());
	data.append('email', $("#email").val());
	data.append('contra', $("#contra").val());
	data.append('servidor', $("#servidor").val());
	data.append('puerto', $("#puerto").val());
	data.append('conexion', $("#conexion").val());
	data.append('correo', correo);
	data.append('tipo', $("#tabModal").find(".item-nav.active").data("tab"));

	$.ajax({
		url: rutaBase + 'pruebasEmail',
		type: "POST",
		dataType: "json",
		async		: false,
		cache		: false,
		contentType : false,
		processData : false,
		data,
		success: function(resp){
			console.log(resp);
			if (resp == 1) {
				alertify.success("El correo se envio correctamente.");
			} else {
				alertify.alert(resp);
			}
		}
	});
}

function pruebasReporte(correo) {
	$.ajax({
		url: rutaBase + 'pruebaReporte',
		type: "POST",
		dataType: "json",
		data: {correo},
		success: function(resp){
			if (resp == 1) {
				alertify.success("El correo se envio correctamente.");
			} else {
				alertify.alert(resp);
			}
		}
	});
}

$(function(){

	RastreoIngresoModulo('SMTP Correo');

	obtenerInfo("general");

	$("#tipoCorreo").on("change", function(){
		$("#email").val("");
		$("#servidor, #puerto, #conexion").val("").prop("disabled", false);

		if ($(this).val() == 'H') {
			$("#servidor").val("smtp.live.com").prop("disabled",true);
			$("#puerto").val("25").prop("disabled",true);
			$("#conexion").val("1").prop("disabled",true);
		} else if ($(this).val() == 'G') {
			$("#servidor").val("smtp.gmail.com").prop("disabled",true);
			$("#puerto").val("587").prop("disabled",true);
			$("#conexion").val("1").prop("disabled",true);
		} else if ($(this).val() == 'F') {
			$("#servidor").val("smtp.office365.com").prop("disabled",true);
			$("#puerto").val("587").prop("disabled",true);
			$("#conexion").val("1").prop("disabled",true);
		}
	});

	$("#pruebasEN").on("click", function(){
		if($("#frmRegistroEmail").valid()) {
			alertify.prompt('Correo para realizar la pruebas de envio.', $(this).data("nombre"), ''
				, function (evt, value) {
					if (value != '') {
						pruebasEmail(value);
					} else {
						setTimeout(() => {
							$("#pruebasEN").click();
						}, 100);
						alertify.warning("Por favor digite un correo");
					}
				}
				, function () { }).set('type', 'email');
		}
	});

	$("#reportePruebas").on("click", function(){
		alertify.prompt('Correo para realizar la pruebas de envio.', $(this).data("nombre"), ''
			, function (evt, value) {
				if (value != '') {
					pruebasReporte(value);
				} else {
					setTimeout(() => {
						$("#reportePruebas").click();
					}, 100);
					alertify.warning("Por favor digite un correo");
				}
			}
			, function () { }).set('type', 'email');
	});

	$("#frmRegistroEmail").unbind().on("submit", function(e){
		e.preventDefault();
		var $dataCRUD = {
			tipoEmailSMTP: $("#tipoCorreo").val() != "" ? $("#tipoCorreo").val() : null,
			emailSMTP:   $("#email").val() != "" ? $("#email").val() : null,
			passSMTP:    $("#contra").val() != "" ? $("#contra").val() : null,
			servidorSMTP:$("#servidor").val() != "" ? $("#servidor").val() : null,
			puertoSMTP:  $("#puerto").val() != "" ? $("#puerto").val() : null,
			sslSMTP:     $("#conexion").val() != "" ? $("#conexion").val() : null,
			tipoCorreo: $("#tabModal").find(".item-nav.active").data("tab")
		}
		email = $dataCRUD.tipoCorreo == "general" ? "POS" : "Eventos";
		var rastreo = `Modifica Email ${email}: ${$("#email").val()} Servidor:[${$("#servidor").val()}] Puerto:[${$("#puerto").val()}]`;

		if ($(this).valid()){
			$.ajax({
				url: rutaBase + "modificarMontaje",
				data: {
					Data: $dataCRUD,
					RASTREO:RASTREO(rastreo,"SMTP Correo")
				},
				type: "POST",
				dataType: 'json',
				success: (resp) => {
					if (resp.success) {
						alertify.success("Datos actualizados.");
					}else{
						alertify.error("Error al actualizar.");
					}
				}
			});
		}
	});

	$("#tabModal").find(".item-nav").on("click", function(e){
		e.preventDefault();
		obtenerInfo($(this).data("tab"));
	});
});