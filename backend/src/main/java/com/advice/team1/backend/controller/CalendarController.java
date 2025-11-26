package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.CalendarDto;
import com.advice.team1.backend.domain.dto.CalendarItemDto;
import com.advice.team1.backend.domain.dto.EventDto;
import com.advice.team1.backend.domain.dto.ExpenseDto;
import com.advice.team1.backend.domain.entity.Event;
import com.advice.team1.backend.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ApiResponse<CalendarDto> getCalendar(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserPrincipal user) {
        CalendarDto calendar = calendarService.getCalendar(groupId);

        return ApiResponse.success("캘린더 불러오기 성공", calendar);
    }

    @PostMapping("/event")
    public ApiResponse<?> addEvent(
            @PathVariable Long groupId,
            @RequestBody EventDto.Request request) {
        Event event = calendarService.addEvent(groupId, request);

        return ApiResponse.success("캘린더 일정 등록 성공", event);
    }

    @GetMapping("/event/{eventId}")
    public ApiResponse<EventDto.Response> getEvent(@PathVariable Long groupId, @PathVariable Long eventId) {
        return ApiResponse.success("캘린더 일정 조회 성공", calendarService.getEvent(groupId, eventId));
    }

    @GetMapping("/expense/{expenseId}")
    public ApiResponse<ExpenseDto> getExpense(@PathVariable Long groupId, @PathVariable Long expenseId) {
        return ApiResponse.success("지출 항목 조회 성공", calendarService.getExpense(groupId, expenseId));
    }
}
