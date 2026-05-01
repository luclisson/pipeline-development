package de.webshop.asta.mvp.features.products.dto;

import de.webshop.asta.mvp.common.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductDTO {
    UUID publicId;
    String name;
    String description;
    String imagePath;
    int price;
    int amountInStock;
    String tag;
    ProductStatus status;
}
