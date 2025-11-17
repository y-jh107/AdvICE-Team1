package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.ExpenseCreateRequestDto;
import com.advice.team1.backend.domain.dto.ExpenseDetailDto;
import com.advice.team1.backend.domain.dto.ExpenseParticipantDetailDto;
import com.advice.team1.backend.domain.dto.ExpenseParticipantRequestDto;
import com.advice.team1.backend.domain.entity.Expense;
import com.advice.team1.backend.domain.entity.ExpenseParticipants;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.domain.entity.User;
import com.advice.team1.backend.repository.ExpenseParticipantRepository;
import com.advice.team1.backend.repository.ExpenseRepository;
import com.advice.team1.backend.repository.GroupMemberRepository;
import com.advice.team1.backend.repository.GroupRepository;
import com.advice.team1.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenses;
    private final GroupRepository groups;
    private final GroupMemberRepository groupMembers;
    private final UserRepository users;
    private final ExpenseParticipantRepository expenseParticipants;

    @Transactional
    public ExpenseDetailDto createExpense(Long groupId, Long userId, ExpenseCreateRequestDto req) {


        Group group = groups.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new IllegalArgumentException("해당 모임의 멤버만 지출을 등록할 수 있습니다.");
        }

        //지출 기본 정보 저장
        Expense expense = Expense.builder()
                .group(group)
                .name(req.name())
                .amount(req.amount())
                .payment(req.payment())
                .memo(req.memo())
                .location(req.location())
                .spentAt(req.spentAt())
                .currency(req.currency())
                .splitMode(req.splitMode())
                .build();

        Expense saved = expenses.save(expense);

        List<ExpenseParticipants> participants = saveParticipantsIfAny(groupId, saved, req);

        return toDetailDto(saved, participants);
    }

    // 지출항목 각각조회
    @Transactional(readOnly = true)
    public ExpenseDetailDto getExpense(Long expenseId, Long userId) {
        Expense e = expenses.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("지출을 찾을 수 없습니다."));

        Long groupId = e.getGroup().getId();


        if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new IllegalArgumentException("해당 모임의 멤버만 지출을 조회할 수 있습니다.");
        }

        List<ExpenseParticipants> participants =
                expenseParticipants.findByExpense_Id(expenseId);

        return toDetailDto(e, participants);
    }

    private List<ExpenseParticipants> saveParticipantsIfAny(Long groupId,
                                                           Expense expense,
                                                           ExpenseCreateRequestDto req) {
        List<ExpenseParticipantRequestDto> reqParticipants = req.participants();
        if (reqParticipants == null || reqParticipants.isEmpty()) {
            return Collections.emptyList();
        }

        // splitMode 가 PERCENT 인 경우, 퍼센트 합 100 체크
        if ("PERCENT".equalsIgnoreCase(req.splitMode())) {
            int sum = reqParticipants.stream()
                    .map(ExpenseParticipantRequestDto::percent)
                    .filter(p -> p != null)
                    .mapToInt(Integer::intValue)
                    .sum();
            if (sum != 100) {
                throw new IllegalArgumentException("분배 비율의 합은 100이어야 합니다.");
            }
        }

        if ("EQUAL".equalsIgnoreCase(req.splitMode())) {
            // 아무 계산도 하지 않음 (percent를 null로 허용)
        }

        // 각 userId 가 해당 모임 멤버인지 검증 후 저장
        List<ExpenseParticipants> participants = reqParticipants.stream()
                .map(p -> {
                    Long participantUserId = p.userId();

                    if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, participantUserId)) {
                        throw new IllegalArgumentException("지출 참여자는 모임의 멤버여야 합니다.");
                    }

                    User user = users.findById(participantUserId)
                            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                    return ExpenseParticipants.builder()
                            .expense(expense)
                            .user(user)
                            .percent(p.percent())
                            .build();
                })
                .toList();

        return expenseParticipants.saveAll(participants);
    }


    private ExpenseDetailDto toDetailDto(Expense e, List<ExpenseParticipants> participants) {
        List<ExpenseParticipantDetailDto> participantDtos =
                (participants == null || participants.isEmpty())
                        ? Collections.emptyList()
                        : participants.stream()
                        .map(ep -> new ExpenseParticipantDetailDto(
                                ep.getUser().getId(),
                                ep.getUser().getName(),
                                ep.getUser().getEmail(),
                                ep.getPercent()
                        ))
                        .toList();

        return new ExpenseDetailDto(
                e.getId(),
                e.getGroup().getId(),
                e.getName(),
                e.getAmount(),
                e.getPayment(),
                e.getMemo(),
                e.getLocation(),
                e.getSpentAt(),
                e.getCurrency(),
                e.getSplitMode(),
                participantDtos
        );
    }
}