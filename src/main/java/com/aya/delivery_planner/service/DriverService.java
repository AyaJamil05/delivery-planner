package com.aya.delivery_planner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Driver;
import com.aya.delivery_planner.repository.DriverRepository;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
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
}