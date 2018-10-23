class Player extends Entity {
    /**
     * Referencia al intermediario de input de Phaser
     */
    private arrowKeys :Phaser.Input.Keyboard.CursorKeys;
    /**
     * Arma que porta este jugador
     */
    private weapon :Weapon;

    /**
     * Clase jugador, que define una entidad controlable mediante teclado. Se puede asignar
     * una configuración específica a cada instancia, pero si no se asigna, la instancia
     * usará la configuración predeterminada de jugador
     * @param scene Referencia a la escena donde se creará esta entidad
     * @param config Opciones específicas para esta instancia en particular
     */
    constructor(scene :Phaser.Scene, config? :EntityConfig) {
        // Si hay una configuración especificada se la pasamos, si no, le
        // pasamos la configuración por defecto de esta clase
        super(scene, config? config : {
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
                x: 400,
                y: 550
            },
            speed: 300
        });

        // Creamos el arma
        this.weapon = new Weapon(this, {
            name: "testweapon",
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
                        {x: 40, y: -32, z: 1},
                        {x: 40, y: -28, z: 1},
                        {x: 40, y: -24, z: 1},
                        {x: 40, y: -28, z: 1}
                    ],
                    down: [
                        {x: -40, y: -32, z: -1},
                        {x: -40, y: -28, z: -1},
                        {x: -40, y: -24, z: -1},
                        {x: -40, y: -28, z: -1}
                    ],
                    side: [
                        {x: -40, y: -32, z: -1},
                        {x: -40, y: -28, z: -1},
                        {x: -40, y: -24, z: -1},
                        {x: -40, y: -28, z: -1}
                    ]
                },
                attack: {
                    up: [
                        {x: 40, y: -32, z: 1},
                        {x: 40, y: -52, z: -2},
                        {x: 40, y: -72, z: -5},
                        {x: 40, y: -52, z: -2}
                    ],
                    down: [
                        {x: -40, y: -32, z: -1},
                        {x: -40, y: -12, z: 2},
                        {x: -40, y: 2, z: 5},
                        {x: -40, y: -12, z: 2}
                    ],
                    side: [
                        {x: -40, y: -32, z: -1},
                        {x: 10, y: -28, z: -1},
                        {x: 60, y: -24, z: -1},
                        {x: 10, y: -28, z: -1}
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
        // Alguien tiene que inicializar al intermediario de input de Phaser
        this.arrowKeys = this.scene.input.keyboard.createCursorKeys();
        // Y el arma
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
    public lockCamera(cam :Phaser.Cameras.Scene2D.Camera) {
        cam.startFollow(this.sprite, true, 0.3, 0.3);
        // Esta llamada activa "roundPixels" en esta cámara, forzándola a que dibuje los sprites
        // siempre en coordenadas enteras. Cuando los sprites se renderizan entre píxeles, el anti-aliasing
        // empeora considerablemente su calidad visual. También le asigna el vector (0.3, 0.3) como
        // interpolación lineal, permitiendo un movimiento suave pero sutil de la cámara
    }

    protected controlTarget() {
        // Vector para almacenar el desplazamiento del target
        var vector = {x: 0, y: 0};
        // Magnitud en la que desplazar el target por cada coordenada
        var delta = 100;

        // El siguiente código debería ser autoexplicativo. Nótese que cada coordenada se procesa por
        // separado para permitir movimiento diagonal

        if(this.arrowKeys.left.isDown)
            vector.x = -delta;
        else if(this.arrowKeys.right.isDown)
            vector.x = delta;
        
        if(this.arrowKeys.up.isDown)
            vector.y = -delta;
        else if(this.arrowKeys.down.isDown)
            vector.y = delta;

        // Movemos al target a la posición del jugador y le sumamos el vector calculado anteriormente
        this.target = this.sprite.body.center.clone();
        this.target.add(new Phaser.Math.Vector2(vector));
    }
}