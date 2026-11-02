package com.devspectrabackend.support;

import com.devspectrabackend.model.Project;
import com.devspectrabackend.model.Setting;
import com.devspectrabackend.model.TeamMember;
import com.devspectrabackend.repository.ProjectRepository;
import com.devspectrabackend.repository.SettingRepository;
import com.devspectrabackend.repository.TeamMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

/**
 * Isi awal tabel website_projects dan website_team_members dengan data yang sebelumnya tertulis di kode website
 * (sekarang menjadi daftar cadangan di data/projects.ts dan data/team.ts), supaya setelah fitur ini dipasang semuanya langsung
 * bisa diedit dari dashboard dan tidak ada yang hilang dari website.
 *
 * Hanya berjalan sekali per tabel. Tandanya disimpan di tabel settings (isi_awal_projects,
 * isi_awal_team_members), jadi project atau anggota yang sengaja dihapus tidak muncul lagi
 * saat backend dinyalakan ulang.
 */
@Component
public class WebsiteContentSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(WebsiteContentSeeder.class);

    static final String PROJECTS_KEY = "isi_awal_projects";
    static final String TEAM_KEY = "isi_awal_team_members";

    private static final String CANVA_URL = "https://canva.link/bn3xmd31bc6rlxe";

    private record SeedProject(String title, String description, String imageUrl, String status, String tags) {
    }

    private record SeedMember(String name, String role, String initials, String email, String division,
                              boolean showOnHome, boolean showInDivision, boolean showInContact) {
    }

    // Kategori semua project awal: IT. "—" = tanda pisah panjang
    private static final List<SeedProject> PROJECTS = List.of(
            new SeedProject("Pemesanan Tiket Bus Online",
                    "Design aplikasi Mobile pemesanan tiket bus pada tugas Akhir kampus.",
                    "/projects/tiket-bus.png", "archived", "UI/UX, Mobile, Figma"),
            new SeedProject("BRAKA",
                    "Design aplikasi Mobile pemesanan tiket bus (BRAKA) pada tugas Akhir kampus.",
                    "/projects/braka.png", "archived", "UI/UX, Mobile, Figma"),
            new SeedProject("Xayara Indonesia",
                    "Sistem fitur website layanan jasa servis AC — instalasi, perawatan, dan perbaikan berbagai AC Split, Cassette, Window, dan lainnya.",
                    "/projects/xayara.png", "active", "Web Developer, Next.js, Full Stack"),
            new SeedProject("Stok Produk UMKM",
                    "Website UMKM stock barang — request dari mahasiswa Sistem Informasi Universitas Komputer Indonesia.",
                    "/projects/stok-umkm.png", "archived", "Web Developer, UNIKOM, Laravel"),
            new SeedProject("Myanature",
                    "Website pengelola limbah rumah tangga — membantu masyarakat dalam mengelola dan mendaur ulang limbah secara mandiri.",
                    "/projects/myanature.png", "active", "Web Developer, Lingkungan, UMKM"),
            new SeedProject("Website Promosi UMKM",
                    "Website UMKM untuk membantu mempromosikan produk dan jualannya.",
                    "/projects/indihome-umkm.png", "active", "Client UMKM, Web Developer, Promosi"),
            new SeedProject("SIPKA",
                    "Sistem pelaporan kepolisian atasan dan anggota dari Kepolisian Jawa Tengah.",
                    "/projects/sipka.png", "active", "Android Developer, Mobile, Kepolisian"));

    private static final List<SeedMember> TEAM = List.of(
            new SeedMember("Karol Efrido Sanggam Purba", "Founder of Devspectra & Head Devspectra Bandung", "KE",
                    "karol@devspectra.com", "IT", true, false, false),
            new SeedMember("Zhahir Furqon", "Manajer & Head Devspectra Jakarta", "ZF",
                    "zhahir@devspectra.com", "IT", true, false, true),
            new SeedMember("Cintya Silvana", "Secretary Devspectra & Developer", "CS",
                    "cintya@devspectra.com", "IT", true, false, true),
            new SeedMember("Bagus Wibowo", "Developer of Devspectra", "BW",
                    "bagus@devspectra.com", "IT", true, true, true),
            new SeedMember("Adrian Ferdiansyah", "Pilot Drone & Head of Media Division", "AF",
                    "adrian@devspectra.com", "Media", true, true, true),
            new SeedMember("Rafi Ar-Rusy", "Media Member & Editor Section of Devspectra", "RA",
                    "rafi@devspectra.com", "Media", true, true, true),
            new SeedMember("Rasya", "Media Member & Design Section of Devspectra", "RS",
                    "rasya@devspectra.com", "Media", true, true, true),
            new SeedMember("Alfin Dwi Wadani", "Developer of Devspectra", "AD",
                    "alfin@devspectra.com", "IT", true, true, true),
            new SeedMember("Ahmad Afriadi Rahman", "DevOps of Devspectra", "AA",
                    "ahmad@devspectra.com", "IT", true, true, true),
            new SeedMember("Cahya Nabil", "Head of Marketing at Devspectra", "CN",
                    "cahya@devspectra.com", "Marketing", true, true, true));

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Override
    public void run(String... args) {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        // Kalau gagal (misalnya database sedang sibuk), backend tetap menyala dan dicoba lagi saat dinyalakan ulang
        try {
            transaction.executeWithoutResult(status -> seedProjects());
        } catch (RuntimeException e) {
            log.warn("Isi awal Projects dilewati, dicoba lagi saat backend dinyalakan ulang: {}", e.getMessage());
        }
        try {
            transaction.executeWithoutResult(status -> seedTeamMembers());
        } catch (RuntimeException e) {
            log.warn("Isi awal Divisi dilewati, dicoba lagi saat backend dinyalakan ulang: {}", e.getMessage());
        }
    }

    private void seedProjects() {
        if (settingRepository.findBySettingKey(PROJECTS_KEY).isPresent()) return;
        if (projectRepository.count() == 0) {
            int order = 1;
            for (SeedProject seed : PROJECTS) {
                Project project = new Project();
                project.setTitle(seed.title());
                project.setDescription(seed.description());
                project.setCategory("IT");
                project.setStatus(seed.status());
                project.setTags(seed.tags());
                project.setImageUrl(seed.imageUrl());
                project.setCanvaUrl(CANVA_URL);
                project.setSortOrder(order++);
                project.setIsActive(true);
                projectRepository.save(project);
            }
            log.info("Isi awal: {} project dari website dimasukkan ke tabel website_projects.", PROJECTS.size());
        }
        markDone(PROJECTS_KEY);
    }

    private void seedTeamMembers() {
        if (settingRepository.findBySettingKey(TEAM_KEY).isPresent()) return;
        if (teamMemberRepository.count() == 0) {
            int order = 1;
            for (SeedMember seed : TEAM) {
                TeamMember member = new TeamMember();
                member.setName(seed.name());
                member.setRole(seed.role());
                member.setInitials(seed.initials());
                member.setEmail(seed.email());
                member.setDivision(seed.division());
                member.setShowOnHome(seed.showOnHome());
                member.setShowInDivision(seed.showInDivision());
                member.setShowInContact(seed.showInContact());
                member.setSortOrder(order++);
                teamMemberRepository.save(member);
            }
            log.info("Isi awal: {} anggota tim dari website dimasukkan ke tabel website_team_members.", TEAM.size());
        }
        markDone(TEAM_KEY);
    }

    private void markDone(String key) {
        Setting setting = new Setting();
        setting.setSettingKey(key);
        setting.setSettingValue("Sudah diisi dari data website pada " + JakartaTime.today()
                + ". Jangan dihapus: kalau baris ini dihapus dan tabelnya kosong, data awal dimasukkan lagi.");
        settingRepository.save(setting);
    }
}
