package com.aya.delivery_planner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Delivery;
import com.aya.delivery_planner.repository.DeliveryRepository;

import com.aya.delivery_planner.model.Driver;
import com.aya.delivery_planner.repository.DriverRepository;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;

    public DeliveryService(DeliveryRepository deliveryRepository, DriverRepository driverRepository) {
        this.deliveryRepository = deliveryRepository;
        this.driverRepository = driverRepository;
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Delivery addDelivery(Delivery delivery) {

        if (delivery.getDriver() != null) {

            Long driverId = delivery.getDriver().getId();

            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Chauffeur introuvable"));

            delivery.setDriver(driver);
        }
        
        if (delivery.getStatus() == null) {
            delivery.setStatus("PENDING");
        }

        return deliveryRepository.save(delivery);
    }

    public Delivery updateDelivery(Long id, Delivery delivery) {
        Delivery existingDelivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));

        existingDelivery.setClient(delivery.getClient());
        existingDelivery.setAddress(delivery.getAddress());
        existingDelivery.setLatitude(delivery.getLatitude());
        existingDelivery.setLongitude(delivery.getLongitude());

        if (delivery.getDriver() != null) {
            Long driverId = delivery.getDriver().getId();

            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Chauffeur introuvable"));

            existingDelivery.setDriver(driver);
        }

        return deliveryRepository.save(existingDelivery);
    }

    public void deleteDelivery(Long id) {
        if (!deliveryRepository.existsById(id)) {
            throw new RuntimeException("Livraison introuvable");
        }

        deliveryRepository.deleteById(id);
    }

}