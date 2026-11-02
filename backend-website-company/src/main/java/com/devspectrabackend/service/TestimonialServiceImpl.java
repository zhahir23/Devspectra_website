package com.devspectrabackend.service;

import com.devspectrabackend.model.Testimonial;
import com.devspectrabackend.repository.TestimonialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestimonialServiceImpl implements TestimonialService {

    @Autowired
    private TestimonialRepository testimonialRepository;

    @Override
    public List<Testimonial> getAllTestimonials() {
        return testimonialRepository.findAll();
    }

    @Override
    public Optional<Testimonial> getTestimonialById(Long id) {
        return testimonialRepository.findById(id);
    }

    @Override
    public Testimonial createTestimonial(Testimonial testimonial) {
        return testimonialRepository.save(testimonial);
    }

    @Override
    public Testimonial updateTestimonial(Long id, Testimonial testimonialDetails) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testimoni dengan ID " + id + " tidak ditemukan"));

        testimonial.setClientName(testimonialDetails.getClientName());
        testimonial.setCompany(testimonialDetails.getCompany());
        testimonial.setContent(testimonialDetails.getContent());
        testimonial.setRating(testimonialDetails.getRating());
        testimonial.setIsActive(testimonialDetails.getIsActive());

        return testimonialRepository.save(testimonial);
    }

    @Override
    public void deleteTestimonial(Long id) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testimoni dengan ID " + id + " tidak ditemukan"));
        testimonialRepository.delete(testimonial);
    }
}