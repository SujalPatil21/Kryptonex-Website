package com.kryptonex.backend.service;

import com.kryptonex.backend.dto.EventRequest;
import com.kryptonex.backend.entity.Event;
import com.kryptonex.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAllByOrderByDateDescTimeDesc();
    }

    public Optional<Event> getFeaturedEvent() {
        return eventRepository.findByIsFeaturedTrue();
    }

    @Transactional
    public Event createEvent(EventRequest request) {
        // If this new event is featured, remove featured status from any current featured event
        if (request.isFeatured()) {
            eventRepository.findByIsFeaturedTrue().ifPresent(currentFeatured -> {
                currentFeatured.setFeatured(false);
                eventRepository.save(currentFeatured);
            });
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .description(request.getDescription())
                .date(request.getDate())
                .time(request.getTime())
                .instructorName(request.getInstructorName())
                .instructorRole(request.getInstructorRole())
                .instructorStats(request.getInstructorStats())
                .isFeatured(request.isFeatured())
                .build();

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }
}
