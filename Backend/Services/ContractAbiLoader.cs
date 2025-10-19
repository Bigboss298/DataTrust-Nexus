using System.Text.Json;

namespace DataTrustNexus.Api.Services;

/// <summary>
/// Helper class to load contract ABIs from JSON files
/// </summary>
public static class ContractAbiLoader
{
    private static readonly string AbiDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ContractABIs");

    /// <summary>
    /// Load contract ABI from compiled artifact JSON
    /// </summary>
    public static string LoadAbi(string contractName)
    {
        try
        {
            var filePath = Path.Combine(AbiDirectory, $"{contractName}.json");
            
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"ABI file not found: {filePath}");
            }

            var json = File.ReadAllText(filePath);
            var artifact = JsonDocument.Parse(json);
            
            // Extract the "abi" array from the Hardhat artifact
            if (artifact.RootElement.TryGetProperty("abi", out var abiElement))
            {
                return abiElement.GetRawText();
            }

            throw new Exception($"ABI property not found in {contractName}.json");
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to load ABI for {contractName}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Get all available contract names
    /// </summary>
    public static List<string> GetAvailableContracts()
    {
        if (!Directory.Exists(AbiDirectory))
        {
            return new List<string>();
        }

        return Directory.GetFiles(AbiDirectory, "*.json")
            .Select(f => Path.GetFileNameWithoutExtension(f))
            .ToList();
    }
}

