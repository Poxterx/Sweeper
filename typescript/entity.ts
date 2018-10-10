type EntityConfig = {
    path :string, // Ruta donde se almacena el sprite de la entidad
    name :string, // Nombre con el que se identifica la identidad
    frameWidth :integer, // Ancho de los fotogramas
    frameHeight :integer, // Alto de los fotogramas
    frameRate :integer, // Velocidad de la animación
    animations? :{
        up: integer[], // Animación cuando camina hacia arriba (espalda)
        down: integer[], // Animación cuando camina hacia abajo (frente)
        side: integer[] // Animacion cuando camina hacia la derecha, también usada para la izquierda
    }
}

abstract class Entity {
    
    /**
     * Referencia al objeto de gráficos de esta entidad, para dibujar el target
     */
    private graphics :Phaser.GameObjects.Graphics;
    /**
     * Última posición del target respecto a la posición de la entidad, para usar en animación
     */
    private oldTargetDelta :Phaser.Math.Vector2;

    /**
     * Nombre que identifica a esta entidad
     */
    protected name :string;
    /**
     * Objeto de configuración con el que se inicializó esta entidad
     */
    protected config :EntityConfig;
    /**
     * Sprite del sistema de físicas de Phaser que maneja esta entidad
     */
    protected sprite :Phaser.Physics.Arcade.Sprite;
    /**
     * Punto del mundo al que debe dirigirse esta entidad
     */
    protected target :Phaser.Math.Vector2;


    constructor(config :EntityConfig) {
        this.name = config.name;
        this.config = config;
    }

    /**
     * Prepara los recursos que necesite esta entidad para una escena
     * @param scene Referencia a la escena en cuestión
     */
    preload(scene :Phaser.Scene) {
        // Cargamos el sprite en la escena
        scene.load.spritesheet(this.name, this.config.path, {
            frameWidth: this.config.frameWidth, frameHeight: this.config.frameHeight});
    }

    /**
     * Inicializa los recursos preparados con preload()
     * @param scene Referencia a la escena donde tiene preparados los recursos
     */
    create(scene :Phaser.Scene) {
        // Introducimos el sprite en el sistema de físicas de Phaser
        this.sprite = scene.physics.add.sprite(400, 300, this.name, 0);
        // Le impedimos salirse del área jugable
        this.sprite.setCollideWorldBounds(true);
        // Cargamos las animaciones
        this.loadAnimations(scene);

        // En principio, la entidad no debe dirigirse a ningún punto. Su target es su propia ubicación
        this.target = this.sprite.body.position;
        // Por tanto, ahora mismo el target respecto a su propia posición es el vector nulo
        this.oldTargetDelta = Phaser.Math.Vector2.ZERO;
        // Inicializamos el objeto de gráficos
        this.graphics = scene.make.graphics(this.target);
    }

    /**
     * Actualiza la entidad en cada fotograma de una escena
     * @param scene Referencia a la escena en cuestión
     */
    update(scene :Phaser.Scene) {
        // Primero seleccionamos el nuevo target que la entidad debe perseguir en este fotograma
        this.controlTarget();
        // Luego lo dibujamos por razones de depuración. En la versión final esta llamada se eliminará
        this.drawTarget();
        // Elegimos la animación correspondiente para que la entidad mire hacia el target
        this.turnToTarget();
        // Finalmente, movemos la entidad hacia el target
        this.pursueTarget();
    }

    /**
     * Calcula la nueva posición del target. Su implementación depende del subtipo de entidad
     */
    protected abstract controlTarget();

    /**
     * Mueve la entidad hacia su target
     */
    private pursueTarget() {
        // Velocidad a la que se va a mover
        var speed = 300;
        // Esto lo hacemos debido a que this.sprite.body podría ser un cuerpo dinámico o estático, y en
        // caso de que sea estático no podemos aplicarle un cambio de velocidad. Con este casting
        // garantizamos que es dinámico (Body) y no estático (StaticBody)
        var body = this.sprite.body as Phaser.Physics.Arcade.Body;
        // Dirección en la que se va a mover
        var deltaVector = {
            x: this.target.x - this.sprite.body.center.x,
            y: this.target.y - this.sprite.body.center.y
        }

        // Aplica a la entidad la velocidad y dirección seleccionados anteriormente
        body.setVelocity(speed * Math.sign(deltaVector.x), speed * Math.sign(deltaVector.y));
    }

    /**
     * Selecciona la animación adecuada para que la entidad mire hacia su target
     */
    private turnToTarget() {
        // Calculamos el target respecto a la posición de la entidad. La llamada a 'clone()' se hace
        // porque en Phaser, las operaciones de vectores como 'add' o 'subtract' modifican el vector
        // base en lugar de devolver el resultado sin modificar los operandos, que es lo que uno esperaría
        var targetDelta = this.target.clone().subtract(this.sprite.body.center);

        // Si el target no se ha movido respecto a la entidad desde el frame anterior...
        if(targetDelta.equals(this.oldTargetDelta)) {
            // Aquí no pintamos nada
            return;
        }

        // Si el target es justamente el punto donde ya se encuentra la entidad...
        if(targetDelta.equals(Phaser.Math.Vector2.ZERO)) {
            // La entidad no tiene que ir a ningún sitio y puede pararse

            // Paramos a la entidad en el primer fotograma de la animación actual.
            // Esto lo hacemos viendo si existe una animación actual, reproduciéndola, y
            // deteniéndola inmediatamente
            if(this.sprite.anims.getCurrentKey())
                this.sprite.anims.play(this.sprite.anims.getCurrentKey());
            this.sprite.anims.stop();

            // Indicamos al siguiente frame que no hay desfase entre la posición de la entidad y su target
            this.oldTargetDelta = Phaser.Math.Vector2.ZERO;
            // Eso es todo
            return;
        }

        // Si se está moviendo a la izquierda en este frame, pero o no lo estaba haciendo en el frame
        // anterior o ha dejado de moverse en vertical
        if(targetDelta.x < 0 && (targetDelta.x != this.oldTargetDelta.x || targetDelta.y == 0)) {
            // Ponemos la animación de moverse a la izquierda, que es la animación de moverse a la
            // derecha pero volteada horizontalmente
            this.sprite.flipX = true;
            this.sprite.anims.play(this.name+"@side");

        // Si se está moviendo a la derecha en este frame, pero o no lo estaba haciendo en el frame
        // anterior o ha dejado de moverse en vertical
        } else if(targetDelta.x > 0 && (targetDelta.x != this.oldTargetDelta.x || targetDelta.y == 0)) {
            // Ponemos la animación de moverse a la derecha
            this.sprite.flipX = false;
            this.sprite.anims.play(this.name+"@side");
        }

        // Si se está moviendo hacia arriba en este frame, pero o no lo estaba haciendo en el frame
        // anterior o ha dejado de moverse en horizontal
        if(targetDelta.y < 0 && (targetDelta.y != this.oldTargetDelta.y || targetDelta.x == 0)) {
            // Ponemos la animación de moverse hacia arriba
            this.sprite.flipX = false;
            this.sprite.anims.play(this.name+"@up");

        // Si se está moviendo hacia abajo en este frame, pero o no lo estaba haciendo en el frame
        // anterior o ha dejado de moverse en horizontal
        } else if(targetDelta.y > 0 && (targetDelta.y != this.oldTargetDelta.y || targetDelta.x == 0)) {
            // Ponemos la animación de moverse hacia abajo
            this.sprite.flipX = false;
            this.sprite.anims.play(this.name+"@down");
        }

        // Estas comprobaciones están pensadas para garantizar que, cada vez que el target se mueva,
        // el giro de la entidad refleje ese movimiento. Por ejemplo, el jugador siempre miraría a la
        // derecha al pulsar el botón correspondiente, independientemente de su estado de movimiento

        // Indicamos al próximo frame el desfase actual entre el target y la posición
        this.oldTargetDelta = targetDelta;
    }

    /**
     * Dibuja una cruz en la posición del target. Esta función está pensada únicamente para usarse por
     * razones de depuración y no debe usarse en la versión final del juego
     */
    private drawTarget() {
        // Borramos todo lo dibujado en el frame anterior
        this.graphics.clear();
        // Nos colocamos justo en el target
        this.graphics.setPosition(this.target.x, this.target.y);
        // Dibujamos una cruz blanca
        this.graphics.lineStyle(5, 0xFFFFFF);
        this.graphics.beginPath();
        this.graphics.moveTo(-5, 0);
        this.graphics.lineTo(5, 0);
        this.graphics.moveTo(0, -5);
        this.graphics.lineTo(0, 5);
        this.graphics.lineStyle(3, 0xFFFFFF);

        // Dibujamos una línea entre el target actual y el target del frame anterior, para
        // apreciar los cambios visualmente
        var targetDelta = this.target.clone().subtract(this.sprite.body.center);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(
            this.oldTargetDelta.x - targetDelta.x,
            this.oldTargetDelta.y - targetDelta.y);

        // Terminamos el dibujo y lo enviamos al lienzo
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    /**
     * Carga las animaciones indicadas en la configuración de esta entidad en una escena
     * @param scene Referencia a la escena en cuestión
     */
    private loadAnimations(scene :Phaser.Scene) {
        // Si no hay datos de animación en la configuración
        if(!this.config.animations) {
            // No podemos hacer nada
            return;
        }

        // Caminar hacia arriba
        scene.anims.create({
            key: this.name+"@up",
            frames: scene.anims.generateFrameNumbers(this.name, {frames: this.config.animations.up}),
            frameRate: this.config.frameRate,
            repeat: -1
        });

        // Caminar hacia abajo
        scene.anims.create({
            key: this.name+"@down",
            frames: scene.anims.generateFrameNumbers(this.name, {frames: this.config.animations.down}),
            frameRate: this.config.frameRate,
            repeat: -1
        });

        // Caminar hacia el lado (hacia la derecha en particular, pero se usa también para la izquierda)
        scene.anims.create({
            key: this.name+"@side",
            frames: scene.anims.generateFrameNumbers(this.name, {frames: this.config.animations.side}),
            frameRate: this.config.frameRate,
            repeat: -1
        });
    }
}