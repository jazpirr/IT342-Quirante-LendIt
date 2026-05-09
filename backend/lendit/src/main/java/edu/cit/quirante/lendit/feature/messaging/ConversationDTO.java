package edu.cit.quirante.lendit.feature.messaging;

import java.time.LocalDateTime;

public class ConversationDTO {

    private Integer contactId;
    private String contactName;
    private Integer itemId;
    private String itemName;
    private String itemImage;
    private String lastMessage;
    private LocalDateTime lastTime;

    public ConversationDTO(Integer contactId, String contactName, Integer itemId,
                           String itemName, String itemImage, String lastMessage, LocalDateTime lastTime) {
        this.contactId = contactId;
        this.contactName = contactName;
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemImage = itemImage;
        this.lastMessage = lastMessage;
        this.lastTime = lastTime;
    }

    public Integer getContactId() { return contactId; }
    public String getContactName() { return contactName; }
    public Integer getItemId() { return itemId; }
    public String getItemName() { return itemName; }
    public String getItemImage() { return itemImage; }
    public String getLastMessage() { return lastMessage; }
    public LocalDateTime getLastTime() { return lastTime; }
}
