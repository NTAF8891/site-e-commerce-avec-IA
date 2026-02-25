package com.example.shop.service;

import com.example.shop.entity.*;
import com.example.shop.repository.OrderItemRepository;
import com.example.shop.repository.OrderRepository;
import com.example.shop.repository.ProductRepository;
import com.example.shop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(Long userId, List<Item> items) {
        User user = userRepository.findById(userId).orElseThrow();
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order = orderRepository.save(order);
        double total = 0d;
        for (Item it : items) {
            Product p = productRepository.findById(it.productId).orElseThrow();
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(it.quantity);
            oi.setPrice(p.getPrice());
            order.getItems().add(oi);
            orderItemRepository.save(oi);
            total += p.getPrice() * it.quantity;
        }
        order.setTotalAmount(total);
        order = orderRepository.save(order);
        return order;
    }

    @Transactional
    public void markPaidAndDecreaseStock(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (order.getStatus() == OrderStatus.PAID) return;
        
        for (OrderItem oi : order.getItems()) {
            Product p = oi.getProduct();
            int newStock = Math.max(0, p.getStock() - oi.getQuantity());
            p.setStock(newStock);
            productRepository.save(p);
        }
        
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public record Item(Long productId, Integer quantity) {}
}
