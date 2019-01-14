const game = new Phaser.Game({
    // Tamaño del lienzo
    width: 800,
    height: 600,
    // Referencia al lienzo
    canvas: document.getElementById("gameCanvas"),
    // Modo de renderizado de Phaser. Usamos el modo Canvas porque en modo WebGL los tiles provocan lag.
    type: Phaser.CANVAS,
    // Información sobre el juego
    title: "Sweeper",
    version: "0.2.0",
    // Base de la física del juego. Usamos arcade pero sin gravedad porque es la base que más
    // se ajusta a la idea de exploración en vista cenital que buscamos.
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    // Desactivamos el antialiasing por ahora
    pixelArt: true,
    // Referencia a las escenas del juego
    scene: [new SceneServer(),
        new SceneTitle(),
        new SceneMenu(),
        new SceneMultiplayerMenu(),
        new SceneOverworld(new Room("mainroom", {
            tilemap: "Mapa.json",
            tileset: "tileset.png"
        })),
        new SceneGUI(),
        new SceneGameOver(),
        new SceneGameVictory(),
        new SceneGameDisconect()]
});
// Mostrar en la pestaña los datos del juego
document.title = game.config.gameTitle + " " + game.config.gameVersion;
// Indicar en la pestaña si es un server
if (SERVER) {
    document.title += " (SERVER)";
}
// Inicializamos la conexión cuando cargue el documento
$(document).ready(function () {
    Connection.initialize();
}).on("keydown", function (event) {
    if (event.key == "Enter") {
        if (chat) {
            Chat.onclickEnviar();
        }
    }
});
Connection.onInitialized(function () {
    chat = new Chat();
    chat.startUpdating();
});
//# sourceMappingURL=main.js.map