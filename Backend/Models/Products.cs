
namespace Backend.Models{
  public class CreateProductsRequest{
        public string Name { get; set; } = string.Empty;
        public int Id_Category { get; set; }
        public decimal PricePerDay { get; set; }

        public IFormFile Image { get; set; } = default!;
    }

    public class Products{
      public int Id_Category{get;set;}
      public string Name {get;set;} = String.Empty;
      public decimal PricePerDay{get;set;}
      public string Image {get;set;} = String.Empty;
    }

    public class ProductsDTO{
      public int Id{get;set;}
      public string Category {get;set;} = String.Empty;
      public string Name {get;set;} = String.Empty;
      public decimal PricePerDay {get;set;}
    }
}//Namespace
