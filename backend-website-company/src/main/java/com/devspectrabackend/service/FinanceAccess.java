package com.devspectrabackend.service;

import com.devspectrabackend.model.User;
import com.devspectrabackend.support.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Hanya dua pemegang keuangan yang boleh membuka /api/incomes.
 * Daftar emailnya diambil dari properti finance.allowed-emails, atau dari
 * environment variable FINANCE_EMAILS (dipisah koma). Samakan dengan
 * VITE_FINANCE_EMAILS di dashboard.
 */
@Service
public class FinanceAccess {

    private final Set<String> financeEmails;

    public FinanceAccess(@Value("${finance.allowed-emails:${FINANCE_EMAILS:}}") String emails) {
        this.financeEmails = Arrays.stream(emails.split(","))
                .map(e -> e.trim().toLowerCase())
                .filter(e -> !e.isEmpty())
                .collect(Collectors.toSet());
    }

    public boolean allows(String email) {
        return email != null && financeEmails.contains(email.trim().toLowerCase());
    }

    public void require(User user) {
        if (!allows(user.getEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Kamu tidak punya akses ke data keuangan.");
        }
    }
}
