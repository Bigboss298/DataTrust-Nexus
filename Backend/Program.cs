using DataTrustNexus.Api.Implementations.Services;
using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Register Services (N-Tier Architecture with REAL BlockDAG integration)
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();

// Domain Services - Each with REAL BlockDAG integration
builder.Services.AddScoped<IInstitutionService, InstitutionService>();
builder.Services.AddScoped<IDataService, DataService>();
builder.Services.AddScoped<IAccessService, AccessService>();
builder.Services.AddScoped<IAuditService, AuditService>();

// Register HttpClient for IPFS
builder.Services.AddHttpClient<IIpfsService, IpfsService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    
    // More restrictive CORS for production
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3001" })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DataTrust Nexus API",
        Version = "v1",
        Description = "Secure, NIST/ISO-compliant data transfer and verification platform built on BlockDAG chain",
        Contact = new OpenApiContact
        {
            Name = "DataTrust Nexus Team",
            Email = "support@datatrustnexus.com"
        }
    });
    
    // Add XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
    
    // Add custom header for wallet address
    c.AddSecurityDefinition("WalletAddress", new OpenApiSecurityScheme
    {
        Description = "Wallet address for authentication",
        Name = "X-Wallet-Address",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "WalletAddress"
    });
});

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DataTrust Nexus API v1");
    c.RoutePrefix = "swagger"; // Serve Swagger UI at /swagger
});

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("Production");
    app.UseHsts();
}

// Comment out HTTPS redirection for local development
// app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health");

// Log startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("DataTrust Nexus API started - Pure BlockDAG architecture");
logger.LogInformation("BlockDAG RPC: {RpcUrl}", builder.Configuration["Blockchain:RpcUrl"]);
logger.LogInformation("Chain ID: {ChainId}", builder.Configuration["Blockchain:ChainId"]);

app.Run();
