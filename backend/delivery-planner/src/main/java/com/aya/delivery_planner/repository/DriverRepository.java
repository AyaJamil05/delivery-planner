package com.aya.delivery_planner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.aya.delivery_planner.model.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {
}