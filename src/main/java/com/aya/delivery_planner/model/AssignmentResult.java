package com.aya.delivery_planner.model;

public class AssignmentResult {

    private Delivery delivery;
    private Driver driver;
    private double distance;
    private long driverLoad;

    public AssignmentResult(Delivery delivery, Driver driver, double distance, long driverLoad) {
        this.delivery = delivery;
        this.driver = driver;
        this.distance = distance;
        this.driverLoad = driverLoad;
    }

    public Delivery getDelivery() {
        return delivery;
    }

    public Driver getDriver() {
        return driver;
    }

    public double getDistance() {
        return distance;
    }

    public long getDriverLoad() {
        return driverLoad;
    }
}