
namespace Backend.Models{
  public class Item{
    public int Id{get;set;}
    public string Name {get;set;} = String.Empty;
    public int Id_Category {get;set;}
    public decimal PricePerDay {get;set;}
  }
}
