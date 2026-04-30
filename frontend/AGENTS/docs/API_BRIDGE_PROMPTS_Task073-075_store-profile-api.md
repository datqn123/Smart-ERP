# Prompt — API_BRIDGE — Task073–075 (thông tin cửa hàng / `store-profile`)

Tham chiếu: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).  
**SRS:** [`backend/docs/srs/SRS_Task073-075_store-profile-api.md`](../../../backend/docs/srs/SRS_Task073-075_store-profile-api.md) — **Approved**; RBAC `can_view_store_profile`; GET auto-create; upload Cloudinary; expose `defaultRetailLocationId`; max 5MB.

---

## 1. Context đầy đủ (mỗi phiên Task073–075: `@` **toàn bộ** khối dưới + file API của Task đang chạy)

```text
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreProfileData.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreLogoUploadData.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/JwtTokenService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/catalog/media/CloudinaryMediaService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/config/CloudinaryProperties.java
@backend/smart-erp/src/main/resources/db/migration/V28__task073_075_can_view_store_profile_permission.sql

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx
```

- **API Task (chọn đúng Task đang bridge):**
  - Task073: `frontend/docs/api/API_Task073_store_profile_get.md`
  - Task074: `frontend/docs/api/API_Task074_store_profile_patch.md`
  - Task075: `frontend/docs/api/API_Task075_store_profile_post_logo.md`

---

## 0. Master (outline)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md (Bước 0, §2b–2c, §3, §5, §7).

Bước 1: Đọc khối **§1 Context đầy đủ** + đúng một file `API_Task073|074|075_*store_profile*.md`.
Bước 2: Chạy từng phiên **một Path** (Mode=verify).
Output: `frontend/docs/api/bridge/BRIDGE_Task0NN_*.md` tương ứng.
```

---

## 2. Một dòng (`Mode=verify`)

```text
API_BRIDGE | Task=Task073 | Path=GET /api/v1/store-profile | Mode=verify
```

```text
API_BRIDGE | Task=Task074 | Path=PATCH /api/v1/store-profile | Mode=verify
```

```text
API_BRIDGE | Task=Task075 | Path=POST /api/v1/store-profile/logo | Mode=verify
```

---

## 3. Verify — đủ context (copy = một phiên / một Path)

### Task073 — GET `/api/v1/store-profile`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task073 | Path=GET /api/v1/store-profile | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task073-075_store-profile-api.md — §6 RBAC; §8.2 response; §10.2 SQL; expose defaultRetailLocationId.

@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/api/API_Task073_store_profile_get.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreProfileData.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/JwtTokenService.java
@backend/smart-erp/src/main/resources/db/migration/V28__task073_075_can_view_store_profile_permission.sql

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx

Grep chuỗi `"/api/v1/store-profile"` trong @backend/smart-erp/src/main/java (kỳ vọng `StoreProfileController`).
Grep chuỗi `"/api/v1/store-profile"` trong @frontend/mini-erp/src (kỳ vọng chưa có hit nếu UI còn mock; nếu có hit thì đối chiếu file `features/settings/api/*.ts` trúng).

Output: @frontend/docs/api/bridge/BRIDGE_Task073_store_profile_get.md
```

### Task074 — PATCH `/api/v1/store-profile`

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task074 | Path=PATCH /api/v1/store-profile | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task073-075_store-profile-api.md — §6 RBAC; §8.3 request; §9 BR-1; §10.2 updatePartial + validate defaultRetailLocationId.

@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/api/API_Task074_store_profile_patch.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreProfileData.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/JwtTokenService.java
@backend/smart-erp/src/main/resources/db/migration/V28__task073_075_can_view_store_profile_permission.sql

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx

Grep chuỗi `PATCH` + `store-profile` trong @backend/smart-erp/src/main/java (kỳ vọng `StoreProfileController.patch` + `StoreProfileService.patch`).
Grep `defaultRetailLocationId` trong @backend/smart-erp/src/main/java để đảm bảo validate `warehouselocations`.
Grep chuỗi `"/api/v1/store-profile"` trong @frontend/mini-erp/src (nếu chưa có hit → xác nhận UI mock; nếu có hit → đối chiếu api function + handler lưu form).

Output: @frontend/docs/api/bridge/BRIDGE_Task074_store_profile_patch.md
```

### Task075 — POST `/api/v1/store-profile/logo` (multipart)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task075 | Path=POST /api/v1/store-profile/logo | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task073-075_store-profile-api.md — §8.4 response; §10.2 update logo_url; Cloudinary folder convention.

@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/api/API_Task075_store_profile_post_logo.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/StoreProfileJdbcRepository.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreLogoUploadData.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/MenuPermissionClaims.java
@backend/smart-erp/src/main/java/com/example/smart_erp/auth/support/JwtTokenService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/catalog/media/CloudinaryMediaService.java
@backend/smart-erp/src/main/java/com/example/smart_erp/config/CloudinaryProperties.java
@backend/smart-erp/src/main/resources/db/migration/V28__task073_075_can_view_store_profile_permission.sql

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx

Grep chuỗi `"/logo"` + `store-profile` trong @backend/smart-erp/src/main/java (kỳ vọng `StoreProfileController.uploadLogo`).
Đối chiếu validate file (content-type + size) trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/media/CloudinaryMediaService.java.

Output: @frontend/docs/api/bridge/BRIDGE_Task075_store_profile_post_logo.md
```

---

## 4. `wire-fe` — đủ context (copy = một phiên / một Path)

> **Context UI:** route `/settings/store-info` (StoreInfoPage).

### Task073 — wire-fe (GET `/api/v1/store-profile`)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task073 | Path=GET /api/v1/store-profile | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task073-075_store-profile-api.md — GET trả đủ field + defaultRetailLocationId.

@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/api/API_Task073_store_profile_get.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreProfileData.java

Thực hiện:
- Tạo `frontend/mini-erp/src/features/settings/api/storeProfileApi.ts` (apiJson) với hàm `getStoreProfile()`.
- Móc gọi GET vào `StoreInfoPage` (useQuery hoặc useEffect + state) và map field camelCase theo spec.
- Không dùng fetch trực tiếp trong component.

Output:
- @frontend/docs/api/bridge/BRIDGE_Task073_store_profile_get.md (cập nhật cột Frontend: api + UI)
```

### Task074 — wire-fe (PATCH `/api/v1/store-profile`)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task074 | Path=PATCH /api/v1/store-profile | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task073-075_store-profile-api.md — patch partial + body rỗng 400 + details.

@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/api/API_Task074_store_profile_patch.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreProfileData.java

Thực hiện:
- Bổ sung vào `frontend/mini-erp/src/features/settings/api/storeProfileApi.ts` hàm `patchStoreProfile(body)`.
- Trong UI, khi bấm “Lưu thay đổi” gọi PATCH; nếu 400 có `details` thì hiển thị theo field; success thì toast + cập nhật state.
- Sau PATCH: invalidate/refetch GET Task073 để đồng bộ.

Output:
- @frontend/docs/api/bridge/BRIDGE_Task074_store_profile_patch.md (cập nhật cột Frontend)
```

### Task075 — wire-fe (POST `/api/v1/store-profile/logo`)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task075 | Path=POST /api/v1/store-profile/logo | Mode=wire-fe
Context SRS: @backend/docs/srs/SRS_Task073-075_store-profile-api.md — multipart field `file`, response {logoUrl, updatedAt}.

@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_RESPONSE_ENVELOPE.md
@frontend/docs/api/API_PROJECT_DESIGN.md
@frontend/docs/api/API_Task075_store_profile_post_logo.md
@backend/docs/srs/SRS_Task073-075_store-profile-api.md

@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/mini-erp/src/features/settings/pages/StoreInfoPage.tsx

@backend/smart-erp/src/main/java/com/example/smart_erp/settings/controller/StoreProfileController.java
@backend/smart-erp/src/main/java/com/example/smart_erp/settings/storeprofile/response/StoreLogoUploadData.java

Thực hiện:
- Bổ sung vào `frontend/mini-erp/src/features/settings/api/storeProfileApi.ts` hàm `uploadStoreLogo(file)` (multipart).
- UI: khi chọn file thì gọi upload (hoặc upload khi bấm Lưu theo UX), nhận `logoUrl` cập nhật state.
- Sau upload: refetch GET Task073.

Output:
- @frontend/docs/api/bridge/BRIDGE_Task075_store_profile_post_logo.md (cập nhật cột Frontend)
```

