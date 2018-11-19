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
    private static listeners :(() => void)[];

    /**
     * Dirección del host al que se puede conectar otro terminal
     */
    private host :string;

    /**
     * Puerto al que se debe conectar otro terminal
     */
    private port :string;

    /**
     * Esta clase sigue el patrón singleton y no es instanciable.
     * @param hostaddress Dirección del host y su puerto, recibido desde el archivo host.txt
     */
    private constructor(hostaddress :string) {
        // La dirección y el puerto quedan separados por el carácter ":"
        this.host = hostaddress.split(":")[0];
        this.port = hostaddress.split(":")[1];
    }

    /**
     * Inicializa la conexión. Realiza peticiones REST a través de la librería de jQuery,
     * y por tanto esta función debe ser llamada dentro del callback de $(document).ready().
     * La conexión sólo puede inicializarse una vez por ejecución del programa.
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
            url: "host.txt"

        }).done(function(content) {
            // Al leerlo, si el archivo resulta está vacío es que ha habido un problema
            if(!content) {
                throw Error("Ha habido un problema al leer el host.");
            }

            // Si no ha habido ningún problema, podemos crear la instancia
            Connection.instance = new Connection(content);

            // Con la clase ya inicializada, ya podemos ejecutar las funciones que estaban
            // esperando a que cargara
            for(let listener of Connection.listeners) {
                listener();
            }

        }).fail(function(content) {
            // En este caso la petición GET no ha tenido éxito, lo cual puede ocurrir si
            // el programa del servidor ha fallado al crear el archivo host.txt.
            throw Error("El archivo del host no se ha creado o no se ha podido leer.");
        });
    }

    /**
     * Devuelve la dirección completa (dirección + puerto) del host.
     */
    public static getFullHost() {
        return Connection.instance.host + ":" + Connection.instance.port;
    }

    /**
     * Añade una función a la espera de que la conexión se inicialice. Cualquier parte del
     * programa que requiera utilizar esta clase debería esperar a que la clase se inicialize,
     * y por tanto el procesamiento tendría que hacerse dentro de funciones que estén a la espera. 
     * @param listener Función que se ejecutará cuando la conexión se inicialice
     */
    public static onInitialized(listener :() => void) {
        // Si la cola de listeners aún no está creada, hay que crearla
        if(!Connection.listeners) {
            Connection.listeners = [];
        }
        // Si aún no tenemos instancia singleton es porque la conexión no está inicializada,
        // así que ponemos la función a la espera
        if(!Connection.instance) {
            Connection.listeners.push(listener);
        // Pero si la hay, entonces la conexión ya estaba inicializada y podemos ejecutar
        // la función directamente
        } else {
            listener();
        }
    }
}