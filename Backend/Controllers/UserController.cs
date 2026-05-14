using Backend.Services;
using Backend.Models;

namespace Backend.Controllers
{
    public static class UserController{
      public static void MapUser(this WebApplication app){
        var g = app.MapGroup("/api/v1/users");

        g.MapGet("/",async(UserServices services)=>{
            try
            {
                var res = await services.GetAllUser();
                return Results.Ok(res);
            }
            catch (Exception e)
            {
                return Results.InternalServerError(e.Message);
            }
        });
      }
    }
}
