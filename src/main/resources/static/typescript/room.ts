type RoomConfig = {
    /**
     * Nombre o dirección de la imagen que define el aspecto de los tiles
     * (partiendo de assets/tilesets)
     */
    tileset :string,
    /**
     * Nombre o dirección del archivo que contiene el trazado del mapa
     * (partiendo de assets/maps)
     */
    tilemap :string
}

class Room {
    /**
     * Nombre que identifica a esta sala
     */
    public name :string;
    /**
     * Escena asociada con esta sala
     */
    public scene :Phaser.Scene;
    /**
     * Dimensiones en píxeles de esta sala. IMPORTANTE: ES POSIBLE QUE LA MEDIDA DE ESTA VARIABLE PASE DE
     * PÍXELES A TILES EN FUTURAS VERSIONES.
     */
    public size :Phaser.Math.Vector2;
    /**
     * Array de capas que contienen las colisiones de esta sala
     */
    public colliderLayers :Phaser.Tilemaps.DynamicTilemapLayer[];
    /**
     * Objeto de configuración con el que se inicializó la sala
     */
    private config :RoomConfig;
    /**
     * Trazado del mapa cargado desde el archivo especificado en config.tilemap
     */
    private map :Phaser.Tilemaps.Tilemap;
    /**
     * Imagen que define el aspecto de los tiles de esta sala
     */
    private tileset :Phaser.Tilemaps.Tileset;
    /**
     * Capas de la sala según están creadas en Tiled
     */
    private layers :Phaser.Tilemaps.DynamicTilemapLayer[];

    constructor(name :string, config :RoomConfig) {
        this.name = name;
        this.config = config;
        this.colliderLayers = [];
    }

    /**
     * Devuelve el tile de Phaser que se encuentra en la posición indicada en la capa de colisiones
     * de esta sala
     * @param tile La posición del tile que queremos
     */
    public getColliderTileAt(tile :Vector2) {
        for (let l = 0; l < this.colliderLayers.length; l++) {
            if(this.colliderLayers[l].getTileAt(tile.x, tile.y, true).index != -1)
                return this.colliderLayers[l].getTileAt(tile.x, tile.y, true);
        }
        return this.colliderLayers[this.colliderLayers.length - 1].getTileAt(tile.x, tile.y, true);
    }

    public findRandomFreePosition(maxAttempts = 1000) {
        var ret :Vector2 = null;
        for(let i = 0; i < maxAttempts; i++) {
            var x = Math.random() * this.size.x;
            var y = Math.random() * this.size.y;

            if(!this.getColliderTileAt(pixelToTilePosition({x: x, y: y})).properties.Solid) {
                ret = {x: x, y: y};
                break;
            }
        }
        return ret;
    }

    /**
     * Carga los recursos necesarios para esta sala
     */
    preload() {
        // Cargamos el tileset y el mapa
        this.scene.load.tilemapTiledJSON(this.name + "@tilemap", "assets/maps/"+this.config.tilemap);
        this.scene.load.image(this.name + "@tileset", "assets/tilesets/"+this.config.tileset);
    }

    /**
     * Inicializa los recursos cargados con preload()
     */
    create() {
        // Creamos el tileset y el mapa
        this.map = this.scene.make.tilemap({key: this.name + "@tilemap"});
        this.tileset = this.map.addTilesetImage(this.map.tilesets[0].name, this.name + "@tileset");

        // El tamaño de la sala será el tamaño del mapa
        this.size = new Phaser.Math.Vector2(this.map.widthInPixels, this.map.heightInPixels);

        // Variables que almacenan los distintos tipos de capa
        var water :Phaser.Tilemaps.LayerData;
        var floor :Phaser.Tilemaps.LayerData;
        var wall :Phaser.Tilemaps.LayerData;
        var lights :Phaser.Tilemaps.LayerData;

        // Guardamos en un array todas las capas guardadas en el archivo tilemap
        this.layers = [];
        for(let layer of this.map.layers) {
            //this.layers.push(this.map.createDynamicLayer(layer.name, this.tileset, 0, 0));
            switch (layer.name) {
                case "agua":
                    water = layer;
                    break;
                case "suelo":
                    floor = layer;
                    break;
                case "paredes":
                    wall = layer;
                    break;
                case "luz":
                    lights = layer;
                    break;
                default:
                    break;
            }
        }

        // Capa para el suelo
        if(floor){
            this.layers.push(this.map.createDynamicLayer(floor.name, this.tileset, 0, 0));
        }

        // Capa para el agua y otros elementos sólidos que no sobresalen del suelo
        if(water){
            this.layers.push(this.map.createDynamicLayer(water.name, this.tileset, 0, 0));
            this.layers[this.layers.length - 1].setCollisionByProperty({Solid: true});
            this.colliderLayers.push(this.layers[this.layers.length - 1]);
        }

        // Capa para las paredes y otros elementos sólidos que sí sobresalen del suelo
        if(wall){
            this.layers.push(this.map.createDynamicLayer(wall.name, this.tileset, 0, 0));
            var wallLayer = this.layers[this.layers.length - 1];
            // En esta implementación, los tiles sólidos son los que en Tiled tienen una propiedad
            // personalizada, de tipo booleano, llamada "Solid". Esta es la capa que indicamos a las otras clases
            // que representa la máscara de colisiones de esta sala.
            wallLayer.setCollisionByProperty({Solid: true});
            this.colliderLayers.push(wallLayer);

            // No necesitamos renderizar la capa de colisiones, así que la desactivamos para obtener
            // un poco de rendimiento extra
            wallLayer.visible = false;

            // Teniendo ya cargados los tiles de la pared, vamos a crear múltiples capas para renderizar
            // los mismos. Esto es necesario para que la renderización de las paredes se ordenen, al igual
            // que el resto de elementos del juego, a través del nivel de profundidad. Sin este procedimiento
            // se producen bugs visuales que son relativamente comunes y fáciles de provocar y que pueden
            // romper la inmersión del jugador.

            // Cada fila de tiles de pared tiene su propia capa, debido a que la implementación de tilemaps
            // de Phaser sólo puede asignarle un valor de profundidad individual a, como mínimo, una capa
            for(let row = 0; row < this.map.height; row++) {
                // Creamos la capa para esta fila. El guión bajo inicial es una convención que *no* vamos a
                // utilizar para nombrar capas en Tiled.
                this.layers.push(this.map.createBlankDynamicLayer("_WallLayer"+row, this.tileset, 0, 0));
                // La capa actual es la que acabamos de añadir al array, es decir la última
                var current = this.layers.length - 1;
                // Ahora pasamos por cada tile de esta fila
                for(let column = 0; column < this.map.width; column++) {

                    var currentTile = wallLayer.getTileAt(column, row);

                    // Si el tile está marcado como Vertical es porque en realidad pertenece a la fila
                    // superior, aunque debido a la perspectiva tuviera que colocarse en esta.
                    // Si es el caso, lo ignoramos.
                    // También es posible que el tile no exista, por eso antes de comprobar nada más hay
                    // que comprobar que sí existe, de ahí el "currentTile &&"
                    if(currentTile && !currentTile.properties.Vertical) {
                        // Y si no es el caso, lo añadimos a la capa 
                        this.layers[current].putTileAt(currentTile, column, row);
                    }

                    // ¿Qué sucede con el tile de la fila inferior? Si está marcado como Vertical es
                    // que pertenece a esta fila
                    currentTile = wallLayer.getTileAt(column, row + 1);        
                    if(currentTile && currentTile.properties.Vertical) {
                        // Si está marcado como Vertical entonces lo añadimos a esta fila
                        this.layers[current].putTileAt(currentTile, column, row + 1);
                    }
                }
                // Le asignamos a la capa la profundidad correspondiente a su posición. El factor "(row + 2)"
                // está pensado para que esta asignación de profundidad tenga en cuenta que la pared está
                // elevada. Si pusiéramos "row" a secas, quedaría visualmente a la altura del suelo.
                this.layers[current].depth = (row + 2) * TILE_SIZE;
            }
        }
        
        // Capa de superposición, para elementos decorativos
        if(lights){
            this.layers.push(this.map.createDynamicLayer(lights.name, this.tileset, 0, 0));
            this.layers[this.layers.length - 1].depth = this.layers[this.layers.length - 2].depth + 1;
        }
    }
}