package com.devspectrabackend.controller;

import com.devspectrabackend.model.ServiceItem;
import com.devspectrabackend.service.ServiceItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceItemService serviceItemService;

    @GetMapping
    public List<ServiceItem> getAllServices() {
        return serviceItemService.getAllServices();
    }

    @PostMapping
    public ServiceItem createService(@RequestBody ServiceItem serviceItem) {
        return serviceItemService.createService(serviceItem);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItem> getServiceById(@PathVariable Long id) {
        ServiceItem serviceItem = serviceItemService.getServiceById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        return ResponseEntity.ok(serviceItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItem> updateService(@PathVariable Long id, @RequestBody ServiceItem details) {
        return ResponseEntity.ok(serviceItemService.updateService(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id) {
        serviceItemService.deleteService(id);
        return ResponseEntity.ok("Service successfully deleted!");
    }
}