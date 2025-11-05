package com.advice.team1.backend.service;

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

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final EventRepository eventRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;

    public void addEvent(Long groupId, EventDto.Request request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        Event event = Event.builder()
                .name(request.getName())
                .date(request.getDate())
                .location(request.getLocation())
                .build();

        eventRepository.save(event);
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
