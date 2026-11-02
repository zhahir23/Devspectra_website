package com.devspectrabackend.repository;

import com.devspectrabackend.model.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    // Status pembayaran QRIS (OrderService): pesan terbaru dengan ID pesanan ini
    List<Inquiry> findByOrderIdOrderByIdDesc(String orderId);

    // Pesan lama yang ID pesanannya baru tertulis di isi pesan (diisi OrderService saat backend menyala)
    List<Inquiry> findByOrderIdIsNull();

    // Pesan yang pembayarannya tercatat sebagai pemasukan ini (IncomeService, saat pemasukan dihapus)
    List<Inquiry> findByIncomeId(Long incomeId);
}
