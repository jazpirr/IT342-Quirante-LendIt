package edu.cit.quirante.lendit.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(name = "recipient_id", nullable = false)
    private Integer recipientId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "item_id")
    private Integer itemId;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "item_image", columnDefinition = "TEXT")
    private String itemImage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getSenderId() { return senderId; }
    public void setSenderId(Integer senderId) { this.senderId = senderId; }

    public Integer getRecipientId() { return recipientId; }
    public void setRecipientId(Integer recipientId) { this.recipientId = recipientId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemImage() { return itemImage; }
    public void setItemImage(String itemImage) { this.itemImage = itemImage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
