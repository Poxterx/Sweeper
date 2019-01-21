class SceneTitle extends Phaser.Scene {
    /**
     * Logo del título
     */
    private logo :Phaser.GameObjects.Image;
    /**
     * Texto de "Press any key to start"
     */
    private start :Phaser.GameObjects.Text;

    /**
     * Escena que representa la pantalla de título del juego
     */
    constructor() {
        super({key: "SceneTitle"});
    }

    /**
     * Carga la imagen necesaria
     */
    preload(){
        this.load.image("logo", "assets/images/Logo.png");
    }

    /**
     * Inicializa la pantalla de título
     */
    create() {
        

        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width as number,
            height: this.game.config.height as number
        }

        this.logo = this.add.image(screen.width*0.5,screen.height*0.5, "logo");


        // Ponemos un evento al pulsar cualquier tecla que haga que empiece la siguiente escena
        
        this.input.keyboard.on("keydown", () => this.scene.start("SceneMenu"));
        // También ponemos la misma función en caso de que se reciba un evento de clic (o toque)
        this.input.addDownCallback(() => this.scene.start("SceneMenu"));
    }

}