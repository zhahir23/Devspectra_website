package com.devspectrabackend.service;

import com.devspectrabackend.model.ServiceItem;
import com.devspectrabackend.repository.ServiceItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceItemServiceImpl implements ServiceItemService {

    @Autowired
    private ServiceItemRepository serviceItemRepository;

    @Override
    public List<ServiceItem> getAllServices() {
        return serviceItemRepository.findAll();
    }

    @Override
    public Optional<ServiceItem> getServiceById(Long id) {
        return serviceItemRepository.findById(id);
    }

    @Override
    public ServiceItem createService(ServiceItem serviceItem) {
        return serviceItemRepository.save(serviceItem);
    }

    @Override
    public ServiceItem updateService(Long id, ServiceItem serviceDetails) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        String val = serviceDetails.getTitle() != null ? serviceDetails.getTitle() : serviceDetails.getName();
        item.setTitle(val);
        item.setName(val);
        if (serviceDetails.getSlug() != null) {
            item.setSlug(serviceDetails.getSlug());
        }
        item.setDescription(serviceDetails.getDescription());
        item.setIcon(serviceDetails.getIcon());
        item.setIconClass(serviceDetails.getIconClass());
        if (serviceDetails.getIsActive() != null) {
            item.setIsActive(serviceDetails.getIsActive());
        }
        return serviceItemRepository.save(item);
    }

    @Override
    public void deleteService(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        serviceItemRepository.delete(item);
    }
}