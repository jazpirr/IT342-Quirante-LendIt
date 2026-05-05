package edu.cit.quirante.lendit.repository;

import edu.cit.quirante.lendit.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE ((m.senderId = :userId AND m.recipientId = :otherId) OR (m.senderId = :otherId AND m.recipientId = :userId)) AND m.itemId = :itemId ORDER BY m.createdAt ASC")
    List<Message> findConversationByItem(
        @Param("userId") Integer userId,
        @Param("otherId") Integer otherId,
        @Param("itemId") Integer itemId
    );

    List<Message> findBySenderIdOrRecipientIdOrderByCreatedAtDesc(
        Integer senderId, Integer recipientId
    );
}
