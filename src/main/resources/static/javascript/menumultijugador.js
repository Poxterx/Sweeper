class SceneMultiplayerMenu extends Phaser.Scene {
    /**
     * Escena que representa el menú del juego
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
        if (status) {
            this.ready = this.add.image(this.sWidth * widthPos - this.menu.width * 0.5, this.sHeight * heightPos - this.menu.height * 0.5, "readyOff");
        }
        else {
            this.ready = this.add.image(this.sWidth * widthPos - this.menu.width * 0.5, this.sHeight * heightPos - this.menu.height * 0.5, "readyOn");
        }
        this.statusReady = !this.statusReady;
    }
    /**
     * Método que carga la lista de jugadores y los controles pertinentes
     */
    playerReady() {
        //Destruimos el botón de introducir nombre
        this.acceptName.destroy();
        //Vaciamos la caja de texto
        this.userName.value = "";
        //Inicializamos el estado del toggle
        this.statusReady = false;
        //Indicamos que la caja y el botón se situarán más arriba, y aparecerá la lista
        this.centered = false;
        //Asignamos el método que llamará el botón Ready
        this.ready = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.85 - this.menu.height * 0.5, "readyOff");
        this.ready.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.buttonAnimation(this.statusReady, 0.85, 0.85));
        //Asignamos el botón que llamará el botón Change Name
        this.changeName = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.35 - this.menu.height * 0.5, "changeName");
        this.changeName.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeUserName());
    }
    /**
     * Método para cambiar el nombre del jugador
     */
    changeUserName() {
        //Tras gestionar el cambio de nombre se borra el contenido de la caja de texto
        this.userName.value = "";
    }
    /**
     * Método que posiciona la caja de texto
     */
    textBoxPosition() {
        if (this.centered) {
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - this.menu.width;
            var posY = this.sHeight * 0.5 - this.menu.height * 0.5;
        }
        else {
            var posX = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - this.menu.width;
            var posY = this.sHeight * 0.35 - this.menu.height * 0.5;
        }
        this.userName.style.left = posX + "px";
        this.userName.style.top = posY + "px";
    }
    /**
     * Inicializa la pantalla de menú
     */
    create() {
        // Creamos el menú multijugador
        this.menu = this.add.text(0, 0, "Menú Multijugador", {
            fontFamily: "Impact",
            fontSize: 36
        });
        this.usersArray = [];
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
        this.userName = document.getElementById("name");
        this.canvas = document.getElementById("gameCanvas");
        this.userName.hidden = false;
        this.centered = true;
        //this.textBoxPosition();
        this.acceptName = this.add.image(this.sWidth * 0.85 - this.menu.width * 0.5, this.sHeight * 0.5 - this.menu.height * 0.5, "acceptName");
        this.back = this.add.image(this.sWidth * 0.5 - this.menu.width * 0.5, this.sHeight * 0.85 - this.menu.height * 0.5, "back");
        /**
        * Ponemos los siguientes eventos asociados a la imagen multiPlayer:
        * En caso de que se pulse se empieza a jugar
        * Si entramos o salimos de la imagen, esta se cambia
        */
        this.acceptName.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.playerReady());
        this.back.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
            this.userName.hidden = true;
            this.scene.start("SceneMenu");
        });
    }
    update() {
        //Se gestiona la posición d ela caja de texto en caso de redimensionar la pantalla
        this.textBoxPosition();
        //Lista
        if (!this.centered) {
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
            let vertPos = 0.4;
            // Cuando esta lleno el array, creamos el texto de cada elemento (nombre)
            for (let element of this.usersArray) {
                this.user = this.add.text(0, 0, element, {
                    fontFamily: "Arial",
                    fontSize: 20
                });
                // Colocamos los nombres verticalmente en el centro, horizontalmente depende del elemento
                this.user.setPosition(screen.width * 0.5 - this.user.width * 0.5, screen.height * vertPos - this.user.height * 0.5);
                // Cada elemento se posiciona un poco mas abajo
                vertPos += 0.05;
            }
        }
    }
}
//# sourceMappingURL=menumultijugador.js.map