class Room {
    constructor(name, config) {
        this.name = name;
        this.config = config;
    }
    /**
     * Carga los recursos necesarios para esta sala
     */
    preload() {
        // Cargamos el tileset y el mapa
        this.scene.load.tilemapTiledJSON(this.name + "@tilemap", "assets/maps/" + this.config.tilemap);
        this.scene.load.image(this.name + "@tileset", "assets/tilesets/" + this.config.tileset);
    }
    /**
     * Inicializa los recursos cargados con preload()
     */
    create() {
        // Creamos el tileset y el mapa
        this.map = this.scene.make.tilemap({ key: this.name + "@tilemap" });
        this.tileset = this.map.addTilesetImage(this.map.tilesets[0].name, this.name + "@tileset");
        // El tamaño de la sala será el tamaño del mapa
        this.size = new Phaser.Math.Vector2(this.map.widthInPixels, this.map.heightInPixels);
        // Guardamos en un array todas las capas guardadas en el archivo tilemap
        this.layers = [];
        for (let layer of this.map.layers) {
            this.layers.push(this.map.createStaticLayer(layer.name, this.tileset, 0, 0));
        }
        // En principio sólo la segunda capa debería contener paredes y obstáculos.
        // Nótese que los tiles sólidos, en Tiled, necesitan de una propiedad
        // personalizada de tipo booleano llamada "Solid".
        if (this.layers[1]) {
            this.layers[1].setCollisionByProperty({ Solid: true });
            this.colliderLayer = this.layers[1];
        }
        // La tercera capa es la que contiene los elementos que visualmente deberían verse más
        // cerca de la cámara. Dado que en este juego la profundidad de la cámara va ligada a la
        // posición en el eje Y (ver update() en entity.ts), podemos asegurarnos de que usar
        // un valor de profundidad correspondiente al lado inferior de la habitación hará que
        // esta capa siempre aparezca delante de cualquier otro elemento de la misma.
        if (this.layers[2]) {
            this.layers[2].depth = this.map.heightInPixels;
        }
    }
}
//# sourceMappingURL=room.js.map