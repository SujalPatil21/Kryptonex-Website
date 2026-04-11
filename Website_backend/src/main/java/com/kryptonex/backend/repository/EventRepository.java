package com.kryptonex.backend.repository;

import com.kryptonex.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByDateDescTimeDesc();
    Optional<Event> findByIsFeaturedTrue();
}
