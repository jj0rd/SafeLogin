package com.webproject.safelogin.controller;

import com.webproject.safelogin.model.User;
import com.webproject.safelogin.repository.UserRepository;
import com.webproject.safelogin.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    @PostMapping("/register")
    User newUser(@RequestBody User newUser)
    {
        User existingUser = userRepository.findByEmail(newUser.getEmail());
        if (existingUser != null) {
            throw new IllegalArgumentException("The user with the specified email address already exists.");
        }
        newUser.setPassword(encoder.encode(newUser.getPassword()));
        return userRepository.save(newUser);
    }

    @PutMapping("/editUser/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User updatedUser) {
        try {
            User updatedRecord = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(updatedRecord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User with id " + id + " has been deleted.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build(); // Zwracamy kod 404
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody User user, HttpServletRequest request) {
        try {
            System.out.println("Received user: " + user.getEmail());  // Logowanie danych
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());

            Authentication authentication = authenticationManager.authenticate(authToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            UserDetails loggedInUser = (UserDetails) authentication.getPrincipal();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("user", loggedInUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Logowanie błędu
            System.err.println("Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // Usunięcie sesji
        }

        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/users")
    public List<User> getUsers(){
        return null;
    }
}
