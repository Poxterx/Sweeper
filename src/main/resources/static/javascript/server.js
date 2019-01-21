class SceneServer extends Phaser.Scene {
    /**
     * Escena del servidor. Esta escena es la interfaz gráfica que tendrá la instancia
     * del juego ejecutándose como servidor, al menos hasta que empiece la partida.
     */
    constructor() {
        super({ key: "SceneServer" });
    }
    /**
     * Inicializa los recursos de la escena.
     */
    create() {
        // Esta es la primera escena que ejecuta Phaser.
        // Si no es un servidor, entonces ir al título para poder jugar.
        if (!SERVER) {
            this.scene.start("SceneTitle");
        }
        // Centrar el texto
        var screen = {
            width: this.game.config.width,
            height: this.game.config.height
        };
        this.text = this.add.text(0, 0, "Esta es la pantalla\nque sale en el server.", {
            fontFamily: "Arial",
            fontSize: 10
        });
        this.text.setPosition(screen.width * 0.5 - this.text.width * 0.5, screen.height * 0.5 - this.text.height * 0.5);
    }
}
//# sourceMappingURL=server.js.map