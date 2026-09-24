package com.aya.delivery_planner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.aya.delivery_planner.model.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

}