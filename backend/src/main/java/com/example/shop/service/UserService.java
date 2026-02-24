package com.example.shop.service;

import com.example.shop.entity.Role;
import com.example.shop.entity.User;
import com.example.shop.repository.UserRepository;
import com.example.shop.security.JwtService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerClient(String firstName, String lastName, String email, String rawPassword) {
        User u = new User();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(Role.CLIENT);
        return userRepository.save(u);
    }

    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("user"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new UsernameNotFoundException("bad credentials");
        }
        return jwtService.generateToken(user.getEmail(), Map.of("role", user.getRole().name(), "id", user.getId()));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("user"));
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
    }
}
