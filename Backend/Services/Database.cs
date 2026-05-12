using MySql.Data.MySqlClient;


namespace Backend.Services{
  public class Database{
    private readonly IConfiguration configuration;

    public Database(IConfiguration _configuration)=>configuration = _configuration;


    public async Task<MySqlConnection> connect(){
          string? connString = configuration.GetConnectionString("DefaultConnection");

          if (string.IsNullOrEmpty(connString))
          {
              throw new Exception("Connection string 'DefaultConnection' is missing in appsettings.json");
          }
          var conn = new MySqlConnection(connString);
          await conn.OpenAsync();
          return await Task.FromResult(conn);
    }
  }

}
