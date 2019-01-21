class InteractiveItem extends Phaser.GameObjects.GameObject {
    constructor(scene, config) {
        super(scene, "interactiveItem");
        this.name = config.name;
        this.config = config;
        this.scene = scene;
        this.open = false;
    }
    /**
     * Carga los recursos necesarios
     */
    preload() {
        // Cargamos el sprite en la escena
        this.scene.load.spritesheet(this.name, "assets/sprites/" + this.config.path, {
            frameWidth: this.config.frameWidth, frameHeight: this.config.frameHeight
        });
    }
    /**
     * Inicializa los recursos cargados con preload()
     */
    create() {
        if (!this.config.startingPosition) {
            this.config.startingPosition = this.scene.room.findRandomFreePosition();
        }
        // Introducimos el sprite en el sistema de físicas de Phaser
        this.sprite = this.scene.physics.add.sprite(this.config.startingPosition.x, this.config.startingPosition.y, this.name, 0);
    }
    /**
     * Actualiza la entidad en cada fotograma de una escena
     */
    update() {
        // Ahora que la entidad se ha movido le ponemos la profundidad adecuada para que se
        // renderice delante de lo que tiene detrás y viceversa
        if (this.sprite && this.sprite.body)
            this.sprite.depth = this.sprite.body.center.y;
    }
}
//# sourceMappingURL=interactiveItem.js.map