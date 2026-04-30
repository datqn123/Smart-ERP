# Prompt — API_BRIDGE — Task076–081 (roles + users management)

Tham chiếu: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).  
**SRS:** [`backend/docs/srs/SRS_Task076-081_roles-and-users-management.md`](../../../backend/docs/srs/SRS_Task076-081_roles-and-users-management.md) — **Approved**; OQ‑1 self-view; OQ‑2 soft delete; OQ‑3 đổi role chỉ Owner; OQ‑5 permissions boolean object; OQ‑6 FE bỏ role thừa.

---

## 1. Context đầy đủ (mỗi phiên Task076/077/079/080/081: `@` toàn bộ khối dưới + đúng 1 file `API_TaskXXX`)

```text
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts
```

---

## 0. Master (outline)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, §2b–2c, §3, §5, §7).

Bước 1: Đọc khối **§1 Context đầy đủ** + đúng một file `API_Task0NN_*.md` theo Path đang bridge.
Bước 2: Mỗi phiên chỉ làm **một Path** (verify → wire-fe khi cần).
Output: `frontend/docs/api/bridge/BRIDGE_Task0NN_*.md`.
```

---

## 2. Một dòng (`Mode=verify`)

```text
API_BRIDGE | Task=Task076 | Path=GET /api/v1/roles | Mode=verify
```

```text
API_BRIDGE | Task=Task077 | Path=GET /api/v1/users | Mode=verify
```

```text
API_BRIDGE | Task=Task079 | Path=GET /api/v1/users/{userId} | Mode=verify
```

```text
API_BRIDGE | Task=Task080 | Path=PATCH /api/v1/users/{userId} | Mode=verify
```

```text
API_BRIDGE | Task=Task081 | Path=DELETE /api/v1/users/{userId} | Mode=verify
```

---

## 3. Verify — đủ context (copy = một phiên / một Path)

### Task076 — `GET /api/v1/roles`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task076 | Path=GET /api/v1/roles | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task076-081_roles-and-users-management.md — §6 RBAC; §8.1 response permissions boolean object (MenuPermissionClaims).

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task076_roles_get_list.md
Grep chuỗi `"/api/v1/roles"` trong @backend/smart-erp/src/main/java (kỳ vọng hit `RolesController`).
Grep chuỗi `"/api/v1/roles"` trong @frontend/mini-erp/src (kỳ vọng chưa có; nếu có thì đối chiếu `features/settings/api/*.ts` trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task076_roles_get_list.md
```

### Task077 — `GET /api/v1/users`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task077 | Path=GET /api/v1/users | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task076-081_roles-and-users-management.md — §8.2 query + paging; status map Active/Locked; §10.2 SQL phác thảo.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task077_users_get_list.md
Grep chuỗi `"/api/v1/users"` trong @backend/smart-erp/src/main/java (kỳ vọng hit `UsersManagementController` + `UsersController` (POST + next-staff-code)).
Grep chuỗi `"/api/v1/users"` trong @frontend/mini-erp/src (kỳ vọng mới có POST/next-staff-code; list đang mock trong `EmployeesPage`).

Output: @frontend/docs/api/bridge/BRIDGE_Task077_users_get_list.md
```

### Task079 — `GET /api/v1/users/{userId}` (self-view)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task079 | Path=GET /api/v1/users/{userId} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task076-081_roles-and-users-management.md — OQ‑1: Staff chỉ được xem chính mình (`userId == jwt.sub`), còn lại cần can_manage_staff; §8.3 response có `username`, `lastLogin`.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task079_users_get_by_id.md
Grep chuỗi `@GetMapping(\"/{userId` hoặc `"/api/v1/users/{userId}"` trong @backend/smart-erp/src/main/java (kỳ vọng `UsersManagementController#getById`).
Grep chuỗi `EmployeeDetailDialog` và path `"/api/v1/users"` trong @frontend/mini-erp/src để xác định dialog đang mock hay đã có call.

Output: @frontend/docs/api/bridge/BRIDGE_Task079_users_get_by_id.md
```

### Task080 — `PATCH /api/v1/users/{userId}` (đổi role chỉ Owner)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task080 | Path=PATCH /api/v1/users/{userId} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task076-081_roles-and-users-management.md — OQ‑3: chỉ Owner được đổi roleId; BR-3 cấm gán Owner; OQ‑4: trùng thông tin → 409.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task080_users_patch.md
Grep chuỗi `@PatchMapping` trong @backend/smart-erp/src/main/java (kỳ vọng `UsersManagementController#patch` + `UsersManagementService#patch`).
Grep `"/api/v1/users"` trong @frontend/mini-erp/src để xác định form edit đã nối hay đang mock.

Output: @frontend/docs/api/bridge/BRIDGE_Task080_users_patch.md
```

### Task081 — `DELETE /api/v1/users/{userId}` (soft lock, 204)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task081 | Path=DELETE /api/v1/users/{userId} | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task076-081_roles-and-users-management.md — OQ‑2 soft lock; BR‑4 cấm self-delete (409); response 204.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task081_users_delete.md
Grep `@DeleteMapping` trong @backend/smart-erp/src/main/java (kỳ vọng `UsersManagementController#delete`).
Grep path `"/api/v1/users"` trong @frontend/mini-erp/src để xác định nút xoá đang mock (`EmployeesPage`).

Output: @frontend/docs/api/bridge/BRIDGE_Task081_users_delete.md
```

---

## 4. `wire-fe` — đủ context (mỗi phiên / một Path)

> Context UI: route `/settings/employees` (EmployeesPage).

### Task076 — wire-fe (dropdown roles trong EmployeeForm)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task076 | Path=GET /api/v1/roles | Mode=wire-fe
Context UI: /settings/employees — EmployeeForm (dropdown role).

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task076_roles_get_list.md

Thực hiện (wire-fe):
- Tạo hàm `getRoles()` gọi `apiJson` (ưu tiên đặt trong `@frontend/mini-erp/src/features/settings/api/usersApi.ts` để cùng cụm users).
- Cập nhật `EmployeeForm` dùng data từ `getRoles()` để render dropdown (không hardcode).
- Đồng bộ OQ-6: UI chỉ dùng role thật từ API/DB (`Owner/Staff/Admin`), bỏ nhãn thừa `Manager/Warehouse` trong type + mapping:
  - `@frontend/mini-erp/src/features/settings/types.ts` (union `Employee["role"]`)
  - `@frontend/mini-erp/src/features/settings/api/usersApi.ts` (map UI role ↔ roleId / staffFamily)

Output: @frontend/docs/api/bridge/BRIDGE_Task076_roles_get_list.md
```

### Task077 — wire-fe (list nhân viên + filter/search/paging)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task077 | Path=GET /api/v1/users | Mode=wire-fe
Context UI: /settings/employees — EmployeesPage + EmployeeTable + EmployeeToolbar.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task077_users_get_list.md

Thực hiện (wire-fe):
- Thêm hàm `getUsersList(query)` gọi `apiJson` trong `@frontend/mini-erp/src/features/settings/api/usersApi.ts`:
  - Query params: `search`, `status`, `roleId`, `page`, `limit` (đúng API doc Task077).
- Trong `@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx`:
  - Thay `mockEmployees` + `useState(mockEmployees)` bằng call API (ưu tiên TanStack Query nếu đã có trong app; nếu chưa thì dùng `useEffect` + state cũng được cho MVP).
  - Khi search/roleFilter thay đổi thì refetch list.
- Mapping dữ liệu:
  - Dùng `userResponseToEmployee()` hoặc tạo mapper mới cho list để map `data.items[]` → `Employee[]`.
  - Đồng bộ OQ-6: chỉ dùng role hợp lệ (`Owner/Staff/Admin`) sau khi Task076 wire-fe cập nhật type/mapping.
- Lỗi:
  - 401/403: hiển thị toast theo `message` và xử lý theo `FE_API_CONNECTION_GUIDE.md` (không crash UI).

Output: @frontend/docs/api/bridge/BRIDGE_Task077_users_get_list.md
```

### Task079 — wire-fe (mở dialog chi tiết)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task079 | Path=GET /api/v1/users/{userId} | Mode=wire-fe
Context UI: /settings/employees — EmployeeDetailDialog.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task079_users_get_by_id.md

Thực hiện (wire-fe):
- Thêm hàm `getUserById(userId)` gọi `apiJson` trong `@frontend/mini-erp/src/features/settings/api/usersApi.ts`.
- Khi mở `EmployeeDetailDialog`:
  - Nếu hiện đang truyền sẵn `employee` (từ list/mock), vẫn gọi `getUserById(employee.id)` để lấy detail (đúng Task079) và render thêm `username`, `lastLogin` nếu có.
  - Xử lý loading/error trong dialog (tối thiểu: spinner + toast).
- RBAC note (self-view): nếu user đang login là Staff thì chỉ xem được chính mình; UI nên xử lý 403 bằng message thân thiện (không crash).

Output: @frontend/docs/api/bridge/BRIDGE_Task079_users_get_by_id.md
```

### Task080 — wire-fe (edit nhân viên)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task080 | Path=PATCH /api/v1/users/{userId} | Mode=wire-fe
Context UI: /settings/employees — EmployeeForm (edit).

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task080_users_patch.md

Thực hiện (wire-fe):
- Thêm hàm `patchUser(userId, body)` gọi `apiJson` trong `@frontend/mini-erp/src/features/settings/api/usersApi.ts`.
- Trong `@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx`:
  - Nhánh edit (đang `toast.success("Cập nhật nhân viên thành công")` và cập nhật state local) → thay bằng call `patchUser`.
  - 400: map `details` → `react-hook-form setError` (theo `FE_API_CONNECTION_GUIDE.md`).
  - 409: hiển thị toast `message`; nếu có `details` thì map field tương tự 400.
- Role change note (OQ-3): chỉ Owner được đổi `roleId`. UI nên handle 403 bằng toast message và không đóng form.

Output: @frontend/docs/api/bridge/BRIDGE_Task080_users_patch.md
```

### Task081 — wire-fe (vô hiệu hoá nhân viên)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task081 | Path=DELETE /api/v1/users/{userId} | Mode=wire-fe
Context UI: /settings/employees — action xoá trên EmployeeTable / confirm dialog trong EmployeesPage.

Context đầy đủ:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task076-081_roles-and-users-management.md

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/User.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/entity/Role.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/UserRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/repository/RoleRepository.java

@backend/smart-erp/src/main/java/com/example/smart_erp/auth/controller/RolesController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/service/RolesService.java

@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/controller/UsersManagementController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/service/UsersManagementService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/repository/UsersListJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserCreateRequest.java
@backend/smart-erp/src/main/java/com/example/smart_erp/users/dto/UserPatchRequest.java

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeTable.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeToolbar.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeForm.tsx
@frontend/mini-erp/src/features/settings/components/EmployeeDetailDialog.tsx
@frontend/mini-erp/src/features/settings/api/usersApi.ts
@frontend/mini-erp/src/features/settings/types.ts

API doc: @frontend/docs/api/API_Task081_users_delete.md

Thực hiện (wire-fe):
- Thêm hàm `deleteUser(userId)` gọi `apiJson` trong `@frontend/mini-erp/src/features/settings/api/usersApi.ts`:
  - Method `DELETE`, path `/api/v1/users/{userId}`, **success = 204 (no body)**.
- Trong `@frontend/mini-erp/src/features/settings/pages/EmployeesPage.tsx`:
  - Nhánh `confirmDelete` đang xoá local state + toast → thay bằng call `deleteUser(deleteTarget.id)`.
  - Khi thành công: toast + refetch list Task077 (hoặc gọi lại `getUsersList`), rồi đóng dialog.
  - 409/403: toast theo `message` (vd. self-delete bị chặn).

Output: @frontend/docs/api/bridge/BRIDGE_Task081_users_delete.md
```

