/**
 * Nombres de los botones
 */
type ReadyButton = "readyOn" | "readyOff" | "back" |"sign_exit"|"sign_exitOn" |"playerReady"|
                    "logIn" |"logInOn" |"signUp" |"signUpOn" |"connect" |"connectOn"|"backLobby"|"backLobbyOn"|"exitMulti"|"exitMultiOn";

class SceneMultiplayerMenu extends Phaser.Scene {

    /**
     * Condición para la posición textbox según si se ha introducido o no el nombre de usuario, así como si se muestra la lista
     */
    private logActive : boolean;
    /**
     * Condicion para la transicion de la señal
     */
    private transition : boolean;
    /**
     * Comprueba si el user esta en un lobby
     */
    private inLobby : boolean;

    //Caja de texto
    private userName :HTMLTextAreaElement;
    private userPassword :HTMLTextAreaElement;
    //Canvas del juego, usado para obtener los datos de posición para la caja de texto
    private canvas :HTMLCanvasElement;

    //Chat del juego
    private chat :HTMLDivElement;
    private currentLobby :HTMLDivElement;
    private errorLog :HTMLDivElement;

    //Variables del fondo
    private backgroundMulti:Phaser.GameObjects.Image;
    private backgroundLobby:Phaser.GameObjects.Image;
    private backgroundMultiShadow:Phaser.GameObjects.Image;
    
    // Variables en las que se guardaran las imágenes de los botones.
    private readyOff:Phaser.GameObjects.Image;
    private readyOn:Phaser.GameObjects.Image;
    private back:Phaser.GameObjects.Image;
    private connect:Phaser.GameObjects.Image;
    private connectOn:Phaser.GameObjects.Image;
    private backLobby:Phaser.GameObjects.Image;
    private backLobbyOn:Phaser.GameObjects.Image;
    private exitMulti:Phaser.GameObjects.Image;
    private exitMultiOn:Phaser.GameObjects.Image;

    //Imagenes de la señal
    private sign:Phaser.GameObjects.Image;
    private sign_exit:Phaser.GameObjects.Image;
    private sign_exitOn:Phaser.GameObjects.Image;
    private sign_logIn:Phaser.GameObjects.Image;
    private sign_logInOn:Phaser.GameObjects.Image;
    private sign_signUp:Phaser.GameObjects.Image;
    private sign_signUpOn:Phaser.GameObjects.Image;

    /**
     * Objeto que se utilizará para pintar la lista de usuarios que se envia desde el backend
     */
    private userlist :UsersList;

    /**
     * Registro de lobbys
     */
    public lobbys:Lobby[];
    private lobbyActual:string;
    private lista : HTMLDivElement;

    /**
     * Variables en las que se guardaran el tamaño de la pantalla.
     */
    private sWidth:number;
    private sHeight:number;
    /**
     * Angulo y posicion en X de la señal
     */
    private angle : number;
    private signX : number;
    /**
     * Escena que representa el menú de la sala de espera para el modo multijugador
     */
    constructor() {
        super({key: "SceneMultiplayerMenu"});
    }
     /**
     * Cargamos las imágenes de los botones
     */
    preload(){
        this.load.image("readyOn", "assets/images/ReadyOn.png");
        this.load.image("readyOff", "assets/images/ReadyOff.png");
        this.load.image("back", "assets/images/Back.png");
        //Nuevo
        this.load.image("backgroundMulti", "assets/images/Menu_Multi/Multi_Base.png");
        this.load.image("backgroundMultiShadow", "assets/images/Menu_Multi/Multi_sombras.png");
        this.load.image("lobby", "assets/images/Menu_Multi/Multi_Lobby.png");
        this.load.image("connect", "assets/images/Menu_Multi/Connect.png");
        this.load.image("connectOn", "assets/images/Menu_Multi/ConnectOn.png");
        this.load.image("backLobby", "assets/images/Menu_Multi/BackLobby.png");
        this.load.image("backLobbyOn", "assets/images/Menu_Multi/BackLobbyOn.png");
        this.load.image("exitMulti", "assets/images/Menu_Multi/ExitMulti.png");
        this.load.image("exitMultiOn", "assets/images/Menu_Multi/ExitMultiOn.png");

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
    buttonAnimation(button :ReadyButton,widthPos :number,heightPos :number) {
        switch (button) {
            case "sign_exit":
            this.sign_exitOn.setVisible(false);
                break;
            case "sign_exitOn":
                this.sign_exitOn.setVisible(true);
                break;
            case "playerReady":
                if (Connection.getUser().ready) {
                    this.readyOn.setVisible(false); 
                }else{
                    this.readyOn.setVisible(true);
                }
                Connection.setUserReady(!Connection.getUser().ready); 
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
    playerReady(register :boolean){
        var that = this;
        Connection.ping(function(){
            // Destruimos el botón de introducir nombre
            Connection.tryCreateUser(that.userName.value, that.userPassword.value, register,
            
            // El usuario se ha creado correctamente porque el nombre es válido para el servidor
            function(user :User) {
                //Vaciamos la caja de texto
                that.userName.value = "";
                that.userPassword.value = "";
                //Inicializamos el estado del toggle
                Connection.setUserReady(false);
                //Indicamos que la caja y el botón se situarán más arriba, y aparecerá la lista
                that.logActive = false;

                //Indicamos la transicion
                that.transition = false;
                that.lista.hidden = false;

                //Quitamos el boton de ready en lobby
                that.readyOn.setVisible(false);
                that.readyOff.setVisible(false);

                //Quitamos el hover
                that.sign_logInOn.setVisible(false);
                that.sign_signUpOn.setVisible(false);

                Connection.openSocket(user);
                //that.getUuidsFromLobby(() =>{});
                //setTimeout(() => Connection.enterLobby(1), 500)
                
                //Asignamos el método que llamará el botón Ready
                that.readyOff.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        Connection.setUserReady(!Connection.getUser().ready);
                        that.buttonAnimation("playerReady",0.85,0.85)
                    });
                that.exitMulti.setVisible(true);

                that.userlist = new UsersList(that);
                that.userlist.create();
                that.generateLobbies();
                //setTimeout(() => Connection.enterLobby(__lobby), 500);
            },
            
            // El usuario no se ha creado porque el nombre de usuario no es válido
            function(error :LoginStatus) {
                SceneMultiplayerMenu.setErrorLog(error);
            }
            );
        },
        function(){
            SceneMultiplayerMenu.setErrorLog("OFFLINE");
        });
            
        
        
    }

    /**
     * Método que posiciona la caja de texto
     */
    textBoxPosition(){
        //Cuando está en el centro de la pantalla
        if(this.logActive){
            var posX_name = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - 60 ;
            var posY_name = this.canvas.getBoundingClientRect().top + this.sHeight * 0.5 - 90 ;

            var posX_pass = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 - 60 ;
            var posY_pass = this.canvas.getBoundingClientRect().top + this.sHeight * 0.5 + 20 ;

            var posX_error = this.canvas.getBoundingClientRect().left + this.sWidth * 0.5 + 45 ;
            var posY_error = this.canvas.getBoundingClientRect().top + this.sHeight * 0.8 -20 ;

            
        }else{
            var posX_chat = this.canvas.getBoundingClientRect().left + this.sWidth * 0.25 - 150 ;
            var posY_chat = this.canvas.getBoundingClientRect().top + this.sHeight * 0.25 + 20 ;

            var posX_lobby = this.canvas.getBoundingClientRect().left + this.sWidth * 0.75 - 100 ;
            var posY_lobby = this.canvas.getBoundingClientRect().top + this.sHeight * 0.25 + 35 ;
            

        }
        
        this.userName.style.left = posX_name + "px";
        this.userName.style.top = posY_name + "px";

        this.userPassword.style.left = posX_pass + "px";
        this.userPassword.style.top = posY_pass + "px";

        this.chat.style.left = posX_chat + "px";
        this.chat.style.top = posY_chat + "px";
        this.chat.style.width = this.sWidth * 0.46 + "px";
        this.chat.style.height = this.sHeight * 0.55 + "px";

        this.lista.style.left = posX_chat + "px";
        this.lista.style.top = posY_chat + "px";
        this.lista.style.width = this.sWidth * 0.46 + "px";
        this.lista.style.height = this.sHeight * 0.55 + "px";

        this.currentLobby.style.left = posX_lobby + "px";
        this.currentLobby.style.top = posY_lobby + "px";

        this.errorLog.style.left = posX_error + "px";
        this.errorLog.style.top = posY_error + "px";
    }

    /**
     * Actualizamos la señal
     */
    updateSign(){
        
        if(this.transition){
            //Animación
            if(this.angle>-0.7853981634 || this.signX>this.sWidth * 0.8){  //-45º
                //Posicionamos
                if(this.angle>-0.7853981634){this.sign.setRotation(this.angle);}
                else{this.sign.setRotation(-0.7853981634);}
                if(this.signX>this.sWidth * 0.8){this.sign.setPosition(this.signX ,this.sHeight * 0.85);}
                else{this.sign.setPosition(this.sWidth * 0.8 ,this.sHeight * 0.85);}
                //Calculamos lo nuevo
                this.angle = this.angle - 0.06; 
                this.signX = this. signX - 15;

            }
            //Activamos los botones en caso de que la transicion ya haya terminado.
            if(this.angle<=-0.7853981634 && this.signX<=this.sWidth * 0.8){
                this.sign.setPosition(this.sWidth * 0.796 ,this.sHeight * 0.85);
                this.userName.hidden = false;
                this.userPassword.hidden = false;
                this.errorLog.hidden = false;
                this.sign_exit.setVisible(true);
                this.sign_logIn.setVisible(true);
                this.sign_signUp.setVisible(true); 
            }
            

        }else{
            //Desactivamos botones
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.errorLog.hidden = true;
            this.sign_exit.setVisible(false);
            this.sign_logIn.setVisible(false);
            this.sign_signUp.setVisible(false);

        //Animación
        if(this.angle<0 || this.signX<this.sWidth * 1.5){ //0º
            //Posicionamos
            if(this.angle<0){this.sign.setRotation(this.angle);}
            else{this.sign.setRotation(0);}
            if(this.signX>this.sWidth * 0.8){this.sign.setPosition(this.signX ,this.sHeight * 0.85);}
            else{this.sign.setPosition(this.sWidth * 1.5);}
            //Calculamos
            this.angle = this.angle + 0.06; 
            this.signX = this.signX + 15;
        }
    }
    }

    /**
     * Crea la lista de lobbies
     */
    generateLobbies(){
        //Limpiamos
        $( ".Row" ).remove();
        //Cargamos los lobbys
        for(var i = 0; i<this.lobbys.length;i++){
            var aux = this.lobbys[i];
            //Construir el Wrap del lobby
            var NombreLobby = document.createElement("div");
            NombreLobby.innerHTML = aux.Nombre + i;
            NombreLobby.setAttribute("style","width:30%;align-self: left; font-size: 25px");

            var BotonConnect = document.createElement("input");
            BotonConnect.setAttribute("type","button");
            BotonConnect.setAttribute("class","connectButton");
            BotonConnect.disabled = true;
            BotonConnect.hidden =true;

            var numeroIntegrantes = document.createElement("div");
            var that = this;
            (function(i:number, numeroIntegrantes:HTMLDivElement, BotonConnect:HTMLInputElement){BotonConnect.addEventListener("click", function(){
                Connection.enterLobby(i);
                that.userlist.startUpdating();
                if(Connection.getUser().ready){
                    that.readyOn.setVisible(true);
                }else{
                    that.readyOff.setVisible(true);
                }
                
            });
                SceneMultiplayerMenu.getUuidsFromLobby(i,(uuids :string[]) => {
                    Connection.getLobbyStatus(i,function(status:string){
                        numeroIntegrantes.innerText = status+" - "+uuids.length.toString()+ "/4";
                        if(status == "OK"){
                            BotonConnect.disabled = false;
                            BotonConnect.hidden = false;
                        }
                    })
                });
                })(i,numeroIntegrantes,BotonConnect);
            BotonConnect.src = "assets/images/Menu_Multi/Connect.png";

            numeroIntegrantes.setAttribute("style","float:right;top:50%");

            var wrapLobby = document.createElement("div");
            wrapLobby.setAttribute("class","Row");
            wrapLobby.setAttribute("style","background-color:lightgrey;margin-bottom:5px;font-family: Impact; font-size: 15px");
            //wrapLobby.setAttribute("style","position:absolute");
            wrapLobby.insertAdjacentElement('beforeend', NombreLobby);
            wrapLobby.insertAdjacentElement('beforeend', BotonConnect);
            wrapLobby.insertAdjacentElement('beforeend', numeroIntegrantes);
            this.lista.insertAdjacentElement('beforeend', wrapLobby);


        }
    }

    /**
     * Inicializa la pantalla de menú
     */
    create() {

        // Obtenemos una forma más conveniente de referirnos a las dimensiones de la pantalla
        var screen = {
            width: this.game.config.width as number,
            height: this.game.config.height as number
        }

        Connection.initialize();

        //Se guardan las dimensiones de la pantalla
        this.sWidth=screen.width;
        this.sHeight=screen.height;
        
        //Metemos las imagenes de base
        this.backgroundMulti=this.add.image(screen.width*0.5,screen.height*0.5, "backgroundMulti");
        this.backgroundLobby=this.add.image(screen.width*0.5,screen.height*0.5, "lobby");
        this.backgroundMultiShadow=this.add.image(screen.width*0.5,screen.height*0.5, "backgroundMultiShadow");

        //Añadimos la señal
        //Señal
        this.sign = this.add.image(screen.width*0.5,screen.height*0.5,"sign");
        this.sign.setScale(1.5);
        this.angle = 0;
        this.sign.setPosition(this.sWidth * 1.05  ,this.sHeight * 0.85);
        this.signX = this.sWidth * 1.05;

        //BotonExit
        this.sign_exit = this.add.image(screen.width*0.5,screen.height*0.85,"sign_exit");
        this.sign_exit.setVisible(false);
            //Y su hover
            this.sign_exitOn = this.add.image(screen.width*0.5,screen.height*0.85,"sign_exitOn");
            this.sign_exitOn.setVisible(false);
        
        //LogIn
        this.sign_logIn = this.add.image(screen.width*0.51,screen.height*0.65,"sign_logIn");
        this.sign_logIn.setVisible(false);
            //Y su hover
            this.sign_logInOn = this.add.image(screen.width*0.51,screen.height*0.65,"sign_logInOn");
            this.sign_logInOn.setVisible(false);
        
        //SignUp
        this.sign_signUp = this.add.image(screen.width*0.51,screen.height*0.7,"sign_signUp");
        this.sign_signUp.setVisible(false);
            //Y su hover
            this.sign_signUpOn = this.add.image(screen.width*0.51,screen.height*0.7,"sign_signUpOn");
            this.sign_signUpOn.setVisible(false);

        //Se inicializan las variables userName y canvas con los elementos html pertinentes
        this.userName = document.getElementById("name") as HTMLTextAreaElement;
        this.userPassword = document.getElementById("password") as HTMLTextAreaElement;
        this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this.chat = document.getElementById("chat") as HTMLDivElement;
        this.currentLobby = document.getElementById("Lobby_name") as HTMLDivElement;
        this.errorLog = document.getElementById("ErrorLog") as HTMLDivElement;
        this.lista = document.getElementById("lobbyList") as HTMLDivElement;

        //Hacemos invisible la caja de texto y el chat
        this.userName.hidden = true;
        this.userPassword.hidden = true;
        this.chat.hidden = true;
        this.currentLobby.hidden = true;
        this.errorLog.hidden = true;
        //Al iniciar la escena, hacemos aparecer la caja y el botón en el centro
        this.logActive = true;

        //Dibujamos los dos botones
        this.back = this.add.image(this.sWidth * 0.5 , this.sHeight * 0.85, "back");
        this.back.setVisible(false);

        //Creamos la imagen del ready
        this.readyOff = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75 , "readyOff");
        this.readyOff.setScale(0.7);
        this.readyOn = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75 , "readyOn");
        this.readyOn.setScale(0.7);
        this.readyOff.setVisible(false);
        this.readyOn.setVisible(false);

        //Creamos la imagen de connect
        this.connect = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75 , "connect");
        this.connectOn = this.add.image(this.sWidth * 0.8, this.sHeight * 0.75 , "connectOn");
        this.connect.setVisible(false);
        this.connectOn.setVisible(false);

        //Creamos el boton de exit para salir de multiplayer
        this.exitMulti = this.add.image(this.sWidth * 0.8, this.sHeight * 0.85 , "exitMulti");
        this.exitMultiOn = this.add.image(this.sWidth * 0.8, this.sHeight * 0.85 , "exitMultiOn");
        this.exitMulti.setVisible(false);
        this.exitMultiOn.setVisible(false);

        //Creamos el boton de back para salir del lobby
        this.backLobby = this.add.image(this.sWidth * 0.9, this.sHeight * 0.39 , "backLobby");
        this.backLobbyOn = this.add.image(this.sWidth * 0.9, this.sHeight * 0.39 , "backLobbyOn");
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

        var that = this;

        this.sign_exit.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                Connection.close();
                that.userName.hidden = true;
                that.userPassword.hidden = true;
                that.currentLobby.hidden = true;
                that.errorLog.hidden = true;
                that.transition = false;
                that.destroy();
                this.scene.stop("SceneMenuMultiplayer");
                that.scene.start("SceneMenu");
            })
            .on('pointerover', () => that.buttonAnimation("sign_exitOn",0.25,0.5) )
            .on('pointerout', () => that.buttonAnimation("sign_exit",0.25,0.5) )
        ;
        //////////////////////////
        this.sign_logIn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => that.playerReady(false))
            .on('pointerover', () => that.buttonAnimation("logInOn",0.25,0.5) )
            .on('pointerout', () => that.buttonAnimation("logIn",0.25,0.5) )
        ;
        this.sign_signUp.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => that.playerReady(true))
            .on('pointerover', () => that.buttonAnimation("signUpOn",0.25,0.5) )
            .on('pointerout', () => that.buttonAnimation("signUp",0.25,0.5) )
        ;
        this.connect.setInteractive({ useHandCursor: true })
            .on('pointerover', () => that.buttonAnimation("connectOn",0.25,0.5) )
            .on('pointerout', () => that.buttonAnimation("connect",0.25,0.5) )
        ;
        this.exitMulti.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
               Connection.dropUser();
               that.userName.hidden = true;
               that.userPassword.hidden = true;
               that.currentLobby.hidden = true;
               that.errorLog.hidden = true;
               that.transition = false;
               that.lista.hidden = true;
               that.chat.hidden = true;
               that.destroy();
               Connection.close();
               this.scene.stop("SceneMenuMultiplayer");
               that.scene.start("SceneMenu");
            })
            .on('pointerover', () => that.buttonAnimation("exitMultiOn",0.25,0.5) )
            .on('pointerout', () => that.buttonAnimation("exitMulti",0.25,0.5) )
        ;
        this.backLobby.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.userlist.stopUpdating();
                this.readyOn.setVisible(false);
                this.readyOff.setVisible(false);
                this.chat.hidden = true;
                Connection.setUserReady(false);
                Connection.exitLobby();
                this.generateLobbies();
             })
            .on('pointerover', () => that.buttonAnimation("backLobbyOn",0.25,0.5) )
            .on('pointerout', () => that.buttonAnimation("backLobby",0.25,0.5) )
        ;
        //////////////////////////

        //Activamos la transicion de entrada
        this.transition=true;
        this.lobbys = [];
        var that = this;
        Connection.getMaxLobbies(function(lobbies:number){
            for(var i =0; i<lobbies; i++){
                 var hey = new Lobby("Lobby_",i);
                 that.lobbys.push(hey);
            }
        });

        Connection.onLost(function(){
            that.destroy();
            that.scene.stop("SceneMenuMultiplayer");
            that.scene.start("SceneGameDisconect");
        });
        
        
    }

    reset() {
        this.logActive = true;
        this.readyOff.destroy();
        this.userName.innerHTML = "";
        this.userPassword.innerHTML = "";
    }

    gestionLobby(){
         //Actualizamos la pantalla de lobbys
         if(!this.logActive){
            this.currentLobby.hidden = false;
            //Si nos encontramos en seleccion de lobby o no.
            if(Connection.getLobby() != null){
                this.lista.hidden = true;
                this.backLobby.setVisible(true);
                //Recibe el lobby actual, si no hay dice no lobby
                document.getElementById("NameText").innerText = "Lobby_"+Connection.getLobby();
                //El chat lo mostramos
                this.chat.hidden = false;
                
                
                
            }else{
                this.backLobby.setVisible(false);
                this.lista.hidden = false;
                //El chat lo ocultamos
                this.chat.hidden = true;

                //Ponemos que no hay lobby seleccionado
                document.getElementById("NameText").innerText = "No lobby";
            }
        }else{
            this.currentLobby.hidden = true;

        }
        
    }

    /**
     * Metodo para poner un error, no muy largo
     */
    public static setErrorLog(error : string){
        document.getElementById("ErrorLogMessage").innerHTML = error;
    }

    update(){
        //Se gestiona la posición de varios elementos al redimensionar
        this.textBoxPosition();
        //Activamos la animación
        this.updateSign();
        //Gestionamos los lobbys y sus elementos
        this.gestionLobby();

        if(Connection.getUser() == null && !this.logActive) {
            this.reset();
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.lista.hidden = true;
            this.transition = false;
            $( ".Row" ).remove();
            this.destroy();
            Connection.close();
            return;
        }

        if(!this.userlist)
            return;
            
        var users = this.userlist.getUsers();
        var allReady = true;
        for(let user of users) {
            if(!user.ready) {
                allReady = false;
            }
        }

        if(allReady && users.length >= 2) {
            
            this.reset();
            this.userName.hidden = true;
            this.userPassword.hidden = true;
            this.currentLobby.hidden = true;
            this.errorLog.hidden = true;
            this.transition = false;
            this.lista.hidden = true;
            this.chat.hidden = true;
            this.destroy();
            if(Connection.isMod()) {
                    Connection.sendOperation("LOBBY_START",
                    Connection.getLobby().toString());
                }
        }
    }

    destroy(){
        //Imagenes
        this.readyOff.destroy();       
        this.readyOn.destroy(); 
        this.back.destroy(); 
        this.connect.destroy(); 
        this.connectOn.destroy(); 
        this.backLobby.destroy(); 
        this.backLobbyOn.destroy(); 
        this.exitMulti.destroy(); 
        this.exitMultiOn.destroy(); 
        this.sign.destroy(); 
        this.sign_exit.destroy(); 
        this.sign_exitOn.destroy(); 
        this.sign_logIn.destroy(); 
        this.sign_logInOn.destroy(); 
        this.sign_signUp.destroy(); 
        this.sign_signUpOn.destroy();
        //Userlist
        if(this.userlist){
            this.userlist.destroy();
        }
        
        this.userlist = null;
        //Background
        this.backgroundMulti.destroy();
        this.backgroundLobby.destroy();
        this.backgroundMultiShadow.destroy();

        //Html boys
        this.lista.hidden = true;
        this.chat.hidden = true;

    }

    public static getUuidsFromLobby(lobby:number,listener :(uuids:string[]) => void) {

        Connection.getAllUsersId(lobby,function(uuids) {

            listener(uuids);
        });
    }
    
}
