using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    public static class CategoryController{
        public static void MapCategory(this WebApplication app){
            var g = app.MapGroup("/api/v1/category");

            g.MapPost("/",async(CategoryService service,Category cat)=>{
                try
                {
                    var res = await service.CreateCategory(cat);
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

            g.MapGet("/",async(CategoryService service)=>{
                try
                {
                    var res = await service.GetCategory();
                    return Results.Ok(res);
                }
                catch (Exception e)
                {
                 return Results.InternalServerError(e.Message);   
                }
            });


           g.MapPatch("/{id}",async(CategoryService service,Category cat,int id)=>{
              try
              {
                  var res = await service.UpdateCategory(id,cat);
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

          g.MapDelete("/{id}",async(CategoryService service,int id)=>{
            try
            {
                var res = await service.DeleteCategory(id);
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
