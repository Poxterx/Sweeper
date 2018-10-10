class SceneOverworld extends Phaser.Scene {
    
    /**
     * Referencia al jugador en esta escena
     */
    private player :Player;

    constructor() {
        super({key: "SceneOverworld"});

        // Inicializamos al jugador
        this.player = new Player({
            name: "player",
            path: "assets/testcharacter.png",
            frameWidth: 84,
            frameHeight: 120,
            frameRate: 10,
            animations: {
                up: [0],
                down: [1],
                side: [3],
            }
        });
    }

    /**
     * Prepara los recursos de la escena
     */
    preload() {
        // De momento sólo necesitamos cargar al jugador y el fondo
        this.player.preload(this);
        this.load.image("sky", "http://labs.phaser.io/assets/skies/space3.png");
    }

    /**
     * Inicializa los recursos de la escena
     */
    create() {
        // Dibujamos el fondo
        this.add.image(400, 300, "sky");
        // Indicamos los límites del área jugable
        this.physics.world.setBounds(0, 0, 1500, 1500);

        // Inicializamos al jugador y centramos la cámara en él
        this.player.create(this);
        this.player.lockCamera(this.cameras.main);

        // Indicamos límites del área renderizable para evitar que la cámara dibuje la zona negra
        // externa al área jugable
        this.cameras.main.setBounds(0, 0, 1500, 1500);
    }

    /**
     * Actualiza la escena en cada fotograma
     */
    update() {
        this.player.update(this);
    }
}