package com.example.shop.stripe;

import com.example.shop.entity.Order;
import com.example.shop.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StripeService {
    private final OrderRepository orderRepository;

    public StripeService(@Value("${stripe.secret-key}") String secretKey, OrderRepository orderRepository) {
        Stripe.apiKey = secretKey;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public String createPaymentIntentForOrder(Long orderId, String currency) throws Exception {
        Order order = orderRepository.findById(orderId).orElseThrow();
        long amount = Math.round(order.getTotalAmount() * 100);
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .putMetadata("orderId", String.valueOf(order.getId()))
                .build();
        PaymentIntent pi = PaymentIntent.create(params);
        order.setStripePaymentIntentId(pi.getId());
        orderRepository.save(order);
        return pi.getClientSecret();
    }
}
