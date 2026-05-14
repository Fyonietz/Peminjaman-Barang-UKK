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
    }
}
