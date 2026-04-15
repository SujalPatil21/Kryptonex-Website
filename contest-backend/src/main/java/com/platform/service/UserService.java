package com.platform.service;

import com.platform.dto.GuestUserRequest;
import com.platform.dto.UserRequest;
import com.platform.dto.UserResponse;
import com.platform.entity.User;
import com.platform.entity.enums.Role;
import com.platform.exception.ResourceNotFoundException;
import com.platform.exception.UsernameAlreadyExistsException;
import com.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse getUserResponseById(Long id) {
        return mapToResponse(getUserEntityById(id));
    }

    public UserResponse createUser(UserRequest request) {
        User user = User.builder()
                .name(request.getUsername())
                .build();
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public UserResponse createGuestUser(GuestUserRequest request) {
        String trimmedName = request.getName().trim();

        if (userRepository.findByName(trimmedName).isPresent()) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }

        User user = User.builder()
                .name(trimmedName)
                .build();
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .build();
    }
}
