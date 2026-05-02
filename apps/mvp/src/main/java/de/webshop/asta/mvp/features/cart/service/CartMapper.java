package de.webshop.asta.mvp.features.cart.service;

import de.webshop.asta.mvp.features.analytics.service.SessionDbManagementService;
import de.webshop.asta.mvp.features.cart.dto.CartDTO;
import de.webshop.asta.mvp.features.cart.entity.Cart;
import de.webshop.asta.mvp.features.products.service.ProductDbService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartMapper {
    private final ProductDbService productDbService;
    private final SessionDbManagementService sessionDbManagementService;

    public CartDTO toDto(Cart cart){
        UUID analyticsId = sessionDbManagementService.getSessionBySessionId(cart.getSessionId())
                .orElseThrow().getAnalyticsId();
        // dont know if the throw here is good for error handling
        UUID publicProductId = productDbService.getProductByProductId(cart.getProductId())
                .orElseThrow().getPublicId();

       return new CartDTO(
               analyticsId,
               publicProductId,
               cart.getAmountSelected(),
               cart.getStatus()
       );
    }

    public Cart toCart(CartDTO dto){
        Cart cart = new Cart();
        cart.setSessionId(sessionDbManagementService.getSessionIdByAnalyticsId(dto.getAnalyticsId()).orElseThrow());
        cart.setProductId(productDbService.getProductIdByPublicId(dto.getPublicProductId()).orElseThrow());
        cart.setAmountSelected(dto.getAmountSelected());
        cart.setStatus(dto.getStatus());

        return cart;
    }
}
