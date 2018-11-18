class Path {
    /**
     * Entidad que está siguiendo esta ruta
     */
    private entity :Entity;
    /**
     * Punto de destino, en píxeles, en el que concluye la ruta
     */
    private destination :Phaser.Math.Vector2;
    /**
     * Lista de puntos, en píxeles, que componen la ruta
     */
    private points :Vector2[];

    /**
     * Ruta inteligente trazada desde la posición actual de una entidad hasta un punto dado
     * en la sala, esquivando todos los tiles sólidos, implementada con el algoritmo A*
     * @param entity La entidad que va a seguir esta ruta
     * @param destination El punto de destino al que debe dirigirse la entidad
     */
    constructor(entity :Entity, destination :Vector2) {
        this.entity = entity;
        this.destination = new Phaser.Math.Vector2(destination);
        this.points = [];

        // Al crear a ruta, procedemos a construirla inmediatamente
        this.generatePoints();
    }

    /**
     * Devuelve el siguiente punto en la ruta, o el último si no quedan más
     */
    public next() {
        // Si queda más de un punto, sacamos el que estuviera al frente
        if(this.points.length > 1) {
            this.points.shift();
        }

        // Y devolvemos el siguiente, que estará ahora al frente
        return this.points[0];
    }

    /**
     * Indica si la ruta ha sido recorrida al completo, es decir, si mediante next() ya se
     * ha obtenido el último punto de la ruta, o si la ruta no tiene puntos en primer lugar
     * porque es imposible.
     */
    public isDone() {
        return this.points.length <= 1;
    }

    /**
     * Indica si la ruta es imposible de recorrer. Esto puede pasar si el punto de destino
     * se encuentra dentro de un tile sólido o si está en una estancia a la que es imposible
     * acceder desde la posición en la que se encuentra la entidad.
     */
    public isImpossible() {
        return this.points.length == 0;
    }

    /**
     * Dibuja una línea verde que representa la ruta, para hacerla visible. Esta función es sólo
     * para depuración y no se va a usar en la versión final.
     * @param graphics El objeto de gráficos de Phaser con el que se va a dibujar la ruta
     */
    public draw(graphics :Phaser.GameObjects.Graphics) {
        // Si la entidad que tiene esta ruta está muerta no hay nada que dibujar
        if(this.entity.dead) {
            return;
        }

        // Ponemos la línea verde y con 3px de grosor
        graphics.lineStyle(3, 0x00FF00);

        // Si no hay nada que dibujar
        if(this.points.length == 0) {
            // Aquí no pintamos nada
            return;
        }

        // Comenzamos el trazado de la ruta
        graphics.beginPath();
        // A partir de aquí, a todas las coordenadas se les resta la posición del propio objeto
        // de gráficos. Esto es porque queremos introducir las coordenadas de cada punto respecto
        // al origen del mundo, pero el objeto de gráficos no necesariamente tiene que estar
        // ahí. Por esa razón restamos su posición actual

        // Empezamos en la posición de la entidad
        graphics.moveTo(
            this.entity.sprite.body.center.x - graphics.x,
            this.entity.sprite.body.center.y - graphics.y);

        // Y ahora dibujamos una línea a cada punto de la ruta
        for(let point of this.points) {
            graphics.lineTo(point.x - graphics.x, point.y - graphics.y);
        }

        // Ya podemos emitir el trazado
        graphics.strokePath();
    }

    /**
     * Genera los puntos que componen esta ruta siguiendo el algoritmo A*
     */
    private generatePoints() {
        // Empezamos con un acceso más conveniente a la sala en la que se encuentra la entidad
        var room = this.entity.scene.room;
        // Obtenemos el tile en el que empezamos y el tile al que vamos
        var destTilePosition = pixelToTilePosition(this.destination);
        var startTilePosition = pixelToTilePosition({
            x: this.entity.sprite.body.center.x,
            y: this.entity.sprite.body.center.y});
        var destTile = room.getColliderTileAt(destTilePosition);
        var startTile = room.getColliderTileAt(startTilePosition);

        // Puede ser que el tile al que vamos sea sólido, en cuyo caso la ruta es imposible
        if(destTile.properties.Solid) {
            console.warn("Atención, Ruta Imposible: "
                + "%s ha intentado generar una ruta hacia el tile sólido situado en (%d, %d)",
                this.entity.name, destTilePosition.x, destTilePosition.y);
            // ¿Para qué perder el tiempo intentando crear la ruta si ya sabemos que es imposible?
            return;
        }

        // Todos los posibles tiles que vayamos a recorrer se guardan en este mapa, que le
        // asigna a cada tile un valor y referencias a sus tiles colindantes
        var astarmap = new Map<Phaser.Tilemaps.Tile, {
            /**
             * Distancia en tiles que se ha recorrido desde el tile inicial hasta este
             */
            value :number,
            /**
             * Vecinos en vertical y horizontal de este tile que no son sólidos
             */
            neighbours :Phaser.Tilemaps.Tile[]
        }>();

        // También tenemos una cola donde añadiremos los tiles que hay que procesar. La
        // inicializamos con el tile inicial, que es por el que vamos a empezar.
        var tileQueue = [startTile];

        // También es buena idea añadir el tile inicial al mapa para que se pueda empezar
        // el procesamiento sin problemas.
        astarmap.set(startTile, {value: 0, neighbours: []});

        // Estaremos procesando tiles hasta que ya no queden más por procesar
        while(tileQueue.length > 0) {
            // Obtenemos los vecinos y los datos en el mapa del tile que estamos procesando
            // actualmente (el que está al frente de la cola)
            let neighbours = Path.getNeighbourTiles(room, tileQueue[0]);
            let currentTileData = astarmap.get(tileQueue[0]);

            for(let neighbour of neighbours) {
                // Si el vecino no es sólido ni está todavía en el mapa
                if(!astarmap.has(neighbour) && !neighbour.properties.Solid) {
                    // Hay que añadirlo al mapa. Además, la relación de vecindad
                    // es recíproca y hay que indicarlo también.
                    astarmap.set(neighbour, {
                        value: currentTileData.value + 1,
                        neighbours: [tileQueue[0]]
                    });
                    // El tile recién añadido al mapa no se ha procesado todavía. Lo
                    // procesaremos más tarde en el bucle.
                    tileQueue.push(neighbour);
                    // El mapa también tiene que tener constancia de los vecinos de este tile.
                    // La diferencia entre los vecinos obtenidos con Path.getNeighbourTiles()
                    // y los que estamos añadiendo ahora es que ahora estamos distinguiendo
                    // los que son sólidos de los que no.
                    currentTileData.neighbours.push(neighbour);
                }
            }
            // ¿El tile que acabamos de procesar es el tile al que teníamos que llegar?
            if(tileQueue[0] == destTile) {
                // Si es así entonces esta etapa de la generación de la ruta ha terminado
                break;
            } else {
                // Si no, sacamos de la cola al tile que acabamos de procesar para que
                // pase el siguiente
                tileQueue.shift();
            }
        }

        // A lo mejor hemos salido del bucle anterior por haber vaciado la cola y no por haber
        // encontrado el tile de destino. Esto se debe a que la estancia donde está la entidad
        // y la estancia donde está el tile de destino están completamente separadas y aisladas
        // por tiles sólidos. En este caso, la ruta también es imposible.
        if(tileQueue[0] != destTile) {
            console.warn("Atención, Ruta Imposible: "
            + "%s ha intentado generar una ruta hacia el tile (%d, %d) pero es inalcanzable "
            + "desde su posición actual", this.entity.name, destTilePosition.x, destTilePosition.y);
            // No podemos hacer nada más
            return;
        }

        // Ahora que ya está el mapa trazado, tenemos que hacer el recorrido inverso: Desde el
        // tile de destino hasta la posición inicial. Lo haremos utilizando los valores que
        // hemos asignado previamente en el mapa. Esta es la etapa que genera los puntos realmente.
        var currentTile = destTile;
        var lastTile = destTile;
        var lastTileAux = destTile;

        // Vamos a estar generando puntos hasta que hayamos vuelto a la posición original,
        // aunque haremos al menos una iteración para que, si no es una ruta imposible,
        // haya al menos un punto en la misma para evitar errores.
        while(currentTile != startTile || this.points.length == 0) {
            // Hay que añadir el punto de este tile. La lista de puntos está en píxeles, así
            // que hay que pasar el tile a píxeles antes de añadirlo. El punto de destino
            // está en píxeles también así que no hay que pasarlo a nada.
            let add :Vector2;
            if(currentTile == destTile) {
                add = this.destination;
            } else {
                add = tileToPixelPosition(currentTile);
            }

            // Metemos el nuevo punto al principio de la lista de puntos
            this.points.unshift(add);

            // Ahora vamos a consultar los datos de este tile para determinar cuál será el siguiente
            let currentTileData = astarmap.get(currentTile);
            for(let neighbour of currentTileData.neighbours) {
                let neighbourData = astarmap.get(neighbour);
                // Si el vecino que estamos mirando existe y su valor es menor que el tile actual,
                // es porque está más cerca del tile inicial que el actual
                if(neighbourData && neighbourData.value < currentTileData.value) {
                    // Y si además es adyacente al tile que miramos en la iteración anterior...
                    if(this.areDiagonallyAdjacent(lastTile, neighbour) && currentTile != destTile) {
                        // ... entonces no necesitamos tener el tile actual en la lista de puntos
                        // (salvo si es el tile de destino, por muy adyacente que sea)
                        this.points.shift();
                        // Pasamos a este vecino para la siguiente iteración
                        currentTile = neighbour;
                        break;
                    } else {
                        // Ponemos a este vecino como posible tile de la siguiente iteración,
                        // pero seguimos mirando por si hay otro vecino que sí es adyacente
                        currentTile = neighbour;
                    }
                }
            }
            // Pero hay que guardar el tile que miramos en la iteración anterior para futuras
            // referencias relacionadas con la adyacencia
            lastTile = lastTileAux;
            lastTileAux = currentTile;
        }
    }

    /**
     * Devuelve los tiles de Phaser en la capa de colisiones que son colindantes,
     * horizontal y verticalmente, al tile indicado
     * @param room La sala a la que pertenece el tile
     * @param tile El tile en cuestión
     */
    private static getNeighbourTiles(room :Room, tile :Phaser.Tilemaps.Tile) {
        var ret :Phaser.Tilemaps.Tile[] = [];

        
        var possibleNeighbours = [
            {x: tile.x, y: tile.y-1},
            {x: tile.x, y: tile.y+1},
            {x: tile.x-1, y: tile.y},
            {x: tile.x+1, y: tile.y}
        ];
        
        // Antes de consultar si hay una colisión en el tile, hay que comprobar que
        // esté dentro de la sala, para evitar problemas con funciones de Phaser
        for(let possibility of possibleNeighbours) {
            if(possibility.x >= 0 && possibility.x < room.size.x / TILE_SIZE
            && possibility.y >= 0 && possibility.y < room.size.y / TILE_SIZE) {
                ret.push(room.getColliderTileAt(possibility));
            }
        }

        return ret;
    }

    /**
     * Indica si dos tiles dados son adyacentes diagonalmente
     * @param tile1 El primer tile a mirar
     * @param tile2 El segundo tile a mirar
     */
    private areDiagonallyAdjacent(tile1 :Vector2, tile2 :Vector2) {
        // Dos tiles son diagonalmente adyacentes si están separados por una distancia de una
        // unidad en ambos ejes. Si la distancia en cualquiera de los ejes fuera 0 ya no sería
        // una adyacencia diagonal, y si la distancia fuera más de 1 ya no sería una adyacencia.
        return Math.abs(tile1.x - tile2.x) == 1 && Math.abs(tile1.y - tile2.y) == 1
    }
}