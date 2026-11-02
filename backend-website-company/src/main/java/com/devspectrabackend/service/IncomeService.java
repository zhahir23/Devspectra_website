package com.devspectrabackend.service;

import com.devspectrabackend.model.Income;
import com.devspectrabackend.model.Inquiry;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.IncomeRepository;
import com.devspectrabackend.repository.InquiryRepository;
import com.devspectrabackend.repository.UserRepository;
import com.devspectrabackend.support.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Pemasukan keuangan. Setiap method memeriksa akses keuangan lebih dulu.
 * Pemasukan dari pembayaran QRIS dibuat oleh OrderService (konfirmasi di Klien masuk) dan punya orderId.
 */
@Service
public class IncomeService {

    private static final Set<String> CATEGORIES = Set.of("PROYEK", "PERAWATAN", "LAINNYA");

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private FinanceAccess financeAccess;

    @Autowired
    private InquiryRepository inquiryRepository;

    /** Body dari dashboard: { receivedOn, description, clientName, category, amount } */
    public record IncomeRequest(LocalDate receivedOn, String description, String clientName,
                                String category, Long amount) {
    }

    /** Yang dikirim ke dashboard, termasuk nama pencatatnya. orderId terisi untuk pemasukan dari pembayaran QRIS. */
    public record IncomeResponse(Long id, LocalDate receivedOn, String description, String clientName,
                                 String category, Long amount, Long recordedBy, String recordedByName,
                                 String orderId) {
    }

    // Satu transaksi untuk semua query di sini (akun yang login, nama pencatat, daftar pemasukan)
    @Transactional(readOnly = true)
    public List<IncomeResponse> list() {
        requireFinanceAccess();
        Map<Long, String> names = userNames();
        return incomeRepository.findAllByOrderByReceivedOnDescIdDesc().stream()
                .map(income -> toResponse(income, names))
                .toList();
    }

    public IncomeResponse create(IncomeRequest request) {
        User me = requireFinanceAccess();
        Income income = new Income();
        apply(income, request);
        income.setRecordedBy(me.getId());
        return toResponse(incomeRepository.save(income), userNames());
    }

    public IncomeResponse update(Long id, IncomeRequest request) {
        requireFinanceAccess();
        Income income = findOrThrow(id);
        apply(income, request);
        return toResponse(incomeRepository.save(income), userNames());
    }

    /**
     * Kalau pemasukan ini berasal dari konfirmasi pembayaran QRIS, pesanannya kembali "belum dibayar"
     * (QRIS tampil lagi untuk klien, dan pembayarannya bisa dikonfirmasi ulang di Klien masuk).
     */
    @Transactional
    public void delete(Long id) {
        requireFinanceAccess();
        Income income = findOrThrow(id);
        for (Inquiry inquiry : inquiryRepository.findByIncomeId(income.getId())) {
            inquiry.setPaidAt(null);
            inquiry.setIncomeId(null);
            inquiryRepository.save(inquiry);
        }
        incomeRepository.delete(income);
    }

    private User requireFinanceAccess() {
        User me = currentUserService.require();
        financeAccess.require(me);
        return me;
    }

    private Income findOrThrow(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Data pemasukan tidak ditemukan."));
    }

    private Map<Long, String> userNames() {
        Map<Long, String> names = new HashMap<>();
        for (User user : userRepository.findAll()) {
            names.put(user.getId(), user.getName());
        }
        return names;
    }

    private static IncomeResponse toResponse(Income income, Map<Long, String> names) {
        return new IncomeResponse(income.getId(), income.getReceivedOn(), income.getDescription(),
                income.getClientName(), income.getCategory(), income.getAmount(), income.getRecordedBy(),
                income.getRecordedBy() == null ? null : names.get(income.getRecordedBy()), income.getOrderId());
    }

    private static void apply(Income income, IncomeRequest request) {
        if (request == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data pemasukan kosong.");
        }
        if (request.receivedOn() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tanggal diterima wajib diisi.");
        }
        String description = request.description() == null ? "" : request.description().trim();
        if (description.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Keterangan wajib diisi.");
        }
        if (description.length() > 200) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Keterangan maksimal 200 karakter.");
        }
        String clientName = request.clientName() == null || request.clientName().isBlank()
                ? null
                : request.clientName().trim();
        if (clientName != null && clientName.length() > 150) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nama klien maksimal 150 karakter.");
        }
        String category = request.category() == null || request.category().isBlank()
                ? "PROYEK"
                : request.category().trim().toUpperCase();
        if (!CATEGORIES.contains(category)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Kategori harus PROYEK, PERAWATAN, atau LAINNYA.");
        }
        if (request.amount() == null || request.amount() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Jumlah harus lebih dari 0.");
        }
        income.setReceivedOn(request.receivedOn());
        income.setDescription(description);
        income.setClientName(clientName);
        income.setCategory(category);
        income.setAmount(request.amount());
    }
}
