package edu.cit.quirante.lendit.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.quirante.lendit.dto.ItemRequest;
import edu.cit.quirante.lendit.entity.Item;
import edu.cit.quirante.lendit.entity.ItemImages;
import edu.cit.quirante.lendit.repository.ItemImageRepository;
import edu.cit.quirante.lendit.security.JwtUtil;
import edu.cit.quirante.lendit.service.ItemService;

import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ItemImageRepository imageRepo;

    @PostMapping("/add")
    public ResponseEntity<?> addItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ItemRequest request) {

        String token = authHeader.substring(7);
        Integer userId = jwtUtil.extractUserId(token);

        // 1. CREATE ITEM
        Item item = new Item();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setImageUrl(request.getImageUrl()); // optional thumbnail
        item.setOwnerId(userId);
        item.setAvailability("AVAILABLE");

        Item savedItem = itemService.createItem(item);

        // 2. SAVE MULTIPLE IMAGES
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (String url : request.getImages()) {
                ItemImages img = new ItemImages();
                img.setItemId(savedItem.getItemId());
                img.setImageUrl(url);
                imageRepo.save(img);
            }
        }

        return ResponseEntity.ok(savedItem);
    }

    @GetMapping
    public ResponseEntity<?> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<?> getImages(@PathVariable Integer id) {
        return ResponseEntity.ok(itemService.getImagesByItem(id));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyItems(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Integer userId = jwtUtil.extractUserId(token);

        return ResponseEntity.ok(itemService.getItemsByOwner(userId));
    }
    }
