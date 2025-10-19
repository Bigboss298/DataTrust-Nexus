# ============================================================
# TEST SMART CONTRACTS ON BLOCKDAG
# ============================================================
# This script tests if your deployed contracts are working
# Run this before setting up the backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Smart Contracts on BlockDAG..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Your deployed contract addresses
$institutionRegistry = "0x5e845012B9c5347daB42DA4b5AC2669970b3B5cE"
$dataVault = "0x8D9e9A1999C8D33E335bEA01A25E0A6698D32168"
$accessControl = "0x6e951aC90F0ea195af2991938DCcBbD845c424D3"
$auditTrail = "0x4b7CFa26D4e5abA247240B117a8B25fBB7476261"

$rpcUrl = "https://rpc.awakening.bdagscan.com"

# Test 1: Check InstitutionRegistry contract
Write-Host "Test 1: Checking InstitutionRegistry contract..." -ForegroundColor Yellow
$body1 = @{
    jsonrpc = "2.0"
    method = "eth_getCode"
    params = @($institutionRegistry, "latest")
    id = 1
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri $rpcUrl -Method POST -Body $body1 -ContentType "application/json"
if ($response1.result -and $response1.result -ne "0x") {
    Write-Host "✅ InstitutionRegistry contract FOUND!" -ForegroundColor Green
    Write-Host "   Address: $institutionRegistry" -ForegroundColor Gray
    Write-Host "   Code length: $($response1.result.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ InstitutionRegistry contract NOT FOUND!" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check DataVaultContract
Write-Host "Test 2: Checking DataVaultContract..." -ForegroundColor Yellow
$body2 = @{
    jsonrpc = "2.0"
    method = "eth_getCode"
    params = @($dataVault, "latest")
    id = 1
} | ConvertTo-Json

$response2 = Invoke-RestMethod -Uri $rpcUrl -Method POST -Body $body2 -ContentType "application/json"
if ($response2.result -and $response2.result -ne "0x") {
    Write-Host "✅ DataVaultContract FOUND!" -ForegroundColor Green
    Write-Host "   Address: $dataVault" -ForegroundColor Gray
    Write-Host "   Code length: $($response2.result.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ DataVaultContract NOT FOUND!" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check AccessControlContract
Write-Host "Test 3: Checking AccessControlContract..." -ForegroundColor Yellow
$body3 = @{
    jsonrpc = "2.0"
    method = "eth_getCode"
    params = @($accessControl, "latest")
    id = 1
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri $rpcUrl -Method POST -Body $body3 -ContentType "application/json"
if ($response3.result -and $response3.result -ne "0x") {
    Write-Host "✅ AccessControlContract FOUND!" -ForegroundColor Green
    Write-Host "   Address: $accessControl" -ForegroundColor Gray
    Write-Host "   Code length: $($response3.result.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ AccessControlContract NOT FOUND!" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check AuditTrailContract
Write-Host "Test 4: Checking AuditTrailContract..." -ForegroundColor Yellow
$body4 = @{
    jsonrpc = "2.0"
    method = "eth_getCode"
    params = @($auditTrail, "latest")
    id = 1
} | ConvertTo-Json

$response4 = Invoke-RestMethod -Uri $rpcUrl -Method POST -Body $body4 -ContentType "application/json"
if ($response4.result -and $response4.result -ne "0x") {
    Write-Host "✅ AuditTrailContract FOUND!" -ForegroundColor Green
    Write-Host "   Address: $auditTrail" -ForegroundColor Gray
    Write-Host "   Code length: $($response4.result.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "❌ AuditTrailContract NOT FOUND!" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get latest block number
Write-Host "Test 5: Getting latest BlockDAG block number..." -ForegroundColor Yellow
$body5 = @{
    jsonrpc = "2.0"
    method = "eth_blockNumber"
    params = @()
    id = 1
} | ConvertTo-Json

$response5 = Invoke-RestMethod -Uri $rpcUrl -Method POST -Body $body5 -ContentType "application/json"
if ($response5.result) {
    $blockNumber = [Convert]::ToInt64($response5.result, 16)
    Write-Host "✅ BlockDAG is online!" -ForegroundColor Green
    Write-Host "   Latest block: $blockNumber" -ForegroundColor Gray
} else {
    Write-Host "❌ Could not connect to BlockDAG!" -ForegroundColor Red
}
Write-Host ""

# Test 6: Check wallet balance
Write-Host "Test 6: Checking deployer wallet balance..." -ForegroundColor Yellow
$deployerAddress = "0xEB982d4692d70330D35361d247B67daE1f919E13"
$body6 = @{
    jsonrpc = "2.0"
    method = "eth_getBalance"
    params = @($deployerAddress, "latest")
    id = 1
} | ConvertTo-Json

$response6 = Invoke-RestMethod -Uri $rpcUrl -Method POST -Body $body6 -ContentType "application/json"
if ($response6.result) {
    $balanceWei = [Convert]::ToInt64($response6.result, 16)
    $balanceEth = $balanceWei / 1000000000000000000
    Write-Host "✅ Wallet balance retrieved!" -ForegroundColor Green
    Write-Host "   Address: $deployerAddress" -ForegroundColor Gray
    Write-Host "   Balance: $balanceEth ETH" -ForegroundColor Gray
} else {
    Write-Host "❌ Could not retrieve wallet balance!" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allGood = ($response1.result -ne "0x") -and ($response2.result -ne "0x") -and ($response3.result -ne "0x") -and ($response4.result -ne "0x")

if ($allGood) {
    Write-Host "✅ ALL CONTRACTS ARE DEPLOYED AND WORKING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Run: cd Backend; dotnet restore" -ForegroundColor Gray
    Write-Host "2. Copy ABIs to Backend/ContractABIs/" -ForegroundColor Gray
    Write-Host "3. Run: dotnet run" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some contracts may not be deployed correctly" -ForegroundColor Yellow
    Write-Host "Check the deployment transaction hashes on:" -ForegroundColor Gray
    Write-Host "https://awakening.bdagscan.com/" -ForegroundColor Gray
}

Write-Host ""
Write-Host "View your contracts on BlockDAG Explorer:" -ForegroundColor White
Write-Host "https://awakening.bdagscan.com/address/$institutionRegistry" -ForegroundColor Blue

