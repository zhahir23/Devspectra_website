package com.devspectrabackend.controller;

import com.devspectrabackend.model.Setting;
import com.devspectrabackend.service.SettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
public class SettingController {

    @Autowired
    private SettingService settingService;

    @GetMapping
    public List<Setting> getAllSettings() {
        return settingService.getAllSettings();
    }

    @PostMapping
    public Setting createSetting(@RequestBody Setting setting) {
        return settingService.createSetting(setting);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Setting> getSettingById(@PathVariable Long id) {
        Setting setting = settingService.getSettingById(id)
                .orElseThrow(() -> new RuntimeException("Setting not found with id: " + id));
        return ResponseEntity.ok(setting);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Setting> updateSetting(@PathVariable Long id, @RequestBody Setting details) {
        return ResponseEntity.ok(settingService.updateSetting(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSetting(@PathVariable Long id) {
        settingService.deleteSetting(id);
        return ResponseEntity.ok("Setting successfully deleted!");
    }
}