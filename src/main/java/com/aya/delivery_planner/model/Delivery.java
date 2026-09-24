package com.aya.delivery_planner.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String client;
    private String address;

    public Delivery() {
    }

    public Delivery(Long id, String client, String address) {
        this.id = id;
        this.client = client;
        this.address = address;
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

    public void setClient(String client) {
        this.client = client;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}