using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    public static class ItemController{
      public static void MapItem(this WebApplication app){
        var g = app.MapGroup("/api/v1/items");




      }//Function
    }//Class
}//Namespace
