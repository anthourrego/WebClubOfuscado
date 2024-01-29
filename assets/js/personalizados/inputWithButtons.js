$(function () {

    const buttons = `
        <div class="btns d-flex" style='position: absolute; right: 0%;'>
            <button class="btn px-1 remove" type="button">
                <i class="fa fa-minus-circle fa-sm mr-1 f-18" style='color: var(--primary);'></i>
                <span class="ripple ripple-animate"></span>
            </button>
            
            <button class="btn px-1 add" type="button">
                <i class="fa fa-plus-circle fa-sm mr-1 f-18" style='color: var(--primary);'></i>
                <span class="ripple ripple-animate"></span>
            </button>
        </div>
    `;

    $.each($(".input-buttons").toArray(), function () {
        $(this).append(buttons).addClass('d-flex');
    })

    $(".add, .remove").on("click", function () {
        const clases = $(this).attr('class');
        const parent = $(this).parents('.form-group');
        const input = parent.children('input');
        let valor = +input.val();
        const nuevoValor = clases.includes('add') ? valor += 1 : (valor > 1 ? valor -= 1 : valor = 1);
        input.val(nuevoValor)
    });
});