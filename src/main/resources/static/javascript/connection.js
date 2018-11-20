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
            url: "host.txt"
        }).done(function (content) {
            // Al leerlo, si el archivo resulta está vacío es que ha habido un problema
            if (!content) {
                throw Error("Ha habido un problema al leer el host.");
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
            Connection.instance.updateInterval = setInterval(Connection.update, 500);
        }).fail(function (content) {
            // En este caso la petición GET no ha tenido éxito, lo cual puede ocurrir si
            // el programa del servidor ha fallado al crear el archivo host.txt.
            throw Error("El archivo del host no se ha creado o no se ha podido leer.");
        });
    }
    /**
     * Devuelve la dirección completa (dirección + puerto) del host.
     */
    static getHostAddress() {
        return Connection.instance.host;
    }
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
    static readConnectedUsers(listener) {
        Connection.onInitialized(function () {
            Connection.ajaxGet("/users")
                .done(function (users) {
                listener(users);
            }).fail(function () {
                console.error("No se ha podido obtener los jugadores conectados.");
            });
        });
    }
    static createUser(username) {
        Connection.onInitialized(function () {
            Connection.ajaxPost("/users", {
                username: username
            }).done(function (user) {
                if (!user) {
                    console.error("Ya hay otro usuario con el mismo nombre.");
                }
                else {
                    Connection.instance.user = user;
                }
            }).fail(function () {
                console.error("No se ha podido crear un usuario en el servidor.");
            });
        });
    }
    static dropUser() {
        if (Connection.instance) {
            Connection.instance.user = null;
        }
    }
    static changeUsername(newName) {
        if (Connection.instance && Connection.instance.user) {
            Connection.ajaxPost("/users/" + Connection.instance.user.id, { username: newName })
                .done(function (user) {
                if (!user) {
                    console.error("Ya hay otro usuario con el mismo nombre.");
                }
                else {
                    Connection.instance.user = user;
                }
            }).fail(function () {
                console.error("No se ha podido solicitar al servidor un cambio de nombre.");
            });
        }
    }
    static update() {
        if (Connection.instance && Connection.instance.user) {
            Connection.ajaxGet("/users/" + Connection.instance.user.id)
                .fail(function () {
                console.error("Se ha perdido la conexión con el servidor.");
                Connection.dropUser();
            });
        }
    }
    static ajaxGet(url) {
        return $.ajax({
            method: "GET",
            url: "http://" + Connection.getHostAddress() + url
        });
    }
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