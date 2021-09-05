package com.tecforte.blog.repository;
import com.tecforte.blog.domain.Entry;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data  repository for the Entry entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {

    List<Entry> deleteAllByTitleContaining(String title);

    List<Entry> deleteAllByBlogIdAndTitleContaining(Long blogId , String title);

}
