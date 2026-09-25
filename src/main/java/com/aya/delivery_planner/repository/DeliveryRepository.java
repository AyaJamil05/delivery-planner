package com.aya.delivery_planner.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aya.delivery_planner.model.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    long countByDriverId(Long driverId);

    long countByDriverIdAndIdNot(Long driverId, Long deliveryId);

    List<Delivery> findByDriverIsNull();
}