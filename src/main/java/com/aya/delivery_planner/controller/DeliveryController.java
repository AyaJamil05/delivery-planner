package com.aya.delivery_planner.controller;

import java.util.List;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.aya.delivery_planner.model.Delivery;
import com.aya.delivery_planner.service.DeliveryService;

@RestController
public class DeliveryController {

    private DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/api/deliveries")
    public List<Delivery> getDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @PostMapping("/api/deliveries")
    public Delivery createDelivery(@RequestBody Delivery delivery) {
        return deliveryService.addDelivery(delivery);
    }
    
    @PutMapping("/api/deliveries/{id}")
    public Delivery updateDelivery(
            @PathVariable Long id,
            @RequestBody Delivery delivery) {

        return deliveryService.updateDelivery(id, delivery);
    }
    
    @DeleteMapping("/api/deliveries/{id}")
    public void deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
    }
}