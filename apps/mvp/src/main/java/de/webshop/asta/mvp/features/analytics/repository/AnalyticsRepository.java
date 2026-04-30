package de.webshop.asta.mvp.features.analytics.repository;

import de.webshop.asta.mvp.features.analytics.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalyticsRepository extends JpaRepository<Session,Long> {
    Optional<Session> findSessionBySessionId(Long id);
}
