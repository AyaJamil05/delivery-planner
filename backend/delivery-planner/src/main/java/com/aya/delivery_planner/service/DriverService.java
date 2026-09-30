package com.aya.delivery_planner.service;

import java.util.List;


import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Driver;
import com.aya.delivery_planner.repository.DriverRepository;
import com.aya.delivery_planner.repository.DeliveryRepository;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final DeliveryRepository deliveryRepository;

    public DriverService(DriverRepository driverRepository, DeliveryRepository deliveryRepository) {
    	this.driverRepository = driverRepository;
        this.deliveryRepository = deliveryRepository;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver addDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver updateDriver(Long id, Driver driver) {

        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chauffeur introuvable"));

        existingDriver.setName(driver.getName());
        existingDriver.setLatitude(driver.getLatitude());
        existingDriver.setLongitude(driver.getLongitude());

        return driverRepository.save(existingDriver);
    }
    
    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chauffeur introuvable"));

        long numberOfDeliveries = deliveryRepository.countByDriverId(id);

        if (numberOfDeliveries > 0) {
            throw new RuntimeException(
                "Impossible de supprimer ce chauffeur : il possède encore "
                + numberOfDeliveries + " livraison(s)."
            );
        }

        driverRepository.delete(driver);
    }
}