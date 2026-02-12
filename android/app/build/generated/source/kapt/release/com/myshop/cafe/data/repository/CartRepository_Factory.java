package com.myshop.cafe.data.repository;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

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
public final class CartRepository_Factory implements Factory<CartRepository> {
  @Override
  public CartRepository get() {
    return newInstance();
  }

  public static CartRepository_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static CartRepository newInstance() {
    return new CartRepository();
  }

  private static final class InstanceHolder {
    private static final CartRepository_Factory INSTANCE = new CartRepository_Factory();
  }
}
