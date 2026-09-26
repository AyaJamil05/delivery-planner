package com.aya.delivery_planner.controller;

import java.util.List;



import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.aya.delivery_planner.model.AssignmentResult;
import com.aya.delivery_planner.model.Delivery;

import com.aya.delivery_planner.service.DeliveryService;
import com.aya.delivery_planner.service.AssignmentService;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class DeliveryController {

    private DeliveryService deliveryService;
    private AssignmentService assignmentService;

    public DeliveryController(DeliveryService deliveryService, AssignmentService assignmentService) {
        this.deliveryService = deliveryService;
        this.assignmentService = assignmentService;
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
    
    @PostMapping("/api/deliveries/{id}/assign")
    public AssignmentResult assignDriver(@PathVariable Long id) {
        return assignmentService.assignNearestDriver(id);
    }
    
    @PostMapping("/api/deliveries/assign-all")
    public List<AssignmentResult> assignAllDeliveries() {
        return assignmentService.assignAllUnassignedDeliveries();
    }
}