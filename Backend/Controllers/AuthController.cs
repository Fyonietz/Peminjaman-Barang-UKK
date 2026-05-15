using Backend.Services;
using Backend.Models;


namespace Backend.Controllers{
  public static class AuthController{
    public static void MapAuth(this WebApplication app){
      var g = app.MapGroup("/api/v1/auth");

      g.MapPost("/register",async(AuthService service,IPasswordService pService,Users user)=>{
          try{
            user.Password =await pService.HashPasswordAsync(user.Password);
            var req = await service.Create(user);
            if(!req){
              return Results.BadRequest();
            }
            return Results.Ok();
          }catch(Exception e){
            return Results.InternalServerError(e.Message);
          }
      }).RequireAuthorization(Policies.AdminAndStaff);

      g.MapPost("/login",async(AuthService service,IPasswordService pService,LoginRequest req,JwtServices jwt)=>{
          try{
            var res = await service.Login(req);
            if(res == null){
              return Results.Unauthorized();
            }
            var verify = await pService.VerifyPasswordAsync(req.Password,res.Password);
            if(!verify){
              return Results.Unauthorized();
            }
           res.Password ="";
           res.Token =  jwt.GenerateToken(res);
           return Results.Ok(res);
          }catch(Exception e){
            return Results.InternalServerError(e.Message);
          }
      });
  
    g.MapGet("/roles",async(AuthService service)=>{
      try
      {
        var res = await service.GetRoles();
        return Results.Ok(res);
      }
      catch (Exception e)
      {
          return Results.InternalServerError(e.Message);
      }
    }).RequireAuthorization(Policies.Admin);


    }//Main Function
  }//Class
}//Namespace
