/*
Copyright (c) 2018 Gilberto Leon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

jQuery_3_3_1(document).ready(function($) {
  /*
  Un arreglo para cada tipo de visualización
  */
  var lineasDeTiempo = [];
  var mapasACartogamas = [];
  var mapasABarras = [];
  var nubesDePalabras = [];
  var lineasDeTiempoSelector = [];

  /*
  Cada arreglo se llena dependiendo del atributo data-tipo-visualizacion
  */
  var arreglo = $("[data-tipo-visualizacion=lineasDeTiempo]");
  _.each(arreglo, function(e) {
    lineasDeTiempo.push({ el: e, v: null, init: false });
  });

  arreglo = $("[data-tipo-visualizacion=mapaACartograma]");
  _.each(arreglo, function(e) {
    mapasACartogamas.push({ el: e, v: null, init: false });
  });

  arreglo = $("[data-tipo-visualizacion=mapaABarras]");
  _.each(arreglo, function(e) {
    mapasABarras.push({ el: e, v: null, init: false });
  });

  arreglo = $("[data-tipo-visualizacion=nubeDePalabras]");
  _.each(arreglo, function(e) {
    nubesDePalabras.push({ el: e, v: null, init: false });
  });

  arreglo = $("[data-tipo-visualizacion=lineasDeTiempoSelector]");
  _.each(arreglo, function(e) {
    lineasDeTiempoSelector.push({ el: e, v: null, init: false });
  });

  /*
  Para cada elemento (de cada arreglo), se revisa si se encuentra visible.
    Si está visible --> Se genera una visualización
    Si no está visible --> Se agrega un listener para el evento scroll, y se genera la visualización cuando sea visible
  */
  _.each(lineasDeTiempo, function(l) {
    if ($(l.el).visible()) {
      if (l.init === false) {
        l.init = true;
        l.v = new LineaDeTiempo($, l.el, true);
      }
    } else {
      l.v = new LineaDeTiempo($, l.el);
      $(window).scroll(function() {
        if ($(l.el).visible()) {
          if (l.init === false) {
            l.init = true;
            l.v.iniciar();
          }
        }
      });
    }
  });

  _.each(mapasACartogamas, function(m) {
    if ($(m.el).visible()) {
      if (m.init === false) {
        m.init = true;
        m.v = new MapaACartograma($, m.el, true);
      }
    } else {
      m.v = new MapaACartograma($, m.el);
      $(window).scroll(function() {
        if ($(m.el).visible()) {
          if (m.init === false) {
            m.init = true;
            m.v.iniciar();
          }
        }
      });
    }
  });

  _.each(mapasABarras, function(m) {
    if ($(m.el).visible()) {
      if (m.init === false) {
        m.init = true;
        m.v = new MapaABarras($, m.el, true);
      }
    } else {
      m.v = new MapaABarras($, m.el);
      $(window).scroll(function() {
        if ($(m.el).visible()) {
          if (m.init === false) {
            m.init = true;
            m.v.iniciar();
          }
        }
      });
    }
  });

  _.each(nubesDePalabras, function(n) {
    if ($(n.el).visible()) {
      if (n.init === false) {
        n.init = true;
        n.v = new NubeDePalabras($, n.el, true);
      }
    } else {
      n.v = new NubeDePalabras($, n.el);
      $(window).scroll(function() {
        if ($(n.el).visible()) {
          if (n.init === false) {
            n.init = true;
            n.v.iniciar();
          }
        }
      });
    }
  });

  _.each(lineasDeTiempoSelector, function(l) {
    if ($(l.el).visible()) {
      if (l.init === false) {
        l.init = true;
        l.v = new LineaDeTiempoSelector($, l.el, true);
      }
    } else {
      l.v = new LineaDeTiempoSelector($, l.el);
      $(window).scroll(function() {
        if ($(l.el).visible()) {
          if (l.init === false) {
            l.init = true;
            l.v.iniciar();
          }
        }
      });
    }
  });
});
