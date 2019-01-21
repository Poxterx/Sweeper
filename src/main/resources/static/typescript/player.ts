type PlayerControl = {
    /**
     * Nombre que identifica a este jugador
     */
    name :string;
    /**
     * Nombre que identifica al arma de este jugador
     */
    weaponName :string;
    /**
     * String que almacena el nombre del evento cuando el jugador va hacia arriba
     */
    up? :string,
    /**
     * String que almacena el nombre del evento cuando el jugador va hacia abajo
     */
    down? :string,
    /**
     * String que almacena el nombre del evento cuando el jugador va hacia la izquierda
     */
    left? :string,
    /**
     * String que almacena el nombre del evento cuando el jugador va hacia derecha
     */
    right? :string,
    /**
     * String que almacena el nombre del evento cuando el jugador va a atacar
     */
    attack? :string,
}

class Player extends Entity {
    /**
     * Nombre que identifica a este jugador
     */
    public name :string;
    /**
     * Nombre que identifica al arma de este jugador
     */
    public weaponName :string;
    /**
     * Array en el que se indica si la tecla asociada a un evento está pulsada
     */
    protected arrayKeys: boolean[];
    /**
     * Intervalo que usa la entidad para enviar datos al servidor
     */
    private syncInterval :number;
    /**
     * Objeto de configuración con el que se inicializó esta entidad
     */
    protected control :PlayerControl;

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
    constructor(scene :SceneOverworld, control :PlayerControl, xPos :number, yPos :number, config? :EntityConfig) {
        // Si hay una configuración especificada se la pasamos, si no, le
        // pasamos la configuración por defecto de esta clase
        super(scene, config? config : {
            name: control.name,
            path: "SweeperPlayer_Anim_Tile.png",
            frameWidth: 87,
            frameHeight: 128,
            frameRate: 10,
            animations: {
                walk: {
                    up: [15, 16, 17, 18, 13, 14],
                    down: [7, 8, 9, 10, 11, 12],
                    side: [6, 2, 3, 4, 5]
                }
            },
            startingPosition: {
                x: xPos,
                y: yPos
            },
            speed: 300
        });
        this.control=control;
        this.name=control.name;
        //se inicializa el array, al principio ninguna tecla esta pulsada
        this.arrayKeys = [false, false, false, false];
        // Creamos el arma
        this.weapon = new Weapon(this, {
            name: control.weaponName,
            damage: 20,
            path: "batSpritesheet.png",
            frameWidth: 128,
            frameHeight: 128,
            animations: {
                walk: {
                    up: [2, 2, 2, 2, 2, 2],
                    down: [1, 1, 1, 1, 1, 1],
                    side: [0, 0, 0, 0, 0]
                },
                attack: {
                    up: [2, 2, 5, 5, 2, 2],
                    down: [1, 1, 4, 4, 1, 1],
                    side: [0, 3, 3, 0, 0]
                }
            },
            offset: {
                walk: {
                    up: [
                        {x: 0, y: -12, z: -1},
                        {x: 0, y: -14, z: -1},
                        {x: 0, y: -12, z: -1},
                        {x: 0, y: -14, z: -1},
                        {x: 0, y: -12, z: -1},
                        {x: 0, y: -14, z: -1}
                    ],
                    down: [
                        {x: 0, y: -2, z: 1},
                        {x: 0, y: -4, z: 1},
                        {x: 0, y: -2, z: 1},
                        {x: 0, y: -4, z: 1},
                        {x: 0, y: -2, z: 1},
                        {x: 0, y: -4, z: 1}
                    ],
                    side: [
                        {x: -5, y: 0, z: -1},
                        {x: -5, y: -2, z: -1},
                        {x: -5, y: 0, z: -1},
                        {x: -5, y: -2, z: -1},
                        {x: -5, y: 0, z: -1}
                    ]
                },
                attack: {
                    up: [
                        {x: 0, y: -16, z: -1},
                        {x: 0, y: -18, z: -1},
                        {x: 0, y: -16, z: -1},
                        {x: 0, y: -18, z: -1},
                        {x: 0, y: -16, z: -1},
                        {x: 0, y: -18, z: -1}
                    ],
                    down: [
                        {x: 0, y: 10, z: 1},
                        {x: 0, y: 14, z: 1},
                        {x: 0, y: 10, z: 1},
                        {x: 0, y: 14, z: 1},
                        {x: 0, y: 10, z: 1},
                        {x: 0, y: 14, z: 1}
                    ],
                    side: [
                        {x: 5, y: 0, z: -1},
                        {x: 7, y: -2, z: -1},
                        {x: 5, y: 0, z: -1},
                        {x: 7, y: -2, z: -1},
                        {x: 5, y: 0, z: -1}
                    ]
                }
            }
        });
    }

    create() {
        super.create();

        if(this instanceof RemotePlayer) {
            return;
        }

        //Se guarda al Player en that
        var that :Player = this;

        // Cuando se pulsa una tecla, se pone a true el elemento del array al que va asociado.
        // Cuando se deja de pulsar la tecla, se pone a false el elemento del array al que va asociado.
        if(this.control.up) {
            this.scene.input.keyboard.on("keydown_"+this.control.up, function (event) {
                that.arrayKeys[0]=true;
            });
            this.scene.input.keyboard.on("keyup_"+this.control.up, function (event) {
                that.arrayKeys[0]=false;
            });
        }
        if(this.control.right) {
            this.scene.input.keyboard.on("keydown_"+this.control.right, function (event) {
                that.arrayKeys[1]=true;
            });
            this.scene.input.keyboard.on("keyup_"+this.control.right, function (event) {
                that.arrayKeys[1]=false;
            });
        }
        if(this.control.down) {
            this.scene.input.keyboard.on("keydown_"+this.control.down, function (event) {
                that.arrayKeys[2]=true;
            });
            this.scene.input.keyboard.on("keyup_"+this.control.down, function (event) {
                that.arrayKeys[2]=false;
            });
        }
        if(this.control.left) {
            this.scene.input.keyboard.on("keydown_"+this.control.left, function (event) {
                that.arrayKeys[3]=true;
            });
            this.scene.input.keyboard.on("keyup_"+this.control.left, function (event) {
                that.arrayKeys[3]=false;
            });
        }
        if(this.control.attack) {
            this.scene.input.keyboard.on("keydown_"+this.control.attack, function (event) {
                //Comprobamos si el jugador no estaba en modo ataque 
                if ((that.getMode()!="attack")){
                    that.setMode("attack");
                }
            });
        }

        if(multiplayer && !(this instanceof RemotePlayer)) {
            var that :Player = this;
            this.syncInterval = setInterval(() => this.sendData.call(this), 50);
        }
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

    /**
     * Mueve el target de manera que la entidad se desplazará de acuerdo con las pulsaciones
     * de teclas del usuario
     */
    protected controlTarget() {
        if(!this.sprite){
            return;
        }
        // Vector para almacenar el desplazamiento del target
        var vector = {x: 0, y: 0};
        // Magnitud en la que desplazar el target por cada coordenada
        var delta = 100;

        // El siguiente código debería ser autoexplicativo. Nótese que cada coordenada se procesa por
        // separado para permitir movimiento diagonal
        //Se actualiza el vector desplazamiento del target dependiendo de si se a pulsado una tecla u otra
        if(this.arrayKeys[3])
            vector.x = -delta;
        else if(this.arrayKeys[1])
            vector.x = delta;

        if(this.arrayKeys[0])
            vector.y = -delta;
        else if(this.arrayKeys[2])
            vector.y = delta;

        // Movemos al target a la posición del jugador y le sumamos el vector calculado anteriormente
        this.target = this.sprite.body.center.clone();
        this.target.add(new Phaser.Math.Vector2(vector));
        
    }

    /**
     * Envía datos propios al servidor para sincronizarlos con los demás clientes
     */
    private sendData() {
        var animationinfo = this.currentAnimationInfo();
        Connection.sendOperation("SYNC_PLAYER", {
            uuid: Connection.getUser().id,
            posX: this.sprite.x,
            posY: this.sprite.y,
            velX: this.sprite.body.velocity.x,
            velY: this.sprite.body.velocity.y,
            mode: this.getMode(),
            anim: animationinfo.toString(),
            frame: animationinfo.frame,
            flip: this.sprite.flipX,
            life: this.getLife(),
            keys: this.arrayKeys
        });
    }

    /**
     * Detiene la sincronización de datos con el servidor
     */
    public stopSync() {
        clearInterval(this.syncInterval);
    }
}