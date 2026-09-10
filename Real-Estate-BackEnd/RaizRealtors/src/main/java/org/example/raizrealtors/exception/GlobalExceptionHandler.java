package org.example.raizrealtors.exception;



import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(
            RuntimeException ex) {

        HttpStatus status =
                ex.getMessage() != null &&
                        ex.getMessage()
                                .toLowerCase()
                                .contains("already booked")
                        ? HttpStatus.CONFLICT
                        : HttpStatus.BAD_REQUEST;

        return ResponseEntity
                .status(status)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "error",
                        "Invalid request data"
                ));
    }
}