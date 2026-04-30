package com.example.smart_erp.settings.storeprofile.response;

import java.time.Instant;

/**
 * Task073/074 — store profile data.
 */
public record StoreProfileData(long id, String name, String businessCategory, String address, String phone, String email, String website,
		String taxCode, String footerNote, String logoUrl, String facebookUrl, String instagramHandle, Integer defaultRetailLocationId,
		Instant updatedAt) {
}

