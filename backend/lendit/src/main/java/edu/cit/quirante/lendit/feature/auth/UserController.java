package edu.cit.quirante.lendit.feature.auth;

import edu.cit.quirante.lendit.shared.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(path = "/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired private UserService userv;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {
        try {
            User saved = userv.createUser(newUser);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        Optional<User> userOpt = userv.findByEmail(loginData.getEmail());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");

        User user = userOpt.get();

        if (user.isBlocked()) {
            return ResponseEntity.status(403).body("Your account has been blocked. Please contact support.");
        }

        if (user.getPassword() == null || passwordEncoder.matches("GOOGLE_USER", user.getPassword())) {
            return ResponseEntity.status(400).body("This account uses Google login. Please continue with Google or set a password.");
        }

        if (!userv.checkPassword(user, loginData.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getId());
        user.setPassword(null);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String imageUrl = body.get("imageUrl");

        Optional<User> userOpt = userv.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.isBlocked()) {
                return ResponseEntity.status(403).body("Your account has been blocked. Please contact support.");
            }
            if (user.getImageUrl() == null && imageUrl != null) {
                user.setImageUrl(imageUrl);
                user = userv.updateUser(user);
            }
        } else {
            user = new User();
            user.setEmail(email);
            String[] names = name.split(" ");
            user.setfName(names[0]);
            user.setlName(names.length > 1 ? names[1] : "");
            user.setPassword("GOOGLE_USER");
            user.setImageUrl(imageUrl);
            user = userv.createUser(user);
        }

        String token = jwtUtil.generateToken(user.getId());
        user.setPassword(null);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("password");
        Optional<User> userOpt = userv.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user = userv.updateUser(user);
        return ResponseEntity.ok("Password set successfully");
    }
}
