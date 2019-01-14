class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: "SceneGameOver" });
    }
    preload() {
        this.load.image("backToMenu", "assets/images/GameOver.png");
    }
    create() {
        var screen = {
            width: game.config.width,
            height: game.config.height
        };
        this.add.image(screen.width * 0.5, screen.height * 0.5, "backToMenu");
        // También ponemos la misma función en caso de que se reciba un evento de clic (o toque)
        this.input.addDownCallback(() => this.scene.start("SceneMenu"));
    }
}
//# sourceMappingURL=gameover.js.map