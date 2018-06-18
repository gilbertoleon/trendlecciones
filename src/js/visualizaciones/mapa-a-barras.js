/*
Copyright (c) 2018 Gilberto Leon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var MapaABarras = function($, el, flagIniciar) {
  flagIniciar = flagIniciar || false;
  var flagEsp =
    window.location.pathname.split("/").indexOf("eng") >= 0 ? false : true;

  var candidatos = null;
  var periodos = null;
  var preferencias = null;
  var candidatoEnBlanco = { id: "", nombre: "", color: "#000000", altura: 0 };

  var projection = d3.geo
    .mercator()
    .scale(1100)
    .center([-108.34034978813841, 24.012062015793]);
  var path = d3.geo.path().projection(projection);

  var paddingEstados = 8;

  var fMexico = false;

  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var medidas = {
    ancho: 800 - margin.left - margin.right,
    alto: 800 - margin.top - margin.bottom
  };

  var tarjeta = { ancho: 133, alto: 124 };
  var retrato = { ancho: 85, alto: 85 };
  var columna = { ancho: 51, alto: 51 };

  var h = 541;

  var estiloLeyenda = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "18px",
    "font-style": "normal",
    "text-anchor": "middle",
    "alignment-baseline": "central",
    "text-transform": "uppercase",
    "font-kerning": "normal"
  };

  var estiloColumna = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "14px",
    "font-style": "normal",
    "text-anchor": "middle",
    "alignment-baseline": "central",
    "text-transform": "uppercase",
    "font-kerning": "normal"
  };

  var estiloColumnaEstados = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "10px",
    "font-style": "normal",
    "text-anchor": "middle",
    "alignment-baseline": "central",
    "text-transform": "uppercase",
    stroke: "#000000",
    fill: "#000000",
    "font-weight": 100,
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

  var contenedor = null;
  var svg = null;
  var gCandidatos = null;
  var mexico = null;
  var gLeyenda = null;
  var gSlider = null;

  var periodoTexto = null;

  var idSombra = getGUID();
  var idGris = getGUID();

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
              (medidas.ancho + margin.left + margin.right) +
              " " +
              (medidas.alto + margin.top + margin.bottom)
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
          .attr("width", medidas.ancho + margin.left + margin.right)
          .attr("height", medidas.alto + margin.top + margin.bottom);

        svg = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        svg
          .append("rect")
          .attr("width", medidas.ancho)
          .attr("height", medidas.alto)
          .attr("fill", "transparent");

        svg
          .append("rect")
          .attr("class", "cursor")
          .attr("x", 3)
          .attr("y", 0)
          .attr("width", 602)
          .attr("height", h)
          .attr("fill", "transparent")
          .on("click", toggleMexico);

        gCandidatos = svg.append("g");
        mexico = svg.append("g");

        periodoTexto = svg
          .append("g")
          .attr("transform", "translate(0,682)")
          .append("text")
          .attr("x", medidas.ancho / 2)
          .style(estiloPeriodo);

        gLeyenda = svg.append("g");
        gSlider = svg
          .append("g")
          .attr("transform", "translate(0," + (medidas.alto - 60) + ")");

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
    var q = d3.queue();
    var urlValoresJSON = contenedor.attr("data-valores-json") || false;
    var urlCandidatos = contenedor.attr("data-candidatos") || false;
    if (urlCandidatos !== false && urlValoresJSON !== false) {
      q.defer(d3.json, "json/mexico.json");
      q.defer(d3.json, urlCandidatos + "?" + getGUID());
      q.defer(d3.json, urlValoresJSON + "?" + getGUID());
      q.awaitAll(function(error, arreglo) {
        var datosMexico = arreglo[0];
        candidatos = arreglo[1];
        periodos = arreglo[2];
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
          _.each(candidatos, function(d) {
            d.seleccionado = true;
          });
          var clave = getCandidatosSeleccionados();
          _.each(periodos, function(p, i) {
            p.seleccionado = i === 0 ? true : false;
          });
          preferencias = getConjuntoDeDatos(clave);
          generaLeyenda();
          generaCandidatos();
          generaMexico(datosMexico);
          generaSliderTemporal();
          generaTooltips();
          actualizaMexico();
          contenedor.classed("espera", false);
          if (flagIniciar === true) {
            iniciar();
          }
        });
      });
    }
  }

  function iniciar() {
    explotaMexico();
    periodoTexto.text(flagEsp ? periodos[0].nombre : periodos[0].nombrei);
  }

  function cambiaPeriodo(numero) {
    numero = numero >= periodos.length ? 0 : numero;
    _.each(periodos, function(p, i) {
      p.seleccionado = i === numero ? true : false;
    });
    var clave = getCandidatosSeleccionados();
    preferencias = getConjuntoDeDatos(clave);
    actualizaMexico(true);
  }

  function getGUID() {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substr(2, 5)
    ).toUpperCase();
  }

  function getCandidatosSeleccionados() {
    var arreglo = _.filter(candidatos, { seleccionado: true });
    arreglo = _.map(arreglo, "id");
    arreglo.sort();
    return arreglo.join("-");
  }

  function getConjuntoDeDatos(cadena) {
    var arreglo = [];
    var periodo = _.find(periodos, { seleccionado: true }) || false;
    if (periodo !== false) {
      var obj = periodo.combinaciones[cadena] || {};
      _.each(obj, function(v, c) {
        var max = _.maxBy(_.keys(v), function(o) {
          return v[o];
        });
        arreglo.push({ estado: +c, valor: max });
      });
    }
    return arreglo;
  }

  function generaLeyenda() {
    gLeyenda.attr(
      "transform",
      "translate(" + (medidas.ancho - tarjeta.ancho) + ",0)"
    );

    var grupos = gLeyenda
      .selectAll("g")
      .data(candidatos)
      .enter()
      .append("g")
      .attr("fill", function(d) {
        return d.color;
      })
      .attr("transform", function(d, i) {
        return "translate(0," + i * (tarjeta.alto + 25) + ")";
      });

    grupos
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "cursor")
      .attr("width", tarjeta.ancho)
      .attr("height", tarjeta.alto)
      .attr("fill", "#ffffff")
      .style("filter", "url(#" + idSombra + ")")
      .on("click", toggleCandidato);

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
      .attr("fill", "transparent")
      .on("click", toggleCandidato);

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

  function toggleCandidato(d) {
    var flag = false;
    if (d.seleccionado === false) {
      flag = true;
    } else {
      var arreglo = _.filter(candidatos, { seleccionado: true });
      if (arreglo.length >= 3) {
        flag = true;
      }
    }
    if (flag === true) {
      d.seleccionado = !d.seleccionado;
      var clave = getCandidatosSeleccionados();
      preferencias = getConjuntoDeDatos(clave);
      actualizaMexico(true);
    }
  }

  function generaCandidatos() {
    gCandidatos.attr("transform", "translate(50,0)");

    var grupos = gCandidatos
      .selectAll("g")
      .data(candidatos)
      .enter()
      .append("g")
      .attr("fill", function(d) {
        return d.color;
      });

    grupos
      .append("svg:image")
      .attr("x", function(d, i) {
        d.x = 152 * i;
        return d.x;
      })
      .attr("y", 590)
      .attr("y", h + 19)
      .attr("width", columna.ancho)
      .attr("height", columna.alto)
      .attr("xlink:href", function(d) {
        return d.imgb64;
      })
      .attr("fill", "transparent")
      .attr("opacity", 0);

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
      .style(estiloColumna)
      .attr("x", function(d) {
        return d.x + columna.ancho / 2;
      })
      .attr("y", 665)
      .attr("y", h + 94)
      .attr("opacity", 0);

    grupos
      .append("text")
      .attr("class", "cuenta")
      .text(flagEsp ? "0 estados" : "0 states")
      .style(estiloColumnaEstados)
      .attr("x", function(d) {
        return d.x + columna.ancho / 2;
      })
      .attr("y", 680)
      .attr("y", h + 109)
      .attr("opacity", 0);

    grupos
      .append("rect")
      .attr("class", "ignorar")
      .attr("width", 146)
      .attr("height", 0)
      .attr("x", function(d, i) {
        return d.x - 47;
      })
      .attr("y", h)
      .attr("fill", function(d) {
        return d.color;
      })
      .style("opacity", 0.2);
  }

  function actualizaMexico(accion) {
    accion = accion || false;
    _.each(candidatos, function(c) {
      c.altura = 0;
    });
    var alturaBarra = h;
    var objPreferencias = _.countBy(preferencias, "valor");
    var max = _.max(_.values(objPreferencias));
    var objCuentas = {};
    _.each(objPreferencias, function(v, c) {
      objCuentas[c] = 0;
    });

    var alturaP = alturaBarra / max;
    var altura = alturaP - paddingEstados;

    _.each(candidatos, function(candidato) {
      candidato.altura = alturaP * (objPreferencias[candidato.id] || 0);
    });

    var estados = mexico.selectAll("path");

    estados.each(function(d) {
      d.properties.preferencia = _.find(preferencias, {
        estado: d.properties.ID_1
      });
      d.properties.candidato =
        _.find(candidatos, { id: d.properties.preferencia.valor }) ||
        candidatoEnBlanco;
    });

    estados
      .transition()
      .duration(1000)
      .attr("transform", "translate(-310,90)")
      .attr("fill", function(d) {
        return d.properties.candidato.color;
      })
      .each(function(d) {
        var centroid = path.centroid(d);
        var x = centroid[0];
        var y = centroid[1];
        objCuentas[d.properties.candidato.id] =
          objCuentas[d.properties.candidato.id] + 1;
        d.x = d.properties.candidato.x + 50 + columna.ancho / 2;
        d.y =
          alturaBarra -
          objCuentas[d.properties.candidato.id] * alturaP +
          alturaP / 2;

        d.xc = x;
        d.yc = y;
        d.altura = altura;

        d.caja = this.getBBox();
        var escala = d.altura / d.caja.height;
        d.escala = escala;

        var contenido =
          "<p>" +
          d.properties.NAME_1 +
          "<br>" +
          d.properties.candidato.nombre +
          "</p>";
        $(this).tooltipster("content", contenido);
      });

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

    gCandidatos
      .selectAll("g")
      .transition()
      .duration(1000)
      .style("opacity", function(d) {
        return d.seleccionado === true ? 1 : 0.3;
      });

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

    gCandidatos
      .selectAll("text")
      .transition()
      .duration(1000)
      .style("fill", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      })
      .style("stroke", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      });

    gCandidatos.selectAll("text.cuenta").text(function(d) {
      var n = objPreferencias[d.id] || 0;
      var mensaje = flagEsp ? "estados" : "states";
      if (n === 1) {
        mensaje = flagEsp ? "estado" : "state";
      }
      return n + " " + mensaje;
    });

    if (accion === true && fMexico === true) {
      explotaMexico();
    }
  }

  function candidatosAGris() {
    gLeyenda
      .selectAll("image")
      .transition()
      .duration(1000)
      .style("filter", function(d, i) {
        return d.seleccionado === true ? "" : "url(#" + idGris + ")";
      });
    gCandidatos
      .selectAll("image")
      .transition()
      .duration(1000)
      .style("filter", function(d, i) {
        return d.seleccionado === true ? "" : "url(#" + idGris + ")";
      });
  }

  function generaMexico(d) {
    mexico
      .selectAll("path")
      .data(topojson.feature(d, d.objects.mexico).features)
      .enter()
      .append("path")
      .each(function(d) {
        d.properties.preferencia = _.find(preferencias, {
          estado: d.properties.ID_1
        });
        d.properties.candidato =
          _.find(candidatos, { id: d.properties.preferencia.valor }) ||
          candidatoEnBlanco;
      })
      .attr("transform", "translate(-310,90)")
      .attr("d", path)
      .attr("class", "estado mexico")
      .attr("fill", function(d) {
        return d.properties.candidato.color;
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", function(d) {
        return 1 + "px";
      });
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
      .attr("class", "arrastrar")
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
    cambiaPeriodo(index);
    d3.select(this).attr("class", "arrastrar marcador");
  }

  function ajustaMarcador(rect, x) {
    var total = anchoMedida - anchoMarcador;
    var anchoSegmento = total / periodos.length;
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
    index = index >= periodos.length ? periodos.length - 1 : index;

    periodoTexto.text(
      flagEsp ? periodos[index].nombre : periodos[index].nombrei
    );
  }

  function toggleMexico() {
    if (fMexico === false) {
      explotaMexico();
    } else {
      juntaMexico();
    }
  }

  function explotaMexico() {
    fMexico = true;

    gCandidatos
      .selectAll("rect")
      .transition()
      .duration(2000)
      .attr("height", function(d) {
        return d.altura || 0;
      })
      .attr("y", function(d, i) {
        return h - (d.altura || 0);
      })
      .attr("fill", function(d) {
        return d.color;
      });

    gCandidatos
      .selectAll("image")
      .transition()
      .duration(2000)
      .attr("opacity", 1);

    gCandidatos
      .selectAll("text")
      .transition()
      .duration(2000)
      .attr("opacity", 1);

    mexico
      .selectAll("path")
      .transition()
      .duration(2000)
      .attr("fill", function(d) {
        return d.properties.candidato.color;
      })
      .style("stroke-width", function(d) {
        return 0 + "px";
      })
      .attr("transform", function(d, i) {
        return (
          "translate(" +
          (d.x - d.xc) +
          "," +
          (d.y - d.yc) +
          ") translate(" +
          d.xc +
          "," +
          d.yc +
          ") scale(" +
          d.escala +
          ") translate(" +
          -d.xc +
          "," +
          -d.yc +
          ")"
        );
      });
  }

  function juntaMexico() {
    fMexico = false;
    gCandidatos
      .selectAll("rect")
      .transition()
      .duration(2000)
      .attr("height", 0)
      .attr("y", h)
      .attr("fill", function(d) {
        return d.color;
      });

    gCandidatos
      .selectAll("image")
      .transition()
      .duration(2000)
      .attr("opacity", 0);

    gCandidatos
      .selectAll("text")
      .transition()
      .duration(2000)
      .attr("opacity", 0);

    mexico
      .selectAll("path")
      .transition()
      .duration(2000)
      .attr("transform", function(d) {
        return "translate(-310,90)";
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", "1px");
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

  function generaTooltips() {
    var opciones = {
      trigger: "custom",
      triggerOpen: {
        mouseenter: true
      },
      triggerClose: {
        mouseleave: true
      },
      contentAsHTML: true
    };
    svg.selectAll("path.estado").each(function(d, i) {
      var contenido =
        "<p>" +
        d.properties.NAME_1 +
        "<br>Candidato: " +
        d.properties.candidato.nombre +
        "</p>";
      opciones.content = $(contenido);
      opciones.theme = "tooltipster-borderless";
      $(this).tooltipster(opciones);
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
    var nombrePNG = "trendlecciones-mapa-barras.png";
    svg.attr("height", medidas.alto + margin.top + margin.bottom);
    svg.attr("width", medidas.ancho + margin.left + margin.right);
    var html = svg
      .attr("title", "Trendlecciones")
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .node().parentNode.innerHTML;
    html = unescape(encodeURIComponent(html));
    var contenidoSVG = btoa(html);
    var imageArtefacto = new Image();
    imageArtefacto.width = medidas.ancho + margin.left + margin.right;
    imageArtefacto.height = medidas.alto + margin.top + margin.bottom;
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
