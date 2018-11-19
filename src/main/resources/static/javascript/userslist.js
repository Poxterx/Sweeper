class UsersList {
    /**
     * Crea una lista de usuarios con las opciones pasadas como parámetro
     * @param scene Escena del servidor
     */
    constructor(scene) {
        this.scene = scene;
        this.usersArray = [];
    }
    /**
     * Actualiza la escena del servidor poniendo los usuarios conectados en el momento
     */
    update() {
        // Se borran los nombres de los usuarios anteriores
        this.usersArray.splice(0, this.usersArray.length);
        // Aqui se rellenaria el array con lo que llega del backend
        // De momento le ponemos unos nombres para probar 
        this.usersArray = ["manuela420", "jorgejavier69", "feliciano666", "memelord65", "tumadreylamiasonamigasseconocen3"];
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: game.config.width,
            height: game.config.height
        };
        // Posicion vertical de la pantalla en la que ira cada nombre de usuario (inicialmente horizontalmente a un 25% desde arriba)
        let vertPos = 0.25;
        // Cuando esta lleno el array, creamos el texto de cada elemento (nombre)
        for (let element of this.usersArray) {
            this.user = this.scene.add.text(0, 0, element, {
                fontFamily: "Arial",
                fontSize: 20
            });
            // Colocamos los nombres verticalmente en el centro, horizontalmente depende del elemento
            this.user.setPosition(screen.width * 0.5 - this.user.width * 0.5, screen.height * vertPos - this.user.height * 0.5);
            // Cada elemento se posiciona un poco mas abajo
            vertPos += 0.1;
        }
    }
}
//# sourceMappingURL=userslist.js.map