/**
 * Clase estática que maneja la conexión con el servidor.
 */
class Connection {
    // /**
    //  * Identificador del intervalo que actualiza la conexión cada poco tiempo
    //  */
    // private updateInterval :number;
    /**
     * Esta clase sigue el patrón singleton y no es instanciable.
     * @param host Dirección del host y su puerto, recibido desde el archivo host.txt
     */
    constructor(host) {
        // La dirección y el puerto vienen incluidos
        this.host = host;
        this.lobby = null;
    }
    /**
     * Inicializa la conexión.
     */
    static initialize() {
        // Si ya estaba inicializada lanzamos un error
        if (Connection.instance) {
            throw Error("La clase Connection ya estaba inicializada.");
        }
        // Y si no está inicializada, lanzamos una petición de tipo GET para leer el
        // contenido del archivo host.txt. El resto del contenido de esta función se
        // encuentra en callbacks, que esperan a que la petición termine.
        $.ajax({
            url: "http://" + location.host + "/address"
        }).done(function (content) {
            // Al leerlo, si el archivo resulta está vacío es que ha habido un problema
            if (!content) {
                throw Error("Ha habido un problema al leer la dirección.");
            }
            // Si no ha habido ningún problema, podemos crear la instancia
            Connection.instance = new Connection(content);
            // Con la clase ya inicializada, ya podemos ejecutar las funciones que estaban
            // esperando a que cargara
            if (Connection.listenersInit) {
                for (let listener of Connection.listenersInit) {
                    listener();
                }
            }
            // Vaciamos la cola de funciones que estaban esperando
            Connection.listenersInit = [];
            Connection.instance.mod = false;
            console.log("Conexión inicializada");
        }).fail(function (content) {
            // En este caso la petición GET no ha tenido éxito, lo cual puede ocurrir si
            // el programa del servidor ha fallado al crear el archivo host.txt.
            throw Error("No se ha podido establecer la conexión con el servidor.");
        });
    }
    /**
     * Inicializa el WebSocket y le indica al servidor a qué usuario pertenece el mismo
     * @param user El usuario al que pertenece el WebSocket
     */
    static openSocket(user) {
        var websocket = new WebSocket("ws://" + location.host + "/socket");
        Connection.instance.websocket = websocket;
        websocket.onopen = () => {
            Connection.sendOperation("LINK_USER", user.id);
            console.log("WebSocket abierto");
        };
        websocket.onmessage = Connection.onWebSocketMessage;
        websocket.onclose = Connection.onWebSocketClose;
        Connection.onClosed(() => console.log("WebSocket cerrado"));
        Connection.onLost(() => console.error("Se ha perdido la conexión con el servidor"));
    }
    static ping(success, fail) {
        if (!Connection.instance) {
            if (fail) {
                fail();
            }
            return;
        }
        Connection.ajaxGet("/address")
            .done(function () {
            success();
        }).fail(function () {
            if (fail) {
                fail();
            }
        });
    }
    static sendOperation(operation, value) {
        var data = value;
        if (typeof (data) !== "string") {
            data = JSON.stringify(data);
        }
        Connection.onInitialized(function () {
            Connection.instance.websocket.send(JSON.stringify({
                operation: operation,
                value: data
            }));
        });
    }
    /**
     * Finaliza la conexión con el servidor
     */
    static close() {
        if (Connection.instance && Connection.instance.websocket) {
            Connection.instance.websocket.close();
        }
        Connection.listenersClose = [];
        Connection.listenersLost = [];
        Connection.listenersInit = [];
        Connection.dropUser();
        NpcSync.deactivate();
        Connection.instance = null;
        console.log("Conexión finalizada");
    }
    /**
     * Indica si la conexión entre cliente y servidor está lista para usarse
     */
    static isReady() {
        return Connection.instance && Connection.instance.user && Connection.instance.websocket
            && Connection.instance.websocket.readyState == WebSocket.OPEN;
    }
    /**
     * Devuelve la dirección completa (dirección + puerto) del host.
     */
    static getHostAddress() {
        return Connection.instance.host;
    }
    /**
     * Envía un mensaje al servidor través de WebSocket
     * @param message El mensaje a enviar
     */
    static socketSend(message) {
        Connection.instance.websocket.send(message);
    }
    /**
     * Devuelve el usuario asociado a este cliente
     */
    static getUser() {
        var ret;
        if (Connection.instance && Connection.instance.user) {
            ret = Connection.instance.user;
        }
        else {
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
    static onInitialized(listener) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if (!Connection.listenersInit) {
            Connection.listenersInit = [];
        }
        // Si aún no tenemos instancia singleton es porque la conexión no está inicializada,
        // así que ponemos la función a la espera
        if (!Connection.instance) {
            Connection.listenersInit.push(listener);
            // Pero si la hay, entonces la conexión ya estaba inicializada y podemos ejecutar
            // la función directamente
        }
        else {
            listener();
        }
    }
    /**
     * Añade una función a la espera de ejecutarse cuando la conexión se cierre con éxito
     * @param listener La función en cuestión
     */
    static onClosed(listener) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if (!Connection.listenersClose) {
            Connection.listenersClose = [];
        }
        Connection.listenersClose.push(listener);
    }
    /**
     * Añade una función a la espera de ejecutarse cuando la conexión se cierra debido a algú problema
     * @param listener La función en cuestión
     */
    static onLost(listener) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if (!Connection.listenersLost) {
            Connection.listenersLost = [];
        }
        Connection.listenersLost.push(listener);
    }
    static setMod(mod = true) {
        Connection.instance.mod = mod;
    }
    static isMod() {
        if (!Connection.instance) {
            return false;
        }
        else {
            return Connection.instance.mod;
        }
    }
    /**
     * Pide al servidor los mensajes del chat y ejecuta una función cuando los recibe
     * @param listener La función en cuestión. Recibe un array de mensajes como parámetro
     */
    static readChatMessages(listener) {
        Connection.onInitialized(function () {
            if (Connection.instance.lobby == null) {
                return;
            }
            Connection.ajaxGet("/chat/" + Connection.instance.lobby.toString())
                .done(function (messages) {
                listener(messages);
            }).fail(function () {
                console.error("No se ha podido conectar al chat");
            });
        });
    }
    /**
     * Envía un mensaje al chat
     * @param message Mensaje a enviar
     * @param listener Función a ejecutar si el mensaje se envía
     */
    static sendChatMessage(message, listener) {
        if (Connection.instance && Connection.instance.user || SERVER) {
            Connection.ajaxPost("/chat", message)
                .done(function () {
                if (listener)
                    listener();
            }).fail(function () {
                console.error("No se ha podido enviar el mensaje al servidor.");
            });
        }
        else {
            console.error("No se puede mandar un mensaje al chat porque no hay " +
                "ningún usuario asociado a este cliente.");
        }
    }
    /**
     * Solicita al servidor una lista con los usuarios conectados y ejecuta una función al recibirla
     * @param listener La función en cuestión. Recibe un array de usuarios como parámetro
     */
    static getAllUsers(listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/users")
                .done(function (users) {
                listener(users);
            }).fail(function () {
                console.error("No se ha podido obtener los usuarios conectados");
            });
        });
    }
    /**
     * Solicita al servidor un array con los UUIDs de todos los usuarios, y ejecuta
     * una función cuando se reciben
     * @param listener La función en cuestión
     */
    static getAllUsersId(lobby, listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/users/uuid/" + lobby)
                .done(function (uuids) {
                listener(uuids);
            }).fail(function () {
                console.error("No se ha podido obtener los usuarios conectados");
            });
        });
    }
    /**
     * Devuelve el numero maximo de lobbies
     */
    static getMaxLobbies(listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/users/lobbies")
                .done(function (lobbies) {
                listener(lobbies);
            }).fail(() => console.error("No se ha podido conectar con el servidor para obtener el número de lobbies del mismo"));
        });
    }
    /**
     * Pregunta al servidor si existe un usuario con la UUID dada, y ejecuta una función cuando responda
     * @param uuid
     * @param listener
     */
    static checkIfUserExists(uuid, listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/users/" + uuid)
                .done(function (user) {
                listener(user !== "");
            }).fail(function () {
                console.error("No se ha podido comprobar la conexión de un usuario");
            });
        });
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
    static tryCreateUser(username, password, registration, onSuccess, onFail) {
        Connection.onInitialized(function () {
            Connection.ajaxPost("/users" + (registration ? "/register" : ""), { name: username, password: password })
                .done(function (reponse) {
                if (reponse.status == "OK") {
                    Connection.ajaxGet("/users/" + reponse.id)
                        .done(function (user) {
                        Connection.instance.user = user;
                        if (onSuccess)
                            onSuccess(user);
                    }).fail(function () {
                        console.error("No se ha podido conectar con el servidor para iniciar sesión.");
                    });
                }
                else {
                    if (onFail)
                        onFail(reponse.status);
                }
            }).fail(function () {
                console.error("No se ha podido conectar con el servidor para iniciar sesión.");
            });
        });
    }
    /**
     * Se desconecta del servidor y descarta el usuario que estaba asociado a este cliente
     */
    static dropUser() {
        if (Connection.instance) {
            Connection.instance.user = null;
            Connection.instance.lobby = null;
            console.log("Este usuario ha abandonado el servidor.");
        }
    }
    /**
     * Cambia el estado de ready del usuario en el servidor
     * @param ready Nuevo estado de ready
     * @param listener Función a ejecutar cuando se confirme el cambio de estado
     */
    static setUserReady(ready, listener) {
        if (Connection.instance && Connection.instance.user) {
            Connection.ajaxPost("/users/" + Connection.instance.user.id + "/ready", ready.toString()).done(function (user) {
                Connection.updateUser(user);
                if (listener)
                    listener();
            }).fail(function () {
                console.error("No se ha podido cambiar el estado de ready en el servidor.");
            });
        }
    }
    static getLobbyStatus(lobby, listener) {
        Connection.ajaxGet("/users/lobbies/" + lobby)
            .done(function (status) {
            listener(status);
        }).fail(() => console.error("No se ha podido conectar con el servidor para obtener el estado del lobby " + lobby));
    }
    static enterLobby(lobby) {
        Connection.onInitialized(() => {
            Connection.ajaxGet("/users/lobbies/" + lobby)
                .done(function (reponse) {
                switch (reponse) {
                    case "FULL":
                        console.error("Lobby " + lobby + " lleno");
                        break;
                    case "PLAYING":
                        console.error("Lobby " + lobby + " playing");
                        break;
                    case "OK":
                        Connection.sendOperation("ENTER_LOBBY", lobby.toString());
                        Connection.instance.lobby = lobby;
                        chat = new Chat();
                        chat.startUpdating();
                        break;
                }
            }).fail(function () { console.error("No se ha podido conectar con el servidor para verificar el estado del lobby."); });
        });
    }
    static exitLobby() {
        Connection.sendOperation("EXIT_LOBBY", "");
        Connection.instance.lobby = null;
        Connection.instance.mod = false;
        chat.stopUpdating();
        chat = null;
    }
    static getLobby() {
        if (!Connection.instance) {
            return null;
        }
        else {
            return Connection.instance.lobby;
        }
    }
    /**
     * Si hay un usuario en este cliente, actualiza sus datos con la nueva información. Esta
     * función existe para evitar reinstanciar la clase User, porque puede ser problemático
     * si otra parte del programa ha almacenado en una variable la instancia de usuario actual.
     * @param newUser
     */
    static updateUser(newUser) {
        if (Connection.instance && Connection.instance.user) {
            Connection.instance.user.id = newUser.id;
            Connection.instance.user.name = newUser.name;
            Connection.instance.user.ready = newUser.ready;
        }
        else {
            console.error("Se ha intentado actualizar un usuario inexistente");
        }
    }
    /**
     * Envía una petición GET a la url deseada del servidor
     * @param url La dirección, basada en el servidor, a la que enviar la petición
     */
    static ajaxGet(url) {
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
    static ajaxPost(url, data) {
        var send;
        var contentType;
        if (typeof (data) !== "string") {
            send = JSON.stringify(data);
            contentType = "application/json";
        }
        else {
            send = data;
            contentType = "text/plain";
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
    static onWebSocketMessage(message) {
        var msgdata = JSON.parse(message.data);
        switch (msgdata.operation) {
            case "SYNC_PLAYER":
                var value = JSON.parse(msgdata.value);
                var player = RemotePlayer.get(value.uuid);
                if (player && Connection.getUser().id != value.uuid) {
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
                SceneMultiplayerMenu.getUuidsFromLobby(Connection.getLobby(), (uuids) => {
                    RemotePlayer.pendingUuids = [];
                    for (let uuid of uuids) {
                        if (Connection.getUser().id != uuid) {
                            RemotePlayer.pendingUuids.push(uuid);
                        }
                    }
                    if (Connection.isMod()) {
                        NpcSync.activate();
                    }
                    game.scene.stop("SceneMenuMultiplayer");
                    game.scene.start("SceneOverworld");
                });
                break;
            case "LOBBY_WIN":
                if (Connection.instance) {
                    SceneOverworld.instance.room.colliderLayers = [];
                    NpcSync.deactivate();
                    SceneOverworld.instance.scene.stop("SceneOverworld");
                    SceneOverworld.instance.scene.stop("SceneGUI");
                    SceneOverworld.instance.scene.start("SceneGameVictory");
                    if (multiplayer) {
                        SceneOverworld.instance.stopSync();
                    }
                }
                break;
            case "LEVER_INTERACT":
                if (!SceneOverworld.instance.door.open) {
                    SceneOverworld.instance.door.open = true;
                    SceneOverworld.instance.door.update();
                    SceneOverworld.instance.switch.update();
                }
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
    static onWebSocketClose(event) {
        if (event.code == 1000) {
            for (let listener of Connection.listenersClose) {
                listener();
            }
        }
        else {
            for (let listener of Connection.listenersLost) {
                listener();
            }
            //Connection.exitLobby();
            Connection.dropUser();
            Connection.instance = null;
            console.log("Conexión finalizada forzadamente");
        }
        Connection.listenersClose = [];
        Connection.listenersLost = [];
        Connection.listenersInit = [];
        NpcSync.deactivate();
    }
}
//# sourceMappingURL=connection.js.map