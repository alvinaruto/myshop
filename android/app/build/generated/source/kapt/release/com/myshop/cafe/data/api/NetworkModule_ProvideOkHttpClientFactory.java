package com.myshop.cafe.data.api;

import com.myshop.cafe.data.repository.UserRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;
import okhttp3.OkHttpClient;

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
public final class NetworkModule_ProvideOkHttpClientFactory implements Factory<OkHttpClient> {
  private final Provider<UserRepository> userRepositoryProvider;

  public NetworkModule_ProvideOkHttpClientFactory(Provider<UserRepository> userRepositoryProvider) {
    this.userRepositoryProvider = userRepositoryProvider;
  }

  @Override
  public OkHttpClient get() {
    return provideOkHttpClient(userRepositoryProvider.get());
  }

  public static NetworkModule_ProvideOkHttpClientFactory create(
      Provider<UserRepository> userRepositoryProvider) {
    return new NetworkModule_ProvideOkHttpClientFactory(userRepositoryProvider);
  }

  public static OkHttpClient provideOkHttpClient(UserRepository userRepository) {
    return Preconditions.checkNotNullFromProvides(NetworkModule.INSTANCE.provideOkHttpClient(userRepository));
  }
}
