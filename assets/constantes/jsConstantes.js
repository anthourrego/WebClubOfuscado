$(function () {
    $.Constantes = {
        estadosEmpleados: [{
            valor: 1, titulo: 'Ocupado'
        }, {
            valor: 2, titulo: 'Mantenimiento'
        }, {
            valor: 3, titulo: 'Disponible'
        }],
        productosRegistrados: [{
            valor: 1, titulo: 'Raqueta'
        }, {
            valor: 2, titulo: 'Balon'
        }, {
            valor: 3, titulo: 'Mesa'
        }],
        bannerDisponible: [{
            valor: 'SE', titulo: 'Socios y Empleados'
        }, {
            valor: 'SO', titulo: 'Socios'
        }, {
            valor: 'EM', titulo: 'Empleados'
        }],
        categoriasDirectoriosDisponible: [{
            valor: 'SO', titulo: 'Socios'
        }, {
            valor: 'EM', titulo: 'Empleados'
        }, {
            valor: 'PR', titulo: 'Proveedores'
        }],
        personalDisponible: [{
            valor: 'socios', titulo: 'Socios'
        }, {
            valor: 'empleados', titulo: 'Empleados'
        }, {
            valor: 'proveedores', titulo: 'Proveedores'
        }],
        mediosPagosEventos: [{
            valor: 'PU', titulo: 'PayU'
        }, {
            valor: 'PO', titulo: 'Pago Online'
        }, {
            valor: 'PB', titulo: 'Bono'
        }, {
            valor: 'PC', titulo: 'Cargar a la cuenta'
        }, {
            valor: 'PP', titulo: 'PSE'
        }, {
            valor: 'PE', titulo: 'Pago en Club'
        }],
        fuenteEditor: `Arial/Arial, Helvetica, sans-serif; Comic Sans MS/Comic Sans MS, cursive; Courier New/Courier New, Courier, monospace;
            Georgia/Georgia, serif; Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif; Tahoma/Tahoma, Geneva, sans-serif;
            Times New Roman/Times New Roman, Times, serif; Trebuchet MS/Trebuchet MS, Helvetica, sans-serif; Verdana/Verdana, Geneva, sans-serif;
            Bungee Shade/Bungee Shade; Dekers/dekers_true; Indie Flower/Indie Flower; ALGERIAN/Algerian;Calibri/Calibri;Cooper Black/COOPER BLACK;
            Chiller/CHILLER;Tunga/TUNGA;Sylfaen/SYLFAEN;Stencil/STENCIL;SimHei/SIMHEI;Ravie/RAVIE;
        `
        , imprimirEstilos: `
            .page-footer, .page-footer-space { height: 100px; }
            .page table { border-spacing: 0px; border-collapse: collapse; }
            .page table td { padding: 1px; }
            p { white-space: unset; text-align: justify; overflow-wrap: anywhere; }
            table { width: 100% !important; }
        `
        , estiloEditor: `
            body.document-editor {
                width: 15.8cm; min-height: 21cm; padding: 1cm 2cm 2cm; margin: 0.5cm auto; border: 1px #D3D3D3 solid; background: white; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                table { width: 100% !important; }
            }
            body.document-editor p { margin : 2px }
            body.document-editor td, body.document-editor th { font-size: 0.9em; }
            body.document-editor h1 { margin-bottom:1cm; }
        `
        , lenguajeTabla: {
            "lengthMenu": "Mostrar _MENU_ registros por página.",
            "zeroRecords": "No se ha encontrado ningún registro.",
            "info": "Mostrando página _PAGE_ de _PAGES_",
            "infoEmpty": "",
            "search": "",
            "searchPlaceholder": "Buscar",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            },
            "infoFiltered": "(_MAX_ Registros filtrados en total)"
        }
        , creacionLocalizacion: [{
            valor: 'pais', titulo: 'Pais'
        }, {
            valor: 'dpto', titulo: 'Departamento'
        },{
            valor: 'ciudad', titulo: 'Ciudad'
        }, {
            valor: 'zona', titulo: 'Zona'
        }]
        , estadosReserva: {
            S: {
                valor: 'S',
                titulo: 'Separado',
                color: 'warning'
            },
            C: {
                valor: 'C',
                titulo: 'Confirmado',
                color: 'primary'
            },
            I: {
                valor: 'I',
                titulo: 'Cancelado',
                color: 'danger'
            }
        }
        , estadosInvitados: {
            S: {
                valor: 'S',
                titulo: 'Pendiente',
                color: 'warning'
            },
            C: {
                valor: 'C',
                titulo: 'Confirmado',
                color: 'secondary'
            },
            A: {
                valor: 'C',
                titulo: 'Asistio',
                color: 'primary'
            },
            I: {
                valor: 'I',
                titulo: 'Cancelado',
                color: 'danger'
            }
        }
        , tiposTercero: [{
            valor: 'R', titulo: 'Representante'
        },{
            valor: 'S', titulo: 'Socio'
        },{
            valor: 'B', titulo: 'Beneficiario'
        },{
            valor: 'I', titulo: 'Invitado'
        },{
            valor: 'E', titulo: 'Especial'
        },{
            valor: 'C', titulo: 'Club'
        },{
            valor: 'T', titulo: 'Torneo'
        },{
            valor: 'H', titulo: 'Hotel'
        },{
            valor: 'PV', titulo: 'Proveedor'
        },{
            valor: 'EM', titulo: 'Empleado'
        },{ 
            valor: 'EV', titulo: 'Evento'
        }]
    }

});