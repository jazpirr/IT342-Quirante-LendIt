package edu.cit.quirante.lendit.feature.item;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;

    private String name;
    private String description;
    private String imageUrl;
    private String availability = "AVAILABLE";
    private Integer ownerId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateAdded;

    public Item() {}

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public Integer getOwnerId() { return ownerId; }
    public void setOwnerId(Integer ownerId) { this.ownerId = ownerId; }

    @PrePersist
    protected void onCreate() { this.dateAdded = LocalDateTime.now(); }
    public LocalDateTime getDateAdded() { return dateAdded; }
}
