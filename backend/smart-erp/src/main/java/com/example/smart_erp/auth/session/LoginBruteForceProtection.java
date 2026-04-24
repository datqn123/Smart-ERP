package com.example.smart_erp.auth.session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_erp.auth.persistence.UserRepository;

/**
 * Sau {@value #MAX_FAILURES} lần mật khẩu sai liên tiếp cho cùng một user Active → {@code status = Locked}.
 */
@Component
public class LoginBruteForceProtection {

	static final int MAX_FAILURES = 5;

	private final Map<Integer, AtomicInteger> failuresByUserId = new ConcurrentHashMap<>();

	public void onSuccess(Integer userId) {
		failuresByUserId.remove(userId);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void onFailure(Integer userId, UserRepository userRepository) {
		int n = failuresByUserId.computeIfAbsent(userId, k -> new AtomicInteger(0)).incrementAndGet();
		if (n >= MAX_FAILURES) {
			userRepository.lockActiveUserById(userId);
			failuresByUserId.remove(userId);
		}
	}
}
