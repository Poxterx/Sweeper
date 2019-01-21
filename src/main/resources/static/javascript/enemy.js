class Enemy extends Entity {
    constructor(scene, counter) {
        super(scene, {
            name: "enemy" + counter,
            path: "slimesheet.png",
            frameWidth: 128,
            frameHeight: 128,
            frameRate: 10,
            animations: {
                walk: {
                    up: [0, 1, 2, 3, 2, 1, 0],
                    down: [0, 1, 2, 3, 2, 1, 0],
                    side: [0, 1, 2, 3, 2, 1, 0]
                },
                attack: {
                    up: [4, 5, 6, 5, 4],
                    down: [4, 5, 6, 5, 4],
                    side: [4, 5, 6, 5, 4]
                }
            },
            speed: 200
        });
        this.path = null;
        this.targetPlayer = null;
        this.weapon = new Weapon(this, {
            name: "invisibleWeapon" + counter,
            damage: 20,
            path: "invisibleweapon.png",
            //el tamaño es ligeramente mayor para poder atacar al jugador cuando es empujado
            frameWidth: 130,
            frameHeight: 130,
            animations: {
                walk: {
                    up: [0, 0, 0, 0],
                    down: [0, 0, 0, 0],
                    side: [0, 0, 0, 0]
                }
            }
        });
    }
    create() {
        super.create();
        NpcSync.register(this.config.name, this);
    }
    update() {
        if (this.dead) {
            this.dead = false;
            var newPosition = this.scene.room.findRandomFreePosition();
            this.sprite.setPosition(newPosition.x, newPosition.y);
            this.setLife(this.getMaxLife());
        }
        super.update();
        if (!this.targetPlayer || Math.random() < 0.05) {
            let minDistance = Infinity;
            for (let entity of this.scene.entities) {
                if (!entity.sprite || !entity.sprite.body) {
                    continue;
                }
                let distance = this.sprite.body.center.distance(entity.sprite.body.center);
                if (entity instanceof Player && distance < minDistance) {
                    this.targetPlayer = entity;
                    minDistance = distance;
                    this.path = null;
                }
            }
        }
        if (this.targetPlayer && !this.path) {
            this.path = new Path(this, this.targetPlayer.sprite.body.center);
        }
        if (this.targetPlayer && this.targetPlayer.sprite.body && this.getMode() == "walk"
            && this.sprite.body.center.distance(this.targetPlayer.sprite.body.center) < TILE_SIZE) {
            this.setMode("attack");
        }
        if (DEBUG && this.path)
            this.path.draw(this.graphics);
    }
    controlTarget() {
        if (this.path && !this.path.isImpossible()) {
            this.target = new Phaser.Math.Vector2(this.path.next());
        }
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
        if (data.life == 0) {
            this.dead = true;
        }
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
//# sourceMappingURL=enemy.js.map