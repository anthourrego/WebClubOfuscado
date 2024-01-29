

$(function () {
	crearCabecera(cabeceraExcel, 'crearCabeceraExcel');

	DTtblImportar = $('#tblImportar').DataTable({
		language: $.Constantes.lenguajeTabla,
		order: [],
		dom: 'Bfrtp',
		fixedColumns: true,
		processing: true,
		// serverSide: true,
		pageLength: 10,

		scrollY: $(document).height() - 480,
        scrollX: true,
        scroller: {
            loadingIndicator: true
        },
        scrollCollapse: true,
        columnDefs: [],
		ajax: {
			url: rutaGeneral + 'cargarExcel',
			type: 'POST',
			data: function(d){
				return new FormData( $("#frmExcel")[0]);
			},
			async	: false,
			cache	: false,
			contentType : false,
			processData : false
		},
		buttons: [{
			extend: 'copy',
			className: 'copyButton',
			text: 'Copiar',
			exportOptions: { columns: ':not(.noExport)' },
		}, {
			extend: 'excel',
			className: 'excelButton',
			orientation: 'landscape',
			exportOptions: { columns: ':not(.noExport)' },
			pageSize: 'letter',
		}, {
			extend: 'pdf',
			className: 'pdfButton',
			tex: 'PDF',
			orientation: 'landscape',
			exportOptions: { columns: ':not(.noExport)' },
			pageSize: 'letter'
		}, {
			extend: 'print',
			className: 'printButton',
			orientation: 'landscape',
			pageSize: 'letter',
			exportOptions: { columns: ':not(.noExport)' },
			text: 'Imprimir'
		}],
		columns: [
			{data: 'A0'}
			,{data: 'A1'}
			,{data: 'A2'}
			,{data: 'A3'}
			,{data: 'A4'}
			,{data: 'A5'}
		],
		drawCallback:function(settings){
			if(this.api().rows().data().length > 0){
				$('#btnImportar').attr('disabled', false);
			}else{
				$('#btnImportar').attr('disabled', true);
			}
		},
		createdRow: function(row, data, dataIndex){
			for (var i = 0; i < 47; i++) {
				var dato = ""+data['A'+i]+"";
				dato = dato.substring(0,1);
				console.log(dato);
				if(dato == '*'){
					$(row).find('td:eq('+i+')').addClass('td-warning');
				}
			}
		}
	});
});

$("#excelfile").change(function(e){
	DTtblImportar.clear().draw();
	if(typeof FormData !== 'undefined'){
		DTtblImportar.ajax.reload();
	}
});

$('#btnImportar').click(function(e){
	e.preventDefault();
	if($('.td-warning').length > 0){
		alertify.alert('Advertencia', `Por favor verificar el archivo importado en la tabla mostrada en pantalla,\
		cada campo señalado en color <strong class="text-danger">ROJO</strong> significa que no puede ser cargado por exceder el tamaño mencionado o no cumplir con las condiciones específicadas en la seccción de <strong>"Ayuda"</strong>`);
	}else{
		$.ajax({
			type: 'POST',
			dataType:'json',
			url: rutaGeneral + "Importar",
			data:{
				EventoReservaId,
				listaInvitado: JSON.stringify(DTtblImportar.rows().data().toArray())
				,RASTREO: RASTREO('Importa archivo de Invitados','Importar Lista Invitados')
			},
			success:function(res){
				switch(res){
					case '1':
						alertify.success('Lista de Invitados, los invitados se han importado satisfactoriamente y han sido cargados al modulo');
						DTtblImportar.clear().draw();
					break;
					case '2':
						alertify.alert('Advertencia', 'Por favor verificar el archivo importado en la tabla mostrada en pantalla,\
							cada campo señalado en color ROJO significa que no puede ser cargado por exceder el tamaño mencionado o no cumplir con las condiciones específicadas en la seccción de "Ayuda"');
					break;
					default:
						alertify.error('Lo sentimos, ocurrió un problema al subir el archivo');
						console.error(res);
					break;
				}
			}
		});
	}
});


$('#btnAyuda').click(function(e){
	e.preventDefault();
	$('#modalAyuda').modal('show');
	if(!tblDTAyuda){
		setTimeout(() => {
			tblDTAyuda   = $("#tblAyuda").DataTable({
				scrollY  : $(document).height() - 480,
				scrollX  : true,
				scroller : {
					loadingIndicator : true
				},
				scrollCollapse : true,
				columnDefs : [],
				pageLength : -1
			});
		}, 200);
	}
});

$(function(){
	// $('#btnAyuda').click();
});
