package edu.cit.quirante.lendit.feature.borrow;

import edu.cit.quirante.lendit.feature.auth.User;
import edu.cit.quirante.lendit.feature.auth.UserRepository;
import edu.cit.quirante.lendit.feature.item.Item;
import edu.cit.quirante.lendit.feature.item.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BorrowRequestServiceTest {

    @Mock
    private BorrowRequestRepository repo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private ItemRepository itemRepo;

    @InjectMocks
    private BorrowRequestService borrowRequestService;

    private Item item;
    private User borrower;
    private BorrowRequest existingRequest;
    private LocalDateTime returnDate;

    @BeforeEach
    void setUp() {
        item = new Item();
        item.setItemId(1);
        item.setName("Camera");
        item.setAvailability("AVAILABLE");
        item.setOwnerId(10);

        borrower = new User();
        borrower.setId(20);
        borrower.setfName("Jane");
        borrower.setlName("Smith");

        existingRequest = new BorrowRequest();
        existingRequest.setId(1);
        existingRequest.setItemId(1);
        existingRequest.setBorrowerId(20);
        existingRequest.setStatus("PENDING");
        existingRequest.setRequestedAt(LocalDateTime.now());

        returnDate = LocalDateTime.now().plusDays(7);
    }

    @Test
    void createRequest_setsPendingStatusAndSaves() {
        when(repo.existsByItemIdAndBorrowerIdAndStatusIn(1, 20, List.of("PENDING", "APPROVED")))
                .thenReturn(false);
        when(repo.save(any(BorrowRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        BorrowRequest result = borrowRequestService.createRequest(1, 20, returnDate);

        assertEquals("PENDING", result.getStatus());
        assertEquals(1, result.getItemId());
        assertEquals(20, result.getBorrowerId());
        verify(repo).save(any(BorrowRequest.class));
    }

    @Test
    void createRequest_throwsWhenAlreadyRequested() {
        when(repo.existsByItemIdAndBorrowerIdAndStatusIn(1, 20, List.of("PENDING", "APPROVED")))
                .thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> borrowRequestService.createRequest(1, 20, returnDate));
        verify(repo, never()).save(any());
    }

    @Test
    void updateStatus_approved_marksItemBorrowedAndRejectsOthers() {
        BorrowRequest request = new BorrowRequest();
        request.setId(1);
        request.setItemId(1);
        request.setBorrowerId(20);
        request.setStatus("PENDING");

        BorrowRequest otherRequest = new BorrowRequest();
        otherRequest.setId(2);
        otherRequest.setItemId(1);
        otherRequest.setBorrowerId(30);
        otherRequest.setStatus("PENDING");

        when(repo.findById(1)).thenReturn(Optional.of(request));
        when(itemRepo.findById(1)).thenReturn(Optional.of(item));
        when(repo.findByItemId(1)).thenReturn(Arrays.asList(request, otherRequest));
        when(repo.save(any(BorrowRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(itemRepo.save(any(Item.class))).thenAnswer(inv -> inv.getArgument(0));

        BorrowRequest result = borrowRequestService.updateStatus(1, "APPROVED");

        assertEquals("APPROVED", result.getStatus());
        assertEquals("BORROWED", item.getAvailability());
        assertEquals("REJECTED", otherRequest.getStatus());
        verify(itemRepo).save(item);
    }

    @Test
    void updateStatus_rejected_doesNotChangeItemAvailability() {
        existingRequest.setStatus("PENDING");
        when(repo.findById(1)).thenReturn(Optional.of(existingRequest));
        when(repo.save(any(BorrowRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        BorrowRequest result = borrowRequestService.updateStatus(1, "REJECTED");

        assertEquals("REJECTED", result.getStatus());
        verify(itemRepo, never()).save(any());
    }

    @Test
    void getRequestsByItem_returnsDTOsWithBorrowerNames() {
        existingRequest.setId(1);
        when(repo.findByItemId(1)).thenReturn(List.of(existingRequest));
        when(userRepo.findById(20)).thenReturn(Optional.of(borrower));

        List<BorrowRequestDTO> result = borrowRequestService.getRequestsByItem(1);

        assertEquals(1, result.size());
        assertEquals("Jane Smith", result.get(0).getBorrowerName());
    }

    @Test
    void getRequestsByBorrower_returnsRequestsForBorrower() {
        existingRequest.setId(1);
        when(repo.findByBorrowerId(20)).thenReturn(List.of(existingRequest));
        when(userRepo.findById(20)).thenReturn(Optional.of(borrower));

        List<BorrowRequestDTO> result = borrowRequestService.getRequestsByBorrower(20);

        assertEquals(1, result.size());
        assertEquals(20, result.get(0).getBorrowerId());
    }
}
