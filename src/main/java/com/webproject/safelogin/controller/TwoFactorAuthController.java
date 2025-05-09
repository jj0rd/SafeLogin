package com.webproject.safelogin.controller;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.webproject.safelogin.model.TotpRequest;
import com.webproject.safelogin.model.User;
import com.webproject.safelogin.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
public class TwoFactorAuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/2fa/verify")
    public ResponseEntity<?> verifyTotp(@RequestBody TotpRequest request, HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String email = auth.getName();
        User user = userService.findByEmail(email);

        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        boolean isCodeValid = gAuth.authorize(user.getTotpSecret(), request.getCode());

        if (isCodeValid) {
            HttpSession session = httpRequest.getSession(false);
            if (session != null) {
                session.setAttribute("2fa_authenticated", true);
            }
            return ResponseEntity.ok("TOTP verified. Fully logged in.");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid TOTP code");
        }
    }

}
