# Trendlecciones.mx #

Aquí están el código y los datos usados para generar las visualizaciones de [trendlecciones.mx](http://trendlecciones.mx "trendlecciones.mx").

## Instalación ##

Para instalar todas las dependencias, teclea desde la carpeta raíz del proyecto (la carpeta padre de src):

    npm install

Para generar la carpeta de distribución (dist):

    gulp:build

Para actualizar automáticamente los archivos durante el desarrollo:

    gulp:init

## Uso ##

Todas las visualizaciones se adaptan al contenedor en el que se encuentren, y tienen un tamaño natural de 800 x 800 pixeles. En general usan el mismo tipo de estructura para generarse y el tipo de visualización se determina por el atributo data-tipo-visualización.

La estructura y clases ("visualizacion" y "principal") se usaron en el proyecto principal para estandarizar los selectores que disparan la generación de cada visualización pero pueden modificarse si es necesario. 

### Línea de tiempo ###

Si la información de la visualización se obtiene de un archivo JSON:

    <div class="visualizacion">
        <div data-tipo-visualizacion="lineasDeTiempo" class="principal" data-candidatos="json/candidatos-presidencia.json" data-valores="https://trends-cms.appspot.com/api/fetchers/agxzfnRyZW5kcy1jbXNyKwsSCkdyb3VwRXZlbnQYgICAgPyEhgoMCxIHRmV0Y2hlchiAgICg8Y-iCww/view/ww-MX">
        </div>
    </div>

Y si la información de la visualización se obtiene de un archivo CSV:

	<div class="visualizacion">
    	<div data-tipo-visualizacion="lineasDeTiempo" class="principal" data-candidatos="json/candidatos-presidencia.json" data-valores-csv="csv/lineas-noticias-falsas.csv">
        </div>
    </div>

La diferencia está en el uso del atributo data-valores vs data-valores-csv.

### Línea de tiempo con selector de estados ###

	<div class="visualizacion">
		<div data-tipo-visualizacion="lineasDeTiempoSelector" class="principal" data-valores="json/gobernadores/estados.json" data-toggle="toggle-estados">
		</div>
	</div>

La implementación usada en [http://trendlecciones.mx](http://trendlecciones.mx "trendlecciones.mx") no acepta archivos CSV.

### Mapa a barras ###

	<div class="visualizacion">
		<div data-tipo-visualizacion="mapaABarras" class="principal" data-candidatos="json/candidatos-presidencia.json" data-valores-json="json/estados-candidatos-presidencia.json">
		</div>
	</div>

La implementación usada en [http://trendlecciones.mx](http://trendlecciones.mx "trendlecciones.mx") no acepta archivos CSV.

### Mapa a cartograma ###

	<div class="visualizacion">
		<div data-tipo-visualizacion="mapaACartograma" class="principal" data-candidatos="json/candidatos-presidencia.json" data-valores-json="json/cartogramas/candidatos-presidencia.json">
		</div>
	</div>

La implementación ofrecida aquí no acepta archivos CSV.

### Nube de palabas ###

	<div class="visualizacion">
		<div data-tipo-visualizacion="nubeDePalabras" class="principal" data-candidatos="json/candidatos-presidencia.json" data-valores-json="json/palabras-candidatos-presidencia.json">
		</div>
	</div>

La implementación usada en [http://trendlecciones.mx](http://trendlecciones.mx "trendlecciones.mx") no acepta archivos CSV.
