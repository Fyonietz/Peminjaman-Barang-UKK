using Microsoft.AspNetCore.Authorization;

namespace Backend.Models
{
    public class LoginRequest{
      public required string Email{get;set;}
      public required string Password{get;set;}
    }

    public class LoginResponse{
      public int Id {get;set;}
      public string Name {get;set;} = String.Empty;
      public string Password {get;set;} = String.Empty;
      public string Email {get;set;} = String.Empty;
      public string Role {get;set;} = String.Empty;
      public string Token {get;set;} = String.Empty;
    }
  

  public class Roles{
    public int Id {get;set;}
    public string Name{get;set;} = String.Empty;
  }
  public static class Policies{
      public const string Admin = "AdminOnly";
      public const string AdminAndStaff = "AdminAndStaff";
      public const string Customer = "CustomerOnly";
      public const string Staff = "StaffOnly";

      public static void Register(AuthorizationOptions options)
      {
          options.AddPolicy(Admin, p => p.RequireRole("Admin"));
          options.AddPolicy(AdminAndStaff, p => p.RequireRole("Admin","Staff"));
          options.AddPolicy(Customer, p => p.RequireRole("Customer"));
          options.AddPolicy(Staff, p => p.RequireRole("Staff"));
      }
}
}
