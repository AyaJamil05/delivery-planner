package com.aya.delivery_planner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Delivery;
import com.aya.delivery_planner.model.Driver;
import com.aya.delivery_planner.repository.DeliveryRepository;
import com.aya.delivery_planner.repository.DriverRepository;

@Service
public class AssignmentService {

    private final DriverRepository driverRepository;
    private final DeliveryRepository deliveryRepository;
    private final DistanceService distanceService;

    public AssignmentService(
            DriverRepository driverRepository,
            DeliveryRepository deliveryRepository,
            DistanceService distanceService) {

        this.driverRepository = driverRepository;
        this.deliveryRepository = deliveryRepository;
        this.distanceService = distanceService;
    }

    public Delivery assignNearestDriver(Long deliveryId) {

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));

        if (delivery.getLatitude() == null || delivery.getLongitude() == null) {
            throw new RuntimeException("La livraison n'a pas de coordonnées");
        }

        List<Driver> drivers = driverRepository.findAll();

        Driver nearestDriver = null;
        double shortestDistance = Double.MAX_VALUE;

        for (Driver driver : drivers) {

            if (driver.getLatitude() == null || driver.getLongitude() == null) {
                continue;
            }

            double distance = distanceService.calculateDistance(
                    delivery.getLatitude(),
                    delivery.getLongitude(),
                    driver.getLatitude(),
                    driver.getLongitude()
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestDriver = driver;
            }
        }

        if (nearestDriver == null) {
            throw new RuntimeException("Aucun chauffeur avec des coordonnées disponibles");
        }

        delivery.setDriver(nearestDriver);

        return deliveryRepository.save(delivery);
    }
}