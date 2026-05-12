using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using Backend.Models;

namespace Backend.Services{
    public class JwtServices{
        private readonly JwtSettings _settings;

        public JwtServices(IOptions<JwtSettings> options)
        {
            _settings = options.Value;
        }

        public string GenerateToken(LoginResponse user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("userId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_settings.Key));

            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
    public class AuthService{
        private readonly Database db;

        public AuthService(Database _db)=>db=_db;
        
            public async Task<bool> Create(Users user) {
                using var conn = await db.connect();

                var sql = @"
                    INSERT INTO Users(name, email, password, id_role)
                    VALUES(@name, @email, @password, @role)
                ";

                var result = await conn.ExecuteAsync(sql, new
                {
                    name = user.Name,
                    email = user.Email,
                    password = user.Password,
                    role = user.Id_Role
                });

                return result > 0;
            }

          public async Task<LoginResponse?> Login(LoginRequest data){
              using var conn = await db.connect();

              var sql = "SELECT u.Id,u.Name,u.Email,u.Password,r.Name as Role FROM Users u JOIN Roles r ON r.id = u.Id_Role WHERE u.Name=@name";
              var result = await conn.QueryFirstOrDefaultAsync<LoginResponse>(sql,new {name = data.Name,password=data.Password});
            
              return result ?? null;
          }

    }
}
