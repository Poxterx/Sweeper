class SceneGameDisconect extends Phaser.Scene {
    constructor() {
        super({ key: "SceneGameDisconect" });
    }
    create() {
        var screen = {
            width: game.config.width,
            height: game.config.height
        };
        SceneGameDisconect.disconect.setVisible(true);
        this.add.existing(SceneGameDisconect.disconect);
        document.getElementById("Lobby_name").hidden = true;
        Connection.close();
        SceneGameDisconect.disconect.scene = this;
        // También ponemos la misma función en caso de que se reciba un evento de clic (o toque) 
        SceneGameDisconect.disconect.setInteractive()
            .on('pointerdown', () => {
            SceneGameDisconect.disconect.setVisible(false);
            this.scene.stop("SceneGameDisconect");
            this.scene.start("SceneMenu");
        });
    }
}
//# sourceMappingURL=disconnect.js.map