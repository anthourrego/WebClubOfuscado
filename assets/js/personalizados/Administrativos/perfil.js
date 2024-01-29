let rutaGeneral = 'Administrativos/Perfil/';

$(function () {

    if ($USUARIO) {
        if (!$USUARIO['TerceroID']) {
            $('#vnombre').text(($USUARIO['nombre'] != " " ? $USUARIO['nombre'] + ' ' + $USUARIO['apellidos'] : $USUARIO['segurNombre']));
            $("#btnEditarPerfil").hide();
            $('.eliminarFoto').hide();
            $(".img-perfil").hide();
            $('.info-user').attr('style', 'display: none !important;');
            $('.botones').addClass('col-md-12');
            $('.profile').addClass('col-md-12');
        } else {
            Object.keys($USUARIO).forEach(it => {
                if (it !== 'foto') {
                    $('#v' + it).text($USUARIO[it]);
                }
            });
            $('#vnombre').text(($USUARIO['nombre'] != " " ? $USUARIO['nombre'] + ' ' + $USUARIO['apellidos'] : $USUARIO['segurNombre']));
            $('#vTipo').text($USUARIO['Tipo'] == 'B' ? 'Beneficiario' : 'Socio');
            if ($USUARIO['foto']) {
                $(".img-radius").attr('src', 'data:image/jpeg;base64,' + $USUARIO['foto']);
            } else {
                $('.eliminarFoto').hide();
                $(".img-radius").attr('src', `${base_url()}assets/images/user/nofoto.png?${Math.random()}`);
            }
        }
    } else {
        $('.eliminarFoto').hide();
        $("#btnEditarPerfil").hide();
    }

    $("#btnEditarPerfil").click(function () {
        let data = ['nombre', 'apellidos', 'telefono', 'direccion', 'email'];
        data.forEach(item => {
            $('#' + item).val($USUARIO[item]);
        });
    });

    $("#formularioPerfil").submit(function (e) {
        e.preventDefault();
        if ($("#formularioPerfil").valid()) {
            let $fills = $("#formularioPerfil input");
            let data = {};
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");
                data[name] = value;
            });
            data = Object.assign(data, obtenerCampo('nombr', data['nombre']));
            data = Object.assign(data, obtenerCampo('apell', data['apellidos']));
            data['terceroId'] = $USUARIO['TerceroID'];
            data = $.Encriptar(data);
            $.ajax({
                url: base_url() + rutaGeneral + 'guardarDatos',
                type: 'POST',
                data: {
                    encriptado: data
                },
                dataType: "json",
                success: (resp) => {
                    resp = JSON.parse($.Desencriptar(resp));
                    if (resp.valido) {
                        $('#modalPerfil').modal('hide');
                        alertify.success(resp.mensaje);
                        location.reload();
                    } else {
                        alertify.error(resp.mensaje);
                    }
                }
            });
        } else {
            alertify.error("Valide la informacion ingresada.");
        }
    });

    $('.imagen-container').on({
        'mouseenter': function () {
            $(".cambio-foto").attr('hidden', false);
        },
        'mouseleave': function () {
            $(".cambio-foto").attr('hidden', true);
        },
    });

    $("#inputFoto").change(function () {
        let formulario = new FormData();
        formulario.append("foto", $(this)[0].files[0]);
        actualizarFoto(formulario, false);
    });

    $(".btn-input").click(function () {
        let input = $(this).prev().prev('.form-control');
        let tipo = input.attr('type');
        let text = tipo == "text";
        $(this).children("i").removeClass(`fa fa-eye${text ? "-slash" : ""}`)
        $(this).children("i").addClass(`fa fa-eye${text ? "" : "-slash"}`);
        input.attr('type', text ? 'password' : 'text');
    });

    $("#eliFotoPerfil").click(function () {
        let formulario = new FormData();
        actualizarFoto(formulario, true);
    });

    $("#formularioClave").submit(function (e) {
        e.preventDefault();
        if ($(this).valid()) {
            let $fills = $("#formularioClave input");
            let data = {};
            $.each($fills, (pos, input) => {
                let value = $(input).val();
                const name = $(input).attr("name");
                data[name] = value;
            });
            if (data['claveNueva'] == data['confirmarClaveNueva']) {
                data = $.Encriptar(data);
                $.ajax({
                    url: base_url() + rutaGeneral + 'cambiarPassword',
                    type: 'POST',
                    data: {
                        encriptado: data
                    },
                    dataType: "json",
                    success: (resp) => {
                        resp = JSON.parse($.Desencriptar(resp));
                        if (resp.valido) {
                            $('#modalClave').modal('hide');
                            limpiarDatos();
                            alertify.success(resp.mensaje);
                        } else {
                            alertify.error(resp.mensaje);
                        }
                    }
                });
            } else {
                alertify.error("Las contraseñas no coinciden.")
            }
        } else {
            alertify.error("Valida los campos.")
        }
    });

    $(".cerrarPassword").click(function () {
        limpiarDatos();
    });

});

function limpiarDatos() {
    $("#formularioClave")[0].reset();
    $("#formularioClave :input").removeClass('is-invalid');
    $("#formularioClave").validate().resetForm();
}

function actualizarFoto(formulario, eliminar) {
    let data = {
        terceroId: $USUARIO['TerceroID'], eliminar
    }
    formulario.append("encriptado", $.Encriptar(data));
    $.ajax({
        url: base_url() + rutaGeneral + 'fotoPerfil',
        type: 'POST',
        data: formulario,
        processData: false,
        contentType: false,
        cache: false,
        encType: 'multipart/form-data',
        dataType: "json",
        success: (resp) => {
            resp = JSON.parse($.Desencriptar(resp));
            if (!resp.valido) {
                alertify.error(resp.mensaje);
            } else {
                location.reload();
            }
        }
    });
}

function seleccionarFoto() {
    $("#inputFoto").click()
}

function obtenerCampo(campo, valor) {
    valor = textoConEspacios(valor);
    let info = {};
    let array = valor.split(' ', 2);
    // El espacio de string es segun la cantidad que se le envie a la funcion testoConEspacios
    let restante = valor.replace(array[0] + (array[1] ? ' ' + array[1] : ''), '');
    info[campo + 'uno'] = array[0];
    info[campo + 'dos'] = (array[1] ? array[1] + restante : '');
    return info
}

function textoConEspacios(valor, cant = 1) {
    let retorno = '';
    let espacios = 0;
    for (let i = 0; i < valor.length; i++) {
        const element = valor[i];
        if (element != ' ') {
            espacios = 0;
            retorno += valor[i];
        } else if (!espacios) {
            for (let j = 0; j < cant; j++) {
                retorno += ' ';
            }
            espacios = cant;
        }
    }
    return retorno;
}