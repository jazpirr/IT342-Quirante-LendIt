package edu.cit.quirante.lendit.controller;

import edu.cit.quirante.lendit.security.JwtUtil;
import edu.cit.quirante.lendit.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/send")
    public ResponseEntity<?> send(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        Integer senderId;
        try {
            senderId = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        Integer recipientId = Integer.parseInt(body.get("recipientId").toString());
        String content = (String) body.get("content");
        Integer itemId = body.get("itemId") != null ? Integer.parseInt(body.get("itemId").toString()) : null;
        String itemName = (String) body.get("itemName");
        String itemImage = (String) body.get("itemImage");

        return ResponseEntity.ok(messageService.sendMessage(senderId, recipientId, content, itemId, itemName, itemImage));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<?> getConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer otherUserId,
            @RequestParam Integer itemId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        Integer userId;
        try {
            userId = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        return ResponseEntity.ok(messageService.getConversation(userId, otherUserId, itemId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        Integer userId;
        try {
            userId = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        return ResponseEntity.ok(messageService.getConversations(userId));
    }
}
