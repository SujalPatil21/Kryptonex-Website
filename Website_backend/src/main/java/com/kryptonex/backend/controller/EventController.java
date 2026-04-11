package com.kryptonex.backend.controller;

import com.kryptonex.backend.dto.EventRequest;
import com.kryptonex.backend.entity.Event;
import com.kryptonex.backend.response.ApiResponse;
import com.kryptonex.backend.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.<List<Event>>builder()
                .success(true)
                .message("Events retrieved successfully")
                .data(eventService.getAllEvents())
                .build());
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<Event>> getFeaturedEvent() {
        Event event = eventService.getFeaturedEvent().orElse(null);
        return ResponseEntity.ok(ApiResponse.<Event>builder()
                .success(true)
                .message(event != null ? "Featured event retrieved" : "No featured event found")
                .data(event)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Event>> createEvent(@RequestBody @Valid EventRequest request) {
        return ResponseEntity.ok(ApiResponse.<Event>builder()
                .success(true)
                .message("Event created successfully")
                .data(eventService.createEvent(request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Event deleted successfully")
                .build());
    }
}
