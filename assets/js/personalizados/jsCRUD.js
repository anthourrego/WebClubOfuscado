var $EVENTO = '';

// 18/01/201 JCSM - Tabla CRUD Generalizado
function dataTableSSCRUD($parametros = {}){
	var settings = {
		processing: true,
		serverSide: true,
		order: [],
		draw: 10,
		language: {
			lengthMenu: "Mostrar _MENU_ registros por página.",
			zeroRecords: "No se ha encontrado ningún registro.",
			info: "Mostrando _START_ a _END_ de _TOTAL_ entradas.",
			infoEmpty: "Registros no disponibles.",
			search   : "",
			searchPlaceholder: "Buscar",
			loadingRecords: "Cargando...",
			processing:     "Procesando...",
			paginate: {
				first:      "Primero",
				last:       "Último",
				next:       "Siguiente",
				previous:   "Anterior"
			},
			infoFiltered: "(_MAX_ Registros filtrados en total)"
		},
		fixedColumns: true,
		pageLength: 10,
		columnDefs: [
		   { orderable: false, targets: [0], width: '1%' }
		],
		ajax: {
			url: base_url() + $DIRECTORY + $CONTROLADOR + "/dataTableSSCRUD",
			type: 'POST'
		},
		buttons: [
			{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
			{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
			{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
			{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
			{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: {columns: ':not(:first-child)', title: 'CLUBAPP - ' + $TITULO} }
		],
		initComplete: function(){
			$('div.dataTables_filter input').unbind();
			$("div.dataTables_filter input").keyup( function (e) {
				e.preventDefault();
				if (e.keyCode == 13) {
					table = $("body").find("#tblCRUD").dataTable();
					table.fnFilter( this.value );
				}
			} );
			$('div.dataTables_filter input').focus();
		},
		deferRender: true,
		scrollX: '100%',
		scrollY: $(document).height() - 350,
        scroller: {
            loadingIndicator: true
        },
		scrollCollapse: false,
		dom: 'Bftri',
        createdRow: function(row, data, dataIndex){
        	var botonesAdicionales = '';
        	if($botonesTabla.length > 0){
        		for (var i = 0; i < $botonesTabla.length; i++) {
        			var boton = "<a href='"+base_url()+$botonesTabla[i].href.replace('{ID}',data[1])+"' class='btn btn-"+$botonesTabla[i].boton+" btn-xs'><span class='glyphicon glyphicon-"+$botonesTabla[i].icono+"' title='"+$botonesTabla[i].titulo+"'></span></a>"
        			botonesAdicionales += boton;
        		}
        	}
        	var botones = "<center><div class='btn-group btn-group-xs'>\
					<button type='button' class='editar btn btn-success'><span class='far fa-edit' title='Editar'></span></button>"+botonesAdicionales+"\
					<button type='button' class='eliminar btn btn-danger'><span class='far fa-trash-alt' title='Eliminar'></span></button>\
				</div></center>";
			$(row).find('td:eq(0)').html(botones);
		}
	};
	delete $parametros['data'];
	for(var attrname in $parametros){
		settings[attrname] = $parametros[attrname];
		delete $parametros[attrname];
	}
	settings = Object.assign(settings, $parametros);
	var dt = $("body").find("#tblCRUD").DataTable(settings);
	return dt;
}

var oldExportAction = function (self, e, dt, button, config) {
	if (button[0].className.indexOf('buttons-excel') >= 0) {
		if ($.fn.dataTable.ext.buttons.excelHtml5.available(dt, config)) {
			$.fn.dataTable.ext.buttons.excelHtml5.action.call(self, e, dt, button, config);
		}
		else {
			$.fn.dataTable.ext.buttons.excelFlash.action.call(self, e, dt, button, config);
		}
	} else if (button[0].className.indexOf('buttons-print') >= 0) {

		$.fn.dataTable.ext.buttons.print.action(e, dt, button, config);
	}
};

var newExportAction = function (e, dt, button, config) {
	var self = this;
	var oldStart = dt.settings()[0]._iDisplayStart;

	dt.one('preXhr', function (e, s, data) {
		// Just this once, load all data from the server...
		data.start = 0;
		//data.length = 2147483647;
		data.length = -1;

		dt.one('preDraw', function (e, settings) {
			// Call the original action function 
			oldExportAction(self, e, dt, button, config);

			dt.one('preXhr', function (e, s, data) {
				// DataTables thinks the first item displayed is index 0, but we're not drawing that.
				// Set the property to what it was before exporting.
				settings._iDisplayStart = oldStart;
				data.start = oldStart;
			});

			// Reload the grid with the original page. Otherwise, API functions like table.cell(this) don't work properly.
			setTimeout(dt.ajax.reload, 0);

			// Prevent rendering of the full data to the DOM
			return false;
		});
	});

	// Requery the server with the new one-time export settings
	dt.ajax.reload();
};

$("#frmCRUD").on("submit", function(e){
	e.preventDefault();
	var $DATA = {},
		$CODIGO = $("[data-codigo]").val(),
		$ID = $("[data-codigo]").attr('data-db'),
		$DATAORIGINAL = {},
		$NOMBRECAMPOS = {};
	$("#frmCRUD").find("[data-db]").not('[data-identity-insert]').each(function(){
		if($(this).is(':checkbox')){
			if($(this).is(':checked')){
				var value = $(this).attr('data-on');
			}else{
				var value = $(this).attr('data-off');
			}
			if(value != $(this).attr('data-original')){
				$DATA[$(this).attr('data-db')] = value;
				$DATAORIGINAL[$(this).attr('data-db')] = $(this).attr('data-original');
				$NOMBRECAMPOS[$(this).attr('data-db')] = $('[for='+$(this).attr('data-db')+']').text();
			}
		}else if($(this).hasClass('inputmask')){
			if($(this).val() == ''){
				var value = 0;
			}else{
				var value = parseFloat($(this).val().replace(/,/g,''));
			}
			if(value != parseFloat($(this).attr('data-original'))){
				$DATA[$(this).attr('data-db')] = value;
				$DATAORIGINAL[$(this).attr('data-db')] = $(this).attr('data-original');
				$NOMBRECAMPOS[$(this).attr('data-db')] = $('[for='+$(this).attr('data-db')+']').text();
			}
		}else if($(this).val() != $(this).attr('data-original') && !(typeof $(this).attr('data-original') == 'undefined' && $(this).val() == '')){
			if($(this).val() == ''){
				$DATA[$(this).attr('data-db')] = null;
			}else{
				$DATA[$(this).attr('data-db')] = $(this).val();
			}
			$DATAORIGINAL[$(this).attr('data-db')] = $(this).attr('data-original');
			$NOMBRECAMPOS[$(this).attr('data-db')] = $('[for='+$(this).attr('data-db')+']').text();
		}
	});
	var retornar = false;
	$("#frmCRUD").find("[max]").each(function(){
		if(parseInt($(this).val()) > parseInt($(this).attr('max'))){
			var self = this;
			alertify.error('El campo seleccionado excede el valor máximo ('+$(self).attr('max')+')');
			$(self).focus();
			retornar = true;
			return false;
		}
	});
	if(retornar == true){
		return false;
	}
	if(Object.keys($DATA).length > 0){
		$.ajax({
			url: base_url() + $DIRECTORY + $CONTROLADOR + "/guardarCRUD/" + $TABLA,
			type: 'POST',
			data: {
				data: $DATA
				,codigo: $CODIGO
				,ID: $ID
				,controlador: $TABLANOMBRE
				,programa: $TITULO
				,dataoriginal: $DATAORIGINAL
				,nombrecampos: $NOMBRECAMPOS
			},
			success: function(respuesta){
				switch(respuesta) {
					case '0':
						alertify.success('Registro Actualizado');
						dataTable.draw();
						$('#myModal').modal('hide');
					break;
					case '1':
						alertify.error('No se pudieron actualizar los datos');
					break;
					case '2':
						alertify.success('Registro Guardado');
						dataTable.draw().on('draw', function () {
							if(dataTable.rows().data().length > 0){
								$('[data-identity-insert]').val(dataTable.rows().data()[dataTable.rows().data().length-1][0]);
							}
							var event = new Event('editar');
							document.dispatchEvent(event);
						});
						$('#myModal').modal('hide');
					break;
					case '3':
						alertify.error('No se pudieron guardar los datos');
					break;
					default:
						console.error(respuesta);
						alertify.alert('Error', respuesta);
					break;
				}
			}
		});
	}else{
		$('#myModal').modal('hide');
		alertify.warning('No se hicieron modificaciones');
	}
});

$(document).on('editar', function(){
	$EVENTO = 'editar';
}).on('crear', function(){
	$EVENTO = 'crear';
})

$("#tblCRUD").on("click", ".eliminar", function(e){
	e.preventDefault();
	var $CODIGO = $(this).closest('tr').find('td:eq(1)').text(),
		$ID = $("[data-codigo]").attr('data-db');
	alertify.confirm('Eliminar', '¿Está seguro de eliminar el registro seleccionado?'
		, function(){
			$.ajax({
				url: base_url() + $DIRECTORY + $CONTROLADOR + "/eliminarCRUD/" + $TABLA,
				type: 'POST',
				data: {
					codigo: $CODIGO
					,ID: $ID
					,controlador: $TABLANOMBRE
					,programa: $TITULO
				},
				success: function(respuesta){
					if(respuesta == true){
						alertify.success('Registro eliminado');
						dataTable.draw();
						$("#frmCRUD").trigger("reset");
						var event = new Event('eliminar');
						document.dispatchEvent(event);
					}else{
						alertify.error('No se pudo eliminar el registro');
					}
				}
			});
		}
        , function(){ alertify.warning('No se eliminó el registro') }
    );
});

$("#tblCRUD").on("click", ".editar", function(e){
	e.preventDefault();
	$CODIGO = $(this).closest('tr').find('td:eq(1)').text();
	cargar($CODIGO);
});

$("#frmCRUD").on("change", "[data-codigo]", function(){
	cargar($(this).val());
});

function cargar(codigo){
	$('button[type="submit"][form="frmCRUD"]').attr('disabled', false);
	$("#frmCRUD").trigger("reset");
	var $ID = $("[data-codigo]").attr('data-db');
	$.ajax({
		url: base_url() + $DIRECTORY + $CONTROLADOR + "/cargarCRUD/" + $TABLA,
		type: 'POST',
		data: {codigo: codigo, ID: $ID},
		success: function(respuesta){
			$("[data-codigo]").val(codigo);
			registro = JSON.parse(respuesta);
			if(registro.length > 0) {
				for(var key in registro[0]) {
					key = key.trim();
					var value = registro[0][key];
					if(value != null && typeof value != 'number'){
						value = value.trim();
					}
					if($("[data-db="+key+"]").is(':checkbox')){
						if(value == $("[data-db="+key+"]").attr('data-on')){
							$("[data-db="+key+"]").prop('checked', true).attr('data-original',$("[data-db="+key+"]").attr('data-on'));
						}else{
							$("[data-db="+key+"]").attr('data-original',$("[data-db="+key+"]").attr('data-off'));
						}
					}else{
						$("[data-db="+key+"]").not('[type=password]').val(value).attr('data-original',value);
					}
				}
				var event = new Event('editar');
			}else{
				var event = new Event('crear');
			}
			document.dispatchEvent(event);
			if( ! $('#myModal').is(':visible')){
				$('#myModal .modal-content .modal-header #myModalLabel').html('Editar');
				$('#myModal .modal-content').find('[data-auto]').removeClass('hide');
				$('#myModal .modal-content').find('[data-codigo]').attr('readonly', true);
				$("[data-required]").each(function(){
					$(this).attr('required','required');
				});
				$('#myModal').modal({
					backdrop: 'static',
					keyboard: true,
					show: true
				});
			}
		}
	});
}

$('#btnCrear').click(function(e){
	e.preventDefault();
	var event = new Event('crear');
	document.dispatchEvent(event);
	$("#frmCRUD").trigger("reset");
	$("[data-db]").each(function(){
		$(this).attr('data-original','');
	});
	$('#myModal .modal-content .modal-header #myModalLabel').html('Crear');
	$('#myModal .modal-content').find('[data-auto]').addClass('hide');
	$('#myModal .modal-content').find('[data-codigo]').attr('readonly', false);
	
	$('#myModal').modal({
		backdrop: 'static',
		keyboard: true,
		show: true
	});
});

$('#myModal').on('shown.bs.modal', function(){
	var self = this;

	if($EVENTO == 'crear'){
		$("[data-required]:not(:visible)").each(function(){
			$(this).removeAttr('required');
		});
	}
	$("[data-required]:visible").each(function(){
		$(this).attr('required','required');
	});

	setTimeout(function(){
		$(self).find('input:visible:not(:disabled):not([readonly]), select:visible:not(:disabled), textarea:visible:not(:disabled):not([readonly])').eq(0).focus();
	},0);
	$('label').off('click').on('click', function(){
		var self = this;
		setTimeout(function(){
			$('[data-db='+$(self).attr('for')+']').focus();
		},0);
	});
});

try {
	$('.data-int').inputmask({
		groupSeparator:"",
		alias:"integer",
		placeholder:"0",
		autoGroup:!0,
		digitsOptional:!1,
		clearMaskOnLostFocus:!1,
		rightAlign: false
	}).focus(function(){
		$(this).select();
	});

	$('.data-decimal').each(function(){
		var digitos = $(this).attr('data-digitos');
		var enteros = $(this).attr('data-enteros');
		$(this).inputmask({
			groupSeparator:",",
			alias:"currency",
			placeholder:"0",
			autoGroup:3,
			digits: digitos,
			digitsOptional:!1,
			clearMaskOnLostFocus:!1,
			rightAlign: false,
			prefix:"",
			integerDigits: enteros
		}).focus(function(){
			$(this).select();
		});
	});
}catch(e){

}