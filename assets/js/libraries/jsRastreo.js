function RASTREO($cambio, $programa) {
	var date = new Date(),
		fecha = date.getFullYear() + "-" + date.getDate() + "-" + (date.getMonth() + 1) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	return {
		fecha: fecha,
		programa: $programa,
		cambio: $cambio,
		accion: 'defecto',
		agregaMensaje: $cambio,
		idItem: ''
	};
}

function RastreoIngresoModulo(modulo = '',cambio = null) {
	if(cambio == null){
		if (performance.getEntriesByType("navigation").map(nav => nav.type)[0] == 'reload') return;
		cambio = 'Ingresa';
	}

	let date = new Date();
	let = fecha = `${date.getFullYear()}-${date.getDate()}-${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	$.ajax({
		url: base_url() + "login2/registroRastreo",
		type: "POST",
		data: {
			RASTREO: {
				fecha,
				programa: modulo,
				cambio,
			}
		},
		dataType: "json",
		success: function (resp) { }
	});
}
