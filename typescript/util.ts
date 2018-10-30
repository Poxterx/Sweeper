// UTILIDADES VARIAS CON PROPÓSITO GENERAL

/**
 * Indica si el juego está siendo jugado por una o varias personas
 */
var multiplayer = false;

type Vector2 = {
    x :number,
    y :number
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
namespace DirectionalAnimation {
    /**
     * Objeto que relaciona una serie de fotogramas con cada dirección contemplada en el
     * tipo AnimationDirectionString
     */
    export type OneCoord = {
        up :number[],
        down :number[],
        side :number[]
    }

    /**
     * Objeto que relaciona un vector bidimensional con cada fotograma asociado a cada dirección
     * contemplada en el tipo AnimationDirectionString
     */
    export type TwoCoords = {
        up: {
            x :number,
            y :number
        }[],
        down :{
            x :number,
            y :number
        }[],
        side :{
            x :number,
            y :number
        }[]
    }

    /**
     * Objeto que relaciona un vector tridimensional con cada fotograma asociado a cada dirección
     * contemplada en el tipo AnimationDirectionString
     */
    export type ThreeCoords = {
        up: {
            x :number,
            y :number,
            z :number
        }[],
        down :{
            x :number,
            y :number,
            z :number
        }[],
        side :{
            x :number,
            y :number,
            z :number
        }[]
    }
}

/**
 * Registra una animación en el administrador de animaciones de Phaser
 * @param scene La escena a través de la cual se accederá al administrador de animaciones
 * @param thisName Nombre único e identificativo de la entidad que usará estas animaciones
 * @param mode Modo que tendrá la entidad al usar esta animación, por ejemplo caminar o atacar
 * @param direction Dirección en la que mirará la entidad cuando tenga esta animación
 * @param frames Array ordenado de los fotogramas del spritesheet que componen esta animación
 * @param frameRate Velocidad a la que se reproducirá la animación
 * @param repeat Si la animación debe reproducirse una vez (false) o continuamente (true)
 */
function addAnimation(scene :Phaser.Scene, thisName :string,
mode :AnimationModeString, direction :AnimationDirectionString,
frames :number[], frameRate? :number, repeat? :boolean) {
    
    scene.anims.create({
        key: thisName + "@" + mode + "@" + direction,
        frames: scene.anims.generateFrameNumbers(thisName, {frames: frames}),
        frameRate: frameRate,
        repeat: repeat ? -1 : 0
    });
}

/**
 * Permite acceder de manera conveniente a datos útiles sobre la animación de una entidad
 */
class AnimationInfo {
    /**
     * Nombre de la entidad que está reproduciendo esta animación
     */
    public name :string;
    /**
     * Modo de la entidad que está reproduciendo esta animación
     */
    public mode :AnimationModeString;
    /**
     * Dirección de la entidad que está reproduciendo esta animación
     */
    public direction :AnimationDirectionString;
    /**
     * Índice del fotograma actual dentro del array de esta animación
     */
    public frame :integer;

    private constructor(name :string, mode :string, direction :string, frame :integer) {
        this.name = name;
        this.mode = mode as AnimationModeString;
        this.direction = direction as AnimationDirectionString;
        this.frame = frame;
    }

    /**
     * Obtiene la información de la animación que un controlador de animaciones tenga
     * en reproducción actualmente
     * @param animationController El controlador de animaciones en cuestión
     */
    public static current(animationController :Phaser.GameObjects.Components.Animation) {
        // Si el controlador no está reproduciendo ninguna animación...
        if(!animationController || !animationController.currentAnim) {
            // ... no hay nada que hacer, devuelve la información predeterminada
            return this.default();
        }
        // La mayor parte de los datos se guarda en el nombre. Dividimos el nombre
        // por el símbolo de arroba para obtener las partes significativas e individuales.
        var split = animationController.currentAnim.key.split("@");
        // El fotograma lo indica el propio controlador. Le restamos uno porque el controlador
        // considera el primer fotograma de la animación como el número 1
        var frame = animationController.currentFrame.index - 1;
        // Devolvemos la información con los datos obtenidos
        return new AnimationInfo(split[0], split[1], split[2], frame);
    }

    /**
     * Devuelve información predeterminada para usar en caso de que las animaciones que hay
     * que leer no se hayan iniciado todavía
     */
    public static default() {
        return new AnimationInfo("", "walk", "up", 0);
    }

    /**
     * Devuelve una representación textual de esta información, en un formato que se puede
     * usar directamente como clave en el adminsitrador de animaciones de Phaser. Probablemente
     * coincida con el valor de `anims.currentAnim.key`.
     * @param name Nombre de la entidad para la que se va a generar esta nueva representación
     * textual. Si no se especifica, se usará el nombre original.
     */
    public toString(name? :string) {
        return (name ? name : this.name) + "@" + this.mode + "@" + this.direction;
    }
}

/**
 * Al asignar a una variable un objeto ya asignado a otra variable, sólo se copia la referencia.
 * Eso significa que cualquier cambio realizado sobre una variable afectará irremediablemente a la
 * otra. Para evitar esta situación, esta función realiza una copia en profundidad del objeto
 * al completo, de manera que puede ser modificado sin problemas y sin afectar al original.
 * @param base El objeto a copiar
 */
function clone(base :any) :any {
    // Hay que tener en cuenta que los datos que estamos copiando pueden ser cualquier cosa
    var ret :any;

    // Si el objeto es un array
    if(base instanceof Array) {
        // Empezamos creando otro array
        ret = [];
        // Iteramos por todo su *contenido* (for-of)
        for(let element of base) {
            // Y copiamos, a su vez, cada elemento del array por separado
            ret.push(clone(element));
        }
    // Si es un objeto pero no un array
    } else if(base instanceof Object) {
        // Empezamos creando un objeto vacío
        ret = {};
        // Iteramos por todos sus *miembros* (for-in)
        for(let member in base) {
            // Y copiamos, a su vez, cada miembro del objeto por separado
            ret[member] = clone(base[member]);
        }
    // Si no es un objeto (por ejemplo, un string, un número o un valor booleano)
    } else {
        // Lo podemos pasar tal cual. Estos valores sólo se pasan por copia.
        ret = base;
    }

    // Devolvemos el objeto ya copiado en su totalidad
    return ret;
}