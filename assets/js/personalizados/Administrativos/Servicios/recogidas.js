let rutaGeneral = base_url() + "Administrativos/Servicios/Recogidas/";

$(function () {
	RastreoIngresoModulo("Recogidas");
	$(document).on("click", "#btnAceptar", function (e) {
		e.preventDefault();
		if (validasuma > 0 || validaresta > 0) {
			$(".tecladoIgual").click();
		}

		setTimeout(function () {
			if (parseFloat($("[data-valor").val().replace(/,/g, ""))) {
				Efectivo = parseFloat($("[data-valor").val().replace(/,/g, ""));
				data = {
					UsuarioAutoriza: $USUARIO,
					Efectivo,
					Estado: "A",
					Tipo: "R",
					AlmacenId: $ALMACEN,
				};
				obtenerInformacion(data, "GuardarRecogida", "GuardarRecogida");
			} else {
				alertify.error("Por favor digite un valor");
				$("[data-valor").focus();
			}
		}, 500);
		UltimaTecla = "Aceptar";
	});
});

function GuardarRecogida(param) {
	validasuma = 0;
	validaigual = 0;
	$("[data-valor").val(0);
	$("[data-valor").val(0);
	$("#valorOperacion").attr("data-operacion", "0").html("");

	alertify.alert(
		"Recogida: " + param.Consecutivo,
		"Recogida almacenada satisfactoriamente",
		function () {
			abrirReporte(
				base_url() + "Reportes/ImprimirRecogidaBaseCaja/" + param.idInsertado,
				contexto,
				"redireccionRecogida"
			);
			location.reload();
		}
	);
}
