package com.myshop.cafe.data.repository;

import com.myshop.cafe.data.api.ApiService;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class OrderRepository_Factory implements Factory<OrderRepository> {
  private final Provider<ApiService> apiServiceProvider;

  public OrderRepository_Factory(Provider<ApiService> apiServiceProvider) {
    this.apiServiceProvider = apiServiceProvider;
  }

  @Override
  public OrderRepository get() {
    return newInstance(apiServiceProvider.get());
  }

  public static OrderRepository_Factory create(Provider<ApiService> apiServiceProvider) {
    return new OrderRepository_Factory(apiServiceProvider);
  }

  public static OrderRepository newInstance(ApiService apiService) {
    return new OrderRepository(apiService);
  }
}
