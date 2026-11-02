package com.devspectrabackend.support;

import org.springframework.http.HttpStatus;

/**
 * Kesalahan yang pesannya aman ditampilkan ke pengguna dashboard.
 * ApiExceptionHandler mengubahnya menjadi respons {"error": "..."} dengan status yang sesuai.
 */
public class ApiException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
