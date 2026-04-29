package de.webshop.asta.mvp.features.products.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity(name = "product")
public class Product {
    @Id
    @Column(name = "product_id")
    private int productId;

    @Column(unique = true,nullable = false,updatable = false, name = "public_id")
    private UUID publicId;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "price")
            //price in cents to avoid float calculations
    private int price;

    @Column(name = "amount_in_stock")
    private int amountInStock;

    @Column(name = "tag")
    private String tag;
}
