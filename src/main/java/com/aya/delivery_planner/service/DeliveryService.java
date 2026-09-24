package com.aya.delivery_planner.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Delivery;

@Service
public class DeliveryService {

    private List<Delivery> deliveries = new ArrayList<>();

    public DeliveryService() {
        deliveries.add(new Delivery(1L, "Client A", "Brest"));
        deliveries.add(new Delivery(2L, "Client B", "Plouzané"));
    }

    public List<Delivery> getAllDeliveries() {
        return deliveries;
    }

    public Delivery addDelivery(Delivery delivery) {
        deliveries.add(delivery);
        return delivery;
    }
}