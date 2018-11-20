package urjc.jr.sweeper;

import java.util.Stack;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Clase estática que se encarga de ejecutar tareas periódicas en el servidor
 */
public class TaskScheduler {

    /**
     * Servicio de ejecución periódica
     */
    private static ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    /**
     * Indica si el servidor ya se ha inicializado
     */
    private static boolean initialized = false;
    /**
     * Indica el tiempo máximo que puede estar un usuario sin dar señales de vida antes de
     * ser desconectado
     */
    private static final int maxIdleAllowed = 2;
    /**
     * Indica el tiempo que transcurre, en milisegundos, entre ejecuciones periódicas de las tareas
     */
    private static final int updateWaitTime = 500;

    /**
     * Inicializa las tareas de esta clase
     */
    public static void initialize() {
        // Si ya está inicializado, inicializarlo otra vez va a provocar problemas
        if(initialized) {
            System.out.println("TaskScheduler ya estaba inicializado.");
            return;
        }

        // Ahora sí, ya está inicializado
        initialized = true;

        // Cada medio segundo ejecutamos el siguiente código:
        scheduler.scheduleWithFixedDelay(() -> {
            // Almacenamos aquí los usuarios que vamos a desconectar cuando terminemos
            // de revisarlos a todos.
            Stack<User> disconnect = new Stack<>();

            // Revisamos el tiempo de inactividad de todos los usuarios. Cuando un usuario
            // excede el máximo tiempo de espera permitido, hay que desconectarlo.
            for(User user : UserController.getUsers()) {
                user.increaseIdle();
                if(user.idleTime() > maxIdleAllowed) {
                    disconnect.push(user);
                }
            }

            // Ahora eliminamos de verdad los usuarios marcados para su desconexión.
            while(!disconnect.empty()) {
                UserController.removeUser(disconnect.pop());
            }

            ChatMessageController.updateSavedFile();
        },
        updateWaitTime, updateWaitTime, TimeUnit.MILLISECONDS);
    }
}