package edu.cit.quirante.lendit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.quirante.lendit.entity.BorrowRequest;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Integer> {

    List<BorrowRequest> findByItemId(Integer itemId);

    List<BorrowRequest> findByBorrowerId(Integer borrowerId);
    
    boolean existsByItemIdAndBorrowerIdAndStatusIn(
        Integer itemId,
        Integer borrowerId,
        List<String> statuses
    );
}
