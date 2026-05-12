using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services{
public interface IPasswordService{
        Task<string> HashPasswordAsync(string password);

        Task<bool> VerifyPasswordAsync(
            string password,
            string storedHash);
  }
  

  public class PasswordService : IPasswordService{
      private const int SaltSize = 16;
      private const int HashSize = 32;

      // Argon2 settings
      private const int DegreeOfParallelism = 8;
      private const int Iterations = 4;
      private const int MemorySize = 65536;

      public async Task<string> HashPasswordAsync(string password)
      {
          byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

          var argon2 = new Argon2id(
              Encoding.UTF8.GetBytes(password))
          {
              Salt = salt,
              DegreeOfParallelism = DegreeOfParallelism,
              Iterations = Iterations,
              MemorySize = MemorySize
          };

          byte[] hash = await argon2.GetBytesAsync(HashSize);

          // Combine salt + hash
          byte[] hashBytes = new byte[SaltSize + HashSize];

          Buffer.BlockCopy(salt, 0, hashBytes, 0, SaltSize);
          Buffer.BlockCopy(hash, 0, hashBytes, SaltSize, HashSize);

          return Convert.ToBase64String(hashBytes);
      }

      public async Task<bool> VerifyPasswordAsync(
          string password,
          string storedHash)
      {
          byte[] hashBytes = Convert.FromBase64String(storedHash);

          byte[] salt = new byte[SaltSize];
          byte[] storedPasswordHash = new byte[HashSize];

          Buffer.BlockCopy(hashBytes, 0, salt, 0, SaltSize);

          Buffer.BlockCopy(
              hashBytes,
              SaltSize,
              storedPasswordHash,
              0,
              HashSize);

          var argon2 = new Argon2id(
              Encoding.UTF8.GetBytes(password))
          {
              Salt = salt,
              DegreeOfParallelism = DegreeOfParallelism,
              Iterations = Iterations,
              MemorySize = MemorySize
          };

          byte[] computedHash = await argon2.GetBytesAsync(HashSize);

          return CryptographicOperations.FixedTimeEquals(
              computedHash,
              storedPasswordHash);
      }
}
}
