package edu.cit.quirante.lendit.feature.item;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepo;

    @Mock
    private ItemImageRepository imageRepo;

    @InjectMocks
    private ItemService itemService;

    private Item item1;
    private Item item2;

    @BeforeEach
    void setUp() {
        item1 = new Item();
        item1.setItemId(1);
        item1.setName("Camera");
        item1.setDescription("DSLR Camera");
        item1.setOwnerId(10);
        item1.setAvailability("AVAILABLE");

        item2 = new Item();
        item2.setItemId(2);
        item2.setName("Projector");
        item2.setDescription("HD Projector");
        item2.setOwnerId(20);
        item2.setAvailability("AVAILABLE");
    }

    @Test
    void createItem_savesAndReturnsItem() {
        when(itemRepo.save(any(Item.class))).thenReturn(item1);

        Item result = itemService.createItem(item1);

        assertNotNull(result);
        assertEquals("Camera", result.getName());
        verify(itemRepo).save(item1);
    }

    @Test
    void getAllItems_returnsAllItems() {
        when(itemRepo.findAll()).thenReturn(Arrays.asList(item1, item2));

        List<Item> result = itemService.getAllItems();

        assertEquals(2, result.size());
        assertEquals("Camera", result.get(0).getName());
        assertEquals("Projector", result.get(1).getName());
    }

    @Test
    void getAllItems_returnsEmptyList_whenNoItems() {
        when(itemRepo.findAll()).thenReturn(List.of());

        List<Item> result = itemService.getAllItems();

        assertTrue(result.isEmpty());
    }

    @Test
    void getItemsByOwner_returnsOnlyOwnerItems() {
        when(itemRepo.findByOwnerId(10)).thenReturn(List.of(item1));

        List<Item> result = itemService.getItemsByOwner(10);

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).getOwnerId());
    }

    @Test
    void getItemsByOwner_returnsEmpty_whenOwnerHasNoItems() {
        when(itemRepo.findByOwnerId(99)).thenReturn(List.of());

        List<Item> result = itemService.getItemsByOwner(99);

        assertTrue(result.isEmpty());
    }

    @Test
    void getImagesByItem_returnsImages() {
        ItemImages img1 = new ItemImages();
        img1.setItemId(1);
        img1.setImageUrl("http://example.com/img1.jpg");

        ItemImages img2 = new ItemImages();
        img2.setItemId(1);
        img2.setImageUrl("http://example.com/img2.jpg");

        when(imageRepo.findByItemId(1)).thenReturn(Arrays.asList(img1, img2));

        List<ItemImages> result = itemService.getImagesByItem(1);

        assertEquals(2, result.size());
    }

    @Test
    void getImagesByItem_returnsEmpty_whenNoImages() {
        when(imageRepo.findByItemId(999)).thenReturn(List.of());

        List<ItemImages> result = itemService.getImagesByItem(999);

        assertTrue(result.isEmpty());
    }
}
