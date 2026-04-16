package edu.cit.quirante.lendit.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.quirante.lendit.entity.User;
import edu.cit.quirante.lendit.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository urepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User createUser(User user) {

        if (urepo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        return urepo.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return urepo.findByEmail(email);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public User updateUser(User user) {
        return urepo.save(user);
    }
}
