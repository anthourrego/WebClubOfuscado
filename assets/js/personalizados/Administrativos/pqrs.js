$(function () {
    bsCustomFileInput.init();
    initListenners();
});

function initListenners() {
    $("#btnVer").on("click", function () {
        $("#previs").toggle();
    });

    $("#responder, #crear").click(abrirModal);
}

function abrirModal() {
    const id = $(this).attr('id');
    setInputsRespuesta(id);

}

function setInputsRespuesta(id) {
    const inputsDisabled = ['funcionario', 'area', 'tipo', 'asunto', 'fecha', 'descripcion'];
    const responder = id === 'responder';
    const inputs = `  
        <div class="col-12">
            <textarea name="repuesta" id="respuesta" required></textarea>
        </div>
        <div class='col-12'>
            <div class="input-group cust-file-button mt-2">
                <div class="custom-file">
                    <input type="file" class="custom-file-input" id="archivoRespuesta" required  name="archivoRespuesta">
                    <label class="custom-file-label" for="archivoRespuesta">Seleccionar Documentos</label>
                </div>
            </div>
        </div>
    `;

    $("#modalCrear .modal-title span").text(`${responder ? `Responder Pqr - #${'007851'} ` : 'Configurar Pqr'}  `);
    $("#modalCrear button[type='submit']").text(`${responder ? `Responder` : 'Crear'}`);

    $('#inputsRespuesta').html(responder ? inputs : '');


    if (responder) {
        $.each($("#modalCrear input, #modalCrear textarea"), function (pos, el) {
            const name = $(el).attr('name');
            if (inputsDisabled.includes(name)) {
                $(el).prop('value', responder ? 'Lorem ipsum' : '').prop('disabled', responder ? true : false);
    
            }
        });

        $('#respuesta').trumbowyg({
            lang: 'es',
            tagsToRemove: ['script'],
            defaultLinkTarget: '_blank'
        }); 
    }
    
    $("#modalCrear").modal('show');  

}
