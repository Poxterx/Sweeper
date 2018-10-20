class Entity extends Phaser.GameObjects.GameObject {
    /**
     * Crea una entidad basada en las opciones pasadas como parámetro
     * @param config Objeto que contiene dichas opciones
     */
    constructor(scene, config) {
        super(scene, "entity");
        this.name = config.name;
        this.config = config;
        this.scene = scene;
    }
    /**
     * Prepara los recursos que necesite esta entidad
     */
    preload() {
        // Cargamos el sprite en la escena
        this.scene.load.spritesheet(this.name, "assets/sprites/" + this.config.path, {
            frameWidth: this.config.frameWidth, frameHeight: this.config.frameHeight
        });
    }
    /**
     * Inicializa los recursos preparados con preload()
     */
    create() {
        // Introducimos el sprite en el sistema de físicas de Phaser
        this.sprite = this.scene.physics.add.sprite(this.config.startingPosition.x, this.config.startingPosition.y, this.name, 0);
        // Le impedimos salirse del área jugable
        this.sprite.setCollideWorldBounds(true);
        // Le damos valor a todas las propiedades opcionales que se podrían no haber especificado.
        // No lo hacemos antes porque el valor por defecto de la caja de colisiones requiere que el
        // sprite ya haya sido cargado y añadido al sistema de físicas, razón por la cual las
        // propiedades relacionadas con el sprite no son opcionales.
        this.setDefaultValues();
        // Cargamos las animaciones
        this.loadAnimations(this.scene);
        // Le ponemos la caja de colisiones indicada en la configuración
        this.setCollisionBox();
        // En principio, la entidad no debe dirigirse a ningún punto. Su target es su propia ubicación
        this.target = this.sprite.body.center;
        // Por tanto, ahora mismo el target respecto a su propia posición es el vector nulo
        this.oldTargetDelta = Phaser.Math.Vector2.ZERO;
        // Inicializamos el objeto de gráficos
        this.graphics = this.scene.make.graphics(this.target);
    }
    /**
     * Actualiza la entidad en cada fotograma de una escena
     */
    update() {
        // Primero seleccionamos el nuevo target que la entidad debe perseguir en este fotograma
        this.controlTarget();
        // Luego lo dibujamos por razones de depuración. En la versión final esta llamada se eliminará
        this.drawTarget();
        // Elegimos la animación correspondiente para que la entidad mire hacia el target
        this.turnToTarget();
        // Finalmente, movemos la entidad hacia el target
        this.pursueTarget();
        // Y ahora que la entidad se ha movido le ponemos la profundidad adecuada para que se
        // renderice delante de lo que tiene detrás y viceversa
        this.sprite.depth = this.sprite.body.center.y;
    }
    /**
     * Devuelve la posición del centro del sprite de esta entidad
     */
    getPosition() {
        return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    }
    /**
     * Devuelve un string que indica la dirección en la que está mirando la entidad
     */
    getDirection() {
        if (!this.sprite.anims.currentAnim) {
            return "up";
        }
        var key = this.sprite.anims.currentAnim.key.split("@")[1].toLowerCase();
        var ret = null;
        if (key == "side") {
            if (this.sprite.flipX)
                ret = "left";
            else
                ret = "right";
        }
        else {
            ret = key;
        }
        return ret;
    }
    /**
     * Devuelve la posición del fotograma actual en el array de la animación que tenga el sprite
     * de la entidad en este momento
     */
    getAnimationFrame() {
        if (!this.sprite.anims.currentFrame)
            return 0;
        else
            return this.sprite.anims.currentFrame.index - 1;
    }
    /**
     * Asigna valores por defecto a las propiedades opcionales no especificadas en la configuración
     */
    setDefaultValues() {
        // Si no hay información sobre las animaciones, entonces todas las animaciones muestran
        // únicamente el primer fotograma
        if (!this.config.animations) {
            this.config.animations = {
                up: [0],
                down: [0],
                side: [0]
            };
        }
        // Si no hay posición inicial, la posición inicial es (0, 0)
        if (!this.config.startingPosition) {
            this.config.startingPosition = {
                x: 0,
                y: 0
            };
        }
        // Si no hay velocidad, la velocidad es 100 píxeles por segundo
        if (!this.config.speed) {
            this.config.speed = 100;
        }
        // Si no hay caja de colisiones, la caja de colisiones será
        // una base cuadrada en la parte inferior del sprite
        if (!this.config.collisionBox) {
            this.config.collisionBox = {
                x: 0,
                y: this.sprite.height - this.config.frameWidth,
                width: this.config.frameWidth,
                height: this.config.frameWidth
            };
        }
    }
    /**
     * Modifica la forma de la caja de colisiones en el sistema de Phaser de acuerdo con el objeto
     * de configuración de esta entidad
     */
    setCollisionBox() {
        var body = this.sprite.body;
        var collider = this.config.collisionBox;
        body.setSize(collider.width, collider.height);
        body.setOffset(collider.x, collider.y);
    }
    /**
     * Mueve la entidad hacia su target
     */
    pursueTarget() {
        // Velocidad a la que se va a mover
        var speed = this.config.speed;
        // Esto lo hacemos debido a que this.sprite.body podría ser un cuerpo dinámico o estático, y en
        // caso de que sea estático no podemos aplicarle un cambio de velocidad. Con este casting
        // garantizamos que es dinámico (Body) y no estático (StaticBody)
        var body = this.sprite.body;
        // Dirección en la que se va a mover
        var deltaVector = new Phaser.Math.Vector2(this.target.x - this.sprite.body.center.x, this.target.y - this.sprite.body.center.y);
        // Si el movimiento en cada eje se procesa por separado, entonces es posible que la entidad
        // se mueva con más velocidad si camina en diagonal que si lo hace en ortogonal. Para evitar
        // este problema, reducimos la velocidad en el caso de caminar en los dos ejes a la vez.
        var modifier = {
            x: deltaVector.y == 0 ? 1 : Math.cos(Math.PI * 0.25),
            y: deltaVector.x == 0 ? 1 : Math.sin(Math.PI * 0.25)
        };
        // Desfase permitido entre el target y la posición de la entidad. La entidad no tiene que buscar
        // estar en el píxel exacto que indica su target, basta con que se quede suficientemente cerca.
        var tolerance = 5;
        // Aplicamos dicho cálculo por separado en cada coordenada del vector modifier
        for (let coordinate in modifier) {
            if (Math.abs(deltaVector[coordinate]) <= tolerance)
                modifier[coordinate] = 0;
        }
        // Aplica a la entidad la velocidad y dirección seleccionados anteriormente
        body.setVelocity(modifier.x * speed * Math.sign(deltaVector.x), modifier.y * speed * Math.sign(deltaVector.y));
    }
    /**
     * Selecciona la animación adecuada para que la entidad mire hacia su target
     */
    turnToTarget() {
        // Calculamos el target respecto a la posición de la entidad. La llamada a 'clone()' se hace
        // porque en Phaser, las operaciones de vectores como 'add' o 'subtract' modifican el vector
        // base en lugar de devolver el resultado sin modificar los operandos, que es lo que uno esperaría
        var targetDelta = this.target.clone().subtract(this.sprite.body.center);
        // Este cálculo puede dar resultados imprecisos con muchos decimales, por ello conviene
        // que redondeemos el vector y trabajemos sólo con enteros
        targetDelta.set(Math.round(targetDelta.x), Math.round(targetDelta.y));
        // Si el target no se ha movido respecto a la entidad desde el frame anterior...
        if (targetDelta.equals(this.oldTargetDelta)) {
            // Aquí no pintamos nada
            return;
        }
        // Si el target es justamente el punto donde ya se encuentra la entidad...
        if (targetDelta.equals(Phaser.Math.Vector2.ZERO)) {
            // La entidad no tiene que ir a ningún sitio y puede pararse
            // Paramos a la entidad en el primer fotograma de la animación actual.
            // Esto lo hacemos viendo si existe una animación actual, reproduciéndola, y
            // deteniéndola inmediatamente
            if (this.sprite.anims.getCurrentKey())
                this.sprite.anims.play(this.sprite.anims.getCurrentKey());
            this.sprite.anims.stop();
            // Indicamos al siguiente frame que no hay desfase entre la posición de la entidad y su target
            this.oldTargetDelta = Phaser.Math.Vector2.ZERO;
            // Eso es todo
            return;
        }
        // En las siguientes operaciones vamos a comprobar si la entidad comparte alguna coordenada con
        // su target, pero no necesitamos que estén alineados al píxel. Por esta razón le añadimos tolerancia.
        var tolerance = 5;
        // Primero elegimos el eje en el que va a mirar la entidad
        if (this.isPreferredAxis(targetDelta.x, targetDelta.y, this.oldTargetDelta.x, tolerance)) {
            // Aquí, el eje escogido es el eje X. Ignoramos el desfase del target en el eje Y
            // Ponemos la animación de moverse a la derecha
            this.sprite.anims.play(this.name + "@side");
            // Si el target queda a la izquierda
            if (targetDelta.x < 0) {
                // Entonces la animación está mirando hacia el lado contrario. La volteamos
                this.sprite.flipX = true;
                // Si el target queda a la derecha
            }
            else if (targetDelta.x > 0) {
                // Entonces la animación está mirando hacia el lado correcto
                this.sprite.flipX = false;
            }
        }
        else if (this.isPreferredAxis(targetDelta.y, targetDelta.x, this.oldTargetDelta.y, tolerance)) {
            // Aquí, el eje escogido es el eje Y. Ignoramos el desfase del target en el eje X
            // Si el target queda hacia arriba
            if (targetDelta.y < 0) {
                // Ponemos la animación de moverse hacia arriba
                this.sprite.anims.play(this.name + "@up");
                // Si el target queda hacia abajo
            }
            else if (targetDelta.y > 0) {
                // Ponemos la animación de moverse hacia abajo
                this.sprite.anims.play(this.name + "@down");
            }
            // Estas animaciones no necesitan volteo horizontal
            this.sprite.flipX = false;
        }
        // Indicamos al próximo frame el desfase actual entre el target y la posición
        this.oldTargetDelta = targetDelta;
    }
    /**
     * Indica si el eje al que corresponde el valor indicado sería el eje elegido para que la entidad
     * mire en su dirección, teniendo en cuenta la posición actual del target (thisAxis, otherAxis) y
     * el valor del eje seleccionado en el frame anterior (oldAxis).
     *
     * El eje preferido será el último eje donde el target se haya alejado de la entidad. Nótese que
     * es posible que la entidad se gire hacia el eje que tiene menos desfase, por el hecho de ser el que
     * ha cambiado más recientemente. Esto es intencional, y está pensado para que, en el caso del jugador,
     * la entidad gire inmediatamente en cuanto el usuario pulse una tecla nueva. Alternativamente,
     * cuando no hay desfase en un eje, se escoge automáticamente el otro. Esto es necesario comprobarlo
     * por si, de nuevo en el caso del jugador, se estaba moviendo en diagonal y el usuario ha soltado una tecla.
     *
     * @param thisAxis La coordenada del target en el eje a comprobar
     * @param otherAxis La coordenada del target en el otro eje
     * @param oldAxis La coordenada del target en el eje a comprobar en el frame anterior
     * @param tolerance Valor máximo permitido para considerarse como cero
     */
    isPreferredAxis(thisAxis, otherAxis, oldAxis, tolerance = 0) {
        return Math.abs(thisAxis) > Math.abs(oldAxis)
            || Math.abs(thisAxis) == Math.abs(oldAxis)
                && Math.sign(thisAxis) != Math.sign(oldAxis)
            || Math.abs(otherAxis) <= tolerance;
    }
    /**
     * Dibuja una cruz en la posición del target. Esta función está pensada únicamente para usarse por
     * razones de depuración y no debe usarse en la versión final del juego
     */
    drawTarget() {
        // Borramos todo lo dibujado en el frame anterior
        this.graphics.clear();
        // Nos colocamos justo en el target
        this.graphics.setPosition(this.target.x, this.target.y);
        // Garantizamos que lo que vayamos a dibujar se dibuje delante de lo que ya hay dibujado
        this.graphics.depth = Infinity;
        // Dibujamos una cruz blanca
        this.graphics.lineStyle(5, 0xFFFFFF);
        this.graphics.beginPath();
        this.graphics.moveTo(-5, 0);
        this.graphics.lineTo(5, 0);
        this.graphics.moveTo(0, -5);
        this.graphics.lineTo(0, 5);
        // Dibujamos una línea entre el target actual y el target del frame anterior, para
        // apreciar los cambios visualmente
        this.graphics.lineStyle(3, 0xFFFFFF);
        var targetDelta = this.target.clone().subtract(this.sprite.body.center);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(this.oldTargetDelta.x - targetDelta.x, this.oldTargetDelta.y - targetDelta.y);
        // Terminamos el dibujo y lo enviamos al lienzo
        this.graphics.closePath();
        this.graphics.strokePath();
    }
    /**
     * Carga las animaciones indicadas en la configuración de esta entidad en una escena
     * @param scene Referencia a la escena en cuestión
     */
    loadAnimations(scene) {
        // Si no hay datos de animación en la configuración
        if (!this.config.animations) {
            // No podemos hacer nada
            return;
        }
        // Caminar hacia arriba
        scene.anims.create({
            key: this.name + "@up",
            frames: scene.anims.generateFrameNumbers(this.name, { frames: this.config.animations.up }),
            frameRate: this.config.frameRate,
            repeat: -1
        });
        // Caminar hacia abajo
        scene.anims.create({
            key: this.name + "@down",
            frames: scene.anims.generateFrameNumbers(this.name, { frames: this.config.animations.down }),
            frameRate: this.config.frameRate,
            repeat: -1
        });
        // Caminar hacia el lado (hacia la derecha en particular, pero se usa también para la izquierda)
        scene.anims.create({
            key: this.name + "@side",
            frames: scene.anims.generateFrameNumbers(this.name, { frames: this.config.animations.side }),
            frameRate: this.config.frameRate,
            repeat: -1
        });
    }
}
//# sourceMappingURL=entity.js.map