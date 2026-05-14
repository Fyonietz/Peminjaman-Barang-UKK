using Backend.Services;
using Backend.Models;
using Backend.Controllers;
using System.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4321")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    var issuer = builder.Configuration["JWT:Issuer"]
        ?? throw new InvalidOperationException("JWT:Issuer is missing");

    var audience = builder.Configuration["JWT:Audience"]
        ?? throw new InvalidOperationException("JWT:Audience is missing");

    var key = builder.Configuration["JWT:Key"]
        ?? throw new InvalidOperationException("JWT:Key is missing");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key))
    };
});

builder.Services.AddAuthorization(Policies.Register);
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JWT"));
builder.Services.AddSingleton<Database>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<JwtServices>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserServices>();

builder.Services.AddOpenApi();

var app = builder.Build();


app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();

    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex);
        throw;
    }
    finally
    {
        sw.Stop();

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        Console.WriteLine(
            $"INFO: {ip} - \"{context.Request.Method} {context.Request.Path} {context.Response.StatusCode}\" {sw.ElapsedMilliseconds}ms"
        );
    }
});

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowFrontend");
app.MapOpenApi();
//Controllers
app.MapAuth();
app.MapUser();
app.Run();


