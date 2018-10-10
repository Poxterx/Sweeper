class Player extends Entity {
    constructor(config) {
        super(config);
    }
    create(scene) {
        super.create(scene);
        // Alguien tiene que inicializar al intermediario de input de Phaser
        this.arrowKeys = scene.input.keyboard.createCursorKeys();
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
        if (this.arrowKeys.left.isDown)
            vector.x = -delta;
        else if (this.arrowKeys.right.isDown)
            vector.x = delta;
        if (this.arrowKeys.up.isDown)
            vector.y = -delta;
        else if (this.arrowKeys.down.isDown)
            vector.y = delta;
        // Movemos al target a la posición del jugador y le sumamos el vector calculado anteriormente
        this.target = this.sprite.body.center.clone();
        this.target.add(new Phaser.Math.Vector2(vector));
    }
}
//# sourceMappingURL=player.js.map