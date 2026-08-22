using GamePrice.Api.Domain.DTOs;

namespace GamePrice.Models
{
    public class WishlistPageViewModel
    {
        public List<WishlistItemDto> Items { get; set; } = new();
    }
}
