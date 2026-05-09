package edu.cit.quirante.lendit.feature.item;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImages, Integer> {
    List<ItemImages> findByItemId(Integer itemId);
}
