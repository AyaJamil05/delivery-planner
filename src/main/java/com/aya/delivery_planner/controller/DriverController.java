package com.aya.delivery_planner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.aya.delivery_planner.model.Driver;
import com.aya.delivery_planner.service.DriverService;

@RestController
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/api/drivers")
    public List<Driver> getDrivers() {
        return driverService.getAllDrivers();
    }

    @PostMapping("/api/drivers")
    public Driver createDriver(@RequestBody Driver driver) {
        return driverService.addDriver(driver);
    }
}