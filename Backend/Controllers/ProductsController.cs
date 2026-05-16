using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace  Backend.Controllers
{
    public static class ProductsController{
        public static void MapProducts(this WebApplication app){
          var g = app.MapGroup("/api/v1/products");

        g.MapPost("/", async (
            ProductsService service,
            [FromForm] CreateProductsRequest request) =>
        {
            // uploads folder
            var uploadsPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot/uploads");

            Directory.CreateDirectory(uploadsPath);

            // unique filename
            var fileName = $"{Guid.NewGuid()}_{request.Image.FileName}";

            var filePath = Path.Combine(uploadsPath, fileName);

            // save image
            using (var stream = File.Create(filePath))
            {
                await request.Image.CopyToAsync(stream);
            }

            // save item
            var item = new Products
            {
                Name = request.Name,
                Id_Category = request.Id_Category,
                PricePerDay = request.PricePerDay,
                // save image path/string into database
                Image = $"/uploads/{fileName}"
            };

            await service.Create(item);

            return Results.Ok(item);
       }).DisableAntiforgery();

        }//Function
    }//Class
}//Namespace
