# Add project specific ProGuard rules here.

# Keep Kotlin Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# Generic Attributes - Keep EVERYTHING for now to rule out attribute stripping
-keepattributes *

# Kotlin Metadata (Crucial for Reflection/Serialization)
-keep class kotlin.Metadata { *; }
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations, AnnotationDefault

# Keep ALL application classes to prevent stripping of models/serializers
-keep class com.myshop.cafe.** { *; }

# Serialization Specific
-keep @kotlinx.serialization.Serializable class * { *; }
-keepclassmembers class * {
    @kotlinx.serialization.SerialName *;
}

# Keep the generated Companion object which holds the serializer
-keepclassmembers class * {
    *** Companion;
}

# Keep the serializer() method on the Companion object
-keepclassmembers class **$Companion {
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit & Network (Existing + Strengthened)
-keep class retrofit2.** { *; }
-keep interface retrofit2.** { *; }
-dontwarn retrofit2.**
-keepattributes Signature, InnerClasses, EnclosingMethod

# Kotlinx Serialization Factory specific
-keep class com.jakewharton.retrofit2.converter.kotlinx.serialization.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.internal.managers.ComponentSupplier { *; }
