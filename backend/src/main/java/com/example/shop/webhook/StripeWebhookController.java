package com.example.shop.webhook;

import com.example.shop.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.ApiResource;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook/stripe")
public class StripeWebhookController {
    private final OrderService orderService;
    private final String webhookSecret;

    public StripeWebhookController(OrderService orderService, @Value("${stripe.webhook-secret}") String webhookSecret) {
        this.orderService = orderService;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping
    public ResponseEntity<Void> handle(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) throws Exception {
        if (webhookSecret == null || webhookSecret.isBlank()) return ResponseEntity.ok().build();
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(400).build();
        }
        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent pi = ApiResource.GSON.fromJson(event.getDataObjectDeserializer().getRawJson(), PaymentIntent.class);
            Map<String, String> md = pi.getMetadata();
            if (md != null && md.get("orderId") != null) {
                Long orderId = Long.valueOf(md.get("orderId"));
                orderService.markPaidAndDecreaseStock(orderId);
            }
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            PaymentIntent pi = ApiResource.GSON.fromJson(event.getDataObjectDeserializer().getRawJson(), PaymentIntent.class);
            Map<String, String> md = pi.getMetadata();
            if (md != null && md.get("orderId") != null) {
                Long orderId = Long.valueOf(md.get("orderId"));
                orderService.markCancelled(orderId);
            }
        }
        return ResponseEntity.ok().build();
    }
}
