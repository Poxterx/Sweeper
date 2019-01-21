package urjc.jr.sweeper;

import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

// CLASE DE CONFIGURACIÓN

@Configuration
@EnableWebSocket
public class ServerConfiguration implements WebSocketConfigurer {

    // Para sortear la CORS policy, permitimos peticiones REST de tipo GET y POST desde cualquier sitio

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedMethods("GET", "POST");
            }
        };
    }

    // Registramos el WebSocket para que los clientes puedan conectarse

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SocketManager(), "/socket").setAllowedOrigins("*");
	}
}