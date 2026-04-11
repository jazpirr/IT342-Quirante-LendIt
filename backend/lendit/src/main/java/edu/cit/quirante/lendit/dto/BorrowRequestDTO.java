package edu.cit.quirante.lendit.dto;

public class BorrowRequestDTO {

    private Integer id;
    private Integer itemId;
    private Integer borrowerId;
    private String borrowerName;
    private String status;

    public BorrowRequestDTO(Integer id, Integer itemId, Integer borrowerId, String borrowerName, String status) {
        this.id = id;
        this.itemId = itemId;
        this.borrowerId = borrowerId;
        this.borrowerName = borrowerName;
        this.status = status;
    }

    public Integer getId() { return id; }
    public Integer getItemId() { return itemId; }
    public Integer getBorrowerId() { return borrowerId; }
    public String getBorrowerName() { return borrowerName; }
    public String getStatus() { return status; }
}