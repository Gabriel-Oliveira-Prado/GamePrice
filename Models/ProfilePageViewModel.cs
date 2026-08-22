using System.ComponentModel.DataAnnotations;

namespace GamePrice.Models
{
    public class ProfilePageViewModel
    {
        public UpdateProfileViewModel Profile { get; set; } = new();
        public ChangePasswordViewModel Password { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int WishlistCount { get; set; }
    }

    public class UpdateProfileViewModel
    {
        [Required(ErrorMessage = "Informe seu nome")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Informe seu email")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        [StringLength(254)]
        public string Email { get; set; } = string.Empty;
    }

    public class ChangePasswordViewModel
    {
        [Required(ErrorMessage = "Informe a senha atual")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Informe a nova senha")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "A nova senha deve ter no mínimo 6 caracteres")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirme a nova senha")]
        [Compare(nameof(NewPassword), ErrorMessage = "As senhas não coincidem")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}
