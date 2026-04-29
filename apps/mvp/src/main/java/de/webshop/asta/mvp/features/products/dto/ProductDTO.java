package de.webshop.asta.mvp.features.products.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductDTO {
    String name;
    String description;
    String imagePath;
    int price;
    int amountInStock;
    String tag;
}
