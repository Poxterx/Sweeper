class Switch extends InteractiveItem {
    //Interruptor al que está vinculado
    //public doorSwitch :switch;

    constructor(scene :SceneOverworld) {
        // Si hay una configuración especificada se la pasamos, si no, le
        // pasamos la configuración por defecto de esta clase
        super(scene, {
            name: "lever",
            path: "lever.png",
            frameWidth: 128,
            frameHeight: 128,
            startingPosition: {
                x: 1152,
                y: 11264
            }
        });
    }

    update(){
        this.sprite = this.scene.physics.add.sprite(
            this.config.startingPosition.x,
            this.config.startingPosition.y,
            this.name, 0).setFlip(true, false);
    }

}