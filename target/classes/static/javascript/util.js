// UTILIDADES VARIAS CON PROPÓSITO GENERAL
/**
 * Tamaño de cada tile en píxeles
 */
const TILE_SIZE = 128;
/**
 * Indica si esta distancia de Sweeper se está ejecutando como servidor. Para ejecutar como
 * servidor, debe accederse al juego desde el mismo dispositivo donde se aloja el servidor
 * de Spring Boot, y es necesario entrar en localhost desde el navegador.
 */
const SERVER = false;
/**
 * Indica si estamos en una sesión de depuración para dibujar la información extra de las entidades
 */
var DEBUG = false;
/**
 * Indica si el juego está siendo jugado por una o varias personas
 */
var multiplayer = false;
/**
 * Variable que contiene el chat
 */
var chat = null;
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
function addAnimation(scene, thisName, mode, direction, frames, frameRate, repeat) {
    scene.anims.create({
        key: thisName + "@" + mode + "@" + direction,
        frames: scene.anims.generateFrameNumbers(thisName, { frames: frames }),
        frameRate: frameRate,
        repeat: repeat ? -1 : 0
    });
}
/**
 * Permite acceder de manera conveniente a datos útiles sobre la animación de una entidad
 */
class AnimationInfo {
    constructor(name, mode, direction, frame) {
        this.name = name;
        this.mode = mode;
        this.direction = direction;
        this.frame = frame;
    }
    /**
     * Obtiene la información de la animación que un controlador de animaciones tenga
     * en reproducción actualmente
     * @param animationController El controlador de animaciones en cuestión
     */
    static current(animationController) {
        // Si el controlador no está reproduciendo ninguna animación...
        if (!animationController || !animationController.currentAnim) {
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
    static default() {
        return new AnimationInfo("", "walk", "up", 0);
    }
    /**
     * Devuelve una representación textual de esta información, en un formato que se puede
     * usar directamente como clave en el adminsitrador de animaciones de Phaser. Probablemente
     * coincida con el valor de `anims.currentAnim.key`.
     * @param name Nombre de la entidad para la que se va a generar esta nueva representación
     * textual. Si no se especifica, se usará el nombre original.
     */
    toString(name) {
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
function clone(base) {
    // Hay que tener en cuenta que los datos que estamos copiando pueden ser cualquier cosa
    var ret;
    // Si el objeto es un array
    if (base instanceof Array) {
        // Empezamos creando otro array
        ret = [];
        // Iteramos por todo su *contenido* (for-of)
        for (let element of base) {
            // Y copiamos, a su vez, cada elemento del array por separado
            ret.push(clone(element));
        }
        // Si es un objeto pero no un array
    }
    else if (base instanceof Object) {
        // Empezamos creando un objeto vacío
        ret = {};
        // Iteramos por todos sus *miembros* (for-in)
        for (let member in base) {
            // Y copiamos, a su vez, cada miembro del objeto por separado
            ret[member] = clone(base[member]);
        }
        // Si no es un objeto (por ejemplo, un string, un número o un valor booleano)
    }
    else {
        // Lo podemos pasar tal cual. Estos valores sólo se pasan por copia.
        ret = base;
    }
    // Devolvemos el objeto ya copiado en su totalidad
    return ret;
}
/**
 * Devuelve la posición en tiles en la que se encuentra la posición especificada en píxeles
 * @param pixel La posición en cuestión, en píxeles
 */
function pixelToTilePosition(pixel) {
    return {
        x: Math.floor(pixel.x / TILE_SIZE),
        y: Math.floor(pixel.y / TILE_SIZE)
    };
}
/**
 * Devuelve la posición del centro del tile especificado, en píxeles
 * @param tile El tile en cuestión
 */
function tileToPixelPosition(tile) {
    return {
        x: (tile.x + 0.5) * TILE_SIZE,
        y: (tile.y + 0.5) * TILE_SIZE
    };
}
//# sourceMappingURL=util.js.map