package com.devspectrabackend.service;

import com.devspectrabackend.model.ServiceItem;
import java.util.List;
import java.util.Optional;

public interface ServiceItemService {
    List<ServiceItem> getAllServices();
    Optional<ServiceItem> getServiceById(Long id);
    ServiceItem createService(ServiceItem serviceItem);
    ServiceItem updateService(Long id, ServiceItem serviceDetails);
    void deleteService(Long id);
}