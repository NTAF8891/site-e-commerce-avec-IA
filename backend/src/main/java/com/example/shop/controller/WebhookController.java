package com.example.shop.controller;

import com.example.shop.service.OrderService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final OrderService orderService;

    public WebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        if (endpointSecret == null || endpointSecret.isEmpty()) {
            System.out.println("⚠️ Webhook secret non configuré, webhook ignoré.");
            return ResponseEntity.ok().build();
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            System.err.println("❌ Erreur signature webhook: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook Error: " + e.getMessage());
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            Optional<com.stripe.model.StripeObject> object = event.getDataObjectDeserializer().getObject();
            if (object.isPresent() && object.get() instanceof PaymentIntent) {
                PaymentIntent paymentIntent = (PaymentIntent) object.get();
                String orderIdStr = paymentIntent.getMetadata().get("orderId");
                if (orderIdStr != null) {
                    try {
                        Long orderId = Long.parseLong(orderIdStr);
                        System.out.println("✅ Paiement réussi pour la commande #" + orderId);
                        orderService.markPaidAndDecreaseStock(orderId);
                    } catch (NumberFormatException e) {
                        System.err.println("❌ ID commande invalide dans metadata: " + orderIdStr);
                    }
                }
            }
        }

        return ResponseEntity.ok().build();
    }
}