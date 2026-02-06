var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

// Controller route
app.MapControllerRoute(
    name: "default",
	pattern: "{controller=Ascii}/{action=Input}/{id?}")
    .WithStaticAssets();

// Blog routes
app.MapControllerRoute(
    name: "essays",  // Essay list
    pattern: "essays",
    defaults: new { controller = "Essay", action = "Index" });

app.MapControllerRoute(
    name: "essay-detail",  // Essay detail (slug required)
    pattern: "essays/{slug}",
    defaults: new { controller = "Essay", action = "Detail" });

app.MapControllerRoute(
    name: "blogs",  // Alias for discovery
    pattern: "blogs/{slug?}",
    defaults: new { controller = "Essay", action = "Index" });

app.MapControllerRoute(
    name: "cave",
    pattern: "cave",
    defaults: new { controller = "Ascii", action = "Cave" });

app.MapControllerRoute(
    name: "privacy",
    pattern: "privacy",
    defaults: new { controller = "Ascii", action = "Privacy" });

app.Run();
