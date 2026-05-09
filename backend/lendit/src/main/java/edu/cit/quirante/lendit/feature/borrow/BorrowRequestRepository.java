package edu.cit.quirante.lendit.feature.borrow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Integer> {
    List<BorrowRequest> findByItemId(Integer itemId);
    List<BorrowRequest> findByBorrowerId(Integer borrowerId);
    boolean existsByItemIdAndBorrowerIdAndStatusIn(Integer itemId, Integer borrowerId, List<String> statuses);
}
