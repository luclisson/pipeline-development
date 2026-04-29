package de.webshop.asta.mvp.features.products.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity(name = "product")
public class Product {
    @Id
    @Column(name = "product_id")
    int productId;

    @Column(name = "name")
    String name;

    @Column(name = "description")
    String description;

    @Column(name = "image_path")
    String imagePath;

    @Column(name = "price")
            //price in cents to avoid float calculations
    int price;

    @Column(name = "amount_in_stock")
    int amountInStock;

    @Column(name = "tag")
    String tag;
}
