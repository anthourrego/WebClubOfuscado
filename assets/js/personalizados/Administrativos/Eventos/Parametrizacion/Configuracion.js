let rutaGeneral = base_url() + 'Administrativos/Eventos/Parametrizacion/Configuracion/';
const PROGRAMA = "Configuración Eventos";

$(function(){
  RastreoIngresoModulo(PROGRAMA);

  $(".chosen-select").chosen({ width: '100%' });

  $(".custom-select").on("change", function(){
    let campo = $(this).attr("name");
    let valor = $(this).val();
    $.ajax({
      url: rutaGeneral + "ActualizarMontaje",
      type: "POST",
      dataType: "json",
      data: {
        campo, 
        valor, 
        RASTREO: RASTREO('Modifica Montaje ', PROGRAMA)
      },
      success: (resp) => {
        if(resp.success){
          alertify.success(resp.msj);
        } else {
          alertify.error(resp.msj);
        }
      }
    });
  })
});