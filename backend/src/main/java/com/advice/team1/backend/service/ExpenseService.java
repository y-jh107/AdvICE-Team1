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

import java.math.BigDecimal;
import java.math.RoundingMode;
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

        String rawMode = req.splitMode();
        String normalizedMode = "by_percent".equalsIgnoreCase(rawMode) ? "by_percent" : "empty";

        Expense expense = Expense.builder()
                .group(group)
                .name(req.name())
                .amount(req.amount())
                .payment(req.payment())
                .memo(req.memo())
                .location(req.location())
                .spentAt(req.spentAt())
                .currency(req.currency())
                .splitMode(normalizedMode)
                .build();

        Expense saved = expenses.save(expense);

        List<ExpenseParticipants> participants = saveParticipantsIfAny(groupId, saved, normalizedMode, req);

        return toDetailDto(saved, participants);
    }

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
                                                            String mode,
                                                            ExpenseCreateRequestDto req) {
        List<ExpenseParticipantRequestDto> reqParticipants = req.participants();
        if (reqParticipants == null || reqParticipants.isEmpty()) {
            return Collections.emptyList();
        }

        if ("by_percent".equals(mode)) {
            int sum = reqParticipants.stream()
                    .map(ExpenseParticipantRequestDto::percent)
                    .filter(p -> p != null)
                    .mapToInt(Integer::intValue)
                    .sum();
            if (sum != 100) {
                throw new IllegalArgumentException("분배 비율의 합은 100이어야 합니다.");
            }
        }

        BigDecimal totalAmount = expense.getAmount();

        List<ExpenseParticipants> participants = reqParticipants.stream()
                .map(p -> {
                    Long participantUserId = p.userId();

                    if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, participantUserId)) {
                        throw new IllegalArgumentException("지출 참여자는 모임의 멤버여야 합니다.");
                    }

                    User user = users.findById(participantUserId)
                            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                    BigDecimal shareRatio = null;
                    BigDecimal shareAmount = null;


                    if ("by_percent".equals(mode) && p.percent() != null) {
                        shareRatio = BigDecimal.valueOf(p.percent())
                                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                        if (totalAmount != null) {
                            shareAmount = totalAmount
                                    .multiply(shareRatio)
                                    .setScale(2, RoundingMode.HALF_UP);
                        }
                    }

                    return ExpenseParticipants.builder()
                            .expense(expense)
                            .user(user)
                            .shareRatio(shareRatio)
                            .shareAmount(shareAmount)
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
                        .map(ep -> {
                            Integer percent = null;
                            if (ep.getShareRatio() != null) {
                                percent = ep.getShareRatio()
                                        .multiply(BigDecimal.valueOf(100))
                                        .setScale(0, RoundingMode.HALF_UP)
                                        .intValue();
                            }

                            User u = ep.getUser();
                            return new ExpenseParticipantDetailDto(
                                    u.getId(),
                                    u.getName(),
                                    u.getEmail(),
                                    percent
                            );
                        })
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