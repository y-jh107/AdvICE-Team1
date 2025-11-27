package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.*;
import com.advice.team1.backend.domain.entity.*;
import com.advice.team1.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ReceiptRepository receipts;
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
        String normalizedMode = "by_percent".equalsIgnoreCase(rawMode) ? "by_percent" : "equal";

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

    @Transactional(readOnly = true)
    public List<ExpenseDetailDto> getExpenses(Long groupId, Long userId) {

        // 해당 유저가 그룹 멤버인지 검증
        if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new IllegalArgumentException("해당 모임의 멤버만 지출을 조회할 수 있습니다.");
        }

        // 해당 그룹의 모든 Expense 조회
        List<Expense> expenseList = expenses.findByGroup_Id(groupId);

        // 각 Expense마다 participants 조회 → ExpenseDetailDto 변환
        return expenseList.stream()
                .map(e -> {
                    List<ExpenseParticipants> participants =
                            expenseParticipants.findByExpense_Id(e.getId());

                    return toDetailDto(e, participants);
                })
                .toList();
    }

    private List<ExpenseParticipants> saveParticipantsIfAny(Long groupId,
                                                            Expense expense,
                                                            String mode,
                                                            ExpenseCreateRequestDto req) {
        List<ExpenseParticipantRequestDto> reqParticipants = req.participants();
        int participantsSize = reqParticipants.size();

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
                    } else if ("equal".equals(mode)) {
                        shareRatio = BigDecimal.ONE.divide(BigDecimal.valueOf(participantsSize), 4, RoundingMode.HALF_UP );

                        shareAmount = totalAmount.divide(BigDecimal.valueOf(participantsSize), 2, RoundingMode.HALF_UP);
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

    public Receipt addReceipt(Long expenseId, ReceiptRequestDto req) throws IOException {
        if (req.image().isEmpty()) {
            throw new IllegalArgumentException("이미지가 첨부되지 않았습니다.");
        }

        Expense e = expenses.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지출을 찾을 수 없습니다."));

        Receipt r = Receipt.builder()
                .expense(e)
                .image(req.image().getBytes())
                .build();

        receipts.save(r);

        return r;
    }

    public ReceiptDto getReceipt(Long expenseId) {
        Expense e = expenses.findById(expenseId)
                .orElseThrow(() -> new NoSuchElementException("해당 지출을 찾을 수 없습니다."));

        Receipt r = receipts.findByExpenseId(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("해당 지출에 등록된 영수증이 없습니다."));

        String image = null;
        byte[] imageBytes = r.getImage();

        if (imageBytes != null) {
            image = Base64.getEncoder().encodeToString(imageBytes);
        }

        return new ReceiptDto(
                r.getId(),
                r.getExpense().getId(),
                image
        );
    }

    private ExpenseDetailDto toDetailDto(Expense e, List<ExpenseParticipants> participants) {
        List<ExpenseParticipantDetailDto> participantDtos =
                (participants == null || participants.isEmpty())
                        ? Collections.emptyList()
                        : participants.stream()
                        .map(ep -> {
                            BigDecimal myAmount = null;
                            if (ep.getShareRatio() != null) {
                                myAmount = ep.getShareAmount();
                            }

                            User u = ep.getUser();
                            return new ExpenseParticipantDetailDto(
                                    u.getId(),
                                    u.getName(),
                                    u.getEmail(),
                                    myAmount
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