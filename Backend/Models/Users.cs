

namespace Backend.Models{

    public class Users{
      public required string Name {get;set;}
      public required string Password {get;set;}
      public required string Email {get;set;}
      public required int Id_Role {get;set;}
    }
  
    public class UsersDTO{
      public int Id {get;set;}
      public string Name {get;set;} = String.Empty;
      public string Password {get;set;} = String.Empty;
      public string Email {get;set;} = String.Empty;
      public string Role {get;set;} = String.Empty;
    }

}
