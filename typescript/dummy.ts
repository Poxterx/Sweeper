class Dummy extends Entity {

    /**
     * Entidad inmóvil que intentará permanecer en su posición inicial, pensada para probar
     * las colisiones entre entidades. Se puede asignar una configuración específica a cada
     * instancia, pero si no se asigna, la instancia usará la configuración predeterminada
     * de su clase
     * @param scene Referencia a la escena donde se creará esta entidad
     * @param config Opciones específicas para esta instancia en particular
     */
    constructor(scene :SceneOverworld, config? :EntityConfig) {
        super(scene, config? config : {
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
                x: 600,
                y: 600
            }
        });
    }
    protected controlTarget() {
        // Intentamos que el dummy se quede en su posición inicial
        this.target = new Phaser.Math.Vector2(this.config.startingPosition);
    }
}