package edu.cit.quirante.lendit.feature.item;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired private ItemRepository itemRepo;
    @Autowired private ItemImageRepository imageRepo;

    public Item createItem(Item item) {
        return itemRepo.save(item);
    }

    public List<Item> getAllItems() {
        return itemRepo.findAll();
    }

    public List<ItemImages> getImagesByItem(Integer itemId) {
        return imageRepo.findByItemId(itemId);
    }

    public List<Item> getItemsByOwner(Integer ownerId) {
        return itemRepo.findByOwnerId(ownerId);
    }
}
