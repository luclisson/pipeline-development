package de.webshop.asta.mvp.features.products.service;

import de.webshop.asta.mvp.features.products.dto.ProductDTO;
import de.webshop.asta.mvp.features.products.entity.Product;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    public ProductDTO toDto(Product p){
        return new ProductDTO(
                p.getPublicId(),
                p.getName(),
                p.getDescription(),
                p.getImagePath(),
                p.getPrice(),
                p.getAmountInStock(),
                p.getTag()
        );
    }
}
