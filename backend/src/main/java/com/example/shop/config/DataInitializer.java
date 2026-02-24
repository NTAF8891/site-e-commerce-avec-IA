package com.example.shop.config;

import com.example.shop.entity.Product;
import com.example.shop.entity.Role;
import com.example.shop.entity.User;
import com.example.shop.repository.ProductRepository;
import com.example.shop.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ProductRepository productRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("admin@local");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }
        if (productRepository.count() == 0) {
            for (int i = 1; i <= 20; i++) {
                Product p = new Product();
                p.setName("Article " + i);
                p.setDescription("Description de l'article " + i + " — modèle démo.");
                p.setPrice(9.99 + (i * 2));
                p.setStock(10 + i);
                p.setImageUrl("https://picsum.photos/seed/shop" + i + "/600/400");
                productRepository.save(p);
            }
        }
    }
}
