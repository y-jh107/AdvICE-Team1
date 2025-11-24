package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.*;
import com.advice.team1.backend.domain.entity.User;
import com.advice.team1.backend.repository.ExpenseRepository;
import com.advice.team1.backend.repository.GroupMemberRepository;
import com.advice.team1.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.*;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MyPageService {
  
    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupMemberRepository;
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

        List<MyPageGroupListDto> groups = user.getGroups().stream()
                .map(gm -> new MyPageGroupListDto(
                        gm.getGroup().getId(),
                        gm.getGroup().getName()
                ))
                .toList();

        LocalDate now = LocalDate.now();
        LocalDate oneWeekAgo = now.minusDays(30);

        List<ExpensesByDateItemDto> items = expenseRepository
                .expensesByDate(targetUserId, oneWeekAgo, now)
                .stream()
                .map(p -> new ExpensesByDateItemDto(
                        p.getD(),
                        p.getTotal()
                ))
                .toList();

        MyPageUserDto myPageUserDto = new MyPageUserDto(
                user.getId(),
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
}
