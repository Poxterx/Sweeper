// CONFIGURACIÓN DEL JUEGO
const game = new Phaser.Game({
    // Tamaño del lienzo
    width: 800,
    height: 600,
    // Referencia al lienzo
    canvas: document.getElementById("gameCanvas"),
    // Modo de renderizado de Phaser
    type: Phaser.AUTO,
    // Información sobre el juego
    title: "Sweeper",
    version: "0.0.1",
    // Base de la física del juego. Usamos arcade pero sin gravedad porque es la base que más
    // se ajusta a la idea de exploración en vista cenital que buscamos
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    // Referencia a las escenas del juego. De momento sólo está la escena principal
    scene: new SceneOverworld(1500, 1500)
});
// Mostrar en la pestaña los datos del juego
document.title = game.config.gameTitle + " " + game.config.gameVersion;
//# sourceMappingURL=main.js.map