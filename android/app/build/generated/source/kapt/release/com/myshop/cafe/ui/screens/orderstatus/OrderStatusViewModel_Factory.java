package com.myshop.cafe.ui.screens.orderstatus;

import com.myshop.cafe.data.repository.OrderRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
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
public final class OrderStatusViewModel_Factory implements Factory<OrderStatusViewModel> {
  private final Provider<OrderRepository> orderRepositoryProvider;

  public OrderStatusViewModel_Factory(Provider<OrderRepository> orderRepositoryProvider) {
    this.orderRepositoryProvider = orderRepositoryProvider;
  }

  @Override
  public OrderStatusViewModel get() {
    return newInstance(orderRepositoryProvider.get());
  }

  public static OrderStatusViewModel_Factory create(
      Provider<OrderRepository> orderRepositoryProvider) {
    return new OrderStatusViewModel_Factory(orderRepositoryProvider);
  }

  public static OrderStatusViewModel newInstance(OrderRepository orderRepository) {
    return new OrderStatusViewModel(orderRepository);
  }
}
