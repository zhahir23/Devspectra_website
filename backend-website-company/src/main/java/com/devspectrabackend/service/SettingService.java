package com.devspectrabackend.service;

import com.devspectrabackend.model.Setting;
import java.util.List;
import java.util.Optional;

public interface SettingService {
    List<Setting> getAllSettings();
    Optional<Setting> getSettingById(Long id);
    Setting createSetting(Setting setting);
    Setting updateSetting(Long id, Setting settingDetails);
    void deleteSetting(Long id);
}