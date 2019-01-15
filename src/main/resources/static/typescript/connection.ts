/**
 * Clase estática que maneja la conexión con el servidor.
 */
class Connection {

    /**
     * Instancia singleton de esta clase
     */
    private static instance :Connection;
    
    /**
     * Funciones a ejecutar cuando la conexión se inicie
     */
    private static listenersInit :(() => void)[];

    /**
     * Funciones a ejecutar cuando la conexión se cierre correctamente
     */
    private static listenersClose :(() => void)[];

    /**
     * Funciones a ejecutar cuando la conexión se pierda
     */
    private static listenersLost :(() => void)[];

    /**
     * Dirección del host al que se puede conectar otro terminal
     */
    private host :string;

    /**
     * WebSocket que conecta a este cliente con el servidor
     */
    private websocket :WebSocket;

    /**
     * Usuario asociado a este cliente
     */
    private user :User;

    private mod :boolean;

    private lobby :number;

    // /**
    //  * Identificador del intervalo que actualiza la conexión cada poco tiempo
    //  */
    // private updateInterval :number;

    /**
     * Esta clase sigue el patrón singleton y no es instanciable.
     * @param host Dirección del host y su puerto, recibido desde el archivo host.txt
     */
    private constructor(host :string) {
        // La dirección y el puerto vienen incluidos
        this.host = host;
        this.lobby = null;
    }

    /**
     * Inicializa la conexión.
     */
    public static initialize() {
        // Si ya estaba inicializada lanzamos un error
        if(Connection.instance) {
            throw Error("La clase Connection ya estaba inicializada.");
        }

        // Y si no está inicializada, lanzamos una petición de tipo GET para leer el
        // contenido del archivo host.txt. El resto del contenido de esta función se
        // encuentra en callbacks, que esperan a que la petición termine.
        $.ajax({
            url: "http://" + location.host + "/address"

        }).done(function(content) {
            // Al leerlo, si el archivo resulta está vacío es que ha habido un problema
            if(!content) {
                throw Error("Ha habido un problema al leer la dirección.");
            }

            // Si no ha habido ningún problema, podemos crear la instancia
            Connection.instance = new Connection(content);

            // Con la clase ya inicializada, ya podemos ejecutar las funciones que estaban
            // esperando a que cargara
            if(Connection.listenersInit) {
                for(let listener of Connection.listenersInit) {
                    listener();
                }
            }

            // Vaciamos la cola de funciones que estaban esperando
            Connection.listenersInit = [];

            Connection.instance.mod = false;

            console.log("Conexión inicializada");

        }).fail(function(content) {
            // En este caso la petición GET no ha tenido éxito, lo cual puede ocurrir si
            // el programa del servidor ha fallado al crear el archivo host.txt.
            throw Error("No se ha podido establecer la conexión con el servidor.");
        });
    }

    /**
     * Inicializa el WebSocket y le indica al servidor a qué usuario pertenece el mismo
     * @param user El usuario al que pertenece el WebSocket
     */
    public static openSocket(user :User) {
        var websocket = new WebSocket("ws://" + location.host + "/socket");
        Connection.instance.websocket = websocket
        websocket.onopen = () => {
            Connection.sendOperation("LINK_USER", user.id);
            console.log("WebSocket abierto");
        }
        websocket.onmessage = Connection.onWebSocketMessage;
        websocket.onclose = Connection.onWebSocketClose;
        Connection.onClosed(() => console.log("WebSocket cerrado"));
        Connection.onLost(() => console.error("Se ha perdido la conexión con el servidor"));
    }

    public static sendOperation(operation :string, value :object | string) {
        var data = value;
        if(typeof(data) !== "string") {
            data = JSON.stringify(data);
        }
        Connection.onInitialized(function() {
            Connection.instance.websocket.send(JSON.stringify({
                operation: operation,
                value: data
            }));
        });
    }

    /**
     * Finaliza la conexión con el servidor
     */
    public static close() {
        if(Connection.instance && Connection.instance.websocket) {
            Connection.instance.websocket.close();
        }
        Connection.dropUser();
        Connection.instance = null;
        console.log("Conexión finalizada");
    }

    /**
     * Indica si la conexión entre cliente y servidor está lista para usarse
     */
    public static isReady() {
        return Connection.instance && Connection.instance.user && Connection.instance.websocket
        && Connection.instance.websocket.readyState == WebSocket.OPEN;
    }

    /**
     * Devuelve la dirección completa (dirección + puerto) del host.
     */
    public static getHostAddress() {
        return Connection.instance.host;
    }
    
    /**
     * Envía un mensaje al servidor través de WebSocket
     * @param message El mensaje a enviar
     */
    public static socketSend(message :string) {
        Connection.instance.websocket.send(message);
    }

    /**
     * Devuelve el usuario asociado a este cliente
     */
    public static getUser() {
       var ret :User;
       if(Connection.instance && Connection.instance.user) {
           ret = Connection.instance.user
       } else {
           ret = null;
       }
       return ret;
    }

    /**
     * Añade una función a la espera de que la conexión se inicialice. Cualquier parte del
     * programa que requiera utilizar esta clase debería esperar a que la clase se inicialize,
     * y por tanto el procesamiento tendría que hacerse dentro de funciones que estén a la espera. 
     * @param listener Función que se ejecutará cuando la conexión se inicialice
     */
    public static onInitialized(listener :() => void) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if(!Connection.listenersInit) {
            Connection.listenersInit = [];
        }
        // Si aún no tenemos instancia singleton es porque la conexión no está inicializada,
        // así que ponemos la función a la espera
        if(!Connection.instance) {
            Connection.listenersInit.push(listener);
        // Pero si la hay, entonces la conexión ya estaba inicializada y podemos ejecutar
        // la función directamente
        } else {
            listener();
        }
    }

    /**
     * Añade una función a la espera de ejecutarse cuando la conexión se cierre con éxito
     * @param listener La función en cuestión
     */
    public static onClosed(listener :() => void) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if(!Connection.listenersClose) {
            Connection.listenersClose = [];

        }

        Connection.listenersClose.push(listener);
    }
    /**
     * Añade una función a la espera de ejecutarse cuando la conexión se cierra debido a algú problema
     * @param listener La función en cuestión
     */

    public static onLost(listener :() => void) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if(!Connection.listenersLost) {
            Connection.listenersLost = [];

        }

        Connection.listenersLost.push(listener);
    }

    public static setMod(mod = true) {
        Connection.instance.mod = mod;
        if(mod && !NpcSync.isActive()) {
            NpcSync.activate();
        } else if(!mod && NpcSync.isActive()) {
            NpcSync.deactivate();
        }
    }

    public static isMod() {
        return Connection.instance.mod;
    }

    /**
     * Pide al servidor los mensajes del chat y ejecuta una función cuando los recibe
     * @param listener La función en cuestión. Recibe un array de mensajes como parámetro
     */
    public static readChatMessages(listener :(messages :Message[]) => void) {
        Connection.onInitialized(function() {
            if(!Connection.instance.lobby) {
                return;
            }

            Connection.ajaxGet("/chat/" + Connection.instance.lobby.toString())
            .done(function(messages) {
                listener(messages);
            }).fail(function() {
                console.error("No se ha podido conectar al chat");
            });
        });
    }

    /**
     * Envía un mensaje al chat
     * @param message Mensaje a enviar
     * @param listener Función a ejecutar si el mensaje se envía
     */
    public static sendChatMessage(message :Message, listener? :() => void) {
        if(Connection.instance && Connection.instance.user || SERVER) {
            Connection.ajaxPost("/chat", message)
            .done(function() {
                if(listener)
                    listener();
            }).fail(function() {
                console.error("No se ha podido enviar el mensaje al servidor.");
            })
        } else {
            console.error("No se puede mandar un mensaje al chat porque no hay " +
            "ningún usuario asociado a este cliente.");
        }
    } 

    /**
     * Solicita al servidor una lista con los usuarios conectados y ejecuta una función al recibirla
     * @param listener La función en cuestión. Recibe un array de usuarios como parámetro
     */
    public static getAllUsers(listener :(users :User[]) => void) {
        Connection.onInitialized(function() {
            Connection.ajaxGet("/users")
            .done(function(users) {
                listener(users);
            }).fail(function() {
                console.error("No se ha podido obtener los usuarios conectados");
            })
        });
    }

    /**
     * Solicita al servidor un array con los UUIDs de todos los usuarios, y ejecuta
     * una función cuando se reciben
     * @param listener La función en cuestión
     */
    public static getAllUsersId(listener :(uuids :string[]) => void) {
        Connection.onInitialized(function() {
            if(!Connection.instance.lobby) {
                return;
            }

            Connection.ajaxGet("/users/uuid/" + Connection.instance.lobby)
            .done(function(uuids) {
                listener(uuids);
            }).fail(function() {
                console.error("No se ha podido obtener los usuarios conectados");
            })
        })
    }

    /**
     * Pregunta al servidor si existe un usuario con la UUID dada, y ejecuta una función cuando responda
     * @param uuid 
     * @param listener 
     */
    public static checkIfUserExists(uuid :string, listener :(exists :boolean) => void) {
        Connection.onInitialized(function() {
            Connection.ajaxGet("/users/" + uuid)
            .done(function(user) {
                listener(user !== "");
            }).fail(function() {
                console.error("No se ha podido comprobar la conexión de un usuario");
            });
        })
    }

    /**
     * Solicita un nuevo usuario que se asociará a este cliente, y ejecuta una función al
     * recibir la confirmación de que se ha creado con éxito u otra si el usuario no se puede
     * crear porque su nombre es inválido.
     * @param username El nombre de usuario deseado
     * @param onSuccess La función a ejecutar una vez el servidor confirme el usuario nuevo,
     * recibe por parámetro dicho usuario
     * @param onFail La función a ejecutar si el servidor rechaza el nombre de usuario propuesto,
     * recibe por parámetro el error indicado por el servidor
     */
    public static tryCreateUser(username :string, password :string, registration? :boolean, onSuccess? :(user :User) => void, onFail? :(error :LoginStatus) => void) {
        Connection.onInitialized(function() {
            Connection.ajaxPost("/users" + (registration? "/register" : ""),
            {name: username, password: password})
            .done(function(reponse :UserCreationReponse) {
                if(reponse.status == "OK") {
                    Connection.ajaxGet("/users/" + reponse.id)
                    .done(function (user) {
                        Connection.instance.user = user;
                        if(onSuccess)
                            onSuccess(user);
                    }).fail(function() {
                        console.error("No se ha podido conectar con el servidor para iniciar sesión.");
                    });
                } else {
                    if(onFail)
                        onFail(reponse.status);
                }
            }).fail(function() {
                console.error("No se ha podido conectar con el servidor para iniciar sesión.");
            })
        });
    }

    /**
     * Se desconecta del servidor y descarta el usuario que estaba asociado a este cliente
     */
    public static dropUser() {
        if(Connection.instance) {
            Connection.instance.user = null;
        }
    }


    /**
     * Cambia el estado de ready del usuario en el servidor
     * @param ready Nuevo estado de ready
     * @param listener Función a ejecutar cuando se confirme el cambio de estado
     */
    public static setUserReady(ready :boolean, listener? :() => void) {
        if(Connection.instance && Connection.instance.user) {
            Connection.ajaxPost("/users/" + Connection.instance.user.id + "/ready", 
                ready.toString()
            ).done(function(user) {
                Connection.updateUser(user);
                if(listener)
                    listener();
            }).fail(function() {
                console.error("No se ha podido cambiar el estado de ready en el servidor.");
            });
        }
    }

    public static enterLobby(lobby :number) {
        Connection.sendOperation("ENTER_LOBBY", lobby.toString());
        Connection.instance.lobby = lobby;
        chat = new Chat();
        chat.startUpdating();
    }

    public static exitLobby() {
        Connection.sendOperation("EXIT_LOBBY", "");
        Connection.instance.lobby = null;
        chat.stopUpdating();
        chat = null;
    }

    public static getLobby() {
        return Connection.instance.lobby;
    }

    /**
     * Si hay un usuario en este cliente, actualiza sus datos con la nueva información. Esta
     * función existe para evitar reinstanciar la clase User, porque puede ser problemático
     * si otra parte del programa ha almacenado en una variable la instancia de usuario actual.
     * @param newUser 
     */
    private static updateUser(newUser :User) {
        if(Connection.instance && Connection.instance.user) {
            Connection.instance.user.id = newUser.id;
            Connection.instance.user.name = newUser.name;
            Connection.instance.user.ready = newUser.ready;
        } else {
            console.error("Se ha intentado actualizar un usuario inexistente");
        }
    }

    /**
     * Envía una petición GET a la url deseada del servidor
     * @param url La dirección, basada en el servidor, a la que enviar la petición
     */
    private static ajaxGet(url :string) {
        return $.ajax({
            method: "GET",
            url: "http://" + Connection.getHostAddress() + url
        });
    }

    /**
     * Envía una petición POST a la url del servidor con el cuerpo indicado
     * @param url La dirección, basada en el servidor, a la que enviar la petición
     * @param data El cuerpo de la petición
     */
    private static ajaxPost(url :string, data :object | string) {
        var send :string;
        var contentType :string;
        if(typeof(data) !== "string") {
            send = JSON.stringify(data);
            contentType = "application/json";
        } else {
            send = data;
            contentType = "text/plain"
        }
        return $.ajax({
            method: "POST",
            url: "http://" + Connection.getHostAddress() + url,
            data: send,
            processData: false,
            headers: {
                "Content-Type": contentType
            }
        });
    }

    /**
     * Evento que se ejecuta cuando se recibe un mensaje por WebSocket
     * @param message Mensaje recibido, usar message.data para obtener el string que envió el servidor
     */
    private static onWebSocketMessage(message :MessageEvent) {
        var msgdata :WebSocketOperation = JSON.parse(message.data);

        switch(msgdata.operation) {
            case "SYNC_PLAYER":
                var value = JSON.parse(msgdata.value);
                var player = RemotePlayer.get(value.uuid);
                if(player && Connection.getUser().id != value.uuid) {
                    player.receiveData(value);
                }
                break;
            case "SYNC_NPC":
                var value = JSON.parse(msgdata.value);
                NpcSync.receiveData(value);
                break;
            case "SET_MOD":
                Connection.setMod();
                break;
            case "START_GAME":
                game.scene.start("SceneOverworld");
                break;
            default:
                console.error("La operación " + msgdata.operation + " recibida del servidor"
                + " no está soportada");
        }
    }

    /**
     * Evento que se ejecuta cuando se cierra la conexión por WebSocket, independientemente del motivo
     * @param event 
     */
    private static onWebSocketClose(event :CloseEvent) {
        if(event.code == 1000) {
            for(let listener of Connection.listenersClose) {
                listener();
            }
        } else {
            for(let listener of Connection.listenersLost) {
                listener();
            }
            Connection.dropUser();
            Connection.instance = null;
            console.log("Conexión finalizada forzadamente");
        }
    }
}
