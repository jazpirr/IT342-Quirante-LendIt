package edu.cit.quirante.lendit.feature.report;

import edu.cit.quirante.lendit.feature.auth.User;
import edu.cit.quirante.lendit.feature.auth.UserRepository;
import edu.cit.quirante.lendit.shared.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired private ReportService reportService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepo;

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

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        Integer reporterId = extractUserId(auth);
        if (reporterId == null) return ResponseEntity.status(401).body("Unauthorized");

        Integer reportedUserId = body.get("reportedUserId") != null
                ? Integer.parseInt(body.get("reportedUserId").toString()) : null;
        Integer itemId = body.get("itemId") != null
                ? Integer.parseInt(body.get("itemId").toString()) : null;
        String itemName = (String) body.get("itemName");
        String reportType = (String) body.get("reportType");
        String reason = (String) body.get("reason");

        if (reportType == null || reason == null || reason.isBlank())
            return ResponseEntity.badRequest().body("reportType and reason are required");

        return ResponseEntity.ok(reportService.createReport(reporterId, reportedUserId, itemId, itemName, reportType, reason));
    }

    @GetMapping
    public ResponseEntity<?> getReports(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestParam(defaultValue = "ALL") String status) {
        Integer userId = extractUserId(auth);
        if (!isAdmin(userId)) return ResponseEntity.status(403).body("Admin only");
        return ResponseEntity.ok(reportService.getAllReports(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        Integer userId = extractUserId(auth);
        if (!isAdmin(userId)) return ResponseEntity.status(403).body("Admin only");
        String status = body.get("status");
        if (status == null) return ResponseEntity.badRequest().body("status required");
        return ResponseEntity.ok(reportService.updateStatus(id, status));
    }
}
