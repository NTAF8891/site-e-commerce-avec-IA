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
        System.out.println("🔔 Webhook Stripe reçu");
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

        System.out.println("Event Stripe: " + event.getType());

        if ("payment_intent.succeeded".equals(event.getType())) {
            Optional<com.stripe.model.StripeObject> object = event.getDataObjectDeserializer().getObject();
            if (object.isPresent() && object.get() instanceof PaymentIntent) {
                PaymentIntent paymentIntent = (PaymentIntent) object.get();
                String orderIdStr = paymentIntent.getMetadata().get("orderId");
                System.out.println("PaymentIntent metadata: " + paymentIntent.getMetadata());
                
                if (orderIdStr != null) {
                    try {
                        Long orderId = Long.parseLong(orderIdStr);
                        System.out.println("✅ Paiement réussi pour la commande #" + orderId + ", mise à jour du stock...");
                        orderService.markPaidAndDecreaseStock(orderId);
                        System.out.println("✅ Stock mis à jour pour la commande #" + orderId);
                    } catch (NumberFormatException e) {
                        System.err.println("❌ ID commande invalide dans metadata: " + orderIdStr);
                    } catch (Exception e) {
                        System.err.println("❌ Erreur lors de la mise à jour du stock: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.err.println("⚠️ Pas d'orderId dans les métadonnées du PaymentIntent");
                }
            }
        }

        return ResponseEntity.ok().build();
    }
}