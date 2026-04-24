package com.example.smart_erp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.smart_erp.auth.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {
}
