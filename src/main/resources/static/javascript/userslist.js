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
        this.text.setPosition(screen.width * 0.25, SERVER ? screen.height * 0.25 : screen.height * 0.1);
    }
    getUsers() {
        return clone(this.usersArray);
    }
    /**
     * Actualiza la escena del servidor poniendo los usuarios conectados en el momento
     */
    update() {
        var that = this;
        Connection.getAllUsers(function (users) {
            // Aqui se rellenaria el array con lo que llega del backend
            that.usersArray.splice(0, that.usersArray.length);
            for (let user of users) {
                that.usersArray.push(user);
            }
            that.text.text = "";
            // Cuando esta lleno el array, creamos el texto de cada elemento (nombre)
            for (let user of that.usersArray) {
                that.text.text += user.name;
                if (user.ready) {
                    that.text.text += " ✔️";
                }
                that.text.text += "\n";
            }
        });
    }
}
//# sourceMappingURL=userslist.js.map