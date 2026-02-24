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
        if (secretKey == null || secretKey.trim().isEmpty()) {
            System.err.println("ERREUR CRITIQUE: La clé secrète Stripe (STRIPE_SECRET_KEY) est manquante ou vide !");
            // On ne lance pas d'exception ici pour ne pas empêcher l'application de démarrer, 
            // mais les appels à l'API Stripe échoueront.
        } else {
            Stripe.apiKey = secretKey;
            System.out.println("Stripe API Key configurée avec succès (longueur: " + secretKey.length() + ")");
        }
        this.orderRepository = orderRepository;
    }

    @Transactional
    public String createPaymentIntentForOrder(Long orderId, String currency) throws Exception {
        if (Stripe.apiKey == null || Stripe.apiKey.trim().isEmpty()) {
            throw new IllegalStateException("La clé API Stripe n'est pas configurée. Veuillez définir la variable d'environnement STRIPE_SECRET_KEY.");
        }
        
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Commande introuvable: " + orderId));
        
        if (order.getTotalAmount() == null || order.getTotalAmount() <= 0) {
             throw new IllegalArgumentException("Montant de commande invalide: " + order.getTotalAmount());
        }

        long amount = Math.round(order.getTotalAmount() * 100);
        
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency(currency)
                    .putMetadata("orderId", String.valueOf(order.getId()))
                    .build();
            PaymentIntent pi = PaymentIntent.create(params);
            order.setStripePaymentIntentId(pi.getId());
            orderRepository.save(order);
            return pi.getClientSecret();
        } catch (Exception e) {
            System.err.println("Erreur lors de la création du PaymentIntent Stripe: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("Erreur Stripe: " + e.getMessage());
        }
    }
}
