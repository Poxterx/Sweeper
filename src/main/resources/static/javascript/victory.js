class SceneGameVictory extends Phaser.Scene {
    constructor() {
        super({ key: "SceneGameVictory" });
    }
    preload() {
        this.load.image("victory", "assets/images/Victory.png");
    }
    create() {
        var screen = {
            width: game.config.width,
            height: game.config.height
        };
        var image = this.add.image(screen.width * 0.5, screen.height * 0.5, "victory");
        Connection.close();
        // También ponemos la misma función en caso de que se reciba un evento de clic (o toque)
        image.setInteractive()
            .on('pointerdown', () => {
            this.scene.stop("SceneGameVictory");
            this.scene.start("SceneMenu");
        });
    }
}
//# sourceMappingURL=victory.js.map