package edu.cit.quirante.lendit.feature.messaging;

import edu.cit.quirante.lendit.shared.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired private MessageService messageService;
    @Autowired private JwtUtil jwtUtil;

    private Integer extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try { return jwtUtil.extractUserId(authHeader.substring(7)); }
        catch (Exception e) { return null; }
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        Integer senderId = extractUserId(authHeader);
        if (senderId == null) return ResponseEntity.status(401).body("Unauthorized");

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
        Integer userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(messageService.getConversation(userId, otherUserId, itemId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Integer userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(messageService.getConversations(userId));
    }
}
