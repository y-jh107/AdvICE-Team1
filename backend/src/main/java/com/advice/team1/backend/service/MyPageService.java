package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.*;
import com.advice.team1.backend.repository.ExpenseRepository;
import com.advice.team1.backend.repository.GroupMemberRepository;
import com.advice.team1.backend.repository.UserRepository;
import com.advice.team1.backend.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.Instant;
import java.time.*;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MyPageService {
    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupRepository;
    private final UserRepository userRepository;

    /**
     * requestUserId: 요청한 유저의 ID
     * targetUserId: 조회 대상 ID
     * from: 날짜별 지출 조회 기간 시작
     * to: 날짜별 지출 조회 기간 끝
     * **/
    public MyPageDto buildMyPage(
            Long requestUserId,
            Long targetUserId,
            Instant from,
            Instant to
    ) {
        if (requestUserId != targetUserId) {
            throw new SecurityException("다른 사람은 조회할 수 없습니다.");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<MyPageGroupListDto> groups = groupRepository.findByUserId(user.getId());

        Range range = normalizeRange(from, to);

        List<ExpensesByDateItemDto> items = expenseRepository.expensesByDate(targetUserId, range.from, range.to)
                .stream()
                .map(r -> new ExpensesByDateItemDto(
                        (r[0] instanceof Date d) ? d.toLocalDate() : (LocalDate) r[0],
                        (r[1] instanceof BigDecimal b) ? b : new BigDecimal(r[1].toString())
                ))
                .toList();

        MyPageUserDto myPageUserDto = new MyPageUserDto(
                Long.valueOf(user.getId()),
                user.getName(),
                user.getEmail(),
                user.getPhone()
        );

        return new MyPageDto(
                myPageUserDto,
                groups,
                new ExpensesByDateDto(items)
        );
    }

    /*
    * 지출 조회 기간 설정 메서드
    * from: 입력값 없다면 현재 날짜로부터 일주일 전
    * to: 입력값 없다면 현재 날짜
    * */
    private Range  normalizeRange(Instant from, Instant to) {
        ZoneId zone = ZoneOffset.UTC;

        Instant defaultEnd = LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant();
        Instant defaultStart = defaultEnd.minus(Duration.ofDays(7));

        Instant start = (from != null) ? from : defaultStart;
        Instant end = (to != null) ? to : defaultEnd;

        if (start.isAfter(end)) {
            end = start.plus(Duration.ofDays(7));
        }

        return new Range(start, end);
    }

    private record Range(Instant from, Instant to) {}
}
