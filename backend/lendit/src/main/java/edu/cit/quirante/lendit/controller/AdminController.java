package edu.cit.quirante.lendit.controller;

import edu.cit.quirante.lendit.entity.User;
import edu.cit.quirante.lendit.repository.BorrowRequestRepository;
import edu.cit.quirante.lendit.repository.ItemImageRepository;
import edu.cit.quirante.lendit.repository.ItemRepository;
import edu.cit.quirante.lendit.repository.ReportRepository;
import edu.cit.quirante.lendit.repository.UserRepository;
import edu.cit.quirante.lendit.security.JwtUtil;
import edu.cit.quirante.lendit.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired private UserRepository userRepo;
    @Autowired private ItemRepository itemRepo;
    @Autowired private ItemImageRepository imageRepo;
    @Autowired private BorrowRequestRepository borrowRepo;
    @Autowired private ReportRepository reportRepo;
    @Autowired private ReportService reportService;
    @Autowired private JwtUtil jwtUtil;

    private Integer extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try { return jwtUtil.extractUserId(authHeader.substring(7)); }
        catch (Exception e) { return null; }
    }

    private boolean isAdmin(Integer userId) {
        if (userId == null) return false;
        User u = userRepo.findById(userId).orElse(null);
        return u != null && "ADMIN".equals(u.getRole());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestHeader(value = "Authorization", required = false) String auth) {

        Integer userId = extractUserId(auth);
        if (!isAdmin(userId)) return ResponseEntity.status(403).body("Admin only");

        long totalUsers = userRepo.count();
        long totalItems = itemRepo.count();
        long activeBorrows = borrowRepo.findAll().stream()
            .filter(r -> "APPROVED".equals(r.getStatus())).count();
        long pendingReports = reportService.countPending();
        long totalReports = reportRepo.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalItems", totalItems);
        stats.put("activeBorrows", activeBorrows);
        stats.put("pendingReports", pendingReports);
        stats.put("totalReports", totalReports);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> deleteItem(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Integer itemId,
            @RequestParam(required = false) Integer reportId) {

        Integer userId = extractUserId(auth);
        if (!isAdmin(userId)) return ResponseEntity.status(403).body("Admin only");

        if (!itemRepo.existsById(itemId)) {
            return ResponseEntity.status(404).body("Item not found");
        }

        imageRepo.findByItemId(itemId).forEach(img -> imageRepo.delete(img));
        itemRepo.deleteById(itemId);

        if (reportId != null) {
            reportService.updateStatus(reportId, "RESOLVED");
        }

        return ResponseEntity.ok("Item deleted");
    }

    @PutMapping("/users/{targetUserId}/block")
    public ResponseEntity<?> blockUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Integer targetUserId,
            @RequestParam(required = false) Integer reportId) {

        Integer userId = extractUserId(auth);
        if (!isAdmin(userId)) return ResponseEntity.status(403).body("Admin only");

        User target = userRepo.findById(targetUserId).orElse(null);
        if (target == null) return ResponseEntity.status(404).body("User not found");

        target.setBlocked(true);
        userRepo.save(target);

        if (reportId != null) {
            reportService.updateStatus(reportId, "RESOLVED");
        }

        return ResponseEntity.ok("User blocked");
    }
}
