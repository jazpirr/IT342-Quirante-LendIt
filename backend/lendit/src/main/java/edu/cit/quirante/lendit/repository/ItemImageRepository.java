package edu.cit.quirante.lendit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.quirante.lendit.entity.ItemImages;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImages, Integer> {
    List<ItemImages> findByItemId(Integer itemId);
}