package edu.cit.quirante.lendit.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.quirante.lendit.security.JwtUtil;
import edu.cit.quirante.lendit.service.BorrowRequestService;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class BorrowRequestController {

    @Autowired
    private BorrowRequestService service;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/create") 
    public ResponseEntity<?> createRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {

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

        Integer itemId = Integer.parseInt(body.get("itemId"));
        String returnDateStr = body.get("returnDate");

        LocalDateTime returnDate = LocalDateTime.parse(returnDateStr + "T00:00:00");

        return ResponseEntity.ok(service.createRequest(itemId, userId, returnDate));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getRequests(@PathVariable Integer itemId) {
        return ResponseEntity.ok(service.getRequestsByItem(itemId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);

        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        String status = body.get("status");

        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing token");
        }

        String token = authHeader.substring(7);

        Integer userId;
        try {
            userId = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        return ResponseEntity.ok(service.getRequestsByBorrower(userId));
    }

    

    
}