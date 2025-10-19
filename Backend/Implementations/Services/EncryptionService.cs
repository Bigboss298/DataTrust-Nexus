using System.Security.Cryptography;
using System.Text;
using DataTrustNexus.Api.Interfaces;

namespace DataTrustNexus.Api.Implementations.Services;

/// <summary>
/// Encryption service implementing AES-256-GCM, RSA-OAEP, and SHA-256
/// Compliant with NIST SP 800-53
/// </summary>
public class EncryptionService : IEncryptionService
{
    private const int AesKeySize = 256; // bits
    private const int AesKeySizeBytes = 32; // 256 bits = 32 bytes
    private const int NonceSize = 12; // 96 bits for GCM
    private const int TagSize = 16; // 128 bits for authentication tag

    public async Task<(byte[] encryptedData, byte[] iv, byte[] tag)> EncryptAesAsync(byte[] data, byte[] key)
    {
        if (data == null || data.Length == 0)
            throw new ArgumentException("Data cannot be null or empty", nameof(data));
        
        if (key == null || key.Length != AesKeySizeBytes)
            throw new ArgumentException($"Key must be {AesKeySizeBytes} bytes", nameof(key));

        using var aes = new AesGcm(key, TagSize);
        
        var nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);
        
        var ciphertext = new byte[data.Length];
        var tag = new byte[TagSize];
        
        await Task.Run(() => aes.Encrypt(nonce, data, ciphertext, tag));
        
        return (ciphertext, nonce, tag);
    }

    public async Task<byte[]> DecryptAesAsync(byte[] encryptedData, byte[] key, byte[] iv, byte[] tag)
    {
        if (encryptedData == null || encryptedData.Length == 0)
            throw new ArgumentException("Encrypted data cannot be null or empty", nameof(encryptedData));
        
        if (key == null || key.Length != AesKeySizeBytes)
            throw new ArgumentException($"Key must be {AesKeySizeBytes} bytes", nameof(key));
        
        if (iv == null || iv.Length != NonceSize)
            throw new ArgumentException($"IV must be {NonceSize} bytes", nameof(iv));
        
        if (tag == null || tag.Length != TagSize)
            throw new ArgumentException($"Tag must be {TagSize} bytes", nameof(tag));

        using var aes = new AesGcm(key, TagSize);
        
        var plaintext = new byte[encryptedData.Length];
        
        await Task.Run(() => aes.Decrypt(iv, encryptedData, tag, plaintext));
        
        return plaintext;
    }

    public byte[] GenerateAesKey()
    {
        var key = new byte[AesKeySizeBytes];
        RandomNumberGenerator.Fill(key);
        return key;
    }

    public async Task<byte[]> EncryptRsaAsync(byte[] data, string publicKeyPem)
    {
        if (data == null || data.Length == 0)
            throw new ArgumentException("Data cannot be null or empty", nameof(data));
        
        if (string.IsNullOrWhiteSpace(publicKeyPem))
            throw new ArgumentException("Public key cannot be null or empty", nameof(publicKeyPem));

        using var rsa = RSA.Create();
        rsa.ImportFromPem(publicKeyPem);
        
        return await Task.Run(() => rsa.Encrypt(data, RSAEncryptionPadding.OaepSHA256));
    }

    public async Task<byte[]> DecryptRsaAsync(byte[] encryptedData, string privateKeyPem)
    {
        if (encryptedData == null || encryptedData.Length == 0)
            throw new ArgumentException("Encrypted data cannot be null or empty", nameof(encryptedData));
        
        if (string.IsNullOrWhiteSpace(privateKeyPem))
            throw new ArgumentException("Private key cannot be null or empty", nameof(privateKeyPem));

        using var rsa = RSA.Create();
        rsa.ImportFromPem(privateKeyPem);
        
        return await Task.Run(() => rsa.Decrypt(encryptedData, RSAEncryptionPadding.OaepSHA256));
    }

    public string ComputeSha256Hash(byte[] data)
    {
        if (data == null || data.Length == 0)
            throw new ArgumentException("Data cannot be null or empty", nameof(data));

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(data);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
    }

    public async Task<string> ComputeSha256HashAsync(Stream stream)
    {
        if (stream == null)
            throw new ArgumentNullException(nameof(stream));

        using var sha256 = SHA256.Create();
        var hashBytes = await sha256.ComputeHashAsync(stream);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
    }

    public (string publicKey, string privateKey) GenerateRsaKeyPair()
    {
        using var rsa = RSA.Create(4096); // 4096-bit key for strong security
        
        var publicKey = rsa.ExportRSAPublicKeyPem();
        var privateKey = rsa.ExportRSAPrivateKeyPem();
        
        return (publicKey, privateKey);
    }

    public bool VerifyHash(byte[] data, string expectedHash)
    {
        if (data == null || data.Length == 0)
            throw new ArgumentException("Data cannot be null or empty", nameof(data));
        
        if (string.IsNullOrWhiteSpace(expectedHash))
            throw new ArgumentException("Expected hash cannot be null or empty", nameof(expectedHash));

        var computedHash = ComputeSha256Hash(data);
        return string.Equals(computedHash, expectedHash, StringComparison.OrdinalIgnoreCase);
    }
}

