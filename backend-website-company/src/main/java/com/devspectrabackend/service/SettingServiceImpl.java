package com.devspectrabackend.service;

import com.devspectrabackend.model.Setting;
import com.devspectrabackend.repository.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SettingServiceImpl implements SettingService {

    @Autowired
    private SettingRepository settingRepository;

    @Override
    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    @Override
    public Optional<Setting> getSettingById(Long id) {
        return settingRepository.findById(id);
    }

    @Override
    public Setting createSetting(Setting setting) {
        return settingRepository.save(setting);
    }

    @Override
    public Setting updateSetting(Long id, Setting settingDetails) {
        Setting setting = settingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Setting not found with id: " + id));
        setting.setSettingKey(settingDetails.getSettingKey());
        setting.setSettingValue(settingDetails.getSettingValue());
        return settingRepository.save(setting);
    }

    @Override
    public void deleteSetting(Long id) {
        Setting setting = settingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Setting not found with id: " + id));
        settingRepository.delete(setting);
    }
}