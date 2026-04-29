package de.webshop.asta.mvp.features.products.service;

import de.webshop.asta.mvp.features.products.dto.ProductDTO;
import de.webshop.asta.mvp.features.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductDbService {
    private final ProductRepository productRepository;
    private final MapperService mapper;
    public Optional<ProductDTO> getProductById(int id){
        return productRepository.findProductByProductId(id).map(mapper::toDto);
    }
    public List<ProductDTO> getProducts(){
        return productRepository.findAll().stream().map(mapper::toDto).toList();
    }
}
