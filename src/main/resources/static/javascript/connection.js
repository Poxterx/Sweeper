/**
 * Clase estática que maneja la conexión con el servidor.
 */
class Connection {
    /**
     * Esta clase sigue el patrón singleton y no es instanciable.
     * @param host Dirección del host y su puerto, recibido desde el archivo host.txt
     */
    constructor(host) {
        // La dirección y el puerto vienen incluidos
        this.host = host;
    }
    /**
     * Inicializa la conexión. Realiza peticiones REST a través de la librería de jQuery,
     * y por tanto esta función debe ser llamada dentro del callback de $(document).ready().
     * La conexión sólo puede inicializarse una vez por ejecución del programa.
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
            if (Connection.listeners) {
                for (let listener of Connection.listeners) {
                    listener();
                }
            }
            // Vaciamos la cola de funciones que estaban esperando
            Connection.listeners = [];
            // Iniciamos las actualizaciones
            Connection.instance.updateInterval = setInterval(Connection.update, 500);
        }).fail(function (content) {
            // En este caso la petición GET no ha tenido éxito, lo cual puede ocurrir si
            // el programa del servidor ha fallado al crear el archivo host.txt.
            throw Error("No se ha podido establecer la conexión con el servidor.");
        });
    }
    /**
     * Devuelve la dirección completa (dirección + puerto) del host.
     */
    static getHostAddress() {
        return Connection.instance.host;
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
        if (!Connection.listeners) {
            Connection.listeners = [];
        }
        // Si aún no tenemos instancia singleton es porque la conexión no está inicializada,
        // así que ponemos la función a la espera
        if (!Connection.instance) {
            Connection.listeners.push(listener);
            // Pero si la hay, entonces la conexión ya estaba inicializada y podemos ejecutar
            // la función directamente
        }
        else {
            listener();
        }
    }
    /**
     * Pide al servidor los mensajes del chat y ejecuta una función cuando los recibe
     * @param listener La función en cuestión. Recibe un array de mensajes como parámetro
     */
    static readChatMessages(listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/chat")
                .done(function (messages) {
                listener(messages);
            }).fail(function () {
                console.error("No se ha podido conectar al chat.");
            });
        });
    }
    /**
     * Envía un mensaje al chat
     * @param message Mensaje a enviar
     * @param listener Función a ejecutar si el mensaje se envía
     */
    static sendChatMessage(message, listener) {
        if (Connection.instance && Connection.instance.user) {
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
    static readConnectedUsers(listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/users")
                .done(function (users) {
                listener(users);
            }).fail(function () {
                console.error("No se ha podido obtener los usuarios conectados.");
            });
        });
    }
    /**
     * Solicita un nuevo usuario que se asociará a este cliente, y ejecuta una función al
     * recibir la confirmación de que se ha creado con éxito. Es posible que el usuario no
     * se cree porque ya exista otro con el mismo nombre.
     * @param username El nombre de usuario deseado
     * @param listener La función a ejecutar una vez el servidor confirme el usuario nuevo,
     * recibe por parámetro dicho usuario
     */
    static createUser(username, listener) {
        Connection.onInitialized(function () {
            Connection.ajaxPost("/users", {
                username: username
            }).done(function (user) {
                if (!user) {
                    console.error("Ya hay otro usuario con el mismo nombre.");
                }
                else {
                    Connection.instance.user = user;
                    if (listener)
                        listener(user);
                }
            }).fail(function () {
                console.error("No se ha podido crear un usuario en el servidor.");
            });
        });
    }
    /**
     * Se desconecta del servidor y descarta el usuario que estaba asociado a este cliente
     */
    static dropUser() {
        if (Connection.instance) {
            Connection.instance.user = null;
        }
    }
    /**
     * Solicita al servidor un cambio de nombre. Es posible que el nombre no cambie al ejecutarse
     * esta petición porque el nuevo nombre de usuario ya esté ocupado.
     * @param newName nombre de usuario deseado
     */
    static changeUsername(newName) {
        if (Connection.instance && Connection.instance.user) {
            Connection.ajaxPost("/users/" + Connection.instance.user.id, { username: newName })
                .done(function (user) {
                if (!user) {
                    console.error("Ya hay otro usuario con el mismo nombre.");
                }
                else {
                    Connection.updateUser(user);
                }
            }).fail(function () {
                console.error("No se ha podido solicitar al servidor un cambio de nombre.");
            });
        }
    }
    /**
     * Cambia el estado de ready del usuario en el servidor
     * @param ready Nuevo estado de ready
     * @param listener Función a ejecutar cuando se confirme el cambio de estado
     */
    static setReady(ready, listener) {
        if (Connection.instance && Connection.instance.user) {
            Connection.ajaxPost("/users/" + Connection.instance.user.id + "/ready", {
                username: Connection.instance.user.username,
                ready: ready
            }).done(function (user) {
                Connection.updateUser(user);
                if (listener)
                    listener();
            }).fail(function () {
                console.error("No se ha podido cambiar el estado de ready en el servidor.");
            });
        }
    }
    /**
     * Envía peticiones GET al servidor para asegurarle que seguimos conectados
     */
    static update() {
        if (Connection.instance && Connection.instance.user) {
            Connection.ajaxGet("/users/" + Connection.instance.user.id)
                .fail(function () {
                console.error("Se ha perdido la conexión con el servidor.");
                Connection.dropUser();
            });
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
            Connection.instance.user.username = newUser.username;
            Connection.instance.user.ready = newUser.ready;
        }
        else {
            console.error("Se ha intentado actualizar un usuario inexistente.");
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
        return $.ajax({
            method: "POST",
            url: "http://" + Connection.getHostAddress() + url,
            data: JSON.stringify(data),
            processData: false,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
//# sourceMappingURL=connection.js.map