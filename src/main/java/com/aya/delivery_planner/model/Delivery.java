package com.aya.delivery_planner.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String client;
    private String address;
    private Double latitude;
    private Double longitude;
    private String status = "PENDING";

    @ManyToOne
    private Driver driver;

    public Delivery() {
    }

    public Delivery(Long id, String client, String address, Driver driver) {
        this.id = id;
        this.client = client;
        this.address = address;
        this.driver = driver;
    }

    public Delivery(String client, String address) {
        this.client = client;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public String getClient() {
        return client;
    }

    public String getAddress() {
        return address;
    }

    public Driver getDriver() {
        return driver;
    }
    
    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}