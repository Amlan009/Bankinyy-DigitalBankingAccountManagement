package com.example.bankingapp.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoanApplicationRequest {

    @NotNull(message = "Loan amount cannot be null")
    @DecimalMin(value = "1000.00", message = "Loan amount must be at least ₹1,000.00")
    @JsonAlias("loanAmount")
    private BigDecimal amount;

    @NotBlank(message = "Loan purpose cannot be empty")
    @JsonAlias("loanPurpose")
    private String purpose;

    @DecimalMin(value = "0.00", message = "Monthly income cannot be negative")
    private BigDecimal monthlyIncome;

    @JsonAlias("loanTenureMonths")
    private Integer tenureMonths;
}