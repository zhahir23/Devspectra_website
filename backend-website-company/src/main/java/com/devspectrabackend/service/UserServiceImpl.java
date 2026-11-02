package com.devspectrabackend.service;

import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User createUser(User user) {
        if (user.getEmail() == null || !user.getEmail().trim().toLowerCase().endsWith("@devspectra.com")) {
            throw new RuntimeException("Registrasi ditolak: Email harus menggunakan domain @devspectra.com");
        }

        // Cek apakah email sudah ada agar tidak terjadi duplikasi data
        Optional<User> existingUser = userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(user.getEmail().trim()))
                .max(Comparator.comparing(User::getId));

        if (existingUser.isPresent()) {
            User updateTarget = existingUser.get();
            updateTarget.setName(user.getName());
            updateTarget.setRole(user.getRole());
            updateTarget.setDivision(user.getDivision());
            updateTarget.setPassword(passwordEncoder.encode(user.getPassword()));
            return userRepository.save(updateTarget);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anggota tim dengan ID " + id + " tidak ditemukan"));

        user.setName(userDetails.getName());
        user.setRole(userDetails.getRole());
        user.setDivision(userDetails.getDivision());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anggota tim dengan ID " + id + " tidak ditemukan"));
        userRepository.delete(user);
    }
}