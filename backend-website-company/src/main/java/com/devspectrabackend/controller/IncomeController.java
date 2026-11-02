package com.devspectrabackend.controller;

import com.devspectrabackend.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Pemasukan keuangan (butuh JWT). Anggota di luar FINANCE_EMAILS mendapat 403. */
@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @GetMapping
    public List<IncomeService.IncomeResponse> list() {
        return incomeService.list();
    }

    @PostMapping
    public IncomeService.IncomeResponse create(@RequestBody IncomeService.IncomeRequest request) {
        return incomeService.create(request);
    }

    @PutMapping("/{id}")
    public IncomeService.IncomeResponse update(@PathVariable Long id, @RequestBody IncomeService.IncomeRequest request) {
        return incomeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        incomeService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Data pemasukan berhasil dihapus."));
    }
}
