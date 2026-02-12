package com.myshop.cafe.ui.screens.checkout;

import com.myshop.cafe.data.repository.CartRepository;
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
public final class CheckoutViewModel_Factory implements Factory<CheckoutViewModel> {
  private final Provider<CartRepository> cartRepositoryProvider;

  private final Provider<OrderRepository> orderRepositoryProvider;

  private final Provider<UserRepository> userRepositoryProvider;

  public CheckoutViewModel_Factory(Provider<CartRepository> cartRepositoryProvider,
      Provider<OrderRepository> orderRepositoryProvider,
      Provider<UserRepository> userRepositoryProvider) {
    this.cartRepositoryProvider = cartRepositoryProvider;
    this.orderRepositoryProvider = orderRepositoryProvider;
    this.userRepositoryProvider = userRepositoryProvider;
  }

  @Override
  public CheckoutViewModel get() {
    return newInstance(cartRepositoryProvider.get(), orderRepositoryProvider.get(), userRepositoryProvider.get());
  }

  public static CheckoutViewModel_Factory create(Provider<CartRepository> cartRepositoryProvider,
      Provider<OrderRepository> orderRepositoryProvider,
      Provider<UserRepository> userRepositoryProvider) {
    return new CheckoutViewModel_Factory(cartRepositoryProvider, orderRepositoryProvider, userRepositoryProvider);
  }

  public static CheckoutViewModel newInstance(CartRepository cartRepository,
      OrderRepository orderRepository, UserRepository userRepository) {
    return new CheckoutViewModel(cartRepository, orderRepository, userRepository);
  }
}
