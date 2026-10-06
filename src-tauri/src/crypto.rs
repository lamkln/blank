use base64::{engine::general_purpose::STANDARD as B64, Engine};

#[cfg(windows)]
pub fn encrypt_secret(plaintext: &str) -> Result<String, String> {
    use windows::Win32::Security::Cryptography::{
        CryptProtectData, CRYPTPROTECT_LOCAL_MACHINE, CRYPT_INTEGER_BLOB, CRYPTPROTECT_UI_FORBIDDEN,
    };
    use windows::Win32::Foundation::LocalFree;

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
pub fn decrypt_secret(ciphertext: &str) -> Result<String, String> {
    use windows::Win32::Security::Cryptography::{CryptUnprotectData, CRYPT_INTEGER_BLOB};
    use windows::Win32::Foundation::LocalFree;

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
        CryptUnprotectData(
            &mut in_blob,
            None,
            None,
            None,
            None,
            0,
            &mut out_blob,
        )
        .map_err(|e| format!("CryptUnprotectData failed: {e}"))?;

        let slice = std::slice::from_raw_parts(out_blob.pbData, out_blob.cbData as usize);
        let s = String::from_utf8(slice.to_vec()).map_err(|e| e.to_string())?;
        let _ = LocalFree(windows::Win32::Foundation::HLOCAL(out_blob.pbData as _));
        Ok(s)
    }
}

#[cfg(not(windows))]
pub fn encrypt_secret(plaintext: &str) -> Result<String, String> {
    Ok(format!("plain:{}", B64.encode(plaintext.as_bytes())))
}

#[cfg(not(windows))]
pub fn decrypt_secret(ciphertext: &str) -> Result<String, String> {
    let payload = ciphertext
        .strip_prefix("plain:")
        .ok_or_else(|| "Invalid ciphertext format".to_string())?;
    let bytes = B64
        .decode(payload)
        .map_err(|e| format!("Base64 decode failed: {e}"))?;
    String::from_utf8(bytes).map_err(|e| e.to_string())
}
