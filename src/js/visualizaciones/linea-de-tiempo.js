/*
Copyright (c) 2018 Gilberto Leon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var LineaDeTiempo = function($, el, flagIniciar) {
  flagIniciar = flagIniciar || false;
  var flagEsp =
    window.location.pathname.split("/").indexOf("eng") >= 0 ? false : true;

  var candidatos = null;
  var valores = null;

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

  var estiloLineas = { fill: "none", "stroke-width": "3px" };

  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var medidas = {
    ancho: 800 - margin.left - margin.right,
    alto: 800 - margin.top - margin.bottom
  };

  var tarjeta = { ancho: 133, alto: 124 };
  var offsetTarjeta = 24;
  var retrato = { ancho: 85, alto: 85 };
  var medidasMarcador = { ancho: 42, alto: 42 };

  var contenedor = null;
  var svg = null;
  var gReticula = null;
  var gLineas = null;
  var gCirculos = null;
  var gLeyenda = null;
  var gSlider = null;

  var linea = null;

  var periodoTexto = null;

  var idSombra = getGUID();
  var idGris = getGUID();

  var escalaX = d3.time.scale().range([0, medidas.ancho - 100]);
  var escalaY = d3.scale
    .linear()
    .range([medidas.alto - 135, 150])
    .domain([0, 100]);

  var anchoMarcador = 101;
  var inicioMedida = 22.5;
  var anchoMedida = 707;
  var medida = null;
  var marcador = null;

  var conversionEscalaX = d3.scale
    .linear()
    .domain([0, anchoMedida - anchoMarcador])
    .range([0, medidas.ancho - 100])
    .clamp([true]);

  var offsetMarcador = false;

  var posicion = 0;
  var tramoEscalaY = d3.scale.linear().clamp([true]);

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
          .attr("width", medidas.ancho + (margin.right - margin.left))
          .attr("height", medidas.alto)
          .attr("fill", "#ffffff");

        gReticula = svg.append("g");
        gReticula
          .append("rect")
          .attr("x", 0)
          .attr("y", 145)
          .attr("width", medidas.ancho)
          .attr("height", 505)
          .attr("fill", "#ffffff")
          .style("filter", "url(#" + idSombra + ")");

        gLineas = svg.append("g");

        gCirculos = svg.append("g");

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

        linea = d3.svg
          .line()
          .x(function(d) {
            return escalaX(d.fecha);
          })
          .y(function(d) {
            return escalaY(d.valor);
          });

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

  function generaEjes() {
    _.each(candidatos, function(candidato, clave) {
      _.each(candidato.puntos, function(punto) {
        var arreglo = punto.fecha.split("-");
        var anio = parseInt(arreglo[0]);
        var mes = parseInt(arreglo[1]) - 1;
        if (arreglo.length === 3) {
          var dia = parseInt(arreglo[2]);
          punto.fecha = new Date(anio, mes, dia);
        } else {
          punto.fecha = new Date(anio, mes);
        }
      });
    });
    var fechas = _.map(
      _.flatten(_.map(_.flatten(candidatos), "puntos")),
      "fecha"
    );

    escalaX.domain(d3.extent(fechas));

    _.each(candidatos, function(candidato) {
      _.map(candidato.puntos, function(p) {
        p.x = escalaX(p.fecha);
      });
      var r = _.clone(candidato.puntos);
      _.reverse(r);
      candidato.rpuntos = r;
    });
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
      .style("font-family", "'Roboto', sans-serif")
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
    d.seleccionado = !d.seleccionado;
    gLeyenda
      .selectAll("g")
      .filter(function(g) {
        return g.id === d.id;
      })
      .transition()
      .duration(1000)
      .style("opacity", function(g) {
        return g.seleccionado === true ? 1 : 0.3;
      })
      .call(endall, candidatosAGris);

    gLeyenda
      .selectAll("text")
      .transition()
      .duration(1000)
      .style("stroke", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      })
      .style("fill", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      });

    gLineas
      .selectAll("g")
      .filter(function(g) {
        return g.id === d.id;
      })
      .transition()
      .duration(1000)
      .style("opacity", function(g) {
        return g.seleccionado === true ? 1 : 0;
      });

    gLineas
      .selectAll("path")
      .transition()
      .duration(1000)
      .style("stroke", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      });

    gLineas
      .selectAll("text")
      .transition()
      .duration(1000)
      .style("stroke", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      })
      .style("fill", function(d) {
        return d.seleccionado === true ? d.color : "#cdcdcd";
      });

    gCirculos.selectAll("circle").classed("ignorar", function(d) {
      return !d.candidato.seleccionado;
    });
    actualizaTooltips();
  }

  function generaLineas() {
    var arreglo = [];
    _.each(candidatos, function(c) {
      arreglo.push(c);
    });
    arreglo.sort(function(a, b) {
      var objA = _.last(a.puntos);
      var objB = _.last(b.puntos);
      if (objA.valor < objB.valor) {
        return -1;
      }
      if (objA.valor > objB.valor) {
        return 1;
      }
      return 0;
    });

    var marcadores = [];
    _.each(arreglo, function(candidato) {
      var filtrados = _.filter(valores, function(v) {
        return v.candidato.id === candidato.id;
      });
      marcadores.push(filtrados);
    });

    var grupos = gLineas
      .selectAll("g")
      .data(arreglo)
      .enter()
      .append("g")
      .attr("fill", function(d) {
        return d.color;
      })
      .style("stroke", function(d) {
        return d.color;
      });

    grupos
      .append("path")
      .attr("d", function(d) {
        return linea(d.puntos);
      })
      .each(function(d) {
        d.linea = {};
        d.linea.largo = d3
          .select(this)
          .node()
          .getTotalLength();
        d.linea.parcial = 0;
      })
      .style(estiloLineas)
      .attr("stroke-dasharray", "0,1");

    grupos.append("g");

    grupos
      .append("svg:image")
      .attr("class", "ignorar")
      .attr("width", medidasMarcador.ancho)
      .attr("height", medidasMarcador.alto)
      .attr("x", function(d) {
        return escalaX(d.puntos[0].fecha);
      })
      .attr("y", function(d) {
        return escalaY(d.puntos[0].valor);
      })
      .attr("xlink:href", function(d) {
        return d.imgb64;
      })
      .attr(
        "transform",
        "translate(" +
          -medidasMarcador.ancho / 2 +
          "," +
          -medidasMarcador.alto / 2 +
          ")"
      );

    grupos
      .append("text")
      .text(function(d) {
        return d.nombrecorto;
      })
      .style("font-family", "'Roboto', sans-serif")
      .style("text-transform", "uppercase")
      .attr("x", function(d) {
        return escalaX(d.puntos[0].fecha) + 25;
      })
      .attr("y", function(d) {
        return escalaY(d.puntos[0].valor) + 5;
      });

    grupos.selectAll("g").each(function(d) {
      var vs = _.filter(valores, function(v) {
        return v.candidato.id === d.id;
      });
      d3.select(this)
        .selectAll("circle")
        .data(vs)
        .enter()
        .append("circle")
        .attr("class", "remover")
        .attr("fill", d.color)
        .attr("cx", function(d) {
          d.x = escalaX(d.fecha);
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y || 625;
        })
        .attr("r", 4)
        .on("mouseenter", function(d) {
          d3.select(this)
            .transition()
            .duration(400)
            .attr("r", 12);
        })
        .on("mouseleave", function(d) {
          d3.select(this)
            .transition()
            .duration(400)
            .attr("r", 4);
        });
    });

    _.each(arreglo, function(candidato) {
      candidato.tramos = [];
      var n = candidato.puntos.length;
      var i = 0;
      var acumulado = 0;
      for (i = 1; i < n; i++) {
        var xIni = escalaX(candidato.puntos[i - 1].fecha);
        var yIni = escalaY(candidato.puntos[i - 1].valor);
        var xFin = escalaX(candidato.puntos[i].fecha);
        var yFin = escalaY(candidato.puntos[i].valor);
        candidato.tramos.push({
          inicio: [xIni, yIni],
          final: [xFin, yFin],
          acumulado: acumulado
        });
        acumulado += Math.sqrt(
          Math.pow(xFin - xIni, 2) + Math.pow(yFin - yIni, 2)
        );
      }
    });
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

    gLineas.selectAll("circle").each(function(d) {
      var contenido = "<p>" + getCadenaFecha(d) + "</p>";
      contenido += "<ul>";
      _.each(d.candidatos, function(candidato) {
        contenido +=
          "<li style='color:" +
          candidato.color +
          "'><span class='valor'>" +
          _.padStart(_.round(candidato.valor), 2, "0") +
          "</span> " +
          candidato.nombre +
          "</li>";
      });
      contenido += "</ul>";
      opciones.content = $(contenido);
      opciones.theme = "tooltipster-shadow";
      $(this).tooltipster(opciones);
    });
  }

  function actualizaTooltips() {
    var seleccionados = _.filter(candidatos, { seleccionado: true });
    var ids = _.map(seleccionados, "id");
    gLineas.selectAll("circle").each(function(d) {
      var contenido = "<p>" + getCadenaFecha(d) + "</p>";
      if (ids.length > 0) {
        contenido += "<ul>";
        var candidatos = _.filter(d.candidatos, function(d) {
          return ids.indexOf(d.id) >= 0;
        });
        _.each(candidatos, function(candidato) {
          contenido +=
            "<li style='color:" +
            candidato.color +
            "'><span class='valor'>" +
            _.padStart(_.round(candidato.valor), 2, "0") +
            "</span> " +
            candidato.nombre +
            "</li>";
        });
        contenido += "</ul>";
      }

      $(this).tooltipster("content", contenido);
    });
  }

  function getCadenaFecha(obj, mes) {
    if (flagEsp) {
      var meses = {
        1: "Ene",
        2: "Feb",
        3: "Mar",
        4: "Abr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Ago",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dic"
      };
    } else {
      var meses = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec"
      };
    }
    var cadena = null;
    var arreglo = obj.fechatextual.split("-");
    var anio = parseInt(arreglo[0]);
    var mes = parseInt(arreglo[1]);
    if (arreglo.length === 3) {
      var dia = parseInt(arreglo[2]);
      cadena = dia + " " + meses[mes] + " " + anio;
    }
    if (arreglo.length === 2) {
      cadena = meses[mes] + " " + anio;
    }
    return cadena;
  }

  function main() {
    var q = d3.queue();
    var urlValoresJSON = contenedor.attr("data-valores") || false;
    var urlValoresCSV = contenedor.attr("data-valores-csv") || false;
    var urlCandidatos = contenedor.attr("data-candidatos") || false;
    if (
      urlCandidatos !== false &&
      (urlValoresJSON !== false || urlValoresCSV !== false)
    ) {
      var flagDatos = "json";
      q.defer(d3.json, urlCandidatos + "?" + getGUID());
      if (urlValoresJSON !== false) {
        q.defer(d3.json, urlValoresJSON + "?" + getGUID());
      } else {
        flagDatos = "csv";
        q.defer(d3.csv, urlValoresCSV + "?" + getGUID());
      }
      q.awaitAll(function(error, arreglo) {
        candidatos = arreglo[0];
        candidatos.sort(function(a, b) {
          if (a.nombrecorto < b.nombrecorto) {
            return -1;
          }
          if (a.nombrecorto > b.nombrecorto) {
            return 1;
          }
          return 0;
        });
        if (flagDatos === "json") {
          var temas = arreglo[1].result.aggregated.topics;
          var resultados = arreglo[1].result.aggregated.result;
          _.each(candidatos, function(candidato) {
            candidato.seleccionado = true;
            candidato.puntos = [];
            var i = _.findIndex(temas, { id: candidato.gid });
            if (i >= 0) {
              candidato.puntos = _.map(resultados, function(r) {
                return {
                  fecha: r.time,
                  fechatextual: r.time,
                  valor: +r.value[i],
                  celda: r.value[i]
                };
              });
            }
          });
        } else {
          var resultados = arreglo[1];
          _.each(candidatos, function(candidato) {
            candidato.seleccionado = true;
            candidato.puntos = [];
            _.each(resultados, function(r) {
              candidato.puntos.push({
                fecha: r.fecha,
                fechatextual: r.fecha,
                valor: +r[candidato.id] || 0,
                celda: r[candidato.id]
              });
            });
          });
        }

        var obj = {};
        _.each(candidatos, function(candidato) {
          _.each(candidato.puntos, function(punto) {
            if (!obj.hasOwnProperty(punto.fechatextual)) {
              obj[punto.fechatextual] = {
                fecha: punto.fechatextual,
                candidatos: []
              };
            }
            obj[punto.fechatextual].candidatos.push({
              nombre: candidato.nombre,
              nombrecorto: candidato.nombrecorto,
              color: candidato.color,
              valor: punto.celda,
              id: candidato.id
            });
          });
        });

        var arreglo = _.values(obj);
        valores = [];
        _.each(arreglo, function(obj) {
          var fecha = null;
          var fechatextual = obj.fecha;
          var arrf = obj.fecha.split("-");
          var anio = parseInt(arrf[0]);
          var mes = parseInt(arrf[1]) - 1;
          if (arrf.length === 3) {
            var dia = parseInt(arrf[2]);
            fecha = new Date(anio, mes, dia);
          } else {
            fecha = new Date(anio, mes);
          }
          var cands = obj.candidatos;
          _.each(obj.candidatos, function(candidato) {
            var y = escalaY(+candidato.valor || 0);
            valores.push({
              fecha: fecha,
              fechatextual: fechatextual,
              y: y,
              candidatos: cands,
              candidato: _.find(candidatos, { id: candidato.id })
            });
          });
        });
        var f = d3.queue();
        _.each(candidatos, function(candidato) {
          f.defer(convertImgToBase64URL, candidato);
        });
        f.awaitAll(function(error, a) {
          generaEjes();
          generaLeyenda();
          generaLineas();
          generaSliderTemporal();
          ajustaMarcador(0);
          generaTooltips();
          contenedor.classed("espera", false);
          if (flagIniciar === true) {
            iniciar();
          }
        });
      });
    }
  }

  function iniciar() {
    marcador
      .transition()
      .duration(4000)
      .attrTween("x", function(d) {
        var i = d3.interpolateNumber(
          _.floor(inicioMedida),
          _.ceil(anchoMedida - anchoMarcador + inicioMedida)
        );
        return function(t) {
          ajustaMarcador(i(t));
          return i(t);
        };
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

    medida = gSlider.append("rect");
    medida
      .attr("fill", "grey")
      .attr("x", inicioMedida)
      .attr("y", 20)
      .attr("width", anchoMarcador / 2)
      .attr("height", 20)
      .attr("class", "ignorar");

    marcador = gSlider.append("rect");
    marcador
      .attr("fill", "#000000")
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
    ajustaMarcador(x);
  }

  function dragended() {
    offsetMarcador = false;
    d3.select(this).attr("class", "arrastrar marcador");
  }

  function ajustaMarcador(x) {
    if (offsetMarcador === false) {
      offsetMarcador = x - +marcador.attr("x");
    }
    var nx = x - offsetMarcador;
    nx = nx <= inicioMedida ? inicioMedida : nx;
    nx =
      nx >= anchoMedida + inicioMedida - anchoMarcador
        ? anchoMedida + inicioMedida - anchoMarcador
        : nx;
    posicion = nx - inicioMedida;

    var xLineas = conversionEscalaX(posicion);

    medida.attr("width", nx - inicioMedida + anchoMarcador / 2);
    marcador.attr("x", nx);

    gLineas
      .selectAll("image")
      .each(function(d) {
        d.punto = {};
        d.tramo =
          _.find(d.tramos, function(tramo) {
            return tramo.inicio[0] <= xLineas && xLineas <= tramo.final[0];
          }) || false;
        tramoEscalaY
          .domain([d.tramo.inicio[0], d.tramo.final[0]])
          .range([d.tramo.inicio[1], d.tramo.final[1]]);
        d.punto.x = xLineas;
        d.punto.y = tramoEscalaY(xLineas);

        var punto =
          _.find(d.rpuntos, function(p) {
            return p.x <= xLineas;
          }) || false;
        var texto = getCadenaFecha(punto, "short");
        periodoTexto.text(texto);
      })
      .attr("x", function(d) {
        return d.punto.x;
      })
      .attr("y", function(d) {
        return d.punto.y;
      });

    gLineas
      .selectAll("text")
      .attr("x", xLineas + 25)
      .attr("y", function(d) {
        return d.punto.y;
      });

    gLineas
      .selectAll("circle")
      .attr("opacity", function(d) {
        return d.x > xLineas ? 0 : 1;
      })
      .style("display", function(d) {
        return d.x > xLineas ? "none" : "";
      });

    gLineas.selectAll("path").call(transicionLinea);
  }

  function transicionLinea(path) {
    path
      .transition()
      .duration(0)
      .attrTween("stroke-dasharray", function(d) {
        var path = d3.select(this);
        d.linea.parcial =
          d.tramo.acumulado +
          Math.sqrt(
            Math.pow(d.punto.x - d.tramo.inicio[0], 2) +
              Math.pow(d.punto.y - d.tramo.inicio[1], 2)
          );
        var path = d3.select(this);
        var l = d.linea.parcial;
        if (d.linea.parcial > d.linea.largo) {
          d.linea.parcial = d.linea.largo;
        }
        if (l === 0) {
          var i = d3.interpolateString("0," + 0, 0 + "," + 1);
        } else {
          var i = d3.interpolateString("0," + l, l + "," + 1000 * l);
        }
        return function(t) {
          var p = path.node().getPointAtLength(t * l);
          return i(t);
        };
      });
  }

  function getGUID() {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substr(2, 5)
    ).toUpperCase();
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

  function candidatosAGris() {
    gLeyenda
      .selectAll("image")
      .transition()
      .duration(1000)
      .style("filter", function(d, i) {
        return d.seleccionado === true ? "" : "url(#" + idGris + ")";
      });

    gLineas
      .selectAll("image")
      .transition()
      .duration(1000)
      .style("filter", function(d, i) {
        return d.seleccionado === true ? "" : "url(#" + idGris + ")";
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
    var nombrePNG = "trendlecciones-linea-de-tiempo.png";
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
