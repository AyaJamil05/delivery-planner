package com.aya.delivery_planner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Delivery;
import com.aya.delivery_planner.repository.DeliveryRepository;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Delivery addDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }
    
    public Delivery updateDelivery(Long id, Delivery delivery) {

        Delivery existingDelivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));

        existingDelivery.setClient(delivery.getClient());
        existingDelivery.setAddress(delivery.getAddress());

        return deliveryRepository.save(existingDelivery);
    }
    
    public void deleteDelivery(Long id) {
        if (!deliveryRepository.existsById(id)) {
            throw new RuntimeException("Livraison introuvable");
        }

        deliveryRepository.deleteById(id);
    }
}