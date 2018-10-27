// CONFIGURACIÓN DEL JUEGO

const game = new Phaser.Game({

    // Tamaño del lienzo
    width: 800,
    height: 600,

    // Referencia al lienzo
    canvas: document.getElementById("gameCanvas") as HTMLCanvasElement,

    // Modo de renderizado de Phaser. Usamos el modo Canvas porque en modo WebGL los tiles provocan lag.
    type: Phaser.CANVAS,

    // Información sobre el juego
    title: "Sweeper",
    version: "0.0.6c",

    // Base de la física del juego. Usamos arcade pero sin gravedad porque es la base que más
    // se ajusta a la idea de exploración en vista cenital que buscamos.
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 0}
        }
    },

    // Desactivamos el antialiasing por ahora
    pixelArt: true,

    // Referencia a las escenas del juego
    scene: [new SceneTitle(),
            new SceneOverworld(new Room("mainroom", {
                tilemap: "Test.json",
                tileset: "test_tileset.png"
            })),
            new SceneGUI()]
});

// Mostrar en la pestaña los datos del juego
document.title = game.config.gameTitle + " " + game.config.gameVersion;