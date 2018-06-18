/*
Copyright (c) 2018 Gilberto Leon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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