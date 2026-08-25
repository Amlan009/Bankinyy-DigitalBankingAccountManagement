package com.example.bankingapp.dto;

import java.math.BigDecimal;

import com.example.bankingapp.model.Account;

import lombok.Data;

@Data
public class AccountDto {
    private Long id;
    private String accountNumber;
    private BigDecimal balance;
    private BankDto bank;
    private String nickname;
    private String accountNickname;
    private String bankName;
    private DebitCardDto debitCard;

    public AccountDto(Account account) {
        this.id = account.getId();
        this.accountNumber = account.getAccountNumber();
        this.balance = account.getBalance();
        this.nickname = account.getAccountNickname();
        this.accountNickname = account.getAccountNickname();

        if (account.getBank() != null) {
            this.bank = new BankDto(account.getBank());
            this.bankName = account.getBank().getName();
        }

        if (account.getDebitCard() != null) {
            this.debitCard = new DebitCardDto(account.getDebitCard());
        }
    }
}