/*
Copyright (c) 2018 Gilberto Leon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
