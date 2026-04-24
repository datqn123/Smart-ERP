package com.example.smart_erp.auth.persistence;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("UPDATE RefreshToken r SET r.deleteYmd = :ts WHERE r.userId = :uid AND r.token = :tok AND r.deleteYmd IS NULL")
	int softRevoke(@Param("uid") Integer userId, @Param("tok") String token, @Param("ts") Instant ts);
}
