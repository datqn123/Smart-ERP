package com.example.smart_erp.auth.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.smart_erp.auth.repository.RoleRepository;
import com.example.smart_erp.auth.response.RoleItemData;
import com.example.smart_erp.auth.response.RolesListData;
import com.example.smart_erp.auth.support.MenuPermissionClaims;

@Service
public class RolesService {

	private final RoleRepository roleRepository;

	public RolesService(RoleRepository roleRepository) {
		this.roleRepository = roleRepository;
	}

	public RolesListData list() {
		List<RoleItemData> items = roleRepository.findAll().stream()
				.map(r -> new RoleItemData(
						r.getId() != null ? r.getId() : 0,
						r.getName(),
						MenuPermissionClaims.fromRolePermissionsJson(r.getPermissions())))
				.toList();
		return new RolesListData(items);
	}
}

