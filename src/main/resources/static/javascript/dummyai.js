class DummyAI extends Entity {
    /**
     * Entidad pensada para probar el algoritmo de pathfinding, que al pulsar una tecla
     * busca un punto aleatorio nuevo de la sala actual al que dirigirse
     * con una ruta inteligente.
     * @param scene La escena a la que pertenece esta entidad
     * @param config Opciones específicas para esta instancia en particular
     */
    constructor(scene, config) {
        super(scene, config ? config : {
            name: "dummyai",
            path: "testcharacter.png",
            frameWidth: 84,
            frameHeight: 120,
            frameRate: 10,
            speed: 200,
            animations: {
                walk: {
                    up: [0],
                    down: [1],
                    side: [3]
                }
            },
            startingPosition: {
                x: 1664,
                y: 2304
            }
        });
    }
    create() {
        super.create();
        // Iniciamos esta entidad dándole una ruta nueva
        this.createNewPath();
        // Y le asignamos la posibilidad de que al pulsar la tecla B pueda crear otra ruta
        this.scene.input.keyboard.on("keydown_B", () => this.createNewPath.call(this));
    }
    update() {
        super.update();
        // Si estamos en modo debug dibujamos la ruta actual. Si no, la superclase ya se encarga
        // de borrar los gráficos dibujados anteriormente
        if (DEBUG)
            this.path.draw(this.graphics);
    }
    /**
     * Mueve el target a lo largo de la ruta inteligente para seguirla
     */
    controlTarget() {
        // Como tolerancia, permitimos que esté alejada como mucho medio tile de su target
        // antes de buscar el siguiente punto
        var tolerance = TILE_SIZE * 0.5;
        // Si todavía quedan puntos por recorrer de la ruta y la entidad ya está lo
        // suficientemente cerca del actual
        if (!this.path.isDone() && this.target.distance(this.sprite.body.center) <= tolerance) {
            // Debe dirigirse al siguiente punto
            this.target = new Phaser.Math.Vector2(this.path.next());
        }
    }
    /**
     * Genera una nueva ruta inteligente para seguirla
     */
    createNewPath() {
        // Buscamos un punto aleatorio de la sala
        var newDest;
        // Y lo intentamos 100 veces...
        for (let i = 0; i < 100; i++) {
            newDest = {
                x: Math.random() * this.scene.room.size.x,
                y: Math.random() * this.scene.room.size.y
            };
            // ... porque no necesariamente tiene que salir un tile pasable a la primera
            if (!this.scene.room.getColliderTileAt(pixelToTilePosition(newDest))
                .properties.Solid) {
                // Pero si ha salido ya no hace falta seguir buscando
                break;
            }
        }
        // Ya podemos crear la ruta hacia ese punto
        this.path = new Path(this, newDest);
        // Y mientras no sea imposible de seguir...
        if (!this.path.isImpossible()) {
            // ... podemos empezamos a seguirla
            this.target = new Phaser.Math.Vector2(this.path.next());
        }
    }
}
//# sourceMappingURL=dummyai.js.map