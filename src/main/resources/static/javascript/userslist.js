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
     * Inicia las actualizaciones de la lista
     */
    startUpdating() {
        this.updateInterval = setInterval(() => this.update.call(this), 500);
    }
    /**
     * Detiene las actualizaciones de la lista
     */
    stopUpdating() {
        clearInterval(this.updateInterval);
    }
    create() {
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: game.config.width,
            height: game.config.height
        };
        this.text = this.scene.add.text(0, 0, "", {
            fontFamily: "Arial",
            fontSize: 20
        });
        this.text.setPosition(screen.width * 0.5 - this.text.width * 0.5, screen.height * 0.25);
    }
    /**
     * Actualiza la escena del servidor poniendo los usuarios conectados en el momento
     */
    update() {
        var that = this;
        Connection.readConnectedUsers(function (users) {
            // Aqui se rellenaria el array con lo que llega del backend
            that.usersArray.splice(0, that.usersArray.length);
            for (let user of users) {
                that.usersArray.push(user.username);
            }
            that.text.text = "";
            // Cuando esta lleno el array, creamos el texto de cada elemento (nombre)
            for (let element of that.usersArray) {
                that.text.text += element + "\n";
            }
        });
    }
}
//# sourceMappingURL=userslist.js.map