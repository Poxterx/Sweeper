/**
 * Objeto con una coordenada X y una coordenada Y
 */
type Vector2 = {
    x :number,
    y :number
}

/**
 * Objeto con una coordenada X, una coordenada Y y una coordenada Z
 */
type Vector3 = {
    x :number,
    y :number,
    z :number
}

/**
 * Direcciones posibles en las que puede mirar una entidad
 */
type DirectionString = "up" | "down" | "left" | "right";

/**
 * Direcciones posibles para una animación
 */
type AnimationDirectionString = "up" | "down" | "side";

/**
 * Modos posibles para una animación
 */
type AnimationModeString = "walk" | "attack";

/**
 * Objeto que relaciona una serie de fotogramas con cada dirección contemplada en el tipo
 * AnimationDirectionString
 */
declare namespace DirectionalAnimation {
    /**
     * Objeto que relaciona una serie de fotogramas con cada dirección contemplada en el
     * tipo AnimationDirectionString
     */
    type OneCoord = {
        up :number[],
        down :number[],
        side :number[]
    }

    /**
     * Objeto que relaciona un vector bidimensional con cada fotograma asociado a cada dirección
     * contemplada en el tipo AnimationDirectionString
     */
    type TwoCoords = {
        up :Vector2[],
        down :Vector2[],
        side :Vector2[]
    }

    /**
     * Objeto que relaciona un vector tridimensional con cada fotograma asociado a cada dirección
     * contemplada en el tipo AnimationDirectionString
     */
    type ThreeCoords = {
        up :Vector3[],
        down :Vector3[],
        side :Vector3[]
    }
    
}

/**
 * Tipo que representa a un usuario del juego
 */
type User = {
    /**
     * Id que identifica únicamente a cada usuario en el servidor
     */
    id :string,
    /**
     * Nombre del usuario
     */
    name :string,
    /**
     * Indica si el usuario considera que está listo para comenzar la partida
     */
    ready :boolean,

    lobby :number,

    password :string
}
/**
 * Mensaje de chat
 */
type Message = {
    /**
     * Autor del mensaje
     */
    username :string,
    /**
     * Contenido del mensaje
     */
    content :string,
    /**
     * Lobby al que se ha enviado el mensaje
     */
    lobby :number
}

/**
 * Mensaje de respuesta que envía el servidor cuando se le propone un nuevo nombre de usuario:
 * - OK: El nombre es válido y se puede usar
 * - EMPTY: El nombre debe contener al menos un carácter, sin contar espacios vacíos
 * - TOOLONG: El nombre tiene más caracteres de los permitidos por el servidor, sin contar espacios vacíos
 * - INVALID: El nombre contiene el carácter §
 * - TAKEN: Otro usuario ya existente tiene un nombre igual, sin contar espacios vacíos
 * - NONEXISTENT: No hay ningún usuario registrado con ese nombre
 * - WRONGPASS: La contraseña es incorrecta
 */
type LoginStatus = "OK" | "EMPTY" | "TOOLONG" | "INVALID" | "TAKEN" | "NONEXISTENT" | "WRONGPASS"

/**
 * Respuesta que envía el servidor al agregar un usuario
 */
type UserCreationReponse = {
    /**
     * UUID que identifica al usuario en el servidor
     */
    id :string,
    /**
     * Posibilidad de usar el nombre propuesto para el nuevo usuario
     */
    status :LoginStatus
}

/**
 * Operación de WebSocket recibida desde el servidor para ejecutar en Connection
 */
type WebSocketOperation = {
    /**
     * String que identifica la operación a realizar
     */
    operation :string,
    /**
     * String que contiene el valor con el que operar. A menudo está codificado en formato JSON
     */
    value :string
}

// JQUERY
// A falta de archivos de definición adecuados para la versión actual de jQuery, hemos añadido
// algunas definiciones que permitan usarlo sin errores de compilación.

/**
 * Función de búsqueda de jQuery.
 * @param any
 */
declare function $(element :any): any;

declare namespace $ {

    /**
     * Datos de la configuración de una petición mediante API REST.
     */
    type ajaxPetition = {
        /**
         * Tipo de petición. Si no se especifica, por defecto es de tipo GET
         */
        method? : "GET" | "POST" | "PUT" | "DELETE",
        /**
         * Tipo de petición. Si no se especifica, por defecto es de tipo GET
         */
        type? : "GET" | "POST" | "PUT" | "DELETE",
        /**
         * Dirección del recurso, local u online, al que se realizará la petición
         */
        url :string,
        /**
         * Datos a enviar al servidor, en forma de JSON stringificado
         */
        data? :string,
        /**
         * Indica si el valor de data se debe convertir en un string compatible con API REST
         */
        processData? :boolean,
        /**
         * Encabezados de los datos de la petición
         */
        headers? :any,
    }

    /**
     * Resultado de realizar una petición mediante API REST. Permite encadenar instrucciones
     * a una petición, para ejecutarlas cuando esta petición termine.
     */
    class ajaxReponse {
        /**
         * Se ejecuta cuando la petición se ha realizado con éxito.
         * @param callback Función a ejecutar
         */
        done(callback :(data :any) => any) :ajaxReponse;
        /**
         * Se ejecuta cuando la petición ha fallado.
         * @param callback Función a ejecutar
         */
        fail(callback :(data :any) => any) :ajaxReponse;
        /**
         * Se ejecuta cuando la petición ha terminado, independientemente del resultado.
         * @param callback Función a ejecutar
         */
        always(callback :(data :any) => any) :ajaxReponse;
    }
    
    /**
     * Realiza una petición mediante API REST al recurso indicado en el parámetro.
     * @param petition El parámetro donde se indican los datos de la petición
     */
    function ajax(petition :ajaxPetition) :ajaxReponse;
}

