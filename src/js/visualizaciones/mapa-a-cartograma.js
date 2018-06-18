/*
Copyright (c) 2018 Gilberto Leon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var MapaACartograma = function($, el, flagIniciar) {
  flagIniciar = flagIniciar || false;
  var flagEsp =
    window.location.pathname.split("/").indexOf("eng") >= 0 ? false : true;

  var margen = { superior: 20, derecho: 20, inferior: 20, izquierdo: 20 };
  var medidas = {
    ancho: 800 - (margen.derecho + margen.izquierdo),
    alto: 800 - (margen.superior + margen.inferior)
  };

  var tarjeta = { ancho: 133, alto: 124 };
  var offsetTarjeta = 24;
  var retrato = { ancho: 85, alto: 85 };

  var datosMexico = null;
  var offsetMapa = { x: 450, y: 145 };

  var estiloLeyenda = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "18px",
    "font-style": "normal",
    "text-anchor": "middle",
    "alignment-baseline": "central",
    "text-transform": "uppercase",
    "font-kerning": "normal"
  };

  var estiloPeriodo = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "18px",
    "font-style": "normal",
    "text-anchor": "middle",
    "alignment-baseline": "central",
    "text-transform": "uppercase",
    "font-kerning": "normal"
  };

  var datos = null;

  var candidatos = null;

  var porcentajesTotales = null;

  var porcentajes = null;

  var candidatoEnBlanco = { id: "", nombre: "", color: "#000000" };
  var contenedor = null;
  var svg = null;
  var gLeyenda = null;
  var gMexico = null;
  var gSlider = null;
  var rToggle = null;

  var periodoTexto = null;

  var idSombra = getGUID();
  var idGris = getGUID();

  var flagExplosion = false;

  var escalaOpacidad = null;

  var anchoMarcador = 101;
  var inicioMedida = 22.5;
  var anchoMedida = 707;
  var medida = null;

  var offsetMarcador = false;
  var index = 0;

  function setup(el) {
    var elemento = null;
    var flag = null;
    contenedor = d3.select(el);
    elemento = contenedor.node() || false;
    if (elemento !== false) {
      flag = contenedor.attr("data-visualizacion") || false;
      if (flag === false) {
        contenedor.attr("data-visualizacion", "true");
        contenedor.classed("espera", true);
        contenedor.selectAll("svg").remove();
        svg = contenedor
          .append("svg")
          .attr("preserveAspectRatio", "xMidYMid")
          .attr(
            "viewBox",
            "0 0 " +
              (medidas.ancho + margen.derecho + margen.izquierdo) +
              " " +
              (medidas.alto + margen.superior + margen.inferior)
          );

        var defs = svg.append("defs");
        var filter = defs
          .append("filter")
          .attr("id", idSombra)
          .attr("height", "130%");

        filter
          .append("feGaussianBlur")
          .attr("in", "SourceAlpha")
          .attr("stdDeviation", "2");

        filter
          .append("feOffset")
          .attr("dx", "2")
          .attr("dy", "2")
          .attr("result", "offsetblur");

        filter
          .append("feFlood")
          .attr("flood-color", "rgb(0,0,0)")
          .attr("flood-opacity", "0.2");

        filter
          .append("feComposite")
          .attr("in2", "offsetblur")
          .attr("operator", "in");

        var feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        defs
          .append("filter")
          .attr("id", idGris)
          .append("feColorMatrix")
          .attr("type", "matrix")
          .attr(
            "values",
            "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"
          );

        svg
          .append("rect")
          .attr("fill", "#ffffff")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", medidas.ancho + margen.izquierdo + margen.derecho)
          .attr("height", medidas.alto + margen.superior + margen.inferior);

        svg = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + margen.izquierdo + "," + margen.derecho + ")"
          );

        svg
          .append("rect")
          .attr("class", "remover")
          .attr("width", medidas.ancho)
          .attr("height", medidas.alto)
          .attr("fill", "transparent");

        rToggle = svg
          .append("rect")
          .attr("class", "cursor")
          .attr("x", 0)
          .attr("y", 130)
          .attr("width", medidas.ancho)
          .attr("height", 530)
          .attr("fill", "transparent");

        periodoTexto = svg
          .append("g")
          .attr("transform", "translate(0,682)")
          .append("text")
          .attr("x", medidas.ancho / 2)
          .style(estiloPeriodo);

        gLeyenda = svg.append("g");
        gMexico = svg
          .append("g")
          .style("stroke", "#ffffff")
          .attr("transform", "translate(-150,150)");
        gSlider = svg
          .append("g")
          .attr("transform", "translate(0," + (medidas.alto - 60) + ")");

        escalaOpacidad = d3.scale
          .linear()
          .domain([0, 100])
          .range([0.2, 1]);

        var descarga = $(elemento)
          .closest("div.visualizacion")
          .next()
          .next()
          .find("img[alt=download]")
          .closest("a");
        if (descarga.length === 0) {
          descarga = $(elemento)
            .closest("div.visualizacion")
            .closest("section")
            .find("img[alt=download]")
            .closest("a");
        }
        if (descarga.length !== 0) {
          descarga.attr("href", "#").click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            descargaVisualizacion(elemento);
          });
        }

        main();
      }
    }
  }

  function main() {
    var projection = d3.geo
      .mercator()
      .scale(1500)
      .center([-103.84034978813841, 24.012062015793]);
    var path = d3.geo.path().projection(projection);
    var q = d3.queue();
    var urlValoresJSON = contenedor.attr("data-valores-json") || false;
    var urlCandidatos = contenedor.attr("data-candidatos") || false;
    if (urlCandidatos !== false && urlValoresJSON !== false) {
      q.defer(d3.json, "json/mexico.json");
      q.defer(d3.json, "json/estados-cartograma.json");
      q.defer(d3.json, urlCandidatos + "?" + getGUID());
      q.defer(d3.json, urlValoresJSON + "?" + getGUID());
      q.awaitAll(function(error, arreglo) {
        datosMexico = arreglo[0];
        datos = arreglo[1];
        candidatos = arreglo[2];
        porcentajesTotales = arreglo[3];
        var f = d3.queue();
        _.each(candidatos, function(candidato) {
          f.defer(convertImgToBase64URL, candidato);
        });
        f.awaitAll(function(error, a) {
          candidatos.sort(function(a, b) {
            if (a.nombrecorto < b.nombrecorto) {
              return -1;
            }
            if (a.nombrecorto > b.nombrecorto) {
              return 1;
            }
            return 0;
          });
          resetCandidatos();
          generaLeyenda();
          procesaDatos();
          generaMexico(path);
          generaSliderTemporal();
          generaTooltips();
          iniciaEventos();
          contenedor.classed("espera", false);
          if (flagIniciar === true) {
            iniciar();
          }
        });
      });
    }
  }

  function iniciar() {
    setPorcentajes(0);
    setCandidatoSeleccionado(candidatos[0].id);
    actualizaTooltips();
    explotaMexico();
    periodoTexto.text(
      flagEsp ? porcentajesTotales[0].nombre : porcentajesTotales[0].nombrei
    );
  }

  function generaLeyenda() {
    var ancho =
      tarjeta.ancho * candidatos.length +
      offsetTarjeta * (candidatos.length - 1);
    var offsetX = (medidas.ancho - ancho) / 2;
    gLeyenda.attr("transform", "translate(" + offsetX + ",0)");

    var grupos = gLeyenda
      .selectAll("g")
      .data(candidatos)
      .enter()
      .append("g")
      .attr("fill", function(d) {
        return d.color;
      })
      .attr("transform", function(d, i) {
        return "translate(" + i * (tarjeta.ancho + offsetTarjeta) + ",0)";
      });

    grupos
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "cursor")
      .attr("width", tarjeta.ancho)
      .attr("height", tarjeta.alto)
      .attr("fill", "#ffffff")
      .style("filter", "url(#" + idSombra + ")");

    grupos
      .append("svg:image")
      .attr("class", "cursor")
      .attr("x", (tarjeta.ancho - retrato.ancho) / 2)
      .attr("y", 10)
      .attr("width", retrato.ancho)
      .attr("height", retrato.alto)
      .attr("xlink:href", function(d) {
        return d.imgb64;
      })
      .attr("fill", "transparent");

    grupos
      .append("text")
      .text(function(d) {
        return d.nombrecorto;
      })
      .style("stroke", function(d) {
        return d.color;
      })
      .style("fill", function(d) {
        return d.color;
      })
      .style(estiloLeyenda)
      .attr("x", tarjeta.ancho / 2)
      .attr("y", retrato.alto + 30);
  }

  function setPorcentajes(numero) {
    numero = numero >= porcentajesTotales.length ? 0 : numero;
    var obj = porcentajesTotales[numero];
    var candidato = getCandidatoSeleccionado();
    if (obj !== false) {
      var pcts = obj.valores;
      var obj = {};
      _.each(candidatos, function(c) {
        obj[c.id] = {};
      });
      _.each(pcts, function(o, c) {
        _.each(candidatos, function(candidato) {
          obj[candidato.id][c] = o[candidato.id];
        });
      });
      porcentajes = obj;
      gMexico
        .selectAll("path")
        .each(function(d) {
          d.properties.datos.opacidad = getPorcentaje(
            d.properties.datos.candidato,
            d.properties.ID_1
          );
        })
        .transition()
        .duration(1000)
        .attr("fill", function(d) {
          return getColor(d);
        })
        .attr("opacity", function(d) {
          var opacidad = 1;
          opacidad = d.properties.datos.opacidad;
          return opacidad;
        });
    }
  }

  function resetCandidatos() {
    _.each(candidatos, function(c) {
      c.seleccionado = false;
    });
  }

  function getCandidatoSeleccionado() {
    var c = null;
    c = _.find(candidatos, { seleccionado: true });
    c = c || false;
    return c === false ? candidatoEnBlanco : c;
  }

  function getPorcentaje(candidato, cadenaEstado) {
    var porcentaje = 1;
    if (candidato.nombre !== "") {
      var valor = porcentajes[candidato.id][cadenaEstado];
      if (valor != 0) {
        porcentaje = escalaOpacidad(valor);
      }
    }
    return porcentaje;
  }

  function procesaDatos() {
    var candidato = getCandidatoSeleccionado();
    _.each(datos, function(d) {
      d.x = +d.x + offsetMapa.x;
      d.y = +d.y + offsetMapa.y;
      d.escala = +d.area;
      d.id = +d.id;
    });
    var propiedades = _.map(
      datosMexico.objects.mexico.geometries,
      "properties"
    );
    _.each(propiedades, function(p) {
      var d =
        _.find(datos, {
          id: p.ID_1
        }) || false;
      if (d !== false) {
        p.datos = {};
        p.datos.ajuste = { x: d.x, y: d.y };
        p.datos.centroide = { x: 0, y: 0 };
        p.datos.estado = d.estado;
        p.datos.escala = d.escala;
        p.datos.candidato = candidato;
        p.datos.opacidad = getPorcentaje(candidato, d.id);
      }
    });
  }

  function generaMexico(path) {
    gMexico
      .selectAll("path")
      .data(topojson.feature(datosMexico, datosMexico.objects.mexico).features)
      .enter()
      .append("path")
      .each(function(d) {
        var centroid = path.centroid(d);
        d.properties.datos.centroide.x = centroid[0];
        d.properties.datos.centroide.y = centroid[1];
      })
      .attr("d", path)
      .attr("fill", "#000000")
      .style("stroke-width", "1px");
  }

  function generaSliderTemporal() {
    var drag = d3.behavior
      .drag()
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);

    var fondo = gSlider
      .append("rect")
      .attr("fill", "white")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 760)
      .attr("height", 60)
      .style("filter", "url(#" + idSombra + ")");

    var medidaCompleta = gSlider
      .append("rect")
      .attr("fill", "#cdcdcd")
      .attr("x", inicioMedida)
      .attr("y", 20)
      .attr("width", anchoMedida)
      .attr("height", 20);

    medida = gSlider
      .append("rect")
      .attr("fill", "grey")
      .attr("x", inicioMedida)
      .attr("y", 20)
      .attr("width", anchoMarcador / 2)
      .attr("height", 20)
      .attr("class", "ignorar");

    var marcador = gSlider
      .append("rect")
      .attr("fill", "#000000")
      .attr("x", 300 + inicioMedida - anchoMarcador / 2)
      .attr("x", inicioMedida)
      .attr("y", 10)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("width", 101)
      .attr("height", 40)
      .attr("class", "arrastrar marcador")
      .call(drag);
  }

  function dragstarted() {
    d3.event.sourceEvent.stopPropagation();
    offsetMarcador = false;
    d3.select(this).attr("class", "arrastrando marcador");
  }

  function dragged() {
    var x = d3.event.x;
    var marcador = d3.select(this);
    ajustaMarcador(marcador, x);
  }

  function dragended() {
    offsetMarcador = false;
    setPorcentajes(index);
    d3.select(this).attr("class", "arrastrar marcador");
    actualizaTooltips();
  }

  function ajustaMarcador(rect, x) {
    var total = anchoMedida - anchoMarcador;
    var anchoSegmento = total / porcentajesTotales.length;
    if (offsetMarcador === false) {
      offsetMarcador = x - rect.attr("x");
    }
    var nx = x - offsetMarcador;
    nx = nx <= inicioMedida ? inicioMedida : nx;
    nx =
      nx >= anchoMedida + inicioMedida - anchoMarcador
        ? anchoMedida + inicioMedida - anchoMarcador
        : nx;
    medida.attr("width", nx - inicioMedida + anchoMarcador / 2);
    rect.attr("x", nx);
    var pos = nx - inicioMedida;

    index = parseInt(pos / anchoSegmento);
    index =
      index >= porcentajesTotales.length
        ? porcentajesTotales.length - 1
        : index;
    periodoTexto.text(
      flagEsp
        ? porcentajesTotales[index].nombre
        : porcentajesTotales[index].nombrei
    );
  }

  function generaTooltips() {
    var opciones = {
      trigger: "custom",
      triggerOpen: {
        mouseenter: true,
        touchstart: true
      },
      triggerClose: {
        mouseleave: true,
        tap: true
      },
      contentAsHTML: true
    };
    gMexico.selectAll("path").each(function(d, i) {
      var contenido = "<p>" + d.properties.datos.estado + "</p>";
      opciones.content = $(contenido);
      opciones.theme = "tooltipster-borderless";
      $(this).tooltipster(opciones);
    });
  }

  function explotaMexico() {
    flagExplosion = true;
    gMexico
      .selectAll("path")
      .transition()
      .duration(1000)
      .attr("transform", function(d) {
        return (
          "translate(" +
          d.properties.datos.ajuste.x +
          "," +
          d.properties.datos.ajuste.y +
          ") scale (" +
          1 / 3 +
          ") translate(" +
          d.properties.datos.centroide.x +
          "," +
          d.properties.datos.centroide.y +
          ") scale(" +
          d.properties.datos.escala +
          ") translate(" +
          -d.properties.datos.centroide.x +
          "," +
          -d.properties.datos.centroide.y +
          ")"
        );
      })
      .attr("fill", function(d) {
        return getColor(d);
      })
      .attr("opacity", function(d) {
        return d.properties.datos.opacidad;
      })
      .style("stroke-width", function(d) {
        return 1 / d.properties.datos.escala + "px";
      });
  }

  function juntaMexico() {
    flagExplosion = false;
    gMexico
      .selectAll("path")
      .transition()
      .duration(1000)
      .attr("transform", "translate(0,0)")
      .attr("fill", function(d) {
        return getColor(d);
      })
      .style("stroke-width", "1px");
  }

  function setCandidatoSeleccionado(cadena) {
    var c = null;
    resetCandidatos();
    c = _.find(candidatos, { id: cadena }) || false;
    if (c !== false) {
      c.seleccionado = true;

      gLeyenda
        .selectAll("g")
        .transition()
        .duration(1000)
        .style("opacity", function(d) {
          return d.seleccionado === true ? 1 : 0.3;
        })
        .call(endall, candidatosAGris);

      gLeyenda
        .selectAll("text")
        .transition()
        .duration(1000)
        .style("fill", function(d) {
          return d.seleccionado === true ? d.color : "#cdcdcd";
        })
        .style("stroke", function(d) {
          return d.seleccionado === true ? d.color : "#cdcdcd";
        });

      gMexico
        .selectAll("path")
        .each(function(d) {
          d.properties.datos.candidato = c;
          d.properties.datos.opacidad = getPorcentaje(c, d.properties.ID_1);
        })
        .transition()
        .duration(1000)
        .attr("fill", function(d) {
          return getColor(d);
        })
        .attr("opacity", function(d) {
          return d.properties.datos.opacidad;
        });
    } else {
      c = candidatoEnBlanco;
    }
    return c;
  }

  function getColor(d) {
    var color = "#dfe0e1";
    if (porcentajes.hasOwnProperty(d.properties.datos.candidato.id)) {
      if (
        porcentajes[d.properties.datos.candidato.id][d.properties.ID_1] !== 0
      ) {
        color = d.properties.datos.candidato.color;
      }
    }
    return color;
  }

  function toggleMexico() {
    if (flagExplosion === false) {
      explotaMexico();
    } else {
      juntaMexico();
    }
  }

  function toggleCandidato(d) {
    setCandidatoSeleccionado(d.id);
    actualizaTooltips();
  }

  function actualizaTooltips() {
    gMexico.selectAll("path").each(function(d) {
      var pct = porcentajes[d.properties.datos.candidato.id][d.properties.ID_1];
      var contenido = "<p>" + pct + "<br>" + d.properties.datos.estado + "</p>";
      $(this).tooltipster("content", contenido);
    });
  }

  function iniciaEventos() {
    var el = $(contenedor.node());
    rToggle.on("click", toggleMexico);
    gLeyenda.selectAll(".cursor").on("click", toggleCandidato);
  }

  function getGUID() {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substr(2, 5)
    ).toUpperCase();
  }

  function candidatosAGris() {
    gLeyenda
      .selectAll("image")
      .transition()
      .duration(1000)
      .style("filter", function(d, i) {
        return d.seleccionado === true ? "" : "url(#" + idGris + ")";
      });
  }

  function endall(transition, callback) {
    var n = 0;
    transition
      .each(function() {
        ++n;
      })
      .each("end", function() {
        if (!--n) callback.apply(this, arguments);
      });
  }

  function descargaVisualizacion(elemento) {
    var el = $(elemento).closest("div.visualizacion");
    var padre = d3
      .select(el[0])
      .node()
      .cloneNode(true);
    padre = d3.select(padre);
    var svg = padre.select("svg");
    var nombreSVG = "trendlecciones.svg";
    var nombrePNG = "trendlecciones-mapa-cartograma.png";
    svg.attr("height", medidas.alto + margen.superior + margen.inferior);
    svg.attr("width", medidas.ancho + margen.izquierdo + margen.derecho);
    var html = svg
      .attr("title", "Trendlecciones")
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .node().parentNode.innerHTML;
    html = unescape(encodeURIComponent(html));
    var contenidoSVG = btoa(html);
    var imageArtefacto = new Image();
    imageArtefacto.width = medidas.ancho + margen.izquierdo + margen.derecho;
    imageArtefacto.height = medidas.alto + margen.superior + margen.inferior;
    imageArtefacto.onload = function() {
      var canvasArtefacto = document.createElement("canvas");
      canvasArtefacto.width = imageArtefacto.width;
      canvasArtefacto.height = imageArtefacto.height;
      canvasArtefacto.getContext("2d").drawImage(imageArtefacto, 0, 0);
      var contenidoPNG = canvasArtefacto.toDataURL("image/png");
      download(contenidoPNG, nombrePNG, "image/png");
    };
    imageArtefacto.src = "data:image/svg+xml;base64," + contenidoSVG;
  }

  function convertImgToBase64URL(d, callback) {
    var img = new Image();
    //img.crossOrigin = "Anonymous";
    img.onload = function() {
      var canvas = document.createElement("CANVAS"),
        ctx = canvas.getContext("2d"),
        dataURL;
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      dataURL = canvas.toDataURL("image/png");
      d.imgb64 = dataURL;
      canvas = null;
      callback(null, d);
    };
    d.img = "img/candidatos/" + d.img;
    img.src = d.img;
  }

  setup(el);

  return { iniciar: iniciar };
};
