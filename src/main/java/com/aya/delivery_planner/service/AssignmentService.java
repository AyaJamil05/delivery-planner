package com.aya.delivery_planner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aya.delivery_planner.model.Delivery;
import com.aya.delivery_planner.model.Driver;
import com.aya.delivery_planner.repository.DeliveryRepository;
import com.aya.delivery_planner.repository.DriverRepository;
import com.aya.delivery_planner.model.AssignmentResult;

@Service
public class AssignmentService {

    private final DriverRepository driverRepository;
    private final DeliveryRepository deliveryRepository;
    private final DistanceService distanceService;
    
    public List<AssignmentResult> assignAllUnassignedDeliveries() {

        List<Delivery> deliveries = deliveryRepository.findByDriverIsNull();

        List<AssignmentResult> results = new java.util.ArrayList<>();

        for (Delivery delivery : deliveries) {

            AssignmentResult result = assignNearestDriver(delivery.getId());

            results.add(result);
        }

        return results;
    }

    public AssignmentService(
            DriverRepository driverRepository,
            DeliveryRepository deliveryRepository,
            DistanceService distanceService) {

        this.driverRepository = driverRepository;
        this.deliveryRepository = deliveryRepository;
        this.distanceService = distanceService;
    }
    
    private long countDeliveriesForDriver(Long driverId, Long deliveryId) {
        return deliveryRepository.countByDriverIdAndIdNot(driverId, deliveryId);
    }

    public AssignmentResult assignNearestDriver(Long deliveryId) {

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable"));

        if (delivery.getLatitude() == null || delivery.getLongitude() == null) {
            throw new RuntimeException("La livraison n'a pas de coordonnées");
        }

        List<Driver> drivers = driverRepository.findAll();

        Driver selectedDriver = null;
        long lowestLoad = Long.MAX_VALUE;
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

            long driverLoad = countDeliveriesForDriver(
                    driver.getId(),
                    deliveryId
            );

            if (driverLoad < lowestLoad
                    || (driverLoad == lowestLoad && distance < shortestDistance)) {

                lowestLoad = driverLoad;
                shortestDistance = distance;
                selectedDriver = driver;
            }
        }

        if (selectedDriver == null) {
            throw new RuntimeException(
                    "Aucun chauffeur avec des coordonnées disponibles");
        }

        delivery.setDriver(selectedDriver);
        delivery.setStatus("ASSIGNED");
        deliveryRepository.save(delivery);

        double roundedDistance = Math.round(shortestDistance * 100.0) / 100.0;
        
        return new AssignmentResult(
                delivery,
                selectedDriver,
                roundedDistance,
                lowestLoad
        );
    }
}