use base64::{engine::general_purpose::STANDARD as B64, Engine};

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn store_keyring(key_id: &str, plaintext: &str) -> Result<String, String> {
    use keyring::Entry;
    let entry = Entry::new("blank-ide", key_id).map_err(|e| e.to_string())?;
    entry
        .set_password(plaintext)
        .map_err(|e| format!("Keyring store failed: {e}"))?;
    Ok(format!("keyring:{key_id}"))
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn load_keyring(token: &str) -> Result<String, String> {
    use keyring::Entry;
    let key_id = token
        .strip_prefix("keyring:")
        .ok_or_else(|| "Invalid keyring token".to_string())?;
    let entry = Entry::new("blank-ide", key_id).map_err(|e| e.to_string())?;
    entry
        .get_password()
        .map_err(|e| format!("Keyring load failed: {e}"))
}

pub fn encrypt_secret(key_id: &str, plaintext: &str) -> Result<String, String> {
    if plaintext.is_empty() {
        return Ok(String::new());
    }

    #[cfg(windows)]
    {
        let _ = key_id;
        return encrypt_dpapi(plaintext);
    }

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        return store_keyring(key_id, plaintext);
    }

    #[cfg(not(any(windows, target_os = "macos", target_os = "linux")))]
    {
        let _ = key_id;
        Ok(format!("plain:{}", B64.encode(plaintext.as_bytes())))
    }
}

pub fn decrypt_secret(ciphertext: &str) -> Result<String, String> {
    if ciphertext.is_empty() {
        return Ok(String::new());
    }

    if let Some(rest) = ciphertext.strip_prefix("keyring:") {
        #[cfg(any(target_os = "macos", target_os = "linux"))]
        {
            return load_keyring(&format!("keyring:{rest}"));
        }
        #[cfg(not(any(target_os = "macos", target_os = "linux")))]
        {
            let _ = rest;
            return Err("Keyring secrets are only available on macOS and Linux".into());
        }
    }

    if ciphertext.starts_with("dpapi:") {
        #[cfg(windows)]
        return decrypt_dpapi(ciphertext);
        #[cfg(not(windows))]
        return Err("DPAPI secrets are only available on Windows".into());
    }

    if let Some(payload) = ciphertext.strip_prefix("plain:") {
        let bytes = B64
            .decode(payload)
            .map_err(|e| format!("Base64 decode failed: {e}"))?;
        return String::from_utf8(bytes).map_err(|e| e.to_string());
    }

    Err("Unknown secret format".into())
}

#[cfg(windows)]
fn encrypt_dpapi(plaintext: &str) -> Result<String, String> {
    use windows::Win32::Foundation::LocalFree;
    use windows::Win32::Security::Cryptography::{
        CryptProtectData, CRYPT_INTEGER_BLOB, CRYPTPROTECT_LOCAL_MACHINE,
        CRYPTPROTECT_UI_FORBIDDEN,
    };

    let mut bytes = plaintext.as_bytes().to_vec();
    let mut in_blob = CRYPT_INTEGER_BLOB {
        cbData: bytes.len() as u32,
        pbData: bytes.as_mut_ptr(),
    };
    let mut out_blob = CRYPT_INTEGER_BLOB::default();

    unsafe {
        CryptProtectData(
            &mut in_blob,
            None,
            None,
            None,
            None,
            CRYPTPROTECT_UI_FORBIDDEN | CRYPTPROTECT_LOCAL_MACHINE,
            &mut out_blob,
        )
        .map_err(|e| format!("CryptProtectData failed: {e}"))?;

        let slice = std::slice::from_raw_parts(out_blob.pbData, out_blob.cbData as usize);
        let encoded = B64.encode(slice);
        let _ = LocalFree(windows::Win32::Foundation::HLOCAL(out_blob.pbData as _));
        Ok(format!("dpapi:{encoded}"))
    }
}

#[cfg(windows)]
fn decrypt_dpapi(ciphertext: &str) -> Result<String, String> {
    use windows::Win32::Foundation::LocalFree;
    use windows::Win32::Security::Cryptography::{CryptUnprotectData, CRYPT_INTEGER_BLOB};

    let payload = ciphertext
        .strip_prefix("dpapi:")
        .ok_or_else(|| "Invalid ciphertext format".to_string())?;
    let mut data = B64
        .decode(payload)
        .map_err(|e| format!("Base64 decode failed: {e}"))?;

    let mut in_blob = CRYPT_INTEGER_BLOB {
        cbData: data.len() as u32,
        pbData: data.as_mut_ptr(),
    };
    let mut out_blob = CRYPT_INTEGER_BLOB::default();

    unsafe {
        CryptUnprotectData(&mut in_blob, None, None, None, None, 0, &mut out_blob)
            .map_err(|e| format!("CryptUnprotectData failed: {e}"))?;

        let slice = std::slice::from_raw_parts(out_blob.pbData, out_blob.cbData as usize);
        let s = String::from_utf8(slice.to_vec()).map_err(|e| e.to_string())?;
        let _ = LocalFree(windows::Win32::Foundation::HLOCAL(out_blob.pbData as _));
        Ok(s)
    }
}
