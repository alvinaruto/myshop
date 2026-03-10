package com.myshop.cafe.ui.screens.profile;

import com.myshop.cafe.data.repository.LoyaltyRepository;
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
public final class ProfileViewModel_Factory implements Factory<ProfileViewModel> {
  private final Provider<UserRepository> userRepositoryProvider;

  private final Provider<LoyaltyRepository> loyaltyRepositoryProvider;

  public ProfileViewModel_Factory(Provider<UserRepository> userRepositoryProvider,
      Provider<LoyaltyRepository> loyaltyRepositoryProvider) {
    this.userRepositoryProvider = userRepositoryProvider;
    this.loyaltyRepositoryProvider = loyaltyRepositoryProvider;
  }

  @Override
  public ProfileViewModel get() {
    return newInstance(userRepositoryProvider.get(), loyaltyRepositoryProvider.get());
  }

  public static ProfileViewModel_Factory create(Provider<UserRepository> userRepositoryProvider,
      Provider<LoyaltyRepository> loyaltyRepositoryProvider) {
    return new ProfileViewModel_Factory(userRepositoryProvider, loyaltyRepositoryProvider);
  }

  public static ProfileViewModel newInstance(UserRepository userRepository,
      LoyaltyRepository loyaltyRepository) {
    return new ProfileViewModel(userRepository, loyaltyRepository);
  }
}
