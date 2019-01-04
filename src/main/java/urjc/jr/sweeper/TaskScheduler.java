package urjc.jr.sweeper;

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
            // Actualizamos periódicamente el archivo del chat
            ChatMessageController.updateSavedFile();
        },
        updateWaitTime, updateWaitTime, TimeUnit.MILLISECONDS);
    }
}