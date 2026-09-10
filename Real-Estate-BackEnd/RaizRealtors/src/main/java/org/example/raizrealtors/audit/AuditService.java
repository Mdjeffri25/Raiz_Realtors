package org.example.raizrealtors.audit;



import org.example.raizrealtors.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;

    public void log(
            User user,
            String action,
            String entity,
            Long entityId,
            String details) {

        repository.save(
                AuditLog.builder()
                        .user(user)
                        .action(action)
                        .entity(entity)
                        .entityId(entityId)
                        .details(details)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
