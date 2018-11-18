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
