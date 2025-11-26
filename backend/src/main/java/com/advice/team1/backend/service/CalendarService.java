package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.CalendarDto;
import com.advice.team1.backend.domain.dto.CalendarItemDto;
import com.advice.team1.backend.domain.dto.EventDto;
import com.advice.team1.backend.domain.dto.ExpenseDto;
import com.advice.team1.backend.domain.entity.Event;
import com.advice.team1.backend.domain.entity.Expense;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.repository.EventRepository;
import com.advice.team1.backend.repository.ExpenseRepository;
import com.advice.team1.backend.repository.GroupRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final EventRepository eventRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;

    public CalendarDto getCalendar(Long groupId) {
        List<CalendarItemDto> items = new ArrayList<>();

        List<Event> events = eventRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroup_Id(groupId);

        events.forEach(e -> items.add(
                new CalendarItemDto(
                        e.getId(),
                        "event",
                        e.getName(),
                        e.getDate()
                )
        ));

        expenses.forEach(ex -> items.add(
                new CalendarItemDto(
                        ex.getId(),
                        "expense",
                        ex.getName(),
                        ex.getSpentAt()
                )
        ));

        return new CalendarDto(items);
    }

    public Event addEvent(Long groupId, EventDto.Request request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        String rawDate = String.valueOf(request.getDate()).substring(0, 10);
        LocalDate date = LocalDate.parse(rawDate);

        Event event = Event.builder()
                .name(request.getName())
                .date(date)
                .location(request.getLocation())
                .group(group)
                .build();

        eventRepository.save(event);

        return event;
    }

    public EventDto.Response getEvent(Long groupId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));

        if (!event.getGroup().getId().equals(groupId))
            throw new IllegalArgumentException("해당 모임의 일정이 아닙니다.");

        return EventDto.Response.from(event);
    }

    public ExpenseDto getExpense(Long groupId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("지출을 찾을 수 없습니다."));

        if (!expense.getGroup().getId().equals(groupId))
            throw new IllegalArgumentException("해당 모임의 지출이 아닙니다.");

        return new ExpenseDto(expense);
    }
}
