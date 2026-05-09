package edu.cit.quirante.lendit.feature.borrow;

import edu.cit.quirante.lendit.shared.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class BorrowRequestController {

    @Autowired private BorrowRequestService service;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/create")
    public ResponseEntity<?> createRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Missing or invalid token");

        String token = authHeader.substring(7);
        Integer userId;
        try { userId = jwtUtil.extractUserId(token); }
        catch (Exception e) { return ResponseEntity.status(401).body("Invalid token"); }

        Integer itemId = Integer.parseInt(body.get("itemId"));
        String returnDateStr = body.get("returnDate");
        LocalDateTime returnDate = LocalDateTime.parse(returnDateStr + "T00:00:00");

        return ResponseEntity.ok(service.createRequest(itemId, userId, returnDate));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getRequests(@PathVariable Integer itemId) {
        return ResponseEntity.ok(service.getRequestsByItem(itemId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Missing or invalid token");
        Integer userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(service.getRequestsByBorrower(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }
}
