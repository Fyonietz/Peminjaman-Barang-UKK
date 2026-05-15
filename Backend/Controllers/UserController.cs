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
        }).RequireAuthorization(Policies.AdminAndStaff);

      g.MapPatch("/{id}",async(UserServices service,IPasswordService Pservice,Users user,int id)=>{
          try
          {
              user.Password = await Pservice.HashPasswordAsync(user.Password);
              var res = await service.UpdateUser(id,user);
              if(!res){
                return Results.InternalServerError();
              }
              return Results.Ok();
          }
          catch (Exception e)
          {
            return Results.InternalServerError(e.Message);   
          }
      }).RequireAuthorization(Policies.AdminAndStaff);

      g.MapDelete("/{id}",async(UserServices service,int id)=>{
          try
          {
              var res = await service.DeleteUser(id);
              if(!res){
                return Results.InternalServerError();
              }
              return Results.Ok();
          }
          catch (Exception e)
          {
            return Results.InternalServerError(e.Message);   
          }
      });

      }//Function
    }//Class
}//Namespace
