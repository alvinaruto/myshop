import os
import subprocess
import requests
import glob

# Configuration
ANDROID_DIR = os.path.abspath("android")
ENV_FILE = os.path.abspath("frontend/.env.local")
BOT_TOKEN = "7983302327:AAHbnRJaHdWn8OtC0ZdpQq6-0Y7kW4h2lks"
CHAT_ID = "-1003739603068"

def build_apk():
    print("🚀 Starting Android Build...")
    try:
        # Run gradle assembleRelease
        result = subprocess.run(
            ["./gradlew", "assembleRelease"],
            cwd=ANDROID_DIR,
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ Build Successful!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Build Failed: {e.stderr}")
        exit(1)

def send_to_telegram(file_path, caption):
    print(f"📤 Uploading {os.path.basename(file_path)} to Telegram...")
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    files = {'document': open(file_path, 'rb')}
    data = {'chat_id': CHAT_ID, 'caption': caption, 'parse_mode': 'HTML'}
    
    response = requests.post(url, files=files, data=data)
    if response.status_code == 200:
        print(f"✅ Uploaded: {os.path.basename(file_path)}")
    else:
        print(f"❌ Failed to upload {os.path.basename(file_path)}: {response.text}")

def main():
    # 1. Build
    build_apk()
    
    # 2. Locate APKs
    apk_pattern = os.path.join(ANDROID_DIR, "app/build/outputs/apk/release/*.apk")
    apk_files = glob.glob(apk_pattern)
    
    if not apk_files:
        print("❌ No APK files found!")
        exit(1)
        
    print(f"📦 Found {len(apk_files)} APK files.")
    
    # 3. Send (ONLY Universal APK)
    universal_apk = next((apk for apk in apk_files if "universal" in apk.lower()), None)
    
    if universal_apk:
        filename = os.path.basename(universal_apk)
        caption = f"🚀 <b>New Release Build (Universal)</b>\n\n📦 File: <code>{filename}</code>\n✨ <b>New Features:</b>\n✅ Auto-OTP detection from notification/clipboard\n✅ 6-digit auto-submit verification\n✅ Functional menu search (Web & Mobile)\n✅ Removed hardcoded delivery fee in cart"
        send_to_telegram(universal_apk, caption)
    else:
        # Fallback to the first found if universal is missing
        if apk_files:
            apk = apk_files[0]
            filename = os.path.basename(apk)
            caption = f"🚀 <b>New Release Build</b>\n\n📦 File: <code>{filename}</code>\n✨ <b>New Features:</b>\n✅ Auto-OTP detection from notification/clipboard\n✅ 6-digit auto-submit verification\n✅ Functional menu search (Web & Mobile)\n✅ Removed hardcoded delivery fee in cart"
            send_to_telegram(apk, caption)

if __name__ == "__main__":
    main()
