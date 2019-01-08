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
        this.load.image("back", "assets/images/Back.png");
        //Nuevo
        this.load.image("backgroundMulti", "assets/images/Menu_Multi/Multi_Base.png");
        this.load.image("backgroundMultiShadow", "assets/images/Menu_Multi/Multi_sombras.png");
        this.load.image("lobby", "assets/images/Menu_Multi/Multi_Lobby.png");
        this.load.image("connect", "assets/images/Menu_Multi/Connect.png");
        this.load.image("connectOn", "assets/images/Menu_Multi/ConnectOn.png");
        this.load.image("backLobby", "assets/images/Menu_Multi/backLobby.png");
        this.load.image("backLobbyOn", "assets/images/Menu_Multi/backLobbyOn.png");
        this.load.image("exitMulti", "assets/images/Menu_Multi/exitMulti.png");
        this.load.image("exitMultiOn", "assets/images/Menu_Multi/exitMultiOn.png");
        //Señal
        this.load.image("sign", "assets/images/Menu_Multi/Señal_Final.png");
        this.load.image("sign_exit", "assets/images/Menu_Multi/ExitSeñal_Button.png");
        this.load.image("sign_exitOn", "assets/images/Menu_Multi/ExitSeñal_ButtonOn.png");
        this.load.image("sign_logIn", "assets/images/Menu_Multi/LogIn.png");
        this.load.image("sign_logInOn", "assets/images/Menu_Multi/LogInOn.png");
        this.load.image("sign_signUp", "assets/images/Menu_Multi/SignUp.png");
        this.load.image("sign_signUpOn", "assets/images/Menu_Multi/SignUpOn.png");
    }
    /**
     * Método que cambia de imagen el "toggle" button
     */
    buttonAnimation(button, widthPos, heightPos) {
        switch (button) {
            case "sign_exit":
                this.sign_exitOn.setVisible(false);
                break;
            case "sign_exitOn":
                this.sign_exitOn.setVisible(true);
                break;
            case "playerReady":
                if (this.statusReady) {
                    this.readyOn.setVisible(false);
                }
                else {
                    this.readyOn.setVisible(true);
                }
                this.statusReady = !this.statusReady;
                break;
            case "logIn":
                this.sign_logInOn.setVisible(false);
                break;
            case "logInOn":
                this.sign_logInOn.setVisible(true);
                break;
            case "signUp":
                this.sign_signUpOn.setVisible(false);
                break;
            case "signUpOn":
                this.sign_signUpOn.setVisible(true);
                break;
            case "backLobby":
                this.backLobbyOn.setVisible(false);
                break;
            case "backLobbyOn":
                this.backLobbyOn.setVisible(true);
                break;
            case "exitMulti":
                this.exitMultiOn.setVisible(false);
                break;
            case "exitMultiOn":
                this.exitMultiOn.setVisible(true);
                break;
            default:
                break;
        }
    }
    /**
     * Método que carga la lista de jugadores y los controles pertinentes
     */
    playerReady() {
        var that = this;
        Connection.createUser(this.userName.value, function () {
            //that.acceptName.destroy();
            //Vaciamos la caja de texto
            that.userName.value = "";
            //Inicializamos el estado del toggle
            that.statusReady = false;
            //Indicamos que la caja y el botón se situarán más arriba, y aparecerá la lista
            that.logActive = false;
            //Indicamos la transicion
            that.transition = false;
            //Asignamos el método que llamará el botón Ready
            that.readyOff.setVisible(true);
            that.readyOff.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                Connection.setReady(!Connection.getUser().ready);
                that.buttonAnimation("playerReady", 0.85, 0.85);
            });
            that.exitMulti.setVisible(true);
            that.userlist = new UsersList(that);
            that.userlist.create();
            that.userlist.startUpdating();
        });
    }
    /**
     * Método que posiciona la caja de texto
     */
    textBoxPosition() {
        //Cuando está en el centro de la pantalla
        if (this.logActive) {
            var posX_name = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - 60;
            var posY_name = this.canvas.getBoundingClientRect().top + this.sHeight * 0.5 - 90;
            var posX_pass = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - 60;
            var posY_pass = this.canvas.getBoundingClientRect().top + this.sHeight * 0.5 + 20;
            var posX_error = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 + 60;
            var posY_error = this.canvas.getBoundingClientRect().top + this.sHeight * 0.8 - 10;
        }
        else {
            var posX_chat = this.canvas.getBoundingClientRect().left + this.sWidth * 0.25 - 150;
            var posY_chat = this.canvas.getBoundingClientRect().top + this.sHeight * 0.25 + 20;
            var posX_lobby = this.canvas.getBoundingClientRect().left + this.sWidth * 0.75 - 100;
            var posY_lobby = this.canvas.getBoundingClientRect().top + this.sHeight * 0.25 + 35;
        }
        this.userName.style.left = posX_name + "px";
        this.userName.style.top = posY_name + "px";
        this.userPassword.style.left = posX_pass + "px";
        this.userPassword.style.top = posY_pass + "px";
        this.chat.style.left = posX_chat + "px";
        this.chat.style.top = posY_chat + "px";
        this.chat.style.width = this.sWidth * 0.46 + "px";
        this.chat.style.height = this.sHeight * 0.55 + "px";
        this.currentLobby.style.left = posX_lobby + "px";
        this.currentLobby.style.top = posY_lobby + "px";
        this.errorLog.style.left = posX_error + "px";
        this.errorLog.style.top = posY_error + "px";
    }
    /**
     * Actualizamos la señal
     */
    updateSign() {
        if (this.transition) {
            //Animación
            if (this.angle > -0.7853981634 || this.signX > this.sWidth * 0.8) { //-45º
                //Posicionamos
                if (this.angle > -0.7853981634) {
                    this.sign.setRotation(this.angle);
                }
                else {
                    this.sign.setRotation(-0.7853981634);
                }
                if (this.signX > this.sWidth * 0.8) {
                    this.sign.setPosition(this.signX, this.sHeight * 0.85);
                }
                else {
                    this.sign.setPosition(this.sWidth * 0.8, this.sHeight * 0.85);
                }
                //Calculamos lo nuevo
                this.angle = this.angle - 0.06;
                this.signX = this.signX - 15;
            }
            //Activamos los botones en casoi de que la transicion ya haya terminado.
            if (this.angle <= -0.7853981634 && this.signX <= this.sWidth * 0.8) {
                this.userName.hidden = false;
                this.userPassword.hidden = false;
                this.errorLog.hidden = false;
                this.sign_exit.setVisible(true);
                this.sign_logIn.setVisible(true);
                this.sign_signUp.setVisible(true);
            }
        }
        else {
            //Desactivamos botones
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.errorLog.hidden = true;
            this.sign_exit.setVisible(false);
            this.sign_logIn.setVisible(false);
            this.sign_signUp.setVisible(false);
            //Animación
            if (this.angle < 0 || this.signX < this.sWidth * 1.5) { //0º
                //Posicionamos
                if (this.angle < 0) {
                    this.sign.setRotation(this.angle);
                }
                else {
                    this.sign.setRotation(0);
                }
                if (this.signX > this.sWidth * 0.8) {
                    this.sign.setPosition(this.signX, this.sHeight * 0.85);
                }
                else {
                    this.sign.setPosition(this.sWidth * 1.5);
                }
                //Calculamos
                this.angle = this.angle + 0.06;
                this.signX = this.signX + 15;
            }
        }
    }
    /**
     * Inicializa la pantalla de menú
     */
    create() {
        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width,
            height: this.game.config.height
        };
        //Se guardan las dimensiones de la pantalla
        this.sWidth = screen.width;
        this.sHeight = screen.height;
        //Metemos las imagenes de base
        this.add.image(screen.width * 0.5, screen.height * 0.5, "backgroundMulti");
        this.add.image(screen.width * 0.5, screen.height * 0.5, "lobby");
        this.add.image(screen.width * 0.5, screen.height * 0.5, "backgroundMultiShadow");
        //Añadimos la señal
        //Señal
        this.sign = this.add.image(screen.width * 0.5, screen.height * 0.5, "sign");
        this.sign.setScale(1.5);
        this.angle = 0;
        this.sign.setPosition(this.sWidth * 1.05, this.sHeight * 0.85);
        this.signX = this.sWidth * 1.05;
        //BotonExit
        this.sign_exit = this.add.image(screen.width * 0.5, screen.height * 0.85, "sign_exit");
        this.sign_exit.setVisible(false);
        //Y su hover
        this.sign_exitOn = this.add.image(screen.width * 0.5, screen.height * 0.85, "sign_exitOn");
        this.sign_exitOn.setVisible(false);
        //LogIn
        this.sign_logIn = this.add.image(screen.width * 0.51, screen.height * 0.65, "sign_logIn");
        this.sign_logIn.setVisible(false);
        //Y su hover
        this.sign_logInOn = this.add.image(screen.width * 0.51, screen.height * 0.65, "sign_logInOn");
        this.sign_logInOn.setVisible(false);
        //SignUp
        this.sign_signUp = this.add.image(screen.width * 0.51, screen.height * 0.7, "sign_signUp");
        this.sign_signUp.setVisible(false);
        //Y su hover
        this.sign_signUpOn = this.add.image(screen.width * 0.51, screen.height * 0.7, "sign_signUpOn");
        this.sign_signUpOn.setVisible(false);
        //Se inicializan las variables userName y canvas con los elementos html pertinentes
        this.userName = document.getElementById("name");
        this.userPassword = document.getElementById("password");
        this.canvas = document.getElementById("gameCanvas");
        this.chat = document.getElementById("chat");
        this.currentLobby = document.getElementById("Lobby_name");
        this.errorLog = document.getElementById("ErrorLog");
        //Hacemos invisible la caja de texto y el chat
        this.userName.hidden = true;
        this.userPassword.hidden = true;
        this.chat.hidden = true;
        this.currentLobby.hidden = true;
        this.errorLog.hidden = true;
        //Al iniciar la escena, hacemos aparecer la caja y el botón en el centro
        this.logActive = true;
        //Dibujamos los dos botones
        this.back = this.add.image(this.sWidth * 0.5, this.sHeight * 0.85, "back");
        this.back.setVisible(false);
        //Creamos la imagen del ready
        this.readyOff = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75, "readyOff");
        this.readyOff.setScale(0.7);
        this.readyOn = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75, "readyOn");
        this.readyOn.setScale(0.7);
        this.readyOff.setVisible(false);
        this.readyOn.setVisible(false);
        //Creamos la imagen de connect
        this.connect = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75, "connect");
        this.connectOn = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75, "connectOn");
        this.connect.setVisible(false);
        this.connectOn.setVisible(false);
        //Creamos el boton de exit para salir de multiplayer
        this.exitMulti = this.add.image(this.sWidth * 0.8, this.sHeight * 0.85, "exitMulti");
        this.exitMultiOn = this.add.image(this.sWidth * 0.8, this.sHeight * 0.85, "exitMultiOn");
        this.exitMulti.setVisible(false);
        this.exitMultiOn.setVisible(false);
        //Creamos el boton de back para salir del lobby
        this.backLobby = this.add.image(this.sWidth * 0.9, this.sHeight * 0.39, "backLobby");
        this.backLobbyOn = this.add.image(this.sWidth * 0.9, this.sHeight * 0.39, "backLobbyOn");
        this.backLobby.setVisible(false);
        this.backLobbyOn.setVisible(false);
        /**
        * Ponemos los siguientes eventos asociados a las imágenes:
        * acceptName: llamamos a playerReady()
        * back: volvemos a la escena de Menú
        * sign_exit: cerramos la señal, ocultamos las cajas de texto y volvemos al menu
        * sign_logIn: accedemos con nuestro usuario al menu multijugador
        * sign_sign_up: creamos un nuevo usuario y accedemos al menu multijugador
        */
        this.back.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
            Connection.dropUser();
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.transition = false;
            this.scene.start("SceneMenu");
        });
        this.sign_exit.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
            Connection.dropUser();
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.transition = false;
            this.scene.start("SceneMenu");
        })
            .on('pointerover', () => this.buttonAnimation("sign_exitOn", 0.25, 0.5))
            .on('pointerout', () => this.buttonAnimation("sign_exit", 0.25, 0.5));
        //////////////////////////
        this.sign_logIn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.playerReady())
            .on('pointerover', () => this.buttonAnimation("logInOn", 0.25, 0.5))
            .on('pointerout', () => this.buttonAnimation("logIn", 0.25, 0.5));
        this.sign_signUp.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.buttonAnimation("signUpOn", 0.25, 0.5))
            .on('pointerout', () => this.buttonAnimation("signUp", 0.25, 0.5));
        this.connect.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.buttonAnimation("connectOn", 0.25, 0.5))
            .on('pointerout', () => this.buttonAnimation("connect", 0.25, 0.5));
        this.exitMulti.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
            Connection.dropUser();
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.transition = false;
            this.scene.start("SceneMenu");
        })
            .on('pointerover', () => this.buttonAnimation("exitMultiOn", 0.25, 0.5))
            .on('pointerout', () => this.buttonAnimation("exitMulti", 0.25, 0.5));
        this.backLobby.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.buttonAnimation("backLobbyOn", 0.25, 0.5))
            .on('pointerout', () => this.buttonAnimation("backLobby", 0.25, 0.5));
        //////////////////////////
        //Activamos la transicion de entrada
        this.transition = true;
    }
    reset() {
        this.logActive = true;
        this.readyOff.destroy();
    }
    gestionLobby() {
        //Actualizamos la pantalla de lobbys
        if (!this.logActive) {
            this.currentLobby.hidden = false;
            //Recibe el lobby actual, si no hay dice no lobby
            document.getElementById("NameText").innerText = "Lobby_1";
            //Si nos encontramos en seleccion de lobby o no.
            this.inLobby = true;
            if (this.inLobby) {
                this.backLobby.setVisible(true);
                //El chat??
            }
            else {
                this.backLobby.setVisible(false);
            }
        }
        else {
            this.currentLobby.hidden = true;
        }
    }
    /**
     * Metodo para poner un error, no muy largo
     */
    setErrorLog(error) {
        document.getElementById("ErrorLogMessage").innerHTML = error;
    }
    update() {
        //Se gestiona la posición de varios elementos al redimensionar
        this.textBoxPosition();
        //Activamos la animación
        this.updateSign();
        //Gestionamos los lobbys y sus elementos
        this.gestionLobby();
        if (Connection.getUser() == null && !this.logActive) {
            this.userlist.stopUpdating();
            this.userlist = null;
            this.reset();
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.transition = false;
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
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.transition = false;
            this.scene.start("SceneOverworld");
            return;
        }
    }
}
//# sourceMappingURL=menumultijugador.js.map