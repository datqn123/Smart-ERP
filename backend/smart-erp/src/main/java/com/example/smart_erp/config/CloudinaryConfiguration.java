package com.example.smart_erp.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
@EnableConfigurationProperties(CloudinaryProperties.class)
public class CloudinaryConfiguration {

	@Bean
	@ConditionalOnProperty(prefix = "app.cloudinary", name = "enabled", havingValue = "true")
	public Cloudinary cloudinary(CloudinaryProperties props) {
		if (!props.hasCredentials()) {
			throw new IllegalStateException(
					"app.cloudinary.enabled=true requires non-blank cloudName, apiKey, apiSecret (e.g. CLOUDINARY_* env).");
		}
		Map<String, String> config = new HashMap<>();
		config.put("cloud_name", props.getCloudName().trim());
		config.put("api_key", props.getApiKey().trim());
		config.put("api_secret", props.getApiSecret().trim());
		return new Cloudinary(config);
	}
}
