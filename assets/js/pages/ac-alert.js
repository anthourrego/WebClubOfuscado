'use strict';
$(document).ready(function() {
    // [ sweet-basic ]
    $('.sweet-basic').on('click', function() {
        swal('Hello world!');
    });
    // [ sweet-success ]
    $('.sweet-success').on('click', function() {
        swal("Good job!", "You clicked the button!", "success");
    });
    // [ sweet-warning ]
    $('.sweet-warning').on('click', function() {
        swal("Good job!", "You clicked the button!", "warning");
    });
    // [ sweet-error ]
    $('.sweet-error').on('click', function() {
        swal("Good job!", "You clicked the button!", "error");
    });
    // [ sweet-info ]
    $('.sweet-info').on('click', function() {
        swal("Good job!", "You clicked the button!", "info");
    });
    // [ sweet-multiple ]
    $('.sweet-multiple-solicitudes').on('click', function() {
        swal({
                title: "¿Estás seguro de eliminar esta solicitud?",
                text: "Una vez elimines esta solicitud, no podrá recuperarse nuevamente.",
                icon: "warning",
                buttons: ["Cancelar","Eliminar"],
                //buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    swal("Haz eliminado la solicitud satisfactoriamente.", {
                        icon: "success",
                    });
                } else {
                    swal("Haz cancelado la eliminación de la solicitud.", {
                        icon: "error",
                    });
                }
            });
    });
    // [ sweet-prompt ]
    $('.sweet-prompt').on('click', function() {
        swal("Write something here:", {
                content: "input",
            })
            .then((value) => {
                swal(`You typed: ${value}`);
            });
    });
    // [ sweet-ajax ]
    $('.sweet-ajax').on('click', function() {
        swal({
                text: 'Search for a movie. e.g. "La La Land".',
                content: "input",
                button: {
                    text: "Search!",
                    closeModal: false,
                },
            })
            .then(name => {
                if (!name) throw null;
                return fetch(`https://itunes.apple.com/search?term=${name}&entity=movie`);
            })
            .then(results => {
                return results.json();
            })
            .then(json => {
                const movie = json.results[0];
                if (!movie) {
                    return swal("No movie was found!");
                }
                const name = movie.trackName;
                const imageURL = movie.artworkUrl100;
                swal({
                    title: "Top result:",
                    text: name,
                    icon: imageURL,
                });
            })
            .catch(err => {
                if (err) {
                    swal("Oh noes!", "The AJAX request failed!", "error");
                } else {
                    swal.stopLoading();
                    swal.close();
                }
            });
    });
});
