class SceneMenu extends Phaser.Scene {
    /**
     * Escena que representa el menú del juego
     */
    constructor() {
        super({ key: "SceneMenu" });
    }
    /**
    * Cargamos las imágenes de los botones
    */
    preload() {
        this.load.image("singlePlayer", "assets/images/SinglePlayer.png");
        this.load.image("singlePlayerOn", "assets/images/SinglePlayerOn.png");
        this.load.image("multiPlayer", "assets/images/Multiplayer.png");
        this.load.image("options", "assets/images/Options.png");
    }
    /**
     * Método que cambia de imagen a la que se le pasa si entramos o salimos de ella
     */
    buttonAnimation(button) {
        this.singlePlayer = this.add.image(this.sWidth * 0.25 - this.menu.width * 0.5, this.sHeight * 0.5 - this.menu.height * 0.5, button);
    }
    /**
     * Inicializa la pantalla de menú
     */
    create() {
        // Creamos el menú
        this.menu = this.add.text(0, 0, "Menu", {
            fontFamily: "Comic Sans MS",
            fontSize: 36
        });
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width,
            height: this.game.config.height
        };
        // Colocamos el menu verticalmente en el centro y horizontalmente a un 20% desde arriba
        this.menu.setPosition(screen.width * 0.45 - this.menu.width * 0.5, screen.height * 0.20 - this.menu.height * 0.5);
        //Se guardan las dimensiones de la pantalla
        this.sWidth = screen.width;
        this.sHeight = screen.height;
        //Colocamos los botones
        //Un 25% a la izquierda y centrado en altura
        this.singlePlayer = this.add.image(this.sWidth * 0.25 - this.menu.width * 0.5, this.sHeight * 0.5 - this.menu.height * 0.5, "singlePlayer");
        //Un 25% a la derecha y centrado en altura
        this.multiPlayer = this.add.image(this.sWidth * 0.75 - this.menu.width * 0.5, this.sHeight * 0.5 - this.menu.height * 0.5, "multiPlayer");
        //Centrado a lo ancho y un 35% abajo
        this.options = this.add.image(this.sWidth * 0.5 - this.menu.width * 0.5, this.sHeight * 0.85 - this.menu.height * 0.5, "options");
        /**
        * Ponemos los siguientes eventos asociados a la imagen singlePlayer:
        * En caso de que se pulse se empieza a jugar
        * Si entramos o salimos de la imagen, esta se cambia
        */
        this.singlePlayer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start("SceneOverworld"))
            .on('pointerover', () => this.buttonAnimation("singlePlayerOn"))
            .on('pointerout', () => this.buttonAnimation("singlePlayer"));
        //Los otros botones aun no tienen funcionalidad
    }
}
//# sourceMappingURL=menu.js.map