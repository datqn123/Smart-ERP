package com.example.smart_erp.auth.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {

	boolean existsByUsername(String username);

	boolean existsByEmailIgnoreCase(String email);

	@Query("select count(u) from User u where lower(u.email) = lower(:email) and u.status = 'Active'")
	long countActiveByEmailIgnoreCase(@Param("email") String email);

	@EntityGraph(attributePaths = "role")
	@Query("select u from User u where lower(u.email) = lower(:email) and u.status = 'Active'")
	Optional<User> findActiveByEmailIgnoreCase(@Param("email") String email);

	@EntityGraph(attributePaths = "role")
	@Query("select u from User u where u.id = :id and u.status = 'Active'")
	Optional<User> findActiveById(@Param("id") Integer id);

	@Modifying
	@Query("update User u set u.status = 'Locked' where u.id = :id and u.status = 'Active'")
	int lockActiveUserById(@Param("id") Integer id);

	@EntityGraph(attributePaths = "role")
	@Query("select u from User u where u.id = :id")
	Optional<User> findWithRoleById(@Param("id") Integer id);
}
