function showTableColumns(invisibles = [], tabla = null) {
	if (tabla == null) {
		$.each($(".filtro-columnas").toArray(), function (pos, ele) {
			if ($(this).attr('id') && !$(`a.btnColumnas[aria-controls=${$(this).attr('id')}]`).length) {
				organizarBotones($(this).attr('id'), invisibles);
			}
		});
	} else {
		if (!$(`a.btnColumnas[aria-controls=${tabla}]`).length) {
			organizarBotones(tabla, invisibles);
		}
	}
}

function organizarBotones(id, invisibles = []) {
	let checks = "";
	$.each($("#" + id + " th").toArray(), (pos, el) => {
		if( ! invisibles.includes(pos)){
			value = $(el).text();
			checks += `
				<div class="form-check col-4 col-sm-6 col-xs-6 col-xl-3 col-lg-3">
					<input class="form-check-input" type="checkbox" name="${value}" id="${value}chck" pos='${pos}' checked="true" onchange="checkColumna(this, ${id})">
					<label class="form-check-label" for="${value}chck">
					${value}
					</label>
				</div>
			`;
		}
	});

	const button = `
		<style>
			#${id}_filter label{
				display: flex;
				justify-content: flex-end;
			}
		</style>
		<a class="dt-button buttons-html5 btnColumnas" tabindex="0" aria-controls="${id}" 
			data-toggle="collapse" data-target="#collapseCols" role="button" aria-expanded="false" 
			aria-controls="collapseCols" style="min-width: 100px;">
			Columnas
			<i data-toggle="tooltip" title="Activa o inactiva las columnas de la tabla" class=" fas fa-question-circle fa-sm "></i>
		</a>
	`;

	const collapse = `
		<style>
			.contenedor-columnas{
				border: 1px solid #efefef;
				border-radius: 10px;      
			}
		</style>
		<div class="collapse w-100" id="collapseCols">
			<div class="card-body contenedor-columnas">
				
				<div class="row">${checks}</div>
			</div>
		</div>
	`;

	$("#dataTables_scroll").prop("position", "absolute")
	$("#" + id + "_filter label").prepend(button);
	if ($("#" + id + "_filter").closest(".dataTablesFiltros") != undefined) {
		$("#" + id + "_filter").closest(".dataTablesFiltros").after(collapse);
	} else {
		$("#" + id + "_filter").after(collapse);
	}
}

checkColumna = (columna, id) => {
	const table = $("#" + $(id).attr('id')).DataTable();
	const pos = $(columna).attr('pos');
	const name = $(columna).attr('name');
	const value = $(columna).is(':checked');
	table.columns([pos]).visible(value);
	/* const element = $(`.sorting:contains(${name})`).first();
	element[value ? 'show' : 'hide'](); */
}