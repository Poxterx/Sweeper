class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: "SceneGameOver" });
    }
    create() {
        var screen = {
            width: game.config.width,
            height: game.config.height
        };
        var text = this.add.text(0, 0, "Game Over", {
            fontFamily: "Impact",
            fontSize: 46
        });
        text.setPosition(screen.width * 0.5 - text.width * 0.5, screen.height * 0.5 - text.height * 0.5);
    }
}
//# sourceMappingURL=gameover.js.map