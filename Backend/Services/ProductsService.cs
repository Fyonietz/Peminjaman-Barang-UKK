using Backend.Models;
using Dapper;


namespace Backend.Services
{
    public class ProductsService{
      private readonly Database db;

      public ProductsService(Database _db)=>db=_db;

      public async Task Create(Products prod){

          using var conn = await db.connect();

          var sql = @"INSERT INTO Products(id_category,name,price_per_day,ImageUrl) VALUES(@cat,@name,@price,@url)";
          var result = await conn.ExecuteAsync(sql,new{
              cat = prod.Id_Category,
              name = prod.Name,
              price = prod.PricePerDay,
              url = prod.Image
          });

      }
    

    }//Class

}//Namespace
