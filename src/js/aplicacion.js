/*
El sitio donde se usaron las visualizaciones usa otra versión de jQuery, así que se guarda la referencia en otra variable global
*/
"use strict";
var jQuery_3_3_1 = $.noConflict(true);

/*
Envía clones de objetos a la consola en vez del estado actual de los mismos
*/
var clonsola = (function() {
  function log(obj) {
    console.log(_.cloneDeep(obj));
  }

  function dir(obj) {
    console.dir(_.cloneDeep(obj));
  }

  function warn(obj) {
    console.warn(_.cloneDeep(obj));
  }

  function error(obj) {
    console.error(_.cloneDeep(obj));
  }

  function clear() {
    console.clear();
  }
  return {
    log: log,
    dir: dir,
    warn: warn,
    error: error,
    clear: clear
  };
})();

var LineaDeTiempoSelector = function($, el, flagIniciar) {
  flagIniciar = flagIniciar || false;
  var flagEsp =
    window.location.pathname.split("/").indexOf("eng") >= 0 ? false : true;

  var estados = null;
  var candidatos = null;
  var valores = null;

  var estiloLeyenda = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "11px",
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

  var tarjeta = { ancho: 86, alto: 92 };
  var offsetTarjeta = 9;
  var retrato = { ancho: 70, alto: 70 };
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

  var escalaX = d3.time.scale().range([0, medidas.ancho - 130]);
  var escalaY = d3.scale
    .linear()
    .range([medidas.alto - 170, 120])
    .domain([0, 100]);

  var anchoMarcador = 101;
  var inicioMedida = 22.5;
  var anchoMedida = 707;
  var medida = null;
  var marcador = null;

  var conversionEscalaX = d3.scale
    .linear()
    .domain([0, anchoMedida - anchoMarcador])
    .range([0, medidas.ancho - 130])
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
          .attr("y", 112)
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
    _.each(estados, function(es) {
      _.each(es.candidatos, function(candidato, clave) {
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
    });

    var fechas = _.map(
      _.flatten(_.map(_.flatten(candidatos), "puntos")),
      "fecha"
    );

    escalaX.domain(d3.extent(fechas));

    _.each(estados, function(es) {
      _.each(es.candidatos, function(candidato) {
        _.map(candidato.puntos, function(p) {
          p.x = escalaX(p.fecha);
        });
        var r = _.clone(candidato.puntos);
        _.reverse(r);
        candidato.rpuntos = r;
      });
    });
  }

  function generaLeyenda() {
    var ancho =
      tarjeta.ancho * candidatos.length +
      offsetTarjeta * (candidatos.length - 1);
    var offsetX = (medidas.ancho - ancho) / 2;
    gLeyenda.attr("transform", "translate(" + offsetX + ",0)");

    var grupos = gLeyenda.selectAll("g").data(candidatos, function(d) {
      return d.gid;
    });

    grupos.exit().remove();

    grupos
      .enter()
      .append("g")
      .attr("fill", function(d) {
        return d.color;
      })
      .attr("transform", function(d, i) {
        return "translate(" + i * (tarjeta.ancho + offsetTarjeta) + ",0)";
      })
      .style("opacity", function(d) {
        return d.seleccionado === true ? 1 : 0.3;
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
      .attr("y", 2)
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
      .attr("y", retrato.alto + 12);
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

    var grupos = gLineas.selectAll("g").data(arreglo, function(d) {
      return d.gid;
    });

    grupos.exit().remove();

    grupos
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
        return escalaX(d.puntos[0].fecha) + 25;
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

  function generaCSV() {
    var BOM = "\uFEFF";
    var div = $(contenedor.node()).closest("div.visualizacion");
    var liga = div.find(".descargacsv");
    var archivo = [];
    var linea = [];
    var datos = {};
    var fechas = _.map(
      _.flatten(_.map(_.flatten(candidatos), "puntos")),
      "fechatextual"
    );
    _.each(fechas, function(fecha) {
      datos[fecha] = { fecha: fecha, valores: [] };
    });
    linea.push("Fecha");
    _.each(candidatos, function(candidato) {
      linea.push('"' + candidato.nombre + '"');
      _.each(candidato.puntos, function(punto) {
        datos[punto.fechatextual].valores.push(punto.celda);
      });
    });
    archivo.push(linea.join(","));

    datos = _.values(datos);
    datos.sort(function(a, b) {
      if (a.fecha < b.fecha) {
        return -1;
      }
      if (a.fecha > b.fecha) {
        return 1;
      }
      return 0;
    });

    _.each(datos, function(dato) {
      linea = [];
      linea.push('"' + dato.fecha + '"');
      linea = linea.concat(dato.valores);
      archivo.push(linea.join(","));
    });

    var cadena = archivo.join("\r\n");
    liga.attr(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(BOM + cadena)
    );
  }

  function main() {
    var q = d3.queue();
    var urlValoresJSON = contenedor.attr("data-valores") || false;
    var sToggle = contenedor.attr("data-toggle") || false;
    if (urlValoresJSON !== false) {
      q.defer(d3.json, urlValoresJSON + "?" + getGUID());
      q.awaitAll(function(error, arreglo) {
        var qsec = d3.queue();
        estados = arreglo[0];

        _.each(estados, function(es) {
          es.seleccionado = false;
          _.each(es.candidatos, function(c) {
            if (c.gid === "") {
              c.gid = getGUID();
            }
          });
          qsec.defer(d3.json, es.url + "?" + getGUID());
        });
        qsec.awaitAll(function(error, arreglo) {
          var arregloObj = [];
          _.each(estados, function(es, i) {
            var temas = arreglo[i].result.aggregated.topics;
            var resultados = arreglo[i].result.aggregated.result;
            es.obj = {};
            es.candidatos.sort(function(a, b) {
              if (a.nombrecorto < b.nombrecorto) {
                return -1;
              }
              if (a.nombrecorto > b.nombrecorto) {
                return 1;
              }
              return 0;
            });
            _.each(es.candidatos, function(candidato) {
              candidato.seleccionado = true;
              candidato.puntos = [];
              var j = _.findIndex(temas, { id: candidato.gid });
              if (j >= 0) {
                candidato.puntos = _.map(resultados, function(r) {
                  return {
                    fecha: r.time,
                    fechatextual: r.time,
                    valor: +r.value[j],
                    celda: r.value[j]
                  };
                });
              } else {
                candidato.puntos = _.map(resultados, function(r) {
                  return {
                    fecha: r.time,
                    fechatextual: r.time,
                    valor: 0,
                    celda: 0
                  };
                });
              }
            });

            _.each(es.candidatos, function(candidato) {
              _.each(candidato.puntos, function(punto) {
                if (!es.obj.hasOwnProperty(punto.fechatextual)) {
                  es.obj[punto.fechatextual] = {
                    fecha: punto.fechatextual,
                    candidatos: []
                  };
                }
                es.obj[punto.fechatextual].candidatos.push({
                  nombre: candidato.nombre,
                  nombrecorto: candidato.nombrecorto,
                  color: candidato.color,
                  valor: punto.celda,
                  id: candidato.id
                });
              });
            });

            es.valores = [];
            var arregloInt = _.values(es.obj);
            _.each(arregloInt, function(obj) {
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
                es.valores.push({
                  fecha: fecha,
                  fechatextual: fechatextual,
                  y: y,
                  candidatos: cands,
                  candidato: _.find(obj.candidatos, { id: candidato.id })
                });
              });
            });
          });
          estados[0].seleccionado = true;
          candidatos = estados[0].candidatos;
          valores = estados[0].valores;
          if (sToggle !== false) {
            sToggle = $("#" + sToggle);
            sToggle.on("change", cambiaEstado);
            generaToggle(sToggle);
          }
          var f = d3.queue();
          _.each(estados, function(es) {
            _.each(es.candidatos, function(candidato) {
              f.defer(convertImgToBase64URL, candidato);
            });
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

  function cambiaEstado(ev) {
    var estado = $(ev.target).val();
    _.each(estados, function(e) {
      e.seleccionado = e.estado === estado ? true : false;
      if (e.seleccionado === true) {
        candidatos = e.candidatos;
        valores = e.valores;
        var fechas = _.map(
          _.flatten(_.map(_.flatten(candidatos), "puntos")),
          "fecha"
        );
        escalaX.domain(d3.extent(fechas));
      }
    });
    generaLeyenda();
    generaLineas();
    generaTooltips();
    iniciar();
  }

  function generaToggle(el) {
    var arreglo = [];
    _.each(estados, function(e) {
      arreglo.push({ etiqueta: e.nombreestado, valor: e.estado });
    });
    _.each(arreglo, function(o) {
      el.append($("<option>", { value: o.valor, text: o.etiqueta }));
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

  function descargaVisualizacion(elemento) {
    var el = $(elemento).closest("div.visualizacion");
    var padre = d3
      .select(el[0])
      .node()
      .cloneNode(true);
    padre = d3.select(padre);
    var svg = padre.select("svg");
    var nombreSVG = "trendlecciones.svg";
    var nombrePNG = "trendlecciones-linea-de-tiempo-selector.png";
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

var NubeDePalabras = function($, el, flagIniciar) {
  flagIniciar = flagIniciar || false;
  var flagEsp =
    window.location.pathname.split("/").indexOf("eng") >= 0 ? false : true;

  var margen = { superior: 20, derecho: 20, inferior: 20, izquierdo: 20 };
  var medidas = {
    ancho: 800 - (margen.derecho + margen.izquierdo),
    alto: 800 - (margen.superior + margen.inferior)
  };

  var retratos = { ancho: 150, alto: 150 };
  var paddingRetratos = 40;

  var retratosGrandes = { ancho: 105, alto: 105 };

  var marcos = { ancho: 164 };
  var paddingMarcos = 24;

  var candidatos = [];

  var candidato = false;

  var palabras = [];

  var estiloBoton = {
    "font-family": "'Roboto', sans-serif",
    "font-size": "18px",
    "font-style": "normal",
    "text-anchor": "middle",
    "dominant-baseline": "central",
    "text-transform": "uppercase",
    "font-kerning": "normal",
    fill: "#ffffff",
    "pointer-events": "none"
  };

  var tamanios = {
    0: 23,
    1: 23,
    2: 21,
    3: 21,
    4: 19,
    5: 19,
    6: 17,
    7: 17,
    8: 15,
    9: 15
  };

  var pesos = {
    0: 900,
    1: 900,
    2: 700,
    3: 700,
    4: 500,
    5: 500,
    6: 400,
    7: 400,
    8: 300,
    9: 300
  };

  var negros = {
    0: "#000000",
    1: "#000000",
    2: "#414042",
    3: "#414042",
    4: "#58595b",
    5: "#58595b",
    6: "#6d6e71",
    7: "#6d6e71",
    8: "#808285",
    9: "#808285"
  };

  var candidatoEnBlanco = { id: "", nombre: "", color: "#000000" };
  var contenedor = null;
  var svg = null;
  var gFondo = null;

  var gFondoNube = null;
  var gPalabras = null;

  var gFondoListas = null;
  var gMarcos = null;
  var gListas = null;

  var gBoton = null;

  var idSombra = getGUID();
  var flagBoton = false;
  var medidasBoton = { ancho: 171, alto: 68 };

  var escalaOpacidad = d3.scale.linear().range([0, 100]);
  var escalaTamanio = d3.scale.linear().range([10, 24]);
  var force = d3.layout
    .force()
    .size([medidas.ancho, medidas.alto / 3])
    .linkDistance(100)
    .linkStrength(1);

  var arrastre = force
    .drag()
    .on("dragstart", dragstart)
    .on("dragend", dragend)
    .on("drag", drag);

  var nodos = [];
  var enlaces = [];

  function dragstart(n) {
    if (n.principal === true) {
      if (n.principal === true && n.candidato.id !== candidato.id) {
        gPalabras
          .selectAll("text")
          .filter(function(d) {
            return d.principal === false;
          })
          .transition()
          .duration(1000)
          .style("fill", function(d) {
            return negros[d.orden];
          })
          .attr("opacity", 1)
          .style("font-size", function(d, i) {
            return tamanios[d.orden] + "px";
          });

        enlaces = [];
        force
          .links(enlaces)
          .charge(-30)
          .start();
      }
      setCandidatoSeleccionado(n.candidato.id);
      gPalabras
        .selectAll("g.etiqueta")
        .filter(function(d) {
          return d.candidato.id !== n.candidato.id && d.principal === true;
        })
        .transition()
        .duration(1000)
        .attr("transform", function(d) {
          return (
            "translate(" +
            d.candidato.coords.x +
            "," +
            d.candidato.coords.y +
            ")"
          );
        })
        .each("end", function(d) {
          d.x = d.candidato.coords.x;
          d.px = d.candidato.coords.x;
          d.y = d.candidato.coords.y;
          d.py = d.candidato.coords.y;
        });
    }
  }

  function dragend(n) {
    if (n.principal === true) {
      if (n.force === false) {
        var nt =
          gPalabras.selectAll("g.etiqueta").filter(function(d) {
            return d.principal === true && d.candidato.seleccionado === true;
          }) || false;
        if (nt !== false) {
          nt.transition()
            .duration(1000)
            .attr("transform", function(d) {
              return (
                "translate(" +
                d.candidato.coords.x +
                "," +
                d.candidato.coords.y +
                ")"
              );
            })
            .each("end", function(d) {
              d.candidato.seleccionado = false;
              d.x = d.candidato.coords.x;
              d.px = d.candidato.coords.x;
              d.y = d.candidato.coords.y;
              d.py = d.candidato.coords.y;
            });
        }
      }
    }
  }

  function drag(n) {
    if (n.principal === true && n.force === false && n.y >= -100) {
      n.force = true;
      var nodosSecundarios = _.filter(nodos, function(ns) {
        return ns.candidato.id === n.candidato.id && ns.principal === false;
      });
      _.each(nodosSecundarios, function(ns) {
        enlaces.push({ source: n, target: ns });
      });
      gPalabras
        .selectAll("text")
        .filter(function(d) {
          return d.principal === false;
        })
        .transition()
        .duration(1000)
        .style("fill", function(d) {
          if (d.candidato.id === n.id) {
            return d.candidato.color;
          } else {
            return negros[d.orden];
          }
        })
        .attr("opacity", function(d) {
          if (d.candidato.id === n.id) {
            return 1;
          } else {
            return 0;
          }
        })
        .style("font-size", function(d, i) {
          if (d.candidato.id === n.id) {
            return tamanios[d.orden] + 5 + "px";
          } else {
            return tamanios[d.orden] + "px";
          }
        });
      force
        .links(enlaces)
        .charge(function(n) {
          var charge = -500;
          if (n.principal === 0) charge = 10 * charge;
          return charge;
        })
        .start();
    }
    if (n.principal === true && n.force === true && n.y < -100) {
      gPalabras
        .selectAll("text")
        .transition()
        .duration(1000)
        .style("fill", function(d) {
          return negros[d.orden];
        })
        .attr("opacity", 1);
      n.force = false;
      enlaces = [];
      force
        .links(enlaces)
        .charge(-30)
        .start();
    }
  }

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

        svg
          .append("rect")
          .attr("fill", "#ffffff")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", medidas.ancho + margen.izquierdo + margen.derecho)
          .attr("height", medidas.alto + margen.superior + margen.inferior);

        var testSVG = svg;

        svg = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + margen.izquierdo + "," + margen.derecho + ")"
          );

        svg
          .append("rect")
          .attr("width", medidas.ancho)
          .attr("height", medidas.alto)
          .attr("fill", "#ffffff");

        gFondo = svg
          .append("g")
          .attr("transform", "translate(0," + medidas.alto / 2 + ")");
        gFondo
          .append("rect")
          .attr("height", medidas.alto / 2)
          .attr("width", medidas.ancho)
          .attr("fill", "#ffffff");

        gFondoNube = svg
          .append("g")
          .attr("opacity", 1)
          .attr("class", "simultaneo")
          .datum({ tipo: "nube" });

        gPalabras = gFondoNube
          .append("g")
          .attr("transform", "translate(0," + medidas.alto / 2 + ")");

        gFondoListas = svg
          .append("g")
          .attr("opacity", 0)
          .attr("class", "ignorar simultaneo")
          .datum({ tipo: "lista" });

        gFondoListas
          .append("rect")
          .attr("fill", "#ffffff")
          .attr("x", -margen.derecho)
          .attr("y", -margen.superior)
          .attr("width", medidas.ancho + margen.izquierdo + margen.derecho)
          .attr("height", medidas.alto + margen.superior + margen.inferior);

        gFondoListas
          .append("rect")
          .attr("fill", "#ffffff")
          .attr("width", medidas.ancho)
          .attr("height", medidas.alto)
          .style("filter", "url(#" + idSombra + ")");

        gMarcos = gFondoListas.append("g");

        gListas = gFondoListas.append("g");

        gBoton = svg
          .append("g")
          .attr(
            "transform",
            "translate(" +
              (medidas.ancho - medidasBoton.ancho) / 2 +
              "," +
              (medidas.alto - medidasBoton.alto) +
              ")"
          );

        var offsetMarco = 0;
        var gTestSVG = testSVG.append("g");
        gTestSVG
          .append("rect")
          .attr("x", 0)
          .attr("y", -20)
          .attr("width", medidas.ancho + margen.izquierdo + margen.derecho)
          .attr("height", margen.superior - offsetMarco + 20)
          .attr("fill", "#ffffff");

        gTestSVG
          .append("rect")
          .attr("x", 0)
          .attr("y", medidas.alto + margen.inferior + offsetMarco)
          .attr("width", medidas.ancho + margen.izquierdo + margen.derecho)
          .attr("height", margen.inferior - offsetMarco + 20)
          .attr("fill", "#ffffff");

        gTestSVG
          .append("rect")
          .attr("x", -20)
          .attr("y", 0)
          .attr("width", margen.izquierdo - offsetMarco + 20)
          .attr("height", medidas.alto + margen.superior + margen.inferior)
          .attr("fill", "#ffffff");

        gTestSVG
          .append("rect")
          .attr("x", medidas.ancho + margen.derecho + offsetMarco)
          .attr("y", 0)
          .attr("width", margen.derecho - offsetMarco + 20)
          .attr("height", medidas.alto + margen.superior + margen.inferior)
          .attr("fill", "#ffffff");

        var topes = d3.extent(_.map(palabras, "n"));
        escalaOpacidad.domain(topes);
        escalaTamanio.domain(topes);

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
      q.defer(d3.json, urlCandidatos + "?" + getGUID());
      q.defer(d3.json, urlValoresJSON + "?" + getGUID());
      q.awaitAll(function(error, arreglo) {
        candidatos = arreglo[0];
        var pals = arreglo[1];
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
          var anchoRetratos =
            candidatos.length * retratos.ancho +
            (candidatos.length - 1) * paddingRetratos;
          var x = (medidas.ancho - anchoRetratos + retratos.ancho) / 2;

          _.each(candidatos, function(c) {
            c.coords.x = x;
            c.coords.y = -220;
            x += retratos.ancho + paddingRetratos;
            var color = c.colorpalabras || c.color;
            c.colorOriginal = c.color;
            c.color = color;
          });
          _.each(pals, function(p) {
            var candidato =
              _.find(candidatos, function(c) {
                return c.id === p.id;
              }) || false;
            if (candidato !== false) {
              _.each(p.palabras, function(pal) {
                var n = _.random(1, 100);
                palabras.push({
                  id: getGUID(),
                  palabra: pal,
                  n: n,
                  candidato: candidato
                });
                palabras.push();
              });
            }
          });
          resetCandidatos();
          procesaDatos();
          generaBoton();
          generaPalabras();
          generaMarcos();
          contenedor.classed("espera", false);
          if (flagIniciar === true) {
            iniciar();
          }
        });
      });
    }
  }

  function iniciar() {
    var num = candidatos.length;
    var i = _.random(0, num - 1);
    var pal = gPalabras.selectAll("g.etiqueta").filter(function(d) {
      return d.id === candidatos[i].id;
    });
    var n = pal.datum();
    var xIni = n.x;
    var yIni = n.y;
    var xPrevio = xIni;
    var yPrevio = yIni;
    setCandidatoSeleccionado(n.id);
    dragstart(n);
    pal
      .transition()
      .duration(1000)
      .attrTween("transform", function(d) {
        var xF = medidas.ancho / 2;
        var yF = medidas.alto / 8;
        var i = d3.interpolateString(
          "translate(" + xIni + "," + yIni + ")",
          "translate(" + xF + "," + yF + ")"
        );
        var j = d3.interpolateNumber(xIni, xF);
        var k = d3.interpolateNumber(yIni, yF);
        return function(t) {
          d.px = d.x;
          d.py = d.y;
          d.x = j(t);
          d.y = k(t);
          drag(n);
          return i(t);
        };
      })
      .each("end", function(d) {
        d.x = medidas.ancho / 2;
        d.y = medidas.alto / 8;
        d.px = medidas.ancho / 2;
        d.py = medidas.alto / 8;
        d.weight = 10;
        d.fixed = 1;
        d.force = true;
        dragend(d);
      });
  }

  function clickCandidato(n) {
    var pal = d3.select(this);

    var xIni = n.x;
    var yIni = n.y;
    var xPrevio = xIni;
    var yPrevio = yIni;

    setCandidatoSeleccionado(n.id);
    dragstart(n);
    pal
      .transition()
      .duration(1000)
      .attrTween("transform", function(d) {
        var xF = medidas.ancho / 2;
        var yF = medidas.alto / 8;
        var i = d3.interpolateString(
          "translate(" + xIni + "," + yIni + ")",
          "translate(" + xF + "," + yF + ")"
        );
        var j = d3.interpolateNumber(xIni, xF);
        var k = d3.interpolateNumber(yIni, yF);
        return function(t) {
          d.px = d.x;
          d.py = d.y;
          d.x = j(t);
          d.y = k(t);
          drag(n);
          return i(t);
        };
      })
      .each("end", function(d) {
        d.x = medidas.ancho / 2;
        d.y = medidas.alto / 8;
        d.px = medidas.ancho / 2;
        d.py = medidas.alto / 8;
        d.weight = 10;
        d.fixed = 1;
        d.force = true;
        dragend(d);
      });
  }

  function resetCandidatos() {
    _.each(candidatos, function(c) {
      c.seleccionado = false;
    });
  }

  function procesaDatos() {}

  function getGUID() {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substr(2, 5)
    ).toUpperCase();
  }

  function colisiona(node) {
    return function(quad, x1, y1, x2, y2) {
      var updated = false;
      if (
        quad.point &&
        quad.point !== node &&
        node.principal !== true &&
        quad.point.principal !== true
      ) {
        var x = node.x - quad.point.x;
        var y = node.y - quad.point.y;
        var xSpacing = (quad.point.caja.width + node.caja.width) / 2;
        var ySpacing = (quad.point.caja.height + node.caja.height) / 2;
        var absX = Math.abs(x);
        var absY = Math.abs(y);
        var l = null;
        var lx = null;
        var ly = null;
        if (absX < xSpacing && absY < ySpacing) {
          l = Math.sqrt(x * x + y * y);
          lx = (absX - xSpacing) / l;
          ly = (absY - ySpacing) / l;
          if (Math.abs(lx) > Math.abs(ly)) {
            lx = 0;
          } else {
            ly = 0;
          }
          if (node.principal !== true) {
            node.x -= x *= lx;
            node.y -= y *= ly;
          }
          if (quad.point.principal !== true) {
            quad.point.x += x;
            quad.point.y += y;
          }

          updated = true;
        }
      }
      return updated;
    };
  }

  function generaPalabras() {
    var grupos = gPalabras
      .selectAll("g")
      .data(candidatos)
      .enter()
      .append("g")
      .attr("class", "principal")
      .attr("fill", function(d) {
        return d.color;
      });

    _.each(candidatos, function(c) {
      var nodoP = {
        id: c.id,
        palabra: c.nombre,
        n: 200,
        candidato: c,
        principal: true,
        fixed: true,
        x: c.coords.x,
        y: c.coords.y,
        force: false
      };
      nodos.push(nodoP);
      var ps = _.filter(palabras, function(p) {
        return p.candidato.id === c.id;
      });
      _.each(ps, function(p) {
        p.principal = false;
        nodos.push(p);
      });
    });

    var claves = {};
    for (var i = 0; i < palabras.length; i++) {
      for (var j = 0; j < palabras.length; j++) {
        if (palabras[i].id !== palabras[j].id) {
          var clave = [];
          clave.push(palabras[i].id);
          clave.push(palabras[j].id);
          clave.sort();
          clave = clave.join("-");
          var flag = claves[clave] || false;
          if (flag === false) {
            claves[clave] = true;
          }
        }
      }
    }

    grupos.each(function(c) {
      var grupo = d3.select(this);
      var ns = _.filter(nodos, function(n) {
        return n.candidato.id === c.id;
      });

      var subgrupos = grupo
        .selectAll("g.etiqueta")
        .data(ns, function(d) {
          return d.id;
        })
        .enter()
        .append("g")
        .attr("class", "etiqueta")
        .on("touchstart", function(d) {
          d3.event.preventDefault();
        })
        .on("touchmove", function(d) {
          d3.event.preventDefault();
        })
        .on("touchend", function(d) {
          d3.event.preventDefault();
        })
        .on("click", function(d) {
          if (!d3.event.defaultPrevented) {
          }
        })
        .call(arrastre);

      var principales = subgrupos.filter(function(d) {
        return d.principal === true;
      });

      var secundarios = subgrupos.filter(function(d) {
        return d.principal !== true;
      });

      principales
        .append("svg:image")
        .attr("class", "arrastrar")
        .attr("fill", function(d) {
          return d.candidato.color;
        })
        .attr("width", retratos.ancho)
        .attr("height", retratos.alto)
        .each(function(d) {
          d.caja = this.getBBox();
          d.caja.width = d.caja.width + 10;
          d.caja.height = d.caja.height + 10;
        })
        .attr("xlink:href", function(d) {
          return d.candidato.imgb64;
        })
        .attr(
          "transform",
          "translate(" + -retratos.ancho / 2 + "," + -retratos.alto / 2 + ")"
        );

      secundarios.append("rect").attr("fill", "transparent");

      secundarios
        .append("text")
        .text(function(d) {
          return d.palabra;
        })
        .style("font-family", "'Roboto', sans-serif")
        .style("stroke-width", "0")
        .style("fill", function(d) {
          return negros[d.orden];
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", function(d, i) {
          return tamanios[i] + "px";
        })
        .style("font-weight", function(d, i) {
          return pesos[i];
        })
        .each(function(d, i) {
          d.orden = i;
          d.caja = this.getBBox();
        });

      secundarios
        .selectAll("rect")
        .attr("width", function(d) {
          return d.caja.width;
        })
        .attr("height", function(d) {
          return d.caja.height;
        })
        .attr("transform", function(d) {
          return (
            "translate(" + -d.caja.width / 2 + "," + -d.caja.height / 2 + ")"
          );
        });
    });

    var node = gPalabras.selectAll("g.etiqueta");

    force.on("tick", function(e) {
      var ns =
        _.find(nodos, function(n) {
          return n.principal === true && n.candidato.seleccionado === true;
        }) || false;
      if (ns !== false) {
        ns.fixed = true;
        var k = 2 * e.alpha;
        _.each(nodos, function(n) {
          if (n.candidato.id === ns.candidato.id) {
            //            n.x += ns.x > n.x ? k : -k;
            //n.y += ns.y > n.y ? k : -k;
          } else {
            n.x += ns.x < n.x ? 2 * k : 2 * -k;
            n.y += ns.y < n.y ? 2 * k : 2 * -k;
          }
        });
      }

      var q = d3.geom.quadtree(nodos);
      var i = 0;
      while (++i < nodos.length) {
        q.visit(colisiona(nodos[i]));
      }

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });

    force.nodes(nodos).start();
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
      }
    };
    gMexico.selectAll("path").each(function(d, i) {
      var contenido = "<p>" + d.properties.datos.estado + "</p>";
      opciones.content = $(contenido);
      opciones.theme = "tooltipster-borderless";
      $(this).tooltipster(opciones);
    });
  }

  function setCandidatoSeleccionado(cadena) {
    var c = null;
    resetCandidatos();
    c = _.find(candidatos, { id: cadena });
    c = c || false;
    if (c !== false) {
      c.seleccionado = true;
      candidato = c;
    } else {
      c = candidatoEnBlanco;
    }
    return c;
  }

  function generaBoton() {
    gBoton
      .append("rect")
      .attr("width", medidasBoton.ancho)
      .attr("height", medidasBoton.alto)
      .attr("fill", "#000000")
      .attr("rx", 10)
      .attr("ry", 10)
      .on("click", toggleBoton);

    var msgEsp = candidatos.length == 1 ? "Ordenar" : "Ver todos";
    var msgEng = candidatos.length == 1 ? "Sort" : "Show all";

    gBoton
      .append("text")
      .text(flagEsp ? msgEsp : msgEng)
      .attr("x", medidasBoton.ancho / 2)
      .attr("y", medidasBoton.alto / 2)
      .style(estiloBoton);
  }

  function toggleBoton() {
    flagBoton = !flagBoton;
    if (flagBoton === true) {
      mostrarLista();
    } else {
      mostrarNube();
    }
  }

  function mostrarNube() {
    var msgEsp = candidatos.length == 1 ? "Ordenar" : "Ver todos";
    var msgEng = candidatos.length == 1 ? "Sort" : "Show all";
    quitaElementosLista();
    gBoton.select("text").text(flagEsp ? msgEsp : msgEng);
  }

  function quitaElementosLista() {
    gListas
      .selectAll(".lista")
      .transition()
      .duration(1000)
      .attr("width", retratos.ancho)
      .attr("height", retratos.alto)
      .attr("transform", function(d) {
        if (d.principal === true) {
          return (
            "translate(" + -retratos.ancho / 2 + "," + -retratos.alto / 2 + ")"
          );
        } else {
          return "translate(" + d.x + "," + (d.y + medidas.alto / 2) + ")";
        }
      })
      .attr("x", function(d) {
        return d.x;
      })
      .attr("y", function(d) {
        return d.y + medidas.alto / 2;
      })
      .each(function(d) {
        var t = d3
          .select(this)
          .select("text")
          .transition("testo")
          .duration(1000)
          .style("fill", function(dt) {
            if (dt.candidato.seleccionado === true) {
              return dt.candidato.color;
            } else {
              return negros[d.orden];
            }
          });
      })
      .call(endall, function() {
        gFondoNube.attr("class", "simultaneo").attr("opacity", 1);
        gFondoListas.attr("class", "ignorar simultaneo").attr("opacity", 0);
        gListas.selectAll(".lista").remove();
        force.start();
      });
  }

  function mostrarLista() {
    force.stop();
    gFondoListas.attr("class", "simultaneo").attr("opacity", 1);
    generaElementosLista();
    gFondoNube.attr("class", "ignorar simultaneo").attr("opacity", 0);
    gBoton.select("text").text(flagEsp ? "Ver nube" : "Show cloud");
  }

  function generaMarcos() {
    var ancho =
      candidatos.length * marcos.ancho +
      (candidatos.length - 1) * paddingMarcos;
    var x = (medidas.ancho - ancho) / 2;
    var grupos = gMarcos
      .selectAll("g.marco")
      .data(candidatos)
      .enter()
      .append("g")
      .attr("class", "marco")
      .attr("fill", function(d) {
        return d.colorOriginal;
      });

    grupos
      .append("rect")
      .attr("x", function(d, i) {
        d.marco = {};
        d.marco.x = x;
        d.marco.y = 20;
        x += marcos.ancho + paddingMarcos;
        return d.marco.x;
      })
      .attr("y", function(d) {
        return d.marco.y;
      })
      .attr("width", marcos.ancho)
      .attr("height", 500)
      .attr("fill", "#ffffff")
      .style("filter", "url(#" + idSombra + ")");
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

  function generaElementosLista() {
    var palabras = [];
    var candidatos = [];
    gPalabras.selectAll("g.etiqueta").each(function(d) {
      if (d.principal === true) {
        candidatos.push(d);
      } else {
        palabras.push(d);
      }
    });

    var ancho =
      candidatos.length * marcos.ancho +
      (candidatos.length - 1) * paddingMarcos;
    var x = (medidas.ancho - ancho) / 2;

    gListas
      .selectAll("image")
      .data(candidatos)
      .enter()
      .append("svg:image")
      .attr("class", "lista")
      .attr("width", retratos.ancho)
      .attr("height", retratos.alto)
      .attr("xlink:href", function(d) {
        return d.candidato.imgb64;
      })
      .attr(
        "transform",
        "translate(" + -retratos.ancho / 2 + "," + -retratos.alto / 2 + ")"
      )
      .attr("x", function(d) {
        return d.x;
      })
      .attr("y", function(d) {
        return d.y + medidas.alto / 2;
      });

    var grupos = gListas
      .selectAll("g.lista")
      .data(palabras)
      .enter()
      .append("g")
      .attr("class", "lista palabra")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + (d.y + medidas.alto / 2) + ")";
      });

    grupos.append("rect").attr("class", "fondo");

    grupos
      .append("text")
      .attr("class", "palabra")
      .text(function(d) {
        return d.palabra;
      })
      .style("font-family", "'Roboto', sans-serif")
      .style("stroke-width", "0")
      .style("fill", function(d) {
        if (d.candidato.seleccionado === true) {
          return d.candidato.color;
        } else {
          return negros[d.orden];
        }
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", function(d) {
        return tamanios[d.orden] + "px";
      })
      .style("font-weight", function(d) {
        return pesos[d.orden];
      })
      .call(wrap, marcos.ancho - 30);

    var altura = 0;
    _.each(palabras, function(d) {});

    grupos.selectAll("text.palabra").each(function(d) {
      if (d.orden === 0) {
        altura = 0;
      }
      d.copia = this.getBBox();
      d.lista = {};
      d.lista.y = altura;
      altura += d.copia.height + 6;
    });

    var obj = {};
    _.each(palabras, function(p) {
      if (!obj.hasOwnProperty(p.orden)) {
        obj[p.orden] = 0;
      }
      if (obj[p.orden] < p.copia.height) {
        obj[p.orden] = p.copia.height;
      }
    });

    altura = 0;
    _.each(palabras, function(p, i) {
      if (p.orden === 0) {
        altura = 0;
      }
      p.lista.yc = altura;
      altura += obj[p.orden] + 5;
    });

    gMarcos
      .selectAll("rect")
      .attr("height", retratosGrandes.alto + 30 + altura);

    gListas
      .selectAll(".lista")
      .transition()
      .duration(1000)
      .attr("width", retratosGrandes.ancho)
      .attr("height", retratosGrandes.alto)
      .attr("transform", function(d, i) {
        if (d.principal === true) {
          return (
            "translate(" +
            -retratosGrandes.ancho / 2 +
            "," +
            -retratosGrandes.alto / 2 +
            ")"
          );
        } else {
          return (
            "translate(" +
            (d.candidato.marco.x +
              (marcos.ancho - retratosGrandes.ancho) / 2 +
              retratosGrandes.ancho / 2) +
            "," +
            (retratosGrandes.alto + 60 + d.lista.yc) +
            ")"
          );
        }
      })
      .attr("x", function(d) {
        if (d.principal === true) {
          return (
            d.candidato.marco.x +
            (marcos.ancho - retratosGrandes.ancho) / 2 +
            retratosGrandes.ancho / 2
          );
        } else {
          return 0;
        }
      })
      .attr("y", function(d) {
        if (d.principal === true) {
          return d.candidato.marco.y + 10 + retratosGrandes.alto / 2;
        } else {
          return 0;
        }
      })
      .each(function(d) {
        var t = d3
          .select(this)
          .select("text")
          .transition("testo")
          .duration(1000)
          .style("fill", function(dt) {
            return dt.candidato.color;
          });
      });
  }

  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
        words = text
          .text()
          .split(/\s+/)
          .reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 0.9,
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy") || 0),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("dominant-baseline", "middle");
      while ((word = words.pop())) {
        ++lineNumber;
        lineNumber = lineNumber > 1 ? 1 : lineNumber;
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", lineNumber * lineHeight + dy + "em")
            .attr("dominant-baseline", "middle")
            .text(word);
        }
      }
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
    var nombrePNG = "trendlecciones-nube-de-palabras.png";
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

//# sourceMappingURL=aplicacion.js.map
