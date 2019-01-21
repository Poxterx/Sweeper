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

## Vídeo
[![Video](https://user-images.githubusercontent.com/43203588/51444411-7790f800-1cf7-11e9-98cf-62d069859779.JPG)](https://www.youtube.com/watch?v=Gg_983Y46L8&feature=youtu.be)

## Implementación de WebSockets
La clase SocketManager tiene un evento para cuando se establece el socket, otro para cuando se cierra, y otro para cuando recibe un mensaje. Los mensajes se usan de una manera muy concreta, se envían siempre pares así: {operation, value}.
Cuando se recibe un mensaje, SocketManager procesa la petición del cliente y la respuesta del server. Las peticiones del cliente pueden ser las siguientes operaciones: LINK_USER, SYNC_NPC, SYNC_PLAYER, ENTER_LOBBY, EXIT_LOBBY, LOBBY_START. El servidor también puede mandar operaciones de ese tipo al cliente que sea necesario. Las opreaciones del server que los clientes pueden entender: SYNC_NPC, SYNC_PLAYER, SET_MOD, START_GAME. Esto se procesa en la clase Connection.

LINK_USER (Un jugador se conecta):
El procedimiento para conectar a un jugador es el siguiente:
-El jugador pone nombre de usuario y contraseña, lo manda al servidor para iniciar sesión o crear su cuenta (con api rest).
-El servidor dice si es válido o no.
-Si no es válido el servidor le envía una notificación indicando la razón por la que no es válido.
-Si está bien, el cliente abre el websocket.
-Con el websocket abierto, le manda al server una operación LINK_USER.
-La operación LINK_USER enlaza al usuario creado anteriormente con api rest a la sesión de websocket que ha enviado eso.
-El usuario no está en ningún lobby cuando entra y en este punto puede intentar conectarse a uno. Pero solo puede conectarse a los que el servidor indica que están libres.

ENTER_LOBBY:
Si la opción de conectarse a un lobby está disponible y el jugador se conecta, el cliente envia esta operación al servidor indicando cual es el lobby solicitado. El servidor asociará el usuario que ha enviado esa operación al lobby y, por tanto, empezará a recibir los datos emitidos a través del lobby, como por ejemplo el chat. Con EXIT_LOBBY se sale del lobby.
El primer usuario en entrar en un lobby es considerado como el moderador de ese lobby. Esto implica que es el cliente que lleva el procesamiento de los npcs. Si el usuario abandona la partida por la razón que sea, el status de moderador se transfiere a otro usuario del mismo lobby al azar. El servidor notifica a un cliente que es el moderador mediante la operación SET_MOD. Los juagadores no necesitan saber cual es el moderador para evitar trampas.

SYNC_PLAYER (Se sincronizan los jugadores):
La clase player está ejecutando cada intervalo de 50 ms una función que envía una operación SYNC_PLAYER(operación de servidor) al server con los datos relevantes (la posición, la animación, etc) y el server manda esos datos (en los que va incluido el usuario que lo ha mandado) a todos los demás clientes en otra operación SYNC_PLAYER(operación de cliente).
En cada cliente hay una instancia de remoteplayer por cada usuario conectado en el lobby (aparte del mismo), cada remoteplayer guarda el uuid del usuario que representa. Así, cuando un cliente recibe una operación SYNC_PLAYER, le asigna los datos al remoteplayer que corresponda.
El server debe confirmar que a un remoteplayer no le queda vida para que el cliente lo de por muerto. No se puede morir automaticamente cuando su vida llega a 0.

SYNC_NPC (Se diferencia al player que usa el usuario de los que no puede controlar):
La clase npcsync se encarga de registrar quién es un npc sincronizable y cuándo hay que hacerlo. Las clases que se pueden registrar como npc, que tienen un senddata y un receivedata, deben implementar la interfaz inpcsyncable, y estas clases ejecutan una función npcsync.register(this) para registrarse como npcs.
npcsync se activa cuendo el cliente recibe la operación START_GAME y se desactiva cuando la conexión se cierra (por victoria, derrota o error de conexión) y cuando se desactiva, los npc sincronizados se dan de baja para que puedan eliminarse sin errores. 
Mientras dure el juego, npcsync se encarga de enviar los datos mediante la función senddata y usando la operación de servidor SYNC_NPC.

## Instrucciones para ejecutar la aplicación
Para compilar el proyecto, habría que instalar jdk y maven, configurar la herramienta spring-boot y ejecutar el comando mvn clean package en la carpeta del proyecto. 
Para ejecutar el jar,  habría que entrar en la carpeta del proyecto y ejecutar el comando java -jar Sweeper-0.3.jar. Hace falta instalar en la máquina Java 8.
Para el cliente, se usa la url que sale en el terminal y el server.
### Observaciones
El juego no puede ejecutarse correctamente si la pantalla está minimizada o en una pestaña de fondo.
La tecla F2 muestra información de depuración, a saber los targets de las entidades y las rutas de las entidades que utilicen IA.
El juego te avisa si se pierde la conexión con el servidor mientras se está jugando, pero no se plantea la posiblidad de seguir jugando en este punto porque el cliente no se puede seguir descargando los assets necesarios para el juego.

### Controles
WASD: moverse por el escenario.
R: atacar.
E: activar palanca.
F2: depuración.

## Páginas principales
Al iniciar el juego se ve la pantalla inicial, la cual solicita una tecla para empezar:
![titulo](https://user-images.githubusercontent.com/43203588/51444411-7790f800-1cf7-11e9-98cf-62d069859779.JPG)

Tras pulsar un tecla, la pantalla de inicio nos lleva al menu inicial que nos deja elegir el modo de juego. Options no esta implementada:

![menu](https://user-images.githubusercontent.com/43203588/51443539-74433f80-1cea-11e9-8cee-baec1185bc6f.JPG)

Si en el menú eliges Solo, se inicia una partida con un solo jugador:
![singlep](https://user-images.githubusercontent.com/43203588/47756469-7923c480-dca2-11e8-8a9a-092261c7646d.jpg)

Si en el menú eliges Coop, te manda a un menú en el que esperas hasta que los demás usuarios estén listos.
Primero, el usuario debe iniciar sesión (si otro usuario ya ha iniciado la misma sesión no le dejará entrar):
![menumultijugadorsesion](https://user-images.githubusercontent.com/43203588/51443554-b9677180-1cea-11e9-869a-a9886d65a4be.JPG)

Después el usuario se conecta en un lobby que no esté lleno (con menos de 4 jugadores) u ocupado (los usuarios están "Playing"):

![menumultijugadorlobbies](https://user-images.githubusercontent.com/43203588/51443563-ef0c5a80-1cea-11e9-9aea-6f371394ea2c.JPG)

Tras elegir un lobby se puede ver acceder al chat y, cuando todos los jugadores del lobby esten listos(aparece con un tick), iniciar la partida:

![menumultijugadorchat](https://user-images.githubusercontent.com/43203588/51443569-03e8ee00-1ceb-11e9-82f6-7ed98a084265.JPG)

Cuando todos los usuarios pulsen Ready (estén listos), se inicia una partida con hasta 4 jugadores:
![multip](https://user-images.githubusercontent.com/43203588/47756508-acfeea00-dca2-11e8-9ffa-871745f7bae0.jpg)
En Coop hay más enemigos para que cooperen los jugadores.

Al morir el jugador local se acaba la partida y te lleva a la pantalla Game Over:
![game over](https://github.com/Poxterx/Sweeper/blob/master/src/main/resources/static/assets/images/GameOver.png?raw=true)

Al ganar se acaba la partida y te lleva a la pantalla Victory (en Coop solo uno necesita llegar a la meta para que todos ganen):

![victory](https://github.com/Poxterx/Sweeper/blob/master/src/main/resources/static/assets/images/Victory.png?raw=true)

Decidimos que al ganar o al perder se cierra la sesión del usuario.

En caso de que se pierda la conexión con el servidor te lleva a la siguiente pantalla:
![desonectadodelservidor](https://user-images.githubusercontent.com/43203588/51443604-8a9dcb00-1ceb-11e9-97b9-7068b2b1eb80.JPG)

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
