package de.webshop.asta.mvp.features.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CartDTO {
    UUID analyticsId;
    UUID publicProductId;
    int amountSelected;
    int status;

}
