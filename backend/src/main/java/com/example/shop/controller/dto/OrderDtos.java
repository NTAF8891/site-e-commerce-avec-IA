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
}
