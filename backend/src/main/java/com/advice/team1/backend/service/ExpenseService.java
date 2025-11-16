package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.ExpenseCreateRequestDto;
import com.advice.team1.backend.domain.dto.ExpenseDetailDto;
import com.advice.team1.backend.domain.entity.Expense;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.repository.ExpenseRepository;
import com.advice.team1.backend.repository.GroupMemberRepository;
import com.advice.team1.backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenses;
    private final GroupRepository groups;
    private final GroupMemberRepository groupMembers;

    @Transactional
    public ExpenseDetailDto createExpense(Long groupId, Long userId, ExpenseCreateRequestDto req) {
        Group group = groups.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new IllegalArgumentException("해당 모임의 멤버만 지출을 등록할 수 있습니다.");
        }

        Date spentAt = null;
        if (req.spentDate() != null) {
            spentAt = Date.from(
                    req.spentDate()
                            .atStartOfDay(java.time.ZoneId.systemDefault())
                            .toInstant()
            );
        }

        Expense expense = Expense.builder()
                .group(group)
                .name(req.name())
                .amount(req.amount())
                .payment(req.payment())
                .memo(req.memo())
                .location(req.location())
                .spentAt(spentAt)
                .currency(req.currency())
                .splitMode(req.splitMode())
                .build();

        Expense saved = expenses.save(expense);
        return toDetailDto(saved);
    }

    @Transactional(readOnly = true)
    public ExpenseDetailDto getExpense(Long expenseId, Long userId) {
        Expense e = expenses.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("지출을 찾을 수 없습니다."));

        Long groupId = e.getGroup().getId();

        // 해당 지출이 속한 모임의 멤버인지 아닌지 확인
        if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new IllegalArgumentException("해당 모임의 멤버만 지출을 조회할 수 있습니다.");
        }

        return toDetailDto(e);
    }

    private ExpenseDetailDto toDetailDto(Expense e) {
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
                e.getSplitMode()
        );
    }
}