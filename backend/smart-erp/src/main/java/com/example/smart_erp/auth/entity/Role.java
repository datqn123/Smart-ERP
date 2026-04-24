package com.example.smart_erp.auth.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Role {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, length = 50)
	private String name;

	/**
	 * JSON quyền (seed Flyway, cột PostgreSQL {@code JSONB}). Phải map {@link SqlTypes#JSON} để
	 * {@code spring.jpa.hibernate.ddl-auto=validate} khớp DB — không dùng {@code String} thuần (mặc định VARCHAR).
	 */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "permissions", nullable = false)
	private String permissions = "{}";

	public Integer getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getPermissions() {
		return permissions;
	}
}
