package com.devspectrabackend.service;

import com.devspectrabackend.model.Income;
import com.devspectrabackend.model.Inquiry;
import com.devspectrabackend.model.User;
import com.devspectrabackend.repository.IncomeRepository;
import com.devspectrabackend.repository.InquiryRepository;
import com.devspectrabackend.support.ApiException;
import com.devspectrabackend.support.InputRules;
import com.devspectrabackend.support.JakartaTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Status pembayaran QRIS untuk pesanan dari formulir kontak website.
 *
 * 1. Website membuat ID pesanan (DSP-XXXXXXXX) dan mengirimnya bersama formulir kontak (field orderId).
 * 2. Setelah proyek selesai, tim menandainya di dashboard (Klien masuk) sambil mengisi tagihan:
 *    PUT /api/inquiries/{id}/project.
 * 3. Klien mengecek di halaman Contact website: GET /api/orders/{orderId}. Kalau sudah selesai, QRIS dan
 *    tagihannya tampil.
 * 4. QRIS-nya statis, jadi backend tidak tahu kapan klien membayar. Setelah uang masuk di aplikasi GoPay Merchant,
 *    pemegang keuangan mengonfirmasi di dashboard: PUT /api/inquiries/{id}/payment. Pemasukan tercatat otomatis
 *    di Keuangan, dan klien yang mengecek lagi melihat bahwa pembayarannya sudah diterima.
 *
 * Statusnya disimpan di database, jadi klien bisa mengecek dari perangkat mana pun.
 */
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private static final Pattern ORDER_ID = Pattern.compile("^DSP-[A-Z0-9]{8}$");
    // Pesan dari website mencantumkan "ID Pesanan: DSP-..." di bagian bawah isi pesan
    private static final Pattern IN_MESSAGE = Pattern.compile("ID Pesanan:\\s*(DSP-[A-Z0-9]{8})");

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private FinanceAccess financeAccess;

    /** Tagihan dan jumlah pembayaran paling besar (13 digit, sama dengan batas di dashboard). */
    public static final long MAX_AMOUNT = 9_999_999_999_999L;

    /**
     * Yang dilihat klien: status ("pending", "completed", atau "paid") dan tagihan, tanpa nama, email,
     * atau isi pesan. Tagihan hanya dikirim setelah proyek ditandai selesai.
     */
    public record OrderStatus(String orderId, String status, LocalDateTime completedAt, Long billAmount,
                              LocalDateTime paidAt) {
    }

    /** Body PUT /api/inquiries/{id}/project: { "completed": true, "billAmount": 2500000 } */
    public record ProjectRequest(Boolean completed, Long billAmount) {
    }

    /** Body PUT /api/inquiries/{id}/payment: { "paid": true, "amount": 2500000, "receivedOn": "2026-10-31" } */
    public record PaymentRequest(Boolean paid, Long amount, LocalDate receivedOn) {
    }

    /** " dsp-blm5xpqo " -> "DSP-BLM5XPQO". Format lain -> null. */
    public static String normalize(String orderId) {
        if (orderId == null) return null;
        String id = orderId.trim().toUpperCase(Locale.ROOT);
        return ORDER_ID.matcher(id).matches() ? id : null;
    }

    /** ID pesanan yang tertulis di isi pesan ("ID Pesanan: DSP-..."), atau null. */
    public static String fromMessage(String message) {
        if (message == null) return null;
        Matcher m = IN_MESSAGE.matcher(message);
        return m.find() ? m.group(1) : null;
    }

    /** ID pesanan untuk pesan baru dari formulir kontak: field orderId, atau yang tertulis di isi pesan. */
    public static String orderIdFor(Inquiry inquiry) {
        String id = normalize(inquiry.getOrderId());
        return id != null ? id : fromMessage(inquiry.getMessage());
    }

    @Transactional(readOnly = true)
    public Optional<OrderStatus> status(String orderId) {
        String id = normalize(orderId);
        if (id == null) return Optional.empty();
        List<Inquiry> found = inquiryRepository.findByOrderIdOrderByIdDesc(id);
        if (found.isEmpty()) return Optional.empty();
        // Kalau ada lebih dari satu pesan dengan ID yang sama (jarang), yang sudah dibayar didahulukan,
        // lalu yang sudah selesai, lalu yang terbaru
        Inquiry inquiry = found.stream().min(Comparator.comparingInt(OrderService::progressRank)).orElse(found.get(0));
        return Optional.of(statusOf(id, inquiry));
    }

    /** Status untuk klien dari satu pesan. Tagihan baru terlihat setelah proyek ditandai selesai. */
    public static OrderStatus statusOf(String orderId, Inquiry inquiry) {
        LocalDateTime completedAt = inquiry.getProjectCompletedAt();
        LocalDateTime paidAt = inquiry.getPaidAt();
        String status = paidAt != null ? "paid" : completedAt != null ? "completed" : "pending";
        Long bill = "pending".equals(status) ? null : inquiry.getBillAmount();
        return new OrderStatus(orderId, status, completedAt, bill, paidAt);
    }

    private static int progressRank(Inquiry inquiry) {
        if (inquiry.getPaidAt() != null) return 0;
        return inquiry.getProjectCompletedAt() != null ? 1 : 2;
    }

    /**
     * Dashboard (Klien masuk): tandai proyek selesai sambil mengisi tagihan (juga untuk mengubah tagihan),
     * atau batalkan tandanya. Semua anggota yang login boleh.
     */
    @Transactional
    public Inquiry setProjectCompleted(Long inquiryId, ProjectRequest request) {
        currentUserService.require();
        Inquiry inquiry = findInquiry(inquiryId);
        if (inquiry.getOrderId() == null) {
            inquiry.setOrderId(fromMessage(inquiry.getMessage()));
        }
        if (inquiry.getOrderId() == null) {
            throw InputRules.bad("Pesan ini tidak punya ID pesanan (DSP-...), jadi QRIS tidak bisa ditampilkan untuk klien.");
        }
        if (inquiry.getPaidAt() != null) {
            throw InputRules.bad("Pembayaran pesanan ini sudah tercatat, jadi tagihan dan status proyeknya tidak bisa diubah. "
                    + "Pemegang keuangan bisa membatalkan pembayarannya dulu.");
        }
        boolean completed = request != null && Boolean.TRUE.equals(request.completed());
        if (!completed) {
            inquiry.setProjectCompletedAt(null);
            return inquiryRepository.save(inquiry);
        }
        inquiry.setBillAmount(checkAmount(request.billAmount(), "Isi tagihan proyek dulu (dalam rupiah).", "Tagihan"));
        if (inquiry.getProjectCompletedAt() == null) {
            inquiry.setProjectCompletedAt(JakartaTime.now());
        }
        return inquiryRepository.save(inquiry);
    }

    /**
     * Pemegang keuangan mengonfirmasi pembayaran QRIS setelah uang masuk di GoPay Merchant.
     * Pemasukan tercatat otomatis di Keuangan (nama klien, ID pesanan, jumlah, tanggal).
     * paid=false membatalkannya, dan pemasukan yang tadi tercatat ikut dihapus.
     */
    @Transactional
    public Inquiry setPayment(Long inquiryId, PaymentRequest request) {
        User me = currentUserService.require();
        financeAccess.require(me);
        Inquiry inquiry = findInquiry(inquiryId);
        boolean paid = request != null && Boolean.TRUE.equals(request.paid());
        if (!paid) {
            if (inquiry.getIncomeId() != null) {
                incomeRepository.findById(inquiry.getIncomeId()).ifPresent(incomeRepository::delete);
            }
            inquiry.setPaidAt(null);
            inquiry.setIncomeId(null);
            return inquiryRepository.save(inquiry);
        }
        if (inquiry.getPaidAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Pembayaran pesanan ini sudah tercatat di Keuangan.");
        }
        if (inquiry.getProjectCompletedAt() == null) {
            throw InputRules.bad("Tandai proyek selesai dulu (sekaligus mengisi tagihan), baru catat pembayarannya.");
        }
        Long amount = checkAmount(request.amount() != null ? request.amount() : inquiry.getBillAmount(),
                "Isi jumlah yang diterima (dalam rupiah).", "Jumlah");
        LocalDate receivedOn = request.receivedOn() != null ? request.receivedOn() : JakartaTime.today();
        if (receivedOn.isAfter(JakartaTime.today())) {
            throw InputRules.bad("Tanggal diterima tidak boleh setelah hari ini.");
        }

        Income income = new Income();
        income.setReceivedOn(receivedOn);
        income.setDescription(paymentDescription(inquiry));
        income.setClientName(clip(InputRules.clean(inquiry.getName()), 150));
        income.setCategory("PROYEK");
        income.setAmount(amount);
        income.setRecordedBy(me.getId());
        income.setOrderId(inquiry.getOrderId());
        income = incomeRepository.save(income);

        inquiry.setPaidAt(JakartaTime.now());
        inquiry.setIncomeId(income.getId());
        return inquiryRepository.save(inquiry);
    }

    /** Keterangan pemasukan: "Pembayaran QRIS DSP-XXXXXXXX: <subjek pesan>" (maksimal 200 karakter). */
    public static String paymentDescription(Inquiry inquiry) {
        String text = "Pembayaran QRIS" + (inquiry.getOrderId() != null ? " " + inquiry.getOrderId() : "");
        String subject = InputRules.clean(inquiry.getSubject());
        return clip(subject != null ? text + ": " + subject : text, 200);
    }

    /** Jumlah rupiah lebih dari 0 dan paling banyak 13 digit. */
    public static Long checkAmount(Long amount, String emptyMessage, String label) {
        if (amount == null) throw InputRules.bad(emptyMessage);
        if (amount <= 0) throw InputRules.bad(label + " harus lebih dari 0.");
        if (amount > MAX_AMOUNT) throw InputRules.bad(label + " terlalu besar. Periksa lagi angkanya.");
        return amount;
    }

    private static String clip(String text, int max) {
        if (text == null) return null;
        return text.length() <= max ? text : text.substring(0, max);
    }

    private Inquiry findInquiry(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Pesan inquiry dengan ID " + inquiryId + " tidak ditemukan"));
    }

    /**
     * Pesan yang masuk sebelum fitur ini dipasang belum punya kolom order_id, padahal ID-nya tertulis
     * di isi pesan. Diisi sekali saat backend menyala, supaya klien lama juga bisa mengecek status.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void fillOrderIdsFromMessages() {
        try {
            int filled = 0;
            for (Inquiry inquiry : inquiryRepository.findByOrderIdIsNull()) {
                String id = fromMessage(inquiry.getMessage());
                if (id != null) {
                    inquiry.setOrderId(id);
                    inquiryRepository.save(inquiry);
                    filled++;
                }
            }
            if (filled > 0) {
                log.info("ID pesanan diisi dari isi pesan untuk {} pesan lama.", filled);
            }
        } catch (RuntimeException e) {
            log.warn("ID pesanan untuk pesan lama belum bisa diisi: {}", e.getMessage());
        }
    }
}
