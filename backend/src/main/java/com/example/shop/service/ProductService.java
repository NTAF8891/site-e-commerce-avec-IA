package com.example.shop.service;

import com.example.shop.entity.Product;
import com.example.shop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    public ProductService(ProductRepository productRepository, FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
    }

    public Product create(Product p, MultipartFile image) throws IOException {
        if (image != null) {
            String url = fileStorageService.storeImage(image);
            p.setImageUrl(url);
        }
        return productRepository.save(p);
    }

    public List<Product> list() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Produit non trouvé: " + id));
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    public Product updatePrice(Long id, Double price) {
        Product p = productRepository.findById(id).orElseThrow();
        p.setPrice(price);
        return productRepository.save(p);
    }

    public Product updateStock(Long id, Integer stock) {
        Product p = productRepository.findById(id).orElseThrow();
        p.setStock(stock);
        return productRepository.save(p);
    }

    public List<Product> createBatch(List<Product> products) {
        return productRepository.saveAll(products);
    }
}
