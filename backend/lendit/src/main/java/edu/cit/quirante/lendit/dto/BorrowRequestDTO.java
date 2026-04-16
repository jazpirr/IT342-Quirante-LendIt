package edu.cit.quirante.lendit.dto;

import java.time.LocalDateTime;

public class BorrowRequestDTO {

    private Integer id;
    private Integer itemId;
    private Integer borrowerId;
    private String borrowerName;
    private String status;

    // ✅ NEW
    private String imageUrl;
    private LocalDateTime returnDate;
    private LocalDateTime requestedAt;

    public BorrowRequestDTO(
        Integer id,
        Integer itemId,
        Integer borrowerId,
        String borrowerName,
        String status,
        String imageUrl,
        LocalDateTime returnDate,
        LocalDateTime requestedAt
    ) {
        this.id = id;
        this.itemId = itemId;
        this.borrowerId = borrowerId;
        this.borrowerName = borrowerName;
        this.status = status;
        this.imageUrl = imageUrl;
        this.returnDate = returnDate;
        this.requestedAt = requestedAt;
    }

    public Integer getId() { return id; }
    public Integer getItemId() { return itemId; }
    public Integer getBorrowerId() { return borrowerId; }
    public String getBorrowerName() { return borrowerName; }
    public String getStatus() { return status; }

    // ✅ NEW GETTERS
    public String getImageUrl() { return imageUrl; }
    public LocalDateTime getReturnDate() { return returnDate; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
}