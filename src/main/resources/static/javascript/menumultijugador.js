class SceneMultiplayerMenu extends Phaser.Scene {
    /**
     * Escena que representa el menú de la sala de espera para el modo multijugador
     */
    constructor() {
        super({ key: "SceneMultiplayerMenu" });
    }
    /**
    * Cargamos las imágenes de los botones
    */
    preload() {
        this.load.image("readyOn", "assets/images/ReadyOn.png");
        this.load.image("readyOff", "assets/images/ReadyOff.png");
        this.load.image("changeName", "assets/images/ChangeName.png");
        this.load.image("back", "assets/images/Back.png");
        this.load.image("acceptName", "assets/images/Ok.png");
    }
    /**
     * Método que cambia de imagen el "toggle" button
     */
    buttonAnimation(status, widthPos, heightPos) {
        this.ready.setVisible(!status);
        this.notReady.setVisible(status);
        this.statusReady = !this.statusReady;
    }
    /**
     * Método que carga la lista de jugadores y los controles pertinentes
     */
    playerReady() {
        // Destruimos el botón de introducir nombre
        var that = this;
        Connection.tryCreateUser(this.userName.value, password, true, 
        // El usuario se ha creado correctamente porque el nombre es válido para el servidor
        function (user) {
            that.acceptName.destroy();
            //Vaciamos la caja de texto
            that.userName.value = "";
            //Inicializamos el estado del toggle
            that.statusReady = false;
            //Indicamos que la caja y el botón se situarán más arriba, y aparecerá la lista
            that.centered = false;
            //Asignamos el método que llamará el botón Ready
            that.ready = that.add.image(that.sWidth * 0.85 - that.menu.width * 0.5, that.sHeight * 0.85 - that.menu.height * 0.5, "readyOn");
            that.ready.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                Connection.setUserReady(!Connection.getUser().ready);
                that.buttonAnimation(that.statusReady, 0.85, 0.85);
            });
            that.ready.setVisible(that.statusReady);
            //Asignamos el método que llamará el botón notReady
            that.notReady = that.add.image(that.sWidth * 0.85 - that.menu.width * 0.5, that.sHeight * 0.85 - that.menu.height * 0.5, "readyOff");
            that.notReady.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                Connection.setUserReady(!Connection.getUser().ready);
                that.buttonAnimation(that.statusReady, 0.85, 0.85);
            });
            Connection.openSocket(user);
            that.userlist = new UsersList(that);
            that.userlist.create();
            that.userlist.startUpdating();
            setTimeout(() => Connection.enterLobby(__lobby), 500);
        }, 
        // El usuario no se ha creado porque el nombre de usuario no es válido
        function (error) {
            console.log("El servidor no ha permitido usar este nombre. Error: " + error);
        });
    }
    /**
     * Método que posiciona la caja de texto
     */
    textBoxPosition() {
        //Cuando está en el centro de la pantalla
        if (this.centered) {
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.25 - this.menu.width;
            var posY = this.sHeight * 0.5 - this.menu.height * 0.5;
        }
        else {
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.1;
            var posY = this.sHeight * 0.05;
            this.userName.hidden = true;
        }
        this.userName.style.left = posX + "px";
        this.userName.style.top = posY + "px";
    }
    /**
     * Inicializa la pantalla de menú
     */
    create() {
        // Inicializamos la conexión
        Connection.initialize();
        // Creamos el menú multijugador
        this.menu = this.add.text(0, 0, "", {
            fontFamily: "Impact",
            fontSize: 36
        });
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width,
            height: this.game.config.height
        };
        // Colocamos el menu verticalmente en el centro y horizontalmente a un 20% desde arriba
        this.menu.setPosition(screen.width * 0.45 - this.menu.width * 0.5, screen.height * 0.20 - this.menu.height * 0.5);
        //Se guardan las dimensiones de la pantalla
        this.sWidth = screen.width;
        this.sHeight = screen.height;
        //Se inicializan las variables userName y canvas con los elementos html pertinentes
        this.userName = document.getElementById("name");
        this.canvas = document.getElementById("gameCanvas");
        //Hacemos visible la caja de texto
        this.userName.hidden = false;
        //Al iniciar la escena, hacemos aparecer la caja y el botón en el centro
        this.centered = true;
        //Dibujamos los dos botones
        this.acceptName = this.add.image(this.sWidth * 0.65, this.sHeight * 0.5 - this.menu.height * 0.5, "acceptName");
        this.back = this.add.image(this.sWidth * 0.5 - this.menu.width * 0.5, this.sHeight * 0.85, "back");
        /**
        * Ponemos los siguientes eventos asociados a las imágenes:
        * acceptName: llamamos a playerReady()
        * back: ocultamos la caja de texto y volvemos a la escena de Menú
        */
        this.acceptName.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.playerReady());
        this.back.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
            this.userName.hidden = true;
            Connection.close();
            this.scene.start("SceneMenu");
        });
    }
    reset() {
        // this.changeName.destroy();
        this.centered = true;
        this.ready.destroy();
    }
    update() {
        //Se gestiona la posición de la caja de texto en caso de redimensionar la pantalla
        this.textBoxPosition();
        if (Connection.getUser() == null && !this.centered) {
            this.userlist.stopUpdating();
            this.userlist = null;
            this.reset();
            this.userName.hidden = true;
            this.scene.start("SceneMenu");
            return;
        }
        if (!this.userlist)
            return;
        var users = this.userlist.getUsers();
        var allReady = true;
        for (let user of users) {
            if (!user.ready) {
                allReady = false;
            }
        }
        if (allReady && users.length >= 2) {
            this.userlist.stopUpdating();
            this.userlist = null;
            this.reset();
            this.userName.hidden = true;
            this.getUuidsFromLobby(() => {
                if (Connection.isMod()) {
                    Connection.sendOperation("LOBBY_START", Connection.getLobby().toString());
                }
            });
        }
    }
    getUuidsFromLobby(listener) {
        RemotePlayer.pendingUuids = [];
        Connection.getAllUsersId(function (uuids) {
            for (let uuid of uuids) {
                if (uuid != Connection.getUser().id) {
                    RemotePlayer.pendingUuids.push(uuid);
                }
            }
            listener();
        });
    }
}
//# sourceMappingURL=menumultijugador.js.map