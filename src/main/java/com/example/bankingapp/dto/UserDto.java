package com.example.bankingapp.dto;

import java.time.LocalDate;

import com.example.bankingapp.model.User;

import lombok.Data;

@Data
public class UserDto {
    private String username;
    private String fullName;
    private String email;
    private boolean hasPin;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String nomineeName;

    public UserDto(User user) {
        this.username = user.getUsername();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.hasPin = user.getPin() != null && !user.getPin().isBlank();
        this.phoneNumber = user.getPhoneNumber();
        this.dateOfBirth = user.getDateOfBirth();
        this.address = user.getAddress();
        this.nomineeName = user.getNomineeName();
    }
}

