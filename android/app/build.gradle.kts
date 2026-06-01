plugins {
    id("com.android.application")
}

android {
    namespace = "org.openclaw.hwface"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.openclaw.hwface"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }
}
