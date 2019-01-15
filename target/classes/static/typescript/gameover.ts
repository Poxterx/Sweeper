class SceneGameOver extends Phaser.Scene {

    constructor() {
        super({key:"SceneGameOver"});
    }

    preload(){
        this.load.image("backToMenu", "assets/images/SinglePlayer.png");
    }

    create() {
        var screen = {
            width: game.config.width as number,
            height: game.config.height as number
        }

        var text = this.add.text(0, 0, "Game Over", {
            fontFamily: "Impact",
            fontSize: 46
        });
        
        text.setPosition(screen.width * 0.5 - text.width * 0.5,
                        screen.height * 0.5 - text.height * 0.5);

        //Vuelta al menú principal pulsando en el texto
        text.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start("SceneMenu");
            });
    }
}