# Sweeper

[Gameplay](#gameplay)  
[Temática](#tematica)  
[Referencias](#referencias)  
[Integrantes](#integrantes)  

## Gameplay
La partida se puede jugar en modo individual o modo cooperativo, en ambos modos se explorara el área jugable a través de una vista cenital. Los jugadores pueden desplazarse, atacar y accionar palancas y otros mecanismos, así como recibir daño por parte de ataques enemigos o del ataque descuidado de otro jugador.

Al principio planteamos el área jugable como un conjunto de salas interconectadas y agrupadas en múltiples zonas. Para avanzar por la zona, los jugadores deberían desbloquear u obtener herramientas o poderes que permitan sortear ciertos obstáculos. Estos obstáculos bloquearían el paso a varias secciones del juego que serían inaccesibles hasta obtener dichas herramientas, ofreciendo una experiencia más o menos lineal en un entorno que hay que explorar. Existiría una zona central que, además de suponer un desafío similar al de las otras zonas, permite navegar entre las demás zonas del juego.

En el juego tal y como está actualmente es solo una de las zonas que habíamos pensado en un principio (las alcantarillas). En ella hay multitud de enemigos que aparecen alentoriamente por el mapa. El jugador deberá enfrentarse a los enemigos que se le interpongan en su camino, o evitarlos, para avanzar. 

Además, el jugador deberá desbloquear la parte del mapa que lleva a la meta accionando una palanca. Esto le obligará a recorrer el escenario y enontrarse con más enemigos. La salida es una escalera que desciende, esto viene de nuestro planteamiento inicial en el que el jugador debería descender para enfrentarse a un enemigo más fuerte que los demás y pasar a la siguiente zona.

La cooperación de los jugadores en la partida facilita el avance por el mapa. Los jugadores deberan ayudarse entre sí, ya que hay un mayor número de enemigos repartidos por el mapa en el modo multijugador. Los jugadores pueden ir por separado. Cuando un jugador llega a la meta ganan todos los jugadores de la partida.


## Temática

La ambientación del juego es urbana y cotidiana. La partida transcurre en una ciudad que ha caído víctima de un suceso paranormal indefinido. Los enemigos a eliminar son elementos del entorno alterados por dicho suceso. Las zonas a explorar son lugares habituales de una ciudad, por ejemplo: un supermercado, una estación de metro, unas alcantarillas, etc. La zona central sería la plaza principal de la ciudad.

## Referencias
![Graveyard Keeper](https://guides.gamepressure.com/graveyard-keeper/gfx/word/436349125.jpg "Graveyard Keeper")  
El ángulo de visión sería similar a Graveyard Keeper  

![Punch Club](https://images.g2a.com/newlayout/470x470/1x1x0/c5e9522e979b/5912e6bcae653aba4e0db542 "Punch Club")  
La estética estaría inspirada en Punch Club  

![Metroid Samus Returns](https://vignette.wikia.nocookie.net/metroid/images/1/15/Metroid_Samus_Returns_area_2_map.png "Metroid Samus Returns")  
El planteamiento del diseño de nivel para las distintas zonas del juego estarían basadas en juegos como Metroid o Hollow Knight  

## Diagrama de navegación de la página
![states](https://user-images.githubusercontent.com/43203588/50811697-d9249000-130f-11e9-808d-2d48f3143716.JPG)
Se ha añadido el Menú Multijugador, en el que los usuarios que quieren partida multijugador se conectan. Cuando todos estén listos se empieza la partida.

## Diagrama de clases de la aplicación
![diagf4](https://user-images.githubusercontent.com/43203588/50811643-aa0e1e80-130f-11e9-91f9-e02e4c798364.PNG)
Se ha añadido la pantalla de victoria entre otras cosas.
## Instrucciones para ejecutar la aplicación
Para compilar el proyecto, habría que instalar jdk y maven, configurar la herramienta spring-boot y ejecutar el comando mvn clean package en la carpeta del proyecto. 
Para ejecutar el jar,  habría que entrar en la carpeta del proyecto y ejecutar el comando java -jar Sweeper-0.2.jar. Hace falta instalar en la máquina Java 8.
Para el server, se debe cargar la url localhost:8080. Para el cliente, se usa la url que sale en el terminal y el server.
## Páginas principales
Esto aparece en el localhost, al abrir el servidor en el navegador, y te da la ip (En la imagen se ha tachado la dirección) para entrar en el juego en modo cliente:
![gg](https://user-images.githubusercontent.com/43203588/48809187-e8ca2400-ed23-11e8-852f-8d32f1cf7ecb.png)

Al iniciar el juego se ve la pantalla inicial, la cual solicita una tecla para empezar:
![title](https://user-images.githubusercontent.com/43203588/47756077-f6e6d080-dca0-11e8-854e-f089d00369b9.jpg)

Tras pulsar un tecla, la pantalla de inicio nos lleva al menu inicial que nos deja elegir el modo de juego. Options no esta implementada:
![menu](https://user-images.githubusercontent.com/43203588/47756118-2d245000-dca1-11e8-83db-1bdebcec8e1e.jpg)

Si en el menú eliges Single Player, se inicia una partida con un solo jugador:
![singlep](https://user-images.githubusercontent.com/43203588/47756469-7923c480-dca2-11e8-8a9a-092261c7646d.jpg)

Si en el menú eliges Multiplayer, te manda a un menú en el que esperas hasta que los demás usuarios estén listos:
![menumultijugador](https://user-images.githubusercontent.com/43203588/48808866-a3f1bd80-ed22-11e8-9f84-ec0b846714a5.jpg)
En este menú, el usuario puede cambiarse el nombre. Ararecen los nombres de los usuarios que están conectados (Aparece con un tick si el usuario está listo) y con el botón Ready (siempre que los demás usuarios también estén listos) se empieza la partida multijugador

Cuando todos los usuarios pulsen Ready (Estén listos), se inicia una partida con 2 jugadores:
![multip](https://user-images.githubusercontent.com/43203588/47756508-acfeea00-dca2-11e8-9ffa-871745f7bae0.jpg)

Al morir el jugador 1 se acaba la partida y te lleva a la pantalla Game Over:
![game over](https://user-images.githubusercontent.com/43203588/47756216-88564280-dca1-11e8-8e26-b81e531c5268.jpg)

## Integrantes  

1. **Nombre y Apellidos:** Pablo Alconchel Palma  
   **Correo universidad:** p.alconchel.2016@alumnos.urjc.es  
   **Cuenta Github:** https://github.com/Poxterx  
   
2. **Nombre y Apellidos:** Raquel Pizarro Expósito  
   **Correo universidad:** r.pizarro.2016@alumnos.urjc.es   
   **Cuenta Github:** https://github.com/RaquelURJC  
   
3. **Nombre y Apellidos:** Carlos González Cruz  
   **Correo universidad:** c.gonzalezcr.2016@alumnos.urjc.es  
   **Cuenta Github:** https://github.com/CarlosGonzalezCruz  
     
4. **Nombre y Apellidos:** Xabier Villanueva Loureiro  
   **Correo universidad:** x.villanueva.2016@alumnos.urjc.es  
   **Cuenta Github:** https://github.com/Voidtekvla  
  
**Link Trello:** https://trello.com/b/bTIkqQ83/game-de-jer
