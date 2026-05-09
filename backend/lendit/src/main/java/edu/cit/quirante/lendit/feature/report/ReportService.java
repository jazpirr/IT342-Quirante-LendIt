package edu.cit.quirante.lendit.feature.report;

import edu.cit.quirante.lendit.feature.auth.User;
import edu.cit.quirante.lendit.feature.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired private ReportRepository reportRepo;
    @Autowired private UserRepository userRepo;

    public Report createReport(Integer reporterId, Integer reportedUserId,
                               Integer itemId, String itemName,
                               String reportType, String reason) {
        Report r = new Report();
        r.setReporterId(reporterId);
        r.setReportedUserId(reportedUserId);
        r.setItemId(itemId);
        r.setItemName(itemName);
        r.setReportType(reportType);
        r.setReason(reason);
        return reportRepo.save(r);
    }

    public List<Map<String, Object>> getAllReports(String status) {
        List<Report> reports = status != null && !status.equals("ALL")
                ? reportRepo.findByStatusOrderByCreatedAtDesc(status)
                : reportRepo.findAllByOrderByCreatedAtDesc();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Report r : reports) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("reportType", r.getReportType());
            m.put("reason", r.getReason());
            m.put("status", r.getStatus());
            m.put("itemId", r.getItemId());
            m.put("itemName", r.getItemName());
            m.put("createdAt", r.getCreatedAt());
            m.put("reportedUserId", r.getReportedUserId());

            User reporter = userRepo.findById(r.getReporterId()).orElse(null);
            m.put("reporterName", reporter != null ? reporter.getfName() + " " + reporter.getlName() : "Unknown");

            if (r.getReportedUserId() != null) {
                User reported = userRepo.findById(r.getReportedUserId()).orElse(null);
                m.put("reportedUserName", reported != null ? reported.getfName() + " " + reported.getlName() : "Unknown");
            } else {
                m.put("reportedUserName", null);
            }
            result.add(m);
        }
        return result;
    }

    public Report updateStatus(Integer reportId, String status) {
        Report r = reportRepo.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        r.setStatus(status);
        return reportRepo.save(r);
    }

    public long countPending() {
        return reportRepo.countByStatus("PENDING");
    }
}
