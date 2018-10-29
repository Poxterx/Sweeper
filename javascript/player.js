class Player extends Entity {
    /**
     * Clase jugador, que define una entidad controlable mediante teclado. Se puede asignar
     * una configuración específica a cada instancia, pero si no se asigna, la instancia
     * usará la configuración predeterminada de jugador
     * @param scene Referencia a la escena donde se creará esta entidad
     * @param control Objeto con los nombres de los eventos asociados a la direccion, al ataque y el nombre del jugador
     * @param xPos Posición en x del Player
     * @param yPos Posición en y del Player
     * @param config Opciones específicas para esta instancia en particular
     */
    constructor(scene, control, xPos, yPos, config) {
        // Si hay una configuración especificada se la pasamos, si no, le
        // pasamos la configuración por defecto de esta clase
        super(scene, config ? config : {
            name: "player",
            path: "testcharacter.png",
            frameWidth: 84,
            frameHeight: 120,
            frameRate: 10,
            animations: {
                walk: {
                    up: [0, 0, 0, 0],
                    down: [1, 1, 1, 1],
                    side: [3, 3, 3, 3],
                }
            },
            startingPosition: {
                x: xPos,
                y: yPos
            },
            speed: 300
        });
        this.control = control;
        this.name = control.name;
        //se inicializa el array, al principio ninguna tecla esta pulsada
        this.arrayKeys = [false, false, false, false];
        // Creamos el arma
        this.weapon = new Weapon(this, {
            name: control.weaponName,
            path: "testweapon.png",
            frameWidth: 128,
            frameHeight: 128,
            animations: {
                walk: {
                    up: [0, 0, 0, 0],
                    down: [0, 0, 0, 0],
                    side: [0, 0, 0, 0]
                },
                attack: {
                    up: [0, 3, 4, 3],
                    down: [0, 3, 4, 3],
                    side: [0, 1, 2, 1]
                }
            },
            offset: {
                walk: {
                    up: [
                        { x: 40, y: -32, z: 1 },
                        { x: 40, y: -28, z: 1 },
                        { x: 40, y: -24, z: 1 },
                        { x: 40, y: -28, z: 1 }
                    ],
                    down: [
                        { x: -40, y: -32, z: -1 },
                        { x: -40, y: -28, z: -1 },
                        { x: -40, y: -24, z: -1 },
                        { x: -40, y: -28, z: -1 }
                    ],
                    side: [
                        { x: -40, y: -32, z: -1 },
                        { x: -40, y: -28, z: -1 },
                        { x: -40, y: -24, z: -1 },
                        { x: -40, y: -28, z: -1 }
                    ]
                },
                attack: {
                    up: [
                        { x: 40, y: -32, z: 1 },
                        { x: 40, y: -52, z: -2 },
                        { x: 40, y: -72, z: -5 },
                        { x: 40, y: -52, z: -2 }
                    ],
                    down: [
                        { x: -40, y: -32, z: -1 },
                        { x: -40, y: -12, z: 2 },
                        { x: -40, y: 2, z: 5 },
                        { x: -40, y: -12, z: 2 }
                    ],
                    side: [
                        { x: -40, y: -32, z: -1 },
                        { x: 10, y: -28, z: -1 },
                        { x: 60, y: -24, z: -1 },
                        { x: 10, y: -28, z: -1 }
                    ]
                }
            }
        });
    }
    preload() {
        super.preload();
        // Hay que cargar los recursos el arma
        this.weapon.preload();
    }
    create() {
        super.create();
        //Se guarda al Player en that
        var that = this;
        /**
        * Cuando se pulsa una tecla, se pone a true el elemento del array al que va asociado.
        */
        this.scene.input.keyboard.on("keydown_" + this.control.up, function (event) {
            that.arrayKeys[0] = true;
        });
        this.scene.input.keyboard.on("keydown_" + this.control.right, function (event) {
            that.arrayKeys[1] = true;
        });
        this.scene.input.keyboard.on("keydown_" + this.control.down, function (event) {
            that.arrayKeys[2] = true;
        });
        this.scene.input.keyboard.on("keydown_" + this.control.left, function (event) {
            that.arrayKeys[3] = true;
        });
        this.scene.input.keyboard.on("keydown_" + this.control.attack, function (event) {
            //Comprobamos si el jugador no estaba en modo ataque 
            if ((that.getMode() != "attack")) {
                that.setMode("attack");
            }
        });
        /**
        * Cuando se deja de pulsar la tecla, se pone a false el elemento del array al que va asociado.
        */
        this.scene.input.keyboard.on("keyup_" + this.control.up, function (event) {
            that.arrayKeys[0] = false;
        });
        this.scene.input.keyboard.on("keyup_" + this.control.right, function (event) {
            that.arrayKeys[1] = false;
        });
        this.scene.input.keyboard.on("keyup_" + this.control.down, function (event) {
            that.arrayKeys[2] = false;
        });
        this.scene.input.keyboard.on("keyup_" + this.control.left, function (event) {
            that.arrayKeys[3] = false;
        });
        //Se crea el arma
        this.weapon.create();
    }
    update() {
        super.update();
        // Después de actualizar al jugador, actualizamos también el arma
        this.weapon.update();
    }
    /**
     * Centra la cámara en este jugador
     * @param cam Referencia a la cámara que queremos centrar
     */
    lockCamera(cam) {
        cam.startFollow(this.sprite, true, 0.3, 0.3);
        // Esta llamada activa "roundPixels" en esta cámara, forzándola a que dibuje los sprites
        // siempre en coordenadas enteras. Cuando los sprites se renderizan entre píxeles, el anti-aliasing
        // empeora considerablemente su calidad visual. También le asigna el vector (0.3, 0.3) como
        // interpolación lineal, permitiendo un movimiento suave pero sutil de la cámara
    }
    controlTarget() {
        // Vector para almacenar el desplazamiento del target
        var vector = { x: 0, y: 0 };
        // Magnitud en la que desplazar el target por cada coordenada
        var delta = 100;
        // El siguiente código debería ser autoexplicativo. Nótese que cada coordenada se procesa por
        // separado para permitir movimiento diagonal
        //Se actualiza el vector desplazamiento del target dependiendo de si se a pulsado una tecla u otra
        if (this.arrayKeys[3])
            vector.x = -delta;
        else if (this.arrayKeys[1])
            vector.x = delta;
        if (this.arrayKeys[0])
            vector.y = -delta;
        else if (this.arrayKeys[2])
            vector.y = delta;
        // Movemos al target a la posición del jugador y le sumamos el vector calculado anteriormente
        this.target = this.sprite.body.center.clone();
        this.target.add(new Phaser.Math.Vector2(vector));
    }
}
//# sourceMappingURL=player.js.map