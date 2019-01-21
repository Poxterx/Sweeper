class Switch extends InteractiveItem {
    //Interruptor al que está vinculado
    //public doorSwitch :switch;
    constructor(scene) {
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
        NpcSync.register("lever", this);
    }
    update() {
        super.update();
        this.sprite.setFlip(true, false);
    }
    sendData() {
        if (!this.sprite) {
            return {
                flip: false
            };
        }
        else {
            return {
                flip: this.sprite.flipX
            };
        }
    }
    receiveData(data) {
        if (this.sprite) {
            this.sprite.setFlip(data.flip, false);
        }
    }
}
//# sourceMappingURL=switch.js.map