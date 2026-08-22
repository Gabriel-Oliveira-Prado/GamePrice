var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var mvcBuilder = builder.Services.AddControllersWithViews(options =>
{
    // Adiciona validação de CSRF globalmente para todos os métodos POST/PUT/DELETE/PATCH
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.AutoValidateAntiforgeryTokenAttribute());
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

// O projeto web referencia a API apenas para compartilhar os contratos. Sem esta
// exclusão, o MVC também tenta ativar os controllers da API dentro do processo web.
mvcBuilder.ConfigureApplicationPartManager(manager =>
{
    var apiParts = manager.ApplicationParts
        .Where(part => string.Equals(part.Name, "GamePrice.Api", StringComparison.Ordinal))
        .ToList();

    foreach (var apiPart in apiParts)
        manager.ApplicationParts.Remove(apiPart);
});

builder.Services.AddHttpClient();
builder.Services.AddScoped<GamePrice.Services.AccountSessionService>();

builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
    });

// Configuração opcional do AntiForgery para fortalecer os cookies
builder.Services.AddAntiforgery(options => 
{
    // Permite rodar localmente via HTTP (Docker)
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.HttpOnly = true; // Impede que o JS acesse o cookie (mitiga XSS)
    options.Cookie.SameSite = SameSiteMode.Strict; // Impede envio cruzado de cookies
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.Use(async (context, next) =>
{
    // Security Headers
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Configura Content-Security-Policy de forma básica, permitindo scripts de CDN conhecidos
    // context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self'");

    await next();
});

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
