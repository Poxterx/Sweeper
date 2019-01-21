class Dummy extends Entity {
    /**
     * Entidad inmóvil que intentará permanecer en su posición inicial, pensada para probar
     * las colisiones entre entidades. Se puede asignar una configuración específica a cada
     * instancia, pero si no se asigna, la instancia usará la configuración predeterminada
     * de su clase
     * @param scene Referencia a la escena donde se creará esta entidad
     * @param config Opciones específicas para esta instancia en particular
     */
    constructor(scene, config) {
        super(scene, config ? config : {
            name: "dummy",
            path: "testcharacter.png",
            frameWidth: 84,
            frameHeight: 120,
            frameRate: 10,
            animations: {
                walk: {
                    up: [0],
                    down: [1],
                    side: [3]
                }
            },
            speed: 200,
            startingPosition: {
                x: 2176,
                y: 1200
            }
        });
    }
    create() {
        super.create();
        NpcSync.register("name", this);
    }
    /**
     * Intenta mantener el target en su posición original
     */
    controlTarget() {
        // Intentamos que el dummy se quede en su posición inicial
        this.target = new Phaser.Math.Vector2(this.config.startingPosition);
    }
    sendData() {
        if (!this.sprite) {
            return {
                life: this.getLife()
            };
        }
        var animationinfo = this.currentAnimationInfo();
        return {
            posX: this.sprite.x,
            posY: this.sprite.y,
            velX: this.sprite.body.velocity.x,
            velY: this.sprite.body.velocity.y,
            mode: this.getMode(),
            anim: animationinfo.toString(),
            frame: animationinfo.frame,
            flip: this.sprite.flipX,
            life: this.getLife()
        };
    }
    receiveData(data) {
        this.setLife(data.life);
        if (!this.sprite) {
            return;
        }
        this.sprite.setPosition(data.posX, data.posY);
        this.sprite.setVelocity(data.velX, data.velY);
        this.setMode(data.mode);
        var animKeys = data.anim.split("@");
        this.sprite.anims.play(this.name + "@" + animKeys[1] + "@" + animKeys[2], false);
        this.sprite.anims.setCurrentFrame(this.sprite.anims.currentAnim.frames[data.frame]);
        this.sprite.flipX = data.flip;
    }
}
//# sourceMappingURL=dummy.js.map