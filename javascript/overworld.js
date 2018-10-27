class SceneOverworld extends Phaser.Scene {
    /**
     * Nueva escena que tiene lugar en la sala indicada
     * @param room La sala en cuestión
     */
    constructor(room) {
        super({ key: "SceneOverworld" });
        this.room = room;
        this.room.scene = this;
    }
    /**
     * Prepara los recursos de la escena
     */
    preload() {
        // Creamos el array de las entidades
        this.entities = [
            new Player(this),
            new Dummy(this)
        ];
        // Cargamos todas las entidades y la sala
        this.entities.forEach(e => e.preload());
        this.room.preload();
    }
    /**
     * Inicializa los recursos de la escena
     */
    create() {
        // Inicializamos la sala
        this.room.create();
        // Indicamos los límites del área jugable de acuerdo con la sala
        this.physics.world.setBounds(0, 0, this.room.size.x, this.room.size.y);
        // Inicializamos todas las entidades
        this.entities.forEach(e => e.create());
        // Activamos las colisiones entre todos los sprites de entidades
        // de la escena, así como con la propia sala
        var sprites = [];
        this.entities.forEach(e => sprites.push(e.sprite));
        this.physics.add.collider(sprites, sprites);
        this.physics.add.collider(sprites, this.room.colliderLayer);
        // Centramos la cámara en el jugador (la primera entidad)
        this.entities[0].lockCamera(this.cameras.main);
        // Indicamos límites del área renderizable para evitar que la cámara dibuje la zona negra
        // externa al área jugable
        this.cameras.main.setBounds(0, 0, this.room.size.x, this.room.size.y);
        // Iniciamos la escena encargada de manejar la interfaz
        this.scene.launch("SceneGUI");
    }
    /**
     * Actualiza la escena en cada fotograma
     */
    update() {
        this.entities.forEach(e => e.update());
    }
}
//# sourceMappingURL=overworld.js.map