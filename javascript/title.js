class SceneTitle extends Phaser.Scene {
    /**
     * Escena que representa la pantalla de título del juego
     */
    constructor() {
        super({ key: "SceneTitle" });
    }
    /**
     * Inicializa la pantalla de título
     */
    create() {
        // Creamos el logo
        this.logo = this.add.text(0, 0, "Sweeper", {
            fontFamily: "Comic Sans MS",
            fontSize: 46
        });
        // Creamos el texto que indica que hay que pulsar una tecla
        this.start = this.add.text(0, 0, "Press any key to start", {
            fontFamily: "Comic Sans MS",
            fontSize: 16,
        });
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width,
            height: this.game.config.height
        };
        // Colocamos el logo verticalmente en el centro y horizontalmente a un 25% desde arriba
        this.logo.setPosition(screen.width * 0.5 - this.logo.width * 0.5, screen.height * 0.25 - this.logo.height * 0.5);
        // Colocamos el texto verticalmente en el centro y horizontalmente a un 25% desde abajo
        this.start.setPosition(screen.width * 0.5 - this.start.width * 0.5, screen.height * 0.75 - this.start.height * 0.5);
        // Ponemos un evento al pulsar cualquier tecla que haga que empiece la siguiente escena
        this.input.keyboard.on("keydown", () => this.scene.start("SceneOverworld"));
        // También ponemos la misma función en caso de que se reciba un evento de clic (o toque)
        this.input.addDownCallback(() => this.scene.start("SceneOverworld"));
    }
}
//# sourceMappingURL=title.js.map