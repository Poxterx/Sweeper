type InteractiveConfig = {
    /**
     * Nombre que identifica al objeto interactivo
     */
    name: string,
    /**
     * Dirección donde se almacena el sprite del objeto interactivo (partiendo de assets/sprites)
     */
    path: string,
    /**
     * Ancho de los fotogramas de la animación
     */
    frameWidth: integer,
    /**
     * Alto de los fotogramas de la animación
     */
    frameHeight: integer,
    /**
     * Posición inicial de la entidad en la escena
     */
    startingPosition?: Vector2,
    /**
     * Dimensiones de la caja de colisiones de este objeto interactivo
     */
    collisionBox?: {
        /**
         * Desfase en píxeles desde el lado izquierdo del sprite hasta el lado izquierdo de la caja de colisiones
         */
        x: integer,
        /**
         * Desfase en píxeles desde el lado superior del sprite hasta el lado superior de la caja de colisiones
         */
        y: integer,
        /**
         * Anchura en píxeles de la caja de colisiones
         */
        width: integer,
        /**
         * Altura en píxeles de la caja de colisiones
         */
        height: integer
    }
}

abstract class InteractiveItem extends Phaser.GameObjects.GameObject {
    //identificador del objeto interactivo
    public name: string;
    //Objeto de configuración con el que se inicializó este item
    public config: InteractiveConfig;
    //Sprite del sistema de físicas de Phaser que maneja este item
    public sprite: Phaser.Physics.Arcade.Sprite;
    //Array de sprites del sistema de físicas de Phaser que maneja este item
    public sprites : Phaser.Physics.Arcade.Sprite[];
    //estado del item
    public active: boolean;
    //referencia a la escena a la que pertenece esta entidad
    public scene: SceneOverworld;

    constructor(scene: SceneOverworld, config: InteractiveConfig) {
        super(scene, "interactiveItem");
        this.name = config.name;
        this.config = config;
        this.scene = scene;
        this.active = false;

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
        this.sprite = this.scene.physics.add.sprite(
            this.config.startingPosition.x,
            this.config.startingPosition.y,
            this.name, 0);
    }

    /**
     * Actualiza la entidad en cada fotograma de una escena
     */
    update() {
        // Ahora que la entidad se ha movido le ponemos la profundidad adecuada para que se
        // renderice delante de lo que tiene detrás y viceversa
        this.sprite.depth = this.sprite.body.center.y;

    }
}