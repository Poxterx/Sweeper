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
     * Capa que contiene las colisiones de esta sala
     */
    public colliderLayer :Phaser.Tilemaps.StaticTilemapLayer;
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
    private layers :Phaser.Tilemaps.StaticTilemapLayer[];

    constructor(name :string, config :RoomConfig) {
        this.name = name;
        this.config = config;
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

        // Guardamos en un array todas las capas guardadas en el archivo tilemap
        this.layers = [];
        for(let layer of this.map.layers) {
            this.layers.push(this.map.createStaticLayer(layer.name, this.tileset, 0, 0));
        }

        // En principio sólo la segunda capa debería contener paredes y obstáculos.
        // Nótese que los tiles sólidos, en Tiled, necesitan de una propiedad
        // personalizada de tipo booleano llamada "Solid".
        if(this.layers[1]) {
            this.layers[1].setCollisionByProperty({Solid: true});
            this.colliderLayer = this.layers[1];
        }

        // La tercera capa es la que contiene los elementos que visualmente deberían verse más
        // cerca de la cámara. Dado que en este juego la profundidad de la cámara va ligada a la
        // posición en el eje Y (ver update() en entity.ts), podemos asegurarnos de que usar
        // un valor de profundidad correspondiente al lado inferior de la habitación hará que
        // esta capa siempre aparezca delante de cualquier otro elemento de la misma.
        if(this.layers[2]) {
            this.layers[2].depth = this.map.heightInPixels;
        }
    }
}