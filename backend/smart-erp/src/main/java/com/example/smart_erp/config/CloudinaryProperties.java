package com.example.smart_erp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cloudinary upload (Task039 multipart). Secrets via env {@code CLOUDINARY_*}; enable with
 * {@code app.cloudinary.enabled=true}.
 */
@ConfigurationProperties(prefix = "app.cloudinary")
public class CloudinaryProperties {

	/**
	 * When false (default), {@link CloudinaryConfiguration} does not create a {@link com.cloudinary.Cloudinary} bean
	 * and multipart upload returns a clear business error.
	 */
	private boolean enabled = false;

	private String cloudName = "";
	private String apiKey = "";
	private String apiSecret = "";
	/** Folder prefix on Cloudinary, e.g. {@code smart-erp/products}. */
	private String folder = "smart-erp/products";
	/** Max accepted upload size in bytes (default 5 MiB). */
	private long maxFileSizeBytes = 5L * 1024 * 1024;

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getCloudName() {
		return cloudName;
	}

	public void setCloudName(String cloudName) {
		this.cloudName = cloudName != null ? cloudName : "";
	}

	public String getApiKey() {
		return apiKey;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey != null ? apiKey : "";
	}

	public String getApiSecret() {
		return apiSecret;
	}

	public void setApiSecret(String apiSecret) {
		this.apiSecret = apiSecret != null ? apiSecret : "";
	}

	public String getFolder() {
		return folder;
	}

	public void setFolder(String folder) {
		this.folder = (folder == null || folder.isBlank()) ? "smart-erp/products" : folder.trim();
	}

	public long getMaxFileSizeBytes() {
		return maxFileSizeBytes;
	}

	public void setMaxFileSizeBytes(long maxFileSizeBytes) {
		this.maxFileSizeBytes = maxFileSizeBytes > 0 ? maxFileSizeBytes : 5L * 1024 * 1024;
	}

	public boolean hasCredentials() {
		return !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();
	}
}
