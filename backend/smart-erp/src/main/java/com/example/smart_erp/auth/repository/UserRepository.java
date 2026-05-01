package com.example.smart_erp.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.smart_erp.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

	boolean existsByUsername(String username);

	boolean existsByEmailIgnoreCase(String email);

	@Query("select count(u) from User u where lower(u.email) = lower(:email) and u.status = 'Active'")
	long countActiveByEmailIgnoreCase(@Param("email") String email);

	@EntityGraph(attributePaths = "role")
	@Query("select u from User u where lower(u.email) = lower(:email)")
	Optional<User> findByEmailIgnoreCase(@Param("email") String email);

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

	/** Task078_02 — prefix ví dụ {@code NV-MAN-}; tham số truyền {@code NV-MAN-} để khớp LIKE. */
	@Query("select u.staffCode from User u where u.staffCode is not null and u.staffCode like concat(:prefix, '%')")
	List<String> findStaffCodesLikePrefix(@Param("prefix") String prefix);
}
