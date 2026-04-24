/**
 * Xác thực & phiên (JWT, refresh, brute-force, registry).
 * <p>
 * Cấu trúc gợi ý trong module:
 * <ul>
 * <li>{@code auth.controller} — REST</li>
 * <li>{@code auth.dto} — request body (inbound)</li>
 * <li>{@code auth.response} — payload success (outbound)</li>
 * <li>{@code auth.service} — nghiệp vụ + kết quả nội bộ (record)</li>
 * <li>{@code auth.repository} — JPA / JDBC</li>
 * <li>{@code auth.entity} — JPA entity</li>
 * <li>{@code auth.session} — trạng thái phiên in-memory</li>
 * <li>{@code auth.support} — JWT, đọc JSON quyền</li>
 * </ul>
 */
package com.example.smart_erp.auth;
