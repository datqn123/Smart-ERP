package com.example.smart_erp.users.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.smart_erp.auth.entity.Role;
import com.example.smart_erp.auth.entity.User;
import com.example.smart_erp.auth.repository.RoleRepository;
import com.example.smart_erp.auth.repository.UserRepository;
import com.example.smart_erp.auth.support.RolePermissionReader;
import com.example.smart_erp.users.response.NextStaffCodeData;

@ExtendWith(MockitoExtension.class)
class NextStaffCodeServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private RoleRepository roleRepository;

	@Mock
	private RolePermissionReader rolePermissionReader;

	@InjectMocks
	private NextStaffCodeService nextStaffCodeService;

	@Test
	void suggest_incrementsMaxSuffixForManagerLine() {
		User actor = org.mockito.Mockito.mock(User.class);
		Role role = org.mockito.Mockito.mock(Role.class);
		when(actor.getStatus()).thenReturn("Active");
		when(actor.getRole()).thenReturn(role);
		when(userRepository.findWithRoleById(1)).thenReturn(Optional.of(actor));
		when(rolePermissionReader.canManageStaff(role)).thenReturn(true);
		when(roleRepository.existsById(3)).thenReturn(true);
		when(userRepository.findStaffCodesLikePrefix("NV-MAN-")).thenReturn(List.of("NV-MAN-001", "NV-MAN-002", "NV-MAN-bad"));

		NextStaffCodeData out = nextStaffCodeService.suggest(1, 3, "MANAGER");
		assertThat(out.nextCode()).isEqualTo("NV-MAN-003");
		assertThat(out.prefix()).isEqualTo("NV-MAN");
	}

	@Test
	void suggest_returns001WhenNoCodes() {
		User actor = org.mockito.Mockito.mock(User.class);
		Role role = org.mockito.Mockito.mock(Role.class);
		when(actor.getStatus()).thenReturn("Active");
		when(actor.getRole()).thenReturn(role);
		when(userRepository.findWithRoleById(1)).thenReturn(Optional.of(actor));
		when(rolePermissionReader.canManageStaff(role)).thenReturn(true);
		when(roleRepository.existsById(2)).thenReturn(true);
		when(userRepository.findStaffCodesLikePrefix("NV-STF-")).thenReturn(List.of());

		NextStaffCodeData out = nextStaffCodeService.suggest(1, 2, "STAFF");
		assertThat(out.nextCode()).isEqualTo("NV-STF-001");
	}
}
