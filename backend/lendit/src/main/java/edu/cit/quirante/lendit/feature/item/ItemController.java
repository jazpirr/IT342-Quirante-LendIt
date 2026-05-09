package edu.cit.quirante.lendit.feature.item;

import edu.cit.quirante.lendit.shared.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    @Autowired private ItemService itemService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private ItemImageRepository imageRepo;

    @PostMapping("/add")
    public ResponseEntity<?> addItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ItemRequest request) {
        String token = authHeader.substring(7);
        Integer userId = jwtUtil.extractUserId(token);

        Item item = new Item();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setImageUrl(request.getImageUrl());
        item.setOwnerId(userId);
        item.setAvailability("AVAILABLE");
        Item savedItem = itemService.createItem(item);

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
