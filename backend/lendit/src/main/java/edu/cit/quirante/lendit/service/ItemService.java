package edu.cit.quirante.lendit.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.quirante.lendit.entity.Item;
import edu.cit.quirante.lendit.repository.ItemRepository;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepo;

    public Item createItem(Item item) {
        return itemRepo.save(item);
    }

    public List<Item> getAllItems() {
        return itemRepo.findAll();
    }
}