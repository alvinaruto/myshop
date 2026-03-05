package com.myshop.cafe.ui.screens.auth;

import android.content.Context;
import com.myshop.cafe.data.api.ApiService;
import com.myshop.cafe.data.repository.UserRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class LoginViewModel_Factory implements Factory<LoginViewModel> {
  private final Provider<UserRepository> userRepositoryProvider;

  private final Provider<ApiService> apiServiceProvider;

  private final Provider<Context> contextProvider;

  public LoginViewModel_Factory(Provider<UserRepository> userRepositoryProvider,
      Provider<ApiService> apiServiceProvider, Provider<Context> contextProvider) {
    this.userRepositoryProvider = userRepositoryProvider;
    this.apiServiceProvider = apiServiceProvider;
    this.contextProvider = contextProvider;
  }

  @Override
  public LoginViewModel get() {
    return newInstance(userRepositoryProvider.get(), apiServiceProvider.get(), contextProvider.get());
  }

  public static LoginViewModel_Factory create(Provider<UserRepository> userRepositoryProvider,
      Provider<ApiService> apiServiceProvider, Provider<Context> contextProvider) {
    return new LoginViewModel_Factory(userRepositoryProvider, apiServiceProvider, contextProvider);
  }

  public static LoginViewModel newInstance(UserRepository userRepository, ApiService apiService,
      Context context) {
    return new LoginViewModel(userRepository, apiService, context);
  }
}
