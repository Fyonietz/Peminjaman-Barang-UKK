using Backend.Models;
using Dapper;



namespace Backend.Services
{
    public class CategoryService{

      private readonly Database db;

      public CategoryService(Database _db)=>db=_db;

      public async Task<bool> CreateCategory(Category cat){
        using var conn = await db.connect();

        var sql = @"INSERT INTO Category(name) VALUES (@name)";
        var result = await conn.ExecuteAsync(sql,new {name = cat.Name});
        return result > 0;
      }  

      public async Task<List<Category>> GetCategory(){
        using var conn = await db.connect();

        var sql = "SELECT * FROM Category";
        var result = (await conn.QueryAsync<Category>(sql)).ToList();
        return result;
      }

     public async Task<bool> UpdateCategory(int Id,Category cat){
       using var conn = await db.connect();

       var sql = "UPDATE Category SET name=@name WHERE id=@id";
       var result = await conn.ExecuteAsync(sql,new {id=Id,name = cat.Name});
       return result > 0;
     }

     public async Task<bool> DeleteCategory(int Id){
       using var conn = await db.connect();

       var sql = "DELETE FROM Category WHERE id=@id";
       var result = await conn.ExecuteAsync(sql,new {id=Id});
       return result > 0;
     }

    }//Class

}//Namespace
