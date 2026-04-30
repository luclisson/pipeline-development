package de.webshop.asta.mvp.features.cart.repository;

import de.webshop.asta.mvp.features.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart,Long> {
    @Query("""
            select c from Cart c inner join Session s on c.sessionId = s.sessionId
            where s.analytics_id = :analyticsId
            """)
    List<Cart> findCartByAnalyticsId(@Param("analyticsId") UUID analyticsId);
}
