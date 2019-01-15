class Enemy extends Entity {

    private path :Path;

    private targetPlayer :Player;

    constructor(scene :SceneOverworld) {
        super(scene, {
            name: "enemy",
            path: "slimesheet.png",
            frameWidth: 128,
            frameHeight: 128,
            frameRate: 10,
            animations: {
                walk: {
                    up: [0,1,2,3,2,1,0],
                    down: [0,1,2,3,2,1,0],
                    side: [0,1,2,3,2,1,0]
                },
                attack: {
                    up: [4,5,6,5,4],
                    down: [4,5,6,5,4],
                    side: [4,5,6,5,4]
                }
            },
            speed: 200
        });

        this.path = null;
        this.targetPlayer = null;
        this.weapon = new Weapon(this, {
            name: "invisibleWeapon",
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

    update() {
        if(this.dead) {
            this.dead = false;
            var newPosition = this.scene.room.findRandomFreePosition();
            this.sprite.setPosition(newPosition.x, newPosition.y);
            this.setLife(this.getMaxLife());
        }

        super.update();

        if(!this.targetPlayer || Math.random() < 0.05) {
            let minDistance = Infinity;
            for(let entity of this.scene.entities) {
                //Comprobamos la integridad de la entidad
                if(entity != null){
                    let distance = this.sprite.body.center.distance(entity.sprite.body.center);
                    if(entity instanceof Player && distance < minDistance) {
                        this.targetPlayer = entity;
                        minDistance = distance;
                        this.path = null;
                    }
                }
            }
        }

        if(this.targetPlayer && !this.path) {
            this.path = new Path(this, this.targetPlayer.sprite.body.center);
        }

        if(this.targetPlayer && this.targetPlayer.sprite.body && this.getMode() == "walk"
        && this.sprite.body.center.distance(this.targetPlayer.sprite.body.center) < TILE_SIZE) {
            this.setMode("attack");
        }

        if(DEBUG && this.path)
            this.path.draw(this.graphics);
    }

    protected controlTarget() {
        if(this.path && !this.path.isImpossible()) {
            this.target = new Phaser.Math.Vector2(this.path.next());
        }
    }

}