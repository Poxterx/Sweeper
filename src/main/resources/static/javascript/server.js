class SceneServer extends Phaser.Scene {
    /**
     * Escena del servidor. Esta escena es la interfaz gráfica que tendrá la instancia
     * del juego ejecutándose como servidor, al menos hasta que empiece la partida.
     */
    constructor() {
        super({ key: "SceneServer" });
        // Le pasamos la propia escena del servidor para que pinte en ella los nombres de los usuarios
        this.us = new UsersList(this);
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
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width,
            height: this.game.config.height
        };
        // Creamos el texto del nombre del host
        this.host = this.add.text(0, 0, "Host", {
            fontFamily: "Arial",
            fontSize: 40
        });
        // Colocamos el nombre del host arriba a la izquierda, para dejar espacio para su direccion y puerto
        this.host.setPosition(screen.width * 0.15 - this.host.width * 0.5, screen.height * 0.15 - this.host.height * 0.5);
        // Cuando la conexión haya cargado, se puede añadir también la dirección del host
        var that = this;
        Connection.onInitialized(function () {
            that.host.text += " Disponible en " + Connection.getFullHost();
        });
    }
    /**
     * Actualiza el array de usuarios conectados
     */
    update() {
        this.us.update();
    }
}
//# sourceMappingURL=server.js.map