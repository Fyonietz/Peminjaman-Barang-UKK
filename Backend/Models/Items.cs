
namespace Backend.Models{
  public class Item{
    public string Name {get;set;} = String.Empty;
    public string Image {get;set;} = String.Empty;
    public int Id_Category {get;set;}
    public decimal PricePerDay {get;set;}
  }

  public class ItemDTO{
    public int Id {get;set;}
    public string Name {get;set;} = String.Empty;
    public string Image {get;set;} = String.Empty;
    public string Category {get;set;} = String.Empty;
    public decimal PricePerDay {get;set;}
  }
}
