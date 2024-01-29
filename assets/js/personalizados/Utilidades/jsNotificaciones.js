var DT;
var config = {data:{
		tblID : "#tblCRUD",
		select : [
			'A.Numero'
			,'A.Descripcion'
			,"FORMAT(A.Creada,'dd/MM/yyyy HH:mm:ss') AS Creada"
			,"IIF(A.Tipo = 'MA', FORMAT(A.Creada, 'dd/MM/yyyy HH:mm:ss'),FORMAT(CAST(CONCAT(A.Programada, ' ', R.HoraDespertador) AS DATETIME2),'dd/MM/yyyy HH:mm:ss')) AS Programada"
			,"FORMAT(A.Ejecutada,'dd/MM/yyyy HH:mm:ss') AS Ejecutada"
			,"CASE A.Tipo WHEN 'DE' THEN 'Despertador'\
				WHEN 'MA' THEN 'Memos'\
				END as 'Tipo'" 
		],
		table : [
			'Alerta A'
			,[
				['Reserva R', 'A.Numero = R.ReservaId', 'LEFT']
			]
			,[
				["A.Tipo NOT IN ('MN')"]
				,["CONVERT(DATETIME, GETDATE()) >= IIF(A.Tipo = 'MA', CONVERT(DATETIME, A.Creada), CONVERT(DATETIME, CAST(CONCAT(A.Programada, ' ', R.HoraDespertador) AS DATETIME2)))"]
			]
		],
		column_order : [
			'A.Numero'
			,'A.Descripcion'
			,'Creada'
			,"Programada"
			,'A.Ejecutada'
			,'Tipo'
		],
		column_search : [
			'A.Numero'
        	,'A.Descripcion'
        	,'Creada'
        	,"Programada"
        	,'A.Ejecutada'
        	,'Tipo'
		],
		orden : {"Creada": 'ASC'},
		columnas : [
			'Descripcion'
			,'Creada'
			,'Programada'
			,'Ejecutada'
			,'Tipo'
		],
	},
	processing: true,
	serverSide: true,
	order: [[0, 'DESC']],
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
	buttons: [
		{ extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
		{ extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
		{ extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
		{ extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: {columns: ':not(:first-child)'}, title: 'CLUBAPP - ' + $TITULO },
		{ extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: {columns: ':not(:first-child)', title: 'CLUBAPP - ' + $TITULO} },
		{ className: 'btnFiltros', text: 'Filtros'}
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
	scrollY: $(document).height() - 295,
	scroller: {
		loadingIndicator: true
	},
	scrollCollapse: false,
	dom: 'Bftri',
	columnDefs:[
		{width: '25%', targets:[0]}
		,{width: '10%', targets:[1,2,3]}
		,{width: '15%', targets:[4]}
	],
}

$(document).on('click', '.btnFiltros', function(e){
	e.preventDefault();
	$('.modal').modal('show');
});

function filtrojson(){
	var filtros = {
		Tipo: $('#tipo').val()
		,TipoFecha: $('#tipoFecha').val()
		,fInicial: $('#fInicial').val()
		,fFinal: $('#fFinal').val()
	}
	$('[name=json]').val(JSON.stringify(filtros));
}

$('.chos-unit select').chosen({
	placeholder_text_single: 'Opción:'
	,width: '100%'
	,no_results_text: 'Oops, no se encuentra'
	,allow_single_deselected: true
});

$('select').change(function(){
	filtrojson();
});

$('#frmCRUD').on('focusout', '.datepicker input', function(){
	filtrojson();
});

$(document).ready(function(){
	if($JSON != ''){
		$JSON = JSON.parse($JSON);
		var WHERES = [];

		if($JSON.Tipo && $JSON.Tipo != ''){
			$('#tipo').val($JSON.Tipo).trigger('chosen:updated');
			var WHERE = "A.Tipo = '"+$JSON.Tipo+"'";
			config.data.table[2].push([WHERE]);
		}

		if($JSON.TipoFecha && $JSON.TipoFecha != ''){
			$('#tipoFecha').val($JSON.TipoFecha).trigger('chosen:updated');
		}

		if($JSON.fInicial){
			$('#fInicial').val($JSON.fInicial);
		}
		if($JSON.fFinal){
			$('#fFinal').val($JSON.fFinal);
		}
		if(($JSON.fInicial && $JSON.fInicial != '') && ($JSON.fFinal && $JSON.fFinal != '')){
			var WHERE = "CAST(A."+$JSON.TipoFecha+" AS DATE) BETWEEN '"+$JSON.fInicial+"' AND '"+$JSON.fFinal+"'";
			config.data.table[2].push([WHERE]);
		}else if($JSON.fInicial && $JSON.fInicial != ''){
			var WHERE = "CAST(A."+$JSON.TipoFecha+" AS DATE) >= '"+$JSON.fInicial+"'";
			config.data.table[2].push([WHERE]);
		}else if($JSON.fFinal && $JSON.fFinal != ''){
			var WHERE = "CAST(A."+$JSON.TipoFecha+" AS DATE) <= '"+$JSON.fFinal+"'";
			config.data.table[2].push([WHERE]);
		}
	}
	filtrojson();

	config.data.select.push("'"+$JSON.fInicial+"' AS PInicial");
	config.data.select.push("'"+$JSON.fFinal+"' AS PFinal");

	DT = dtSS(config);
});