package edu.cit.quirante.lendit.feature.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository urepo;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setfName("John");
        testUser.setlName("Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("plainPassword");
        testUser.setRole("USER");
        testUser.setBlocked(false);
    }

    @Test
    void createUser_encodesPasswordAndSaves() {
        when(urepo.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(urepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.createUser(testUser);

        assertEquals("encodedPassword", saved.getPassword());
        verify(urepo).save(testUser);
    }

    @Test
    void createUser_throwsWhenEmailAlreadyExists() {
        when(urepo.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> userService.createUser(testUser));
        verify(urepo, never()).save(any());
    }

    @Test
    void findByEmail_returnsUser_whenExists() {
        when(urepo.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findByEmail("john@example.com");

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getfName());
    }

    @Test
    void findByEmail_returnsEmpty_whenNotFound() {
        when(urepo.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByEmail("unknown@example.com");

        assertFalse(result.isPresent());
    }

    @Test
    void checkPassword_returnsTrue_forCorrectPassword() {
        when(passwordEncoder.matches("plainPassword", "encodedPassword")).thenReturn(true);
        testUser.setPassword("encodedPassword");

        assertTrue(userService.checkPassword(testUser, "plainPassword"));
    }

    @Test
    void checkPassword_returnsFalse_forWrongPassword() {
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);
        testUser.setPassword("encodedPassword");

        assertFalse(userService.checkPassword(testUser, "wrongPassword"));
    }

    @Test
    void updateUser_savesAndReturnsUser() {
        when(urepo.save(testUser)).thenReturn(testUser);

        User result = userService.updateUser(testUser);

        assertNotNull(result);
        verify(urepo).save(testUser);
    }
}
