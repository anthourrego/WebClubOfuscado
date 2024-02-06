let rutaGeneral = base_url() + "Administrativos/Servicios/BaseCaja/";

$(function () {
	RastreoIngresoModulo("Base a Caja");
	$(document).on("click", "#btnAceptar", function (e) {
		e.preventDefault();
		if (validasuma > 0 || validaresta > 0) {
			$(".tecladoIgual").click();
		}

		setTimeout(function () {
			if (parseFloat($("[data-valor").val().replace(/,/g, ""))) {
				Efectivo = parseFloat($("[data-valor").val().replace(/,/g, ""));
				data = {
					UsuarioAutoriza: null,
					Efectivo,
					Estado: "A",
					Tipo: "B",
					AlmacenId: $ALMACEN,
				};
				obtenerInformacion(data, "GuardarBaseCaja", "GuardarBaseCaja");
			} else {
				alertify.error("Por favor digite un valor");
				$("[data-valor").focus();
			}
		}, 500);
		UltimaTecla = "Aceptar";
	});
});

function GuardarBaseCaja(param) {
	validasuma = 0;
	validaigual = 0;
	$("[data-valor").val(0);
	$("[data-valor").val(0);
	$("#valorOperacion").attr("data-operacion", "0").html("");

	alertify.alert(
		"Base a Caja: " + param.Consecutivo,
		"Base a Caja almacenada satisfactoriamente",
		function () {
			abrirReporte(
				base_url() +
					"Reportes/ImprimirRecogidaBaseCaja/" +
					param.idisertado +
					"/BaseCaja",
				contexto,
				"redireccionRecogida"
			);
			location.reload();
		}
	);
}
