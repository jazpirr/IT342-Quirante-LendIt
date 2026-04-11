package edu.cit.quirante.lendit.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.quirante.lendit.entity.Item;
import edu.cit.quirante.lendit.entity.ItemImages;
import edu.cit.quirante.lendit.repository.ItemImageRepository;
import edu.cit.quirante.lendit.repository.ItemRepository;
import edu.cit.quirante.lendit.repository.UserRepository;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepo;

    @Autowired
    private ItemImageRepository imageRepo;

    @Autowired
    private UserRepository userRepo;

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