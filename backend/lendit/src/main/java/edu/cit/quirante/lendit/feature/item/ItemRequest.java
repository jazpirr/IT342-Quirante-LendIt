package edu.cit.quirante.lendit.feature.item;

import java.util.List;

public class ItemRequest {
    private String name;
    private String description;
    private String imageUrl;
    private List<String> images;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
