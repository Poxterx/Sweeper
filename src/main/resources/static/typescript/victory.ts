class SceneGameVictory extends Phaser.Scene {

    constructor() {
        super({key:"SceneGameVictory"});
    }

    preload(){
        this.load.image("backToMenu", "assets/images/Victory.png");
    }

    create() {
        var screen = {
            width: game.config.width as number,
            height: game.config.height as number
        }

        this.add.image(screen.width*0.5,screen.height*0.5, "backToMenu");

        // También ponemos la misma función en caso de que se reciba un evento de clic (o toque)
        this.input.addDownCallback(() => this.scene.start("SceneMenu"));
    }
}