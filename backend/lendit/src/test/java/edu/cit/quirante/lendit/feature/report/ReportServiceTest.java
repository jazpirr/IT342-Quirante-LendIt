package edu.cit.quirante.lendit.feature.report;

import edu.cit.quirante.lendit.feature.auth.User;
import edu.cit.quirante.lendit.feature.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepo;

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private ReportService reportService;

    private Report pendingReport;
    private User reporter;
    private User reportedUser;

    @BeforeEach
    void setUp() {
        reporter = new User();
        reporter.setId(1);
        reporter.setfName("Alice");
        reporter.setlName("Johnson");

        reportedUser = new User();
        reportedUser.setId(2);
        reportedUser.setfName("Bob");
        reportedUser.setlName("Williams");

        pendingReport = new Report();
        pendingReport.setId(1);
        pendingReport.setReporterId(1);
        pendingReport.setReportedUserId(2);
        pendingReport.setItemId(10);
        pendingReport.setItemName("Camera");
        pendingReport.setReportType("ITEM");
        pendingReport.setReason("Fake listing");
        pendingReport.setStatus("PENDING");
        pendingReport.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createReport_savesPendingReport() {
        when(reportRepo.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        Report result = reportService.createReport(1, 2, 10, "Camera", "ITEM", "Fake listing");

        assertEquals("ITEM", result.getReportType());
        assertEquals("Fake listing", result.getReason());
        assertEquals(1, result.getReporterId());
        verify(reportRepo).save(any(Report.class));
    }

    @Test
    void createReport_nonReturnType_savedSuccessfully() {
        when(reportRepo.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        Report result = reportService.createReport(1, 2, 10, "Camera", "NON_RETURN",
                "Item not returned after due date");

        assertEquals("NON_RETURN", result.getReportType());
        assertEquals(2, result.getReportedUserId());
    }

    @Test
    void updateStatus_changesReportStatus() {
        when(reportRepo.findById(1)).thenReturn(Optional.of(pendingReport));
        when(reportRepo.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        Report result = reportService.updateStatus(1, "RESOLVED");

        assertEquals("RESOLVED", result.getStatus());
        verify(reportRepo).save(pendingReport);
    }

    @Test
    void updateStatus_dismissed_changesStatusToDismissed() {
        when(reportRepo.findById(1)).thenReturn(Optional.of(pendingReport));
        when(reportRepo.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        Report result = reportService.updateStatus(1, "DISMISSED");

        assertEquals("DISMISSED", result.getStatus());
    }

    @Test
    void updateStatus_throwsWhenReportNotFound() {
        when(reportRepo.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> reportService.updateStatus(999, "RESOLVED"));
    }

    @Test
    void countPending_returnsCorrectCount() {
        when(reportRepo.countByStatus("PENDING")).thenReturn(5L);

        long count = reportService.countPending();

        assertEquals(5L, count);
    }

    @Test
    void countPending_returnsZero_whenNoPendingReports() {
        when(reportRepo.countByStatus("PENDING")).thenReturn(0L);

        long count = reportService.countPending();

        assertEquals(0L, count);
    }

    @Test
    void getAllReports_allStatus_returnsAllReports() {
        Report report2 = new Report();
        report2.setId(2);
        report2.setReporterId(1);
        report2.setReportedUserId(2);
        report2.setItemId(20);
        report2.setItemName("Projector");
        report2.setReportType("NON_RETURN");
        report2.setReason("Not returned");
        report2.setStatus("RESOLVED");
        report2.setCreatedAt(LocalDateTime.now());

        when(reportRepo.findAllByOrderByCreatedAtDesc())
                .thenReturn(Arrays.asList(pendingReport, report2));
        when(userRepo.findById(1)).thenReturn(Optional.of(reporter));
        when(userRepo.findById(2)).thenReturn(Optional.of(reportedUser));

        List<Map<String, Object>> result = reportService.getAllReports("ALL");

        assertEquals(2, result.size());
        assertEquals("Alice Johnson", result.get(0).get("reporterName"));
        assertEquals("Bob Williams", result.get(0).get("reportedUserName"));
    }

    @Test
    void getAllReports_pendingStatus_returnsOnlyPending() {
        when(reportRepo.findByStatusOrderByCreatedAtDesc("PENDING"))
                .thenReturn(List.of(pendingReport));
        when(userRepo.findById(1)).thenReturn(Optional.of(reporter));
        when(userRepo.findById(2)).thenReturn(Optional.of(reportedUser));

        List<Map<String, Object>> result = reportService.getAllReports("PENDING");

        assertEquals(1, result.size());
        assertEquals("PENDING", result.get(0).get("status"));
    }
}
