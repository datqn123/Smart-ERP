package com.example.smart_erp.auth.persistence;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

	@Query("SELECT r FROM RefreshToken r WHERE r.token = :tok AND r.deleteYmd IS NULL AND r.expiresAt > :now")
	Optional<RefreshToken> findValidByToken(@Param("tok") String token, @Param("now") Instant now);

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("UPDATE RefreshToken r SET r.deleteYmd = :ts WHERE r.userId = :uid AND r.token = :tok AND r.deleteYmd IS NULL")
	int softRevoke(@Param("uid") Integer userId, @Param("tok") String token, @Param("ts") Instant ts);
}
