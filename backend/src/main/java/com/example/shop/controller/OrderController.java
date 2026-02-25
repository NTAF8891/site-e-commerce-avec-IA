package com.example.shop.controller;

import com.example.shop.controller.dto.OrderDtos;
import com.example.shop.entity.Order;
import com.example.shop.repository.UserRepository;
import com.example.shop.service.OrderService;
import com.example.shop.stripe.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    public OrderController(OrderService orderService, UserRepository userRepository, StripeService stripeService) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderDtos.CreateOrderRequest req, Authentication auth) {
        Long userId = userRepository.findByEmail(auth.getName()).orElseThrow().getId();
        List<OrderService.Item> items = req.items.stream()
                .map(i -> new OrderService.Item(i.productId, i.quantity))
                .collect(Collectors.toList());
        Order order = orderService.createOrder(userId, items);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<OrderDtos.CreatePaymentIntentResponse> createPaymentIntent(@RequestBody OrderDtos.CreatePaymentIntentRequest req) throws Exception {
        String clientSecret = stripeService.createPaymentIntentForOrder(req.orderId, req.currency == null ? "eur" : req.currency);
        OrderDtos.CreatePaymentIntentResponse res = new OrderDtos.CreatePaymentIntentResponse();
        res.clientSecret = clientSecret;
        return ResponseEntity.ok(res);
    }

    @GetMapping
    public ResponseEntity<List<OrderDtos.OrderResponse>> getUserOrders(Authentication auth) {
        Long userId = userRepository.findByEmail(auth.getName()).orElseThrow().getId();
        List<Order> orders = orderService.getOrdersByUser(userId);
        List<OrderDtos.OrderResponse> res = orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(res);
    }

    private OrderDtos.OrderResponse mapToDto(Order order) {
        OrderDtos.OrderResponse dto = new OrderDtos.OrderResponse();
        dto.id = order.getId();
        dto.totalAmount = order.getTotalAmount();
        dto.status = order.getStatus().name();
        dto.createdAt = order.getCreatedAt().toString();
        dto.items = order.getItems().stream()
                .map(i -> {
                    OrderDtos.OrderItemDto itemDto = new OrderDtos.OrderItemDto();
                    itemDto.productName = i.getProduct().getName();
                    itemDto.quantity = i.getQuantity();
                    itemDto.price = i.getPrice();
                    return itemDto;
                })
                .collect(Collectors.toList());
        return dto;
    }
}
