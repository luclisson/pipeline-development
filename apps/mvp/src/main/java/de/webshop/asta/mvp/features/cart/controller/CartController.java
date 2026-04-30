package de.webshop.asta.mvp.features.cart.controller;

import de.webshop.asta.mvp.features.cart.dto.CartDTO;
import de.webshop.asta.mvp.features.cart.service.CartDbManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartController {
    private final CartDbManagementService cartDbManagementService;
    @GetMapping("/getCart/{analyticsId}")
    public ResponseEntity<List<CartDTO>> getCart(@PathVariable("analyticsId") UUID analyticsId){
        return ResponseEntity.ok(cartDbManagementService.getCartByAnalyticsId(analyticsId));
    }
}
