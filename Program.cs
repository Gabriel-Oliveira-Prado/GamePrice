var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews(options => 
{
    // Adiciona validação de CSRF globalmente para todos os métodos POST/PUT/DELETE/PATCH
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.AutoValidateAntiforgeryTokenAttribute());
});
builder.Services.AddHttpClient();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Configuração opcional do AntiForgery para fortalecer os cookies
builder.Services.AddAntiforgery(options => 
{
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Exige HTTPS para o cookie de CSRF
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
}

app.UseHttpsRedirection();
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

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
