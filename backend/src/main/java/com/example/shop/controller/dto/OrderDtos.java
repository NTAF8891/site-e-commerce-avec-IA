package com.example.shop.controller.dto;

import java.util.List;

public class OrderDtos {
    public static class CreateOrderRequest {
        public List<Item> items;
    }
    public static class Item {
        public Long productId;
        public Integer quantity;
    }
    public static class CreatePaymentIntentRequest {
        public Long orderId;
        public String currency;
    }
    public static class CreatePaymentIntentResponse {
        public String clientSecret;
    }

    public static class OrderResponse {
        public Long id;
        public Double totalAmount;
        public String status;
        public String createdAt;
        public List<OrderItemDto> items;
    }

    public static class OrderItemDto {
        public String productName;
        public Integer quantity;
        public Double price;
    }
}
