using Backend.Models;
using Dapper;
namespace Backend.Services
{
    public class ItemService{
      
      private readonly Database db;
      public ItemService(Database _db)=>db=_db;


      public async Task<bool> CreateItem(Item item){
          using var conn = await db.connect();

          var sql = @"INSERT INTO Items(id_category,name,price_per_day,imageurl) VALUES(@cat,@name,@price,@url)";
          var result = await conn.ExecuteAsync(sql,new{
              cat = item.Id_Category,
              name = item.Name,
              price = item.PricePerDay,
              url = item.Image
          });
          return result > 0;
      }

    // public async Task<ItemDTO> GetAllItem(){
    //     using var conn = await db.connect();
    //
    //     var sql = @"";
    //     retru
    // }

    }//Class
}//Namespace
