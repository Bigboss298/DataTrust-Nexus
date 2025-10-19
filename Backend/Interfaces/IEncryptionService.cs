namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service interface for encryption operations
/// Implements AES-256-GCM, RSA-OAEP, and SHA-256
/// </summary>
public interface IEncryptionService
{
    /// <summary>
    /// Encrypt data using AES-256-GCM
    /// </summary>
    /// <returns>Tuple of (encrypted data, IV, authentication tag)</returns>
    Task<(byte[] encryptedData, byte[] iv, byte[] tag)> EncryptAesAsync(byte[] data, byte[] key);
    
    /// <summary>
    /// Decrypt data using AES-256-GCM
    /// </summary>
    Task<byte[]> DecryptAesAsync(byte[] encryptedData, byte[] key, byte[] iv, byte[] tag);
    
    /// <summary>
    /// Generate a random AES-256 key
    /// </summary>
    byte[] GenerateAesKey();
    
    /// <summary>
    /// Encrypt AES key using RSA-OAEP
    /// </summary>
    Task<byte[]> EncryptRsaAsync(byte[] data, string publicKeyPem);
    
    /// <summary>
    /// Decrypt AES key using RSA-OAEP
    /// </summary>
    Task<byte[]> DecryptRsaAsync(byte[] encryptedData, string privateKeyPem);
    
    /// <summary>
    /// Compute SHA-256 hash of data
    /// </summary>
    string ComputeSha256Hash(byte[] data);
    
    /// <summary>
    /// Compute SHA-256 hash from file stream
    /// </summary>
    Task<string> ComputeSha256HashAsync(Stream stream);
    
    /// <summary>
    /// Generate RSA key pair
    /// </summary>
    /// <returns>Tuple of (public key PEM, private key PEM)</returns>
    (string publicKey, string privateKey) GenerateRsaKeyPair();
    
    /// <summary>
    /// Verify SHA-256 hash
    /// </summary>
    bool VerifyHash(byte[] data, string expectedHash);
}

