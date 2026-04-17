package edu.cit.quirante.lendit.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.quirante.lendit.dto.BorrowRequestDTO;
import edu.cit.quirante.lendit.entity.BorrowRequest;
import edu.cit.quirante.lendit.entity.Item;
import edu.cit.quirante.lendit.entity.User;
import edu.cit.quirante.lendit.repository.BorrowRequestRepository;
import edu.cit.quirante.lendit.repository.ItemRepository;
import edu.cit.quirante.lendit.repository.UserRepository;

@Service
public class BorrowRequestService {

    @Autowired
    private BorrowRequestRepository repo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ItemRepository itemRepo;

    public BorrowRequest createRequest(Integer itemId, Integer borrowerId, LocalDateTime returnDate) {

        boolean alreadyRequested = repo.existsByItemIdAndBorrowerIdAndStatusIn(
            itemId,
            borrowerId,
            List.of("PENDING", "APPROVED")
        );

        if (alreadyRequested) {
            throw new RuntimeException("You already requested this item.");
        }

        BorrowRequest req = new BorrowRequest();
        req.setItemId(itemId);
        req.setBorrowerId(borrowerId);
        req.setStatus("PENDING");
        req.setRequestedAt(LocalDateTime.now());
        req.setReturnDate(returnDate);

        return repo.save(req);
    }



    public BorrowRequest updateStatus(Integer id, String status) {
        BorrowRequest req = repo.findById(id).orElseThrow();

        req.setStatus(status);

        if ("APPROVED".equalsIgnoreCase(status)) {

            Item item = itemRepo.findById(req.getItemId()).orElseThrow();

            // ✅ make item unavailable
            item.setAvailability("BORROWED");
            itemRepo.save(item);

            req.setApprovedAt(LocalDateTime.now());

            // 🔥 AUTO-REJECT OTHER REQUESTS (PUT IT HERE)
            List<BorrowRequest> others = repo.findByItemId(req.getItemId());

            for (BorrowRequest r : others) {
                if (!r.getId().equals(req.getId())) {
                    r.setStatus("REJECTED");
                    repo.save(r);
                }
            }
        }

        return repo.save(req);
    }
        

    public List<BorrowRequestDTO> getRequestsByItem(Integer itemId) {
        List<BorrowRequest> requests = repo.findByItemId(itemId);

        return requests.stream().map(req -> {

            User user = userRepo.findById(req.getBorrowerId()).orElse(null);

            String name = (user != null)
                ? user.getfName() + " " + user.getlName()
                : "Unknown";

            return new BorrowRequestDTO(
                req.getId(),
                req.getItemId(),
                req.getBorrowerId(),
                name,
                req.getStatus(),
                user != null ? user.getImageUrl() : null, // ✅ profile pic
                req.getReturnDate(),                      // ✅ return date
                req.getRequestedAt()                      // ✅ requested date
            );

        }).toList();
    }

    public List<BorrowRequestDTO> getRequestsByBorrower(Integer borrowerId) {
        List<BorrowRequest> requests = repo.findByBorrowerId(borrowerId);

        return requests.stream().map(req -> {

            User user = userRepo.findById(req.getBorrowerId()).orElse(null);
            Item item = itemRepo.findById(req.getItemId()).orElse(null);

            String name = (user != null)
                ? user.getfName() + " " + user.getlName()
                : "Unknown";

            return new BorrowRequestDTO(
                req.getId(),
                req.getItemId(),
                req.getBorrowerId(),
                name,
                req.getStatus(),
                user != null ? user.getImageUrl() : null,
                req.getReturnDate(),
                req.getRequestedAt()
            );

        }).toList();
    }

    
}
