class SceneOverworld extends Phaser.Scene {
    
    /**
     * Anchura (x) y altura (y) de la escena, en píxeles.
     * IMPORTANTE: EN VERSIONES FUTURAS, ES PROBABLE QUE LAS UNIDADES DE ESTE VECTOR PASEN DE PÍXELES A TILES
     */
    public size :Phaser.Math.Vector2;
    /**
     * Entidades de esta escena
     */
    private entities :Entity[];

    /**
     * Crea una escena con las dimensiones indicadas.
     * IMPORTANTE: EN VERSIONES FUTURAS, ES PROBABLE QUE LAS UNIDADES DE ESTOS PARÁMETROS PASEN DE PÍXELES A TILES
     * @param width Anchura en píxeles de la escena
     * @param height Altura en píxeles de la escena
     */
    constructor(width :integer, height :integer) {
        super({key: "SceneOverworld"});

        this.size = new Phaser.Math.Vector2(width, height);
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
        // Cargamos todas las entidades y el fondo
        this.entities.forEach(e => e.preload());
        this.load.image("sky", "http://labs.phaser.io/assets/skies/space3.png");
    }

    /**
     * Inicializa los recursos de la escena
     */
    create() {
        // Dibujamos el fondo
        this.add.image(400, 300, "sky");
        // Indicamos los límites del área jugable
        this.physics.world.setBounds(0, 0, this.size.x, this.size.y);

        // Inicializamos todas las entidades
        this.entities.forEach(e => e.create());

        // Activamos las colisiones entre todos los sprites de entidades de la escena
        var sprites = [];
        this.entities.forEach(e => sprites.push(e.sprite));
        this.physics.add.collider(sprites, sprites);

        // Centramos la cámara en el jugador (la primera entidad)
        (this.entities[0] as Player).lockCamera(this.cameras.main);

        // Indicamos límites del área renderizable para evitar que la cámara dibuje la zona negra
        // externa al área jugable
        this.cameras.main.setBounds(0, 0, this.size.x, this.size.y);
    }

    /**
     * Actualiza la escena en cada fotograma
     */
    update() {
        this.entities.forEach(e => e.update());
    }
}