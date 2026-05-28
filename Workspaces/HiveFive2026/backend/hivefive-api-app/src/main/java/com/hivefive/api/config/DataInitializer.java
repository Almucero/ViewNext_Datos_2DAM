package com.hivefive.api.config;

import com.hivefive.role.domain.RoleEntity;
import com.hivefive.role.repository.RoleRepository;
import com.hivefive.status.domain.StatusEntity;
import com.hivefive.status.repository.StatusRepository;
import com.hivefive.user.domain.UserEntity;
import com.hivefive.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            RoleRepository roleRepository,
            StatusRepository statusRepository) {
        return args -> {
            if (roleRepository.count() == 0) {
                RoleEntity adminRole = new RoleEntity();
                adminRole.setId(1L);
                adminRole.setName("ROLE_ADMIN");
                roleRepository.save(adminRole);

                RoleEntity userRole = new RoleEntity();
                userRole.setId(3L);
                userRole.setName("ROLE_USER");
                roleRepository.save(userRole);
            }

            if (statusRepository.count() == 0) {
                StatusEntity todo = new StatusEntity();
                todo.setId(2L);
                todo.setName("Por Hacer");
                statusRepository.save(todo);

                StatusEntity doing = new StatusEntity();
                doing.setId(3L);
                doing.setName("En Proceso");
                statusRepository.save(doing);

                StatusEntity blocked = new StatusEntity();
                blocked.setId(4L);
                blocked.setName("Bloqueado");
                statusRepository.save(blocked);

                StatusEntity done = new StatusEntity();
                done.setId(5L);
                done.setName("Completado");
                statusRepository.save(done);
            }

            if (userRepository.count() == 0) {
                UserEntity admin = new UserEntity();
                admin.setId(1L);
                admin.setRoleId(1L);
                admin.setEmail("admin@hivefive.local");
                admin.setFirstName("Admin");
                admin.setLastName("HiveFive");
                admin.setPassword("admin123");
                userRepository.save(admin);
            }
        };
    }
}
