package urjc.jr.sweeper;

import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private static Map<Integer, User> users = new ConcurrentHashMap<>();
    private static List<String> takenUsernames = new ArrayList<>();
    private static int currentId = 0;

    @GetMapping
    public static Collection<User> getUsers() {
        return users.values();
    }
    
    @GetMapping("/{id}")
    public static User getUser(@PathVariable int id) {
        User ret = users.get(id);
        if(ret != null) {
            ret.resetIdle();
            
        return ret;
    }

    @PostMapping
    public static User addUser(@RequestBody User user) {
        if(takenUsernames.contains(user.getUsername())) {
            System.out.println("Otro usuario ha intentado usar el nombre " + user.getUsername()
                + ", que ya estaba cogido. Se le ha rechazado la conexión.");
            return null;
        }

        user.setId(currentId);
        users.put(currentId, user);
        user.resetIdle();
        takenUsernames.add(user.getUsername());
        System.out.println(user.getUsername() + " se ha conectado.");
        currentId++;
        return user;
    }

    @PostMapping("/{id}")
    public static User changeUsername(@PathVariable int id, @RequestBody User user) {
        User currentUser = users.get(id);
        if(currentUser == null) {
            return null;
        }
        currentUser.resetIdle();
        if(takenUsernames.contains(user.getUsername())) {
            System.out.println(currentUser.getUsername() + " ha intentado cambiarse el nombre a "
                + user.getUsername() + ", pero no ha podido porque ese nombre ya está cogido.");
            return null;
        }
        takenUsernames.remove(currentUser.getUsername());
        takenUsernames.add(user.getUsername());
        System.out.println(currentUser.getUsername() + " se ha cambiado el nombre a " + user.getUsername() + ".");
        currentUser.setUsername(user.getUsername());
        return currentUser;
    }

    public static void removeUser(User user) {
        users.remove(user.getId());
        takenUsernames.remove(user.getUsername());
        System.out.println(user.getUsername() + " se ha desconectado.");
    }
}