let cabeceraTabla = ['Accion', 'Tipo', 'Tipo_Socio', 'Nombre', 'Documento', 'Dirección', 'Ciudad', 'Telefono', 'Correo'];
let tablaSocios;

$(function () {
	RastreoIngresoModulo('Socios');
    $.each(cabeceraTabla, (pos, cab) => {
        $('#cabecera').append(`<th>${cab.replace('_', ' ')}</th>`)
    });
    tablaSocios = configurarTabla();
    dtSS(tablaSocios);
});

function configurarTabla() {
    return {
        data: {
            tblID: "#tblCRUD",
            select: [
                "tr.nombre as Nombre"
                , "tpd.nombre as Documento"
                , "tr.direccion as Dirección"
                , "ciu.nombre as Ciudad"
                , "tr.telefono as Telefono"
                , "tr.email as Correo"
                , "tra.Accionid as Accion"
                , "CASE tra.Tipo WHEN 'S' THEN 'Socio' WHEN 'B' THEN 'Beneficiario' END as Tipo"
                , 'tps.Nombre as Tipo_Socio'
            ],
            table: [
                'Tercero tr',
                [
                    ['TerceroAccion tra', 'tr.TerceroID = tra.TerceroID', 'LEFT']
                    , ['tipodocu tpd', 'tr.tipodocuid = tpd.tipodocuid', 'LEFT']
                    , ['Ciudad ciu', 'tr.ciudadid = ciu.ciudadid', 'LEFT']
                    , ['TipoSocio tps', 'tra.TipoSocioId = tps.TipoSocioId', 'LEFT']
                ], [
                    ["tr.nombre != ''"],
                    ["tra.Tipo = 'S'"],
                    ["tr.Estado = 'A'"]
                ]
            ],
            column_order: ["tpd.nombre", "tpd.nombre", "tr.direccion", "ciu.nombre", "tr.telefono", "tr.email", "Tipo", "tps.Nombre", "tra.Accionid"],
            column_search: [
                'tr.nombre '
                , 'tpd.nombre'
                , 'tra.Accionid'
            ],
            orden: { 'Accion': 'DESC' },
            columnas: cabeceraTabla
        },
        language: $.Constantes.lenguajeTabla,
        processing: true,
        serverSide: true,
        order: [[0, 'ASC']],
        draw: 10,
        fixedColumns: true,
        pageLength: 15,
        buttons: [
            { extend: 'copy', className: 'copyButton', text: 'Copiar', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'csv', className: 'csvButton', text: 'CSV', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'excel', action: newExportAction, text: 'Excel', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'pdf', className: 'pdfButton', tex: 'PDF', exportOptions: { columns: ':not(:first-child)' }, title: 'Web_Club' },
            { extend: 'print', className: 'printButton', text: 'Imprimir', exportOptions: { columns: ':not(:first-child)', title: 'Web_Club' } }
        ],
        //deferRender: true,
        scrollY: $(document).height() - 480,
        scrollX: true,
        scroller: {
            loadingIndicator: true
        },
        scrollCollapse: true,
        dom: 'Bfrt',
        columnDefs: [],
        createdRow: function (row, data, dataIndex) { }
    };
}
