package edu.cit.quirante.lendit.feature.messaging;

import edu.cit.quirante.lendit.feature.auth.User;
import edu.cit.quirante.lendit.feature.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MessageService {

    @Autowired private MessageRepository messageRepo;
    @Autowired private UserRepository userRepo;

    public Message sendMessage(Integer senderId, Integer recipientId, String content,
                               Integer itemId, String itemName, String itemImage) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setRecipientId(recipientId);
        message.setContent(content);
        message.setItemId(itemId);
        message.setItemName(itemName);
        message.setItemImage(itemImage);
        return messageRepo.save(message);
    }

    public List<Message> getConversation(Integer userId, Integer otherUserId, Integer itemId) {
        return messageRepo.findConversationByItem(userId, otherUserId, itemId);
    }

    public List<ConversationDTO> getConversations(Integer userId) {
        List<Message> allMessages = messageRepo.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(userId, userId);
        Map<String, ConversationDTO> convMap = new LinkedHashMap<>();

        for (Message msg : allMessages) {
            Integer otherId = msg.getSenderId().equals(userId) ? msg.getRecipientId() : msg.getSenderId();
            Integer itemId = msg.getItemId();
            String key = otherId + "_" + itemId;

            if (!convMap.containsKey(key)) {
                User other = userRepo.findById(otherId).orElse(null);
                String otherName = other != null ? other.getfName() + " " + other.getlName() : "Unknown";
                convMap.put(key, new ConversationDTO(otherId, otherName, itemId,
                        msg.getItemName(), msg.getItemImage(), msg.getContent(), msg.getCreatedAt()));
            }
        }
        return new ArrayList<>(convMap.values());
    }
}
