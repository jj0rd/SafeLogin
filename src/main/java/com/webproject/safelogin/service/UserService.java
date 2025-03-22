package com.webproject.safelogin.service;

import com.webproject.safelogin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.webproject.safelogin.model.User;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    public User updateUser(Integer id, User updatedUser) {
        User existingUser = userRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("User with id " + id + " not found.")
        );

        existingUser.setNick(updatedUser.getNick());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setName(updatedUser.getName());
        existingUser.setSurname(updatedUser.getSurname());
        existingUser.setPassword(encoder.encode(updatedUser.getPassword()));

        return userRepository.save(existingUser);
    }
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("User with id " + id + " not found.")
        );

        userRepository.delete(user);
    }
    public User findUserById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

}
