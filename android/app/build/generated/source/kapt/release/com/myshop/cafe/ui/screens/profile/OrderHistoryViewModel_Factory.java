package com.myshop.cafe.ui.screens.profile;

import com.myshop.cafe.data.repository.OrderRepository;
import com.myshop.cafe.data.repository.UserRepository;
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
public final class OrderHistoryViewModel_Factory implements Factory<OrderHistoryViewModel> {
  private final Provider<OrderRepository> orderRepositoryProvider;

  private final Provider<UserRepository> userRepositoryProvider;

  public OrderHistoryViewModel_Factory(Provider<OrderRepository> orderRepositoryProvider,
      Provider<UserRepository> userRepositoryProvider) {
    this.orderRepositoryProvider = orderRepositoryProvider;
    this.userRepositoryProvider = userRepositoryProvider;
  }

  @Override
  public OrderHistoryViewModel get() {
    return newInstance(orderRepositoryProvider.get(), userRepositoryProvider.get());
  }

  public static OrderHistoryViewModel_Factory create(
      Provider<OrderRepository> orderRepositoryProvider,
      Provider<UserRepository> userRepositoryProvider) {
    return new OrderHistoryViewModel_Factory(orderRepositoryProvider, userRepositoryProvider);
  }

  public static OrderHistoryViewModel newInstance(OrderRepository orderRepository,
      UserRepository userRepository) {
    return new OrderHistoryViewModel(orderRepository, userRepository);
  }
}
