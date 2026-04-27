package com.example.smart_erp.config;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Pool dùng upload ảnh song song khi tạo sản phẩm (multipart) — SRS Task034-041 §14.
 */
@Configuration
public class CatalogExecutorConfig {

	@Bean(destroyMethod = "shutdown")
	ExecutorService productImageUploadExecutor() {
		return Executors.newFixedThreadPool(4);
	}
}
