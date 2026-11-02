package com.devspectrabackend.service;

import com.devspectrabackend.model.Testimonial;
import java.util.List;
import java.util.Optional;

public interface TestimonialService {
    List<Testimonial> getAllTestimonials();
    Optional<Testimonial> getTestimonialById(Long id);
    Testimonial createTestimonial(Testimonial testimonial);
    Testimonial updateTestimonial(Long id, Testimonial testimonialDetails);
    void deleteTestimonial(Long id);
}