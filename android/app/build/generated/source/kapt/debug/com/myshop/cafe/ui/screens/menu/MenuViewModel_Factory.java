package com.myshop.cafe.ui.screens.menu;

import com.myshop.cafe.data.repository.CartRepository;
import com.myshop.cafe.data.repository.MenuRepository;
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
public final class MenuViewModel_Factory implements Factory<MenuViewModel> {
  private final Provider<MenuRepository> menuRepositoryProvider;

  private final Provider<CartRepository> cartRepositoryProvider;

  public MenuViewModel_Factory(Provider<MenuRepository> menuRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider) {
    this.menuRepositoryProvider = menuRepositoryProvider;
    this.cartRepositoryProvider = cartRepositoryProvider;
  }

  @Override
  public MenuViewModel get() {
    return newInstance(menuRepositoryProvider.get(), cartRepositoryProvider.get());
  }

  public static MenuViewModel_Factory create(Provider<MenuRepository> menuRepositoryProvider,
      Provider<CartRepository> cartRepositoryProvider) {
    return new MenuViewModel_Factory(menuRepositoryProvider, cartRepositoryProvider);
  }

  public static MenuViewModel newInstance(MenuRepository menuRepository,
      CartRepository cartRepository) {
    return new MenuViewModel(menuRepository, cartRepository);
  }
}
