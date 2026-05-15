using Backend.Models;
using Dapper;
namespace Backend.Services
{
    public class UserServices{
      private readonly Database db;

      public UserServices(Database _db)=>db=_db;

      public async Task<List<UsersDTO>> GetAllUser(){
        using var conn = await db.connect();

        var sql = "SELECT u.Id,u.Name,u.Email,r.Name as Role FROM Users u LEFT JOIN Roles r ON r.Id = u.Id_Role";
        var result = (await conn.QueryAsync<UsersDTO>(sql)).ToList();
        return result;
      }
      
     public async Task<bool> UpdateUser(int id,Users user){
       using var conn = await db.connect();

       var sql = "UPDATE Users SET name=@name,email=@email,password=@password,id_role=@role WHERE id=@id";
       var result = await conn.ExecuteAsync(sql,new {
          name=user.Name,
          password=user.Password,
          email=user.Email,
          role=user.Id_Role,
          id = id
      });
       return result > 0;
     }

     public async Task<bool> DeleteUser(int id){
      using var conn = await db.connect();

      var sql = "DELETE FROM Users WHERE id=@id";
      var result = await conn.ExecuteAsync(sql,new {id = id});
      return result > 0;
     }

    }//Class
}//Namespace
