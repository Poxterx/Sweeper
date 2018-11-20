class Weapon {
    /**
     * Crea un arma con las opciones pasadas como parámetro
     * @param entity Entidad que porta el arma
     * @param config Objeto que contiene las opciones mencionadas
     */
    constructor(entity, config) {
        this.name = config.name;
        this.damage = config.damage;
        this.cooldown = false;
        this.config = config;
        this.scene = entity.scene;
        this.entity = entity;
    }
    /**
     * Carga los recursos necesarios para el arma
     */
    preload() {
        // Cargamos el spritesheet indicado
        this.scene.load.spritesheet(this.name, "assets/sprites/" + this.config.path, {
            frameWidth: this.config.frameWidth, frameHeight: this.config.frameHeight
        });
    }
    /**
     * Inicializa los recursos preparados con preload()
     */
    create() {
        // Introducimos el sprite en el sistema de físicas de Phaser. La posición
        // es irrelevante porque se modificará en update().
        this.sprite = this.scene.physics.add.sprite(0, 0, this.name, 0);
        // Nos aseguramos de que todos los parámetros opcionales tienen valor
        // aunque no hayan sido especificados desde fuera
        this.setDefaultValues();
        // Ahora que tenemos todos los parámetros de configuración podemos cargar las animaciones
        this.loadAnimations();
        this.scene.physics.add.overlap;
    }
    /**
     * Actualizamos el arma en cada fotograma
     */
    update() {
        // Si la entidad que tiene este arma está muerta no hay nada que hacer
        if (this.entity.dead) {
            return;
        }
        // Vamos a calcular el desfase que hay entre la posición del arma y el jugador que la porta
        // en este fotograma, teniendo en cuenta su dirección y su animación. Empezamos partiendo
        // de que no hay desfase (y, por tanto, el arma está en el mismo punto que el jugador).
        var offset = { x: 0, y: 0, z: 0 };
        // Para saber qué animación poner al arma tenemos que saber también el modo del jugador
        var mode = this.entity.currentAnimationInfo().mode;
        // Comprobamos en qué dirección está mirando el jugador
        switch (this.entity.getDirection()) {
            // Si está mirando en cierta dirección:
            // Indicamos si el sprite del arma debe estar volteado;
            // Le asignamos el desfase que indique la configuración.
            case "left":
                this.sprite.flipX = true;
                offset = this.config.offset[mode].side[this.entity.currentAnimationInfo().frame];
                break;
            case "right":
                this.sprite.flipX = false;
                offset = this.config.offset[mode].side[this.entity.currentAnimationInfo().frame];
                break;
            case "up":
                this.sprite.flipX = false;
                offset = this.config.offset[mode].up[this.entity.currentAnimationInfo().frame];
                break;
            case "down":
                this.sprite.flipX = false;
                offset = this.config.offset[mode].down[this.entity.currentAnimationInfo().frame];
                break;
        }
        // Ponemos la misma animación que tiene el jugador en el arma
        this.sprite.anims.play(this.entity.currentAnimationInfo().toString(this.name), false, this.entity.currentAnimationInfo().frame);
        // A partir de aquí vamos a modificar las coordenadas del desplazamiento. Como la variable
        // offset representa parte de la información de las animaciones, al modificarla también
        // podemos modificar dicha información. Para evitar esto, hacemos una copia del desfase
        // calculado que podemos modificar libremente.
        offset = clone(offset);
        if (!offset) {
            offset = {
                x: 0,
                y: 0,
                z: 0
            };
        }
        // Si el arma tiene que estar volteada horizontalmente...
        if (this.sprite.flipX) {
            // Es porque el personaje está mirando hacia la izquierda. Como nuestros cálculos
            // parten de que el personaje mira a la derecha, tenemos que voltear todo horizontalmente.
            offset.x *= -1;
            // Si el jugador está girado respecto a cómo esperábamos tenerlo, también
            // conviene tener en cuenta que eso afecta a la profundidad.
            offset.z *= -1;
        }
        // Por último, colocamos el arma junto al jugador atendiendo a todos los cálculos previos
        this.sprite.setPosition(this.entity.getPosition().x + offset.x, this.entity.getPosition().y + offset.y);
        this.sprite.depth = this.entity.sprite.depth + offset.z;
        //Se comprueba si el arma está en ataque para ejecutar las funciones correspondientes.
        if (this.entity.getMode() === "attack") {
            this.auxOnHit();
        }
        else {
            this.cooldown = false;
        }
    }
    /**
     * Asigna valores predeterminados a los parámetros opcionales de la configuración
     */
    setDefaultValues() {
        // Si no hay información de animación, entonces todas las animaciones muestran
        // únicamente el primer fotograma
        if (!this.config.animations) {
            this.config.animations = {
                walk: {
                    up: [0],
                    down: [0],
                    side: [0]
                }
            };
        }
        // Si no hay información de la animación de atacar, entonces copiamos la de caminar
        if (!this.config.animations.attack) {
            this.config.animations.attack = clone(this.config.animations.walk);
        }
        // Si no hay información del desplazamiento, entonces no podemos hacer más que
        // asumir que no hay
        if (!this.config.offset) {
            this.config.offset = {
                walk: {
                    up: [{ x: 0, y: 0, z: 0 }],
                    down: [{ x: 0, y: 0, z: 0 }],
                    side: [{ x: 0, y: 0, z: 0 }]
                }
            };
        }
        // Si no hay información del desplazamiento durante el ataque, copiamos el
        // desplazamiento que tenemos de caminar
        if (!this.config.offset.attack) {
            this.config.offset.attack = clone(this.config.offset.walk);
        }
    }
    /**
     * Carga las animaciones preparadas en la configuración de este arma
     */
    loadAnimations() {
        // Si no hay datos de animación en la configuración
        if (!this.config.animations) {
            // No podemos hacer nada
            return;
        }
        // Atajo conveniente para referirnos a las animaciones de la configuración
        var anims = this.config.animations;
        // Animaciones cuando el jugador camina
        addAnimation(this.scene, this.name, "walk", "up", anims.walk.up);
        addAnimation(this.scene, this.name, "walk", "down", anims.walk.down);
        addAnimation(this.scene, this.name, "walk", "side", anims.walk.side);
        // Animaciones cuando el jugador ataca
        addAnimation(this.scene, this.name, "attack", "up", anims.attack.up);
        addAnimation(this.scene, this.name, "attack", "down", anims.attack.down);
        addAnimation(this.scene, this.name, "attack", "side", anims.attack.side);
    }
    /**
     * Función auxiliar que se encarga de comprobar si el arma choca con alguna de las entidades
     * de la escena. Comprueba si las entidades hacen overlap, si la entidad que porta el arma
     * está atacando, y si el cooldown del ataque no está activo
     */
    auxOnHit() {
        for (let entity of this.scene.entities) {
            if (this.scene.physics.overlap(this.sprite, entity.sprite) &&
                (this.entity.getMode() === "attack") &&
                (this.cooldown === false)) {
                if (entity.sprite != this.entity.sprite) {
                    this.onHit(entity);
                }
            }
        }
    }
    /**
     * Función que se ejecuta cuando el arma golpea a una entidad
     * @param victim La entidad golpeada con el arma
     */
    onHit(victim) {
        // Solo activamos el ataque durante un fotograma en concreto
        if (AnimationInfo.current(this.sprite.anims).frame == 2) {
            victim.setLife(victim.getLife() - this.damage);
            this.cooldown = true;
        }
    }
}
//# sourceMappingURL=weapon.js.map