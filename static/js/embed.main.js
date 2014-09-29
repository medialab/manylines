;(function(undefined) {

  /**
   * TubeMyNet Embed Controller
   * ===========================
   *
   * TubeMyNet utility to display the application's widgets.
   */

  // Helpers
  function parseHash() {
    var hash = window.location.hash;

    return hash;
  }

  $.get('/api/embed/narrative/be33f704-0fbc-486f-913d-1f53e19b6523', function(data)  {
    console.log(data);
  });
}).call(this);
