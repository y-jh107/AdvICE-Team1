package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.dto.EventDto;
import com.advice.team1.backend.domain.dto.ExpenseDto;
import com.advice.team1.backend.domain.entity.Event;
import com.advice.team1.backend.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/group/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping("/event")
    public ApiResponse<?> addEvent(
            @RequestParam Long groupId,
            @RequestBody EventDto.Request request) {
        Event event = calendarService.addEvent(groupId, request);

        return ApiResponse.success("캘린더 일정 등록 성공", event);
    }

    @GetMapping("/event")
    public ApiResponse<EventDto.Response> getEvent(@RequestParam Long groupId, @RequestParam Long eventId) {
        return ApiResponse.success("캘린더 일정 조회 성공", calendarService.getEvent(groupId, eventId));
    }

    @GetMapping("/expense")
    public ApiResponse<ExpenseDto> getExpense(@RequestParam Long groupId, @RequestParam Long expenseId) {
        return ApiResponse.success("지출 항목 조회 성공", calendarService.getExpense(groupId, expenseId));
    }
}
