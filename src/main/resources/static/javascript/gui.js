class SceneGUI extends Phaser.Scene {
    /**
     * La escena de GUI se superpone a la escena de overworld ejecutándose al mismo tiempo, y se encarga
     * de dibujar la interfaz gráfica
     */
    constructor() {
        super({ key: "SceneGUI" });
    }
    /**
     * Inicializa los elementos de la interfaz
     */
    create() {
        // Introducimos el indicador de fps
        this.fpsText = this.add.text(20, 20, "FPS:" + Math.round(game.loop.actualFps), {
            fontSize: 20,
            backgroundColor: "rgba(0, 0, 0, 0.5)"
        });
    }
    /**
     * Actualiza los elementos de la interfaz cada frame
     */
    update() {
        // Actualizamos el indicador de fps
        this.fpsText.text = "FPS:" + Math.round(game.loop.actualFps);
    }
}
//# sourceMappingURL=gui.js.map