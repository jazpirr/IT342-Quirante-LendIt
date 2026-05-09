package edu.cit.quirante.lendit.feature.messaging;

import edu.cit.quirante.lendit.feature.auth.User;
import edu.cit.quirante.lendit.feature.auth.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepo;

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private MessageService messageService;

    private User sender;
    private User recipient;
    private Message message1;
    private Message message2;

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(1);
        sender.setfName("Alice");
        sender.setlName("Johnson");

        recipient = new User();
        recipient.setId(2);
        recipient.setfName("Bob");
        recipient.setlName("Williams");

        message1 = new Message();
        message1.setId(1);
        message1.setSenderId(1);
        message1.setRecipientId(2);
        message1.setContent("Hello Bob!");
        message1.setItemId(10);
        message1.setItemName("Camera");
        message1.setItemImage("http://example.com/cam.jpg");
        message1.setCreatedAt(LocalDateTime.now().minusMinutes(10));

        message2 = new Message();
        message2.setId(2);
        message2.setSenderId(2);
        message2.setRecipientId(1);
        message2.setContent("Hi Alice!");
        message2.setItemId(10);
        message2.setItemName("Camera");
        message2.setItemImage("http://example.com/cam.jpg");
        message2.setCreatedAt(LocalDateTime.now().minusMinutes(5));
    }

    @Test
    void sendMessage_savesAllFieldsCorrectly() {
        when(messageRepo.save(any(Message.class))).thenAnswer(inv -> inv.getArgument(0));

        Message result = messageService.sendMessage(1, 2, "Hello Bob!", 10, "Camera",
                "http://example.com/cam.jpg");

        assertNotNull(result);
        assertEquals(1, result.getSenderId());
        assertEquals(2, result.getRecipientId());
        assertEquals("Hello Bob!", result.getContent());
        assertEquals(10, result.getItemId());
        verify(messageRepo).save(any(Message.class));
    }

    @Test
    void sendMessage_callsRepoSave() {
        when(messageRepo.save(any(Message.class))).thenReturn(message1);

        messageService.sendMessage(1, 2, "Hello Bob!", 10, "Camera", "http://example.com/cam.jpg");

        verify(messageRepo, times(1)).save(any(Message.class));
    }

    @Test
    void getConversation_returnsMessagesForItemThread() {
        when(messageRepo.findConversationByItem(1, 2, 10))
                .thenReturn(Arrays.asList(message1, message2));

        List<Message> result = messageService.getConversation(1, 2, 10);

        assertEquals(2, result.size());
        assertEquals("Hello Bob!", result.get(0).getContent());
        assertEquals("Hi Alice!", result.get(1).getContent());
    }

    @Test
    void getConversation_returnsEmpty_whenNoMessages() {
        when(messageRepo.findConversationByItem(1, 2, 99)).thenReturn(List.of());

        List<Message> result = messageService.getConversation(1, 2, 99);

        assertTrue(result.isEmpty());
    }

    @Test
    void getConversations_groupsByContactAndItem() {
        when(messageRepo.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(1, 1))
                .thenReturn(Arrays.asList(message2, message1));
        when(userRepo.findById(2)).thenReturn(Optional.of(recipient));

        List<ConversationDTO> result = messageService.getConversations(1);

        assertEquals(1, result.size());
        assertEquals("Bob Williams", result.get(0).getContactName());
        assertEquals(2, result.get(0).getContactId());
    }

    @Test
    void getConversations_returnsEmpty_whenNoMessages() {
        when(messageRepo.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(99, 99))
                .thenReturn(List.of());

        List<ConversationDTO> result = messageService.getConversations(99);

        assertTrue(result.isEmpty());
    }
}
