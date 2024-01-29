$(function () {
    initListenners();
    setNombreArchivo();
});

function setNombreArchivo() {
    $('#archivo').change(function (e) {
        e.preventDefault();
        const name = $(this).val().split("\\");
    });
}

function initListenners() {
    $('.icon-container').click(function () {
        $('#inputIcon').click();
    });

    $("#btnVer").click(function () {
        $("#previs").toggle();
    })

    $.Constantes.personalDisponible.forEach(item => {
        $("#personalDisponible").append(`<div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" name="${item.valor}" id="${item.valor}">
            <label class="custom-control-label" for="${item.valor}">${item.titulo}</label>
        </div>`);
    });
}