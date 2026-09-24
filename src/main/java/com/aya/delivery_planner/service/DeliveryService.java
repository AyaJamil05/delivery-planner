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
}