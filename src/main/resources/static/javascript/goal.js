class Goal extends InteractiveItem {
    constructor(scene) {
        super(scene, {
            name: "meta",
            path: "ladder.png",
            frameWidth: 128,
            frameHeight: 128,
            startingPosition: {
                x: 6272,
                y: 8704
            }
        });
        //La meta se activa desde el principio
        this.open = true;
    }
    update() {
        super.update();
    }
}
//# sourceMappingURL=goal.js.map